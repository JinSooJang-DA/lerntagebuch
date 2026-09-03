import { DayEntry, TimeSlotRow } from '../types';

/**
 * Normalizes various date string formats into standard "YYYY-MM-DD"
 */
export function normalizeDateToIso(dateStr: string): string | null {
  if (!dateStr) return null;
  const clean = dateStr.trim().replace(/^\[|\]$/g, '');

  // 1. Check YYYY-MM-DD or YYYY.MM.DD or YYYY/MM/DD
  const isoMatch = clean.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2. Check DD.MM.YYYY or DD-MM-YYYY or DD/MM/YYYY (common in German & Google Docs)
  const dmyMatch = clean.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{4})$/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // 3. Look for date inside text like "Datum: [02.09.2026]" or "02.09.2026"
  const embeddedDmy = clean.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (embeddedDmy) {
    const d = embeddedDmy[1].padStart(2, '0');
    const m = embeddedDmy[2].padStart(2, '0');
    const y = embeddedDmy[3];
    return `${y}-${m}-${d}`;
  }

  const embeddedIso = clean.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (embeddedIso) {
    const y = embeddedIso[1];
    const m = embeddedIso[2].padStart(2, '0');
    const d = embeddedIso[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
}

/**
 * Normalizes a time string like "9:00", "09.00", "09:00" to "09:00"
 */
export function normalizeTimeString(t: string): string {
  const clean = t.trim().replace('.', ':');
  const [h, m] = clean.split(':');
  if (!h) return '09:00';
  const hours = h.padStart(2, '0');
  const minutes = (m || '00').padStart(2, '0');
  return `${hours}:${minutes}`;
}

export interface ParseResult {
  success: boolean;
  entries: Record<string, DayEntry>;
  detectedDaysCount: number;
  totalSlotsCount: number;
  logs: string[];
  rawFormatDetected: 'google_docs_table' | 'google_docs_text' | 'markdown_table' | 'json' | 'unknown';
}

/**
 * Parse Google Docs copied text (tables, tabs, bulleted text, markdown tables)
 */
export function parseGoogleDocsText(rawText: string, fallbackDate?: string): ParseResult {
  const logs: string[] = [];
  const entries: Record<string, DayEntry> = {};
  let totalSlots = 0;

  const defaultDate = fallbackDate || new Date().toISOString().split('T')[0];
  let currentDate = defaultDate;

  // Split by lines
  const lines = rawText.split(/\r?\n/);
  let currentSlots: TimeSlotRow[] = [];
  let detectedFormat: 'google_docs_table' | 'google_docs_text' | 'markdown_table' = 'google_docs_text';

  // Helper to commit current date's accumulated slots
  const commitCurrentDate = () => {
    if (currentSlots.length > 0) {
      // Sort slots by start time
      currentSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      const existing = entries[currentDate];
      if (existing) {
        // Merge
        entries[currentDate] = {
          ...existing,
          timeSlots: [...existing.timeSlots, ...currentSlots],
          updatedAt: new Date().toISOString()
        };
      } else {
        entries[currentDate] = {
          date: currentDate,
          timeSlots: [...currentSlots],
          summary: '',
          questionsForInstructor: '',
          homeworkStatus: 'in_progress',
          attachments: [],
          updatedAt: new Date().toISOString()
        };
      }
      totalSlots += currentSlots.length;
      currentSlots = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;

    // Check if line indicates a Date change (e.g. "Datum: [02.09.2026]", "## 02.09.2026", "Mittwoch, 02.09.2026")
    const dateMatch =
      line.match(/datum\s*:\s*\[?([0-9./-]+)\]?/i) ||
      line.match(/^(?:#+|\*\*|==)?\s*(?:Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)?\s*,?\s*\[?(\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})\]?/i);

    if (dateMatch) {
      const parsedIso = normalizeDateToIso(dateMatch[1]);
      if (parsedIso) {
        commitCurrentDate();
        currentDate = parsedIso;
        logs.push(`Datum erkannt: ${parsedIso} (aus "${line}")`);
        continue;
      }
    }

    // Check for Table Headers like "Zeitraum | Thema & Notizen" or "Zeitraum\tThema"
    if (
      line.toLowerCase().includes('zeitraum') &&
      (line.toLowerCase().includes('thema') || line.toLowerCase().includes('notizen') || line.includes('\t'))
    ) {
      detectedFormat = rawLine.includes('\t') ? 'google_docs_table' : 'markdown_table';
      continue;
    }

    // Skip markdown table separators like | :--- | :--- |
    if (/^\|?\s*[-:]+\s*\|\s*[-:]+\s*\|?$/.test(line)) {
      continue;
    }

    // Try detecting a Time Slot Pattern
    // e.g. "09:00 - 10:20" or "09:00 – 10:20" or "09:00 ~ 10:20" or "09.00 - 10.20"
    const timeRangeRegex = /(\d{1,2}[:.]\d{2})\s*(?:[-–—~]|bis|to)\s*(\d{1,2}[:.]\d{2})/i;
    const timeMatch = line.match(timeRangeRegex);

    if (timeMatch) {
      const startTime = normalizeTimeString(timeMatch[1]);
      const endTime = normalizeTimeString(timeMatch[2]);

      let title = '';
      let content = '';

      // Check if it's a tab-separated line (Direct Google Docs table paste)
      if (rawLine.includes('\t')) {
        detectedFormat = 'google_docs_table';
        const parts = rawLine.split('\t').map(p => p.trim()).filter(Boolean);
        // Usually part 0 is time (or contains time), part 1 is topic/title, part 2 is notes
        const nonTimeParts = parts.filter(p => !timeRangeRegex.test(p));
        if (nonTimeParts.length > 0) {
          title = nonTimeParts[0].replace(/^[•*\-\s]+/, '');
          if (nonTimeParts.length > 1) {
            content = nonTimeParts.slice(1).join('\n');
          }
        }
      } else if (line.includes('|')) {
        // Markdown table row: | 09:00 - 10:20 | • Live-Calls: ... |
        detectedFormat = 'markdown_table';
        const cols = line
          .split('|')
          .map(c => c.trim())
          .filter(Boolean);
        const colContent = cols.find(c => !timeRangeRegex.test(c)) || '';
        const cleanContent = colContent.replace(/<br\s*\/?>/gi, '\n');
        
        // Split title vs notes
        const bulletMatch = cleanContent.match(/^[•*\-\s]*(?:\*\*)?([^*:\n]+)(?:\*\*)?(?::|\n)([\s\S]*)$/);
        if (bulletMatch) {
          title = bulletMatch[1].trim();
          content = bulletMatch[2].trim();
        } else {
          title = cleanContent.split('\n')[0].replace(/^[•*\-\s]+/, '');
          content = cleanContent.split('\n').slice(1).join('\n').trim();
        }
      } else {
        // Plain text row: "09:00 - 10:20 : Live-Calls - notes..."
        const remainder = line.replace(timeMatch[0], '').replace(/^[:\-–|\s]+/, '').trim();
        if (remainder) {
          const bulletMatch = remainder.match(/^[•*\-\s]*([^:\n]+)(?::|\s-\s)([\s\S]*)$/);
          if (bulletMatch) {
            title = bulletMatch[1].trim();
            content = bulletMatch[2].trim();
          } else {
            title = remainder.replace(/^[•*\-\s]+/, '');
          }
        } else {
          title = 'Study Session';
        }

        // Peek at subsequent lines for notes until next time slot or date
        let nextIdx = i + 1;
        const subNotes: string[] = [];
        while (nextIdx < lines.length) {
          const nextLine = lines[nextIdx].trim();
          if (!nextLine) {
            nextIdx++;
            continue;
          }
          if (timeRangeRegex.test(nextLine) || /datum\s*:/i.test(nextLine)) {
            break; // Stop at next slot
          }
          subNotes.push(nextLine.replace(/^[•*\-\s]+/, ''));
          nextIdx++;
        }
        if (subNotes.length > 0) {
          content = content ? `${content}\n${subNotes.join('\n')}` : subNotes.join('\n');
          i = nextIdx - 1; // Advance outer loop
        }
      }

      // Final cleanup
      if (!title) title = 'Study Session';
      title = title.replace(/\*\*/g, '').trim();

      currentSlots.push({
        id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        startTime,
        endTime,
        title,
        content: content || undefined,
        completed: true
      });

      logs.push(`슬롯 파싱 완료: [${currentDate}] ${startTime}–${endTime} : ${title}`);
    }
  }

  // Commit last accumulated date
  commitCurrentDate();

  const detectedDaysCount = Object.keys(entries).length;

  return {
    success: detectedDaysCount > 0,
    entries,
    detectedDaysCount,
    totalSlotsCount: totalSlots,
    logs,
    rawFormatDetected: detectedFormat
  };
}

/**
 * Parse JSON data (supports key-value map, array of entries, nested entries)
 */
export function parseDiaryJson(jsonContent: string | object): ParseResult {
  const logs: string[] = [];
  const entries: Record<string, DayEntry> = {};
  let totalSlots = 0;

  try {
    const rawData = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;

    // Helper to normalize a single entry object
    const processDayObj = (obj: any, fallbackKey?: string) => {
      if (!obj || typeof obj !== 'object') return;

      const dateStr =
        normalizeDateToIso(obj.date) ||
        normalizeDateToIso(obj.datum) ||
        normalizeDateToIso(obj.day) ||
        normalizeDateToIso(fallbackKey || '') ||
        new Date().toISOString().split('T')[0];

      const slots: TimeSlotRow[] = [];

      // Case A: Standard timeSlots array
      if (Array.isArray(obj.timeSlots)) {
        obj.timeSlots.forEach((s: any) => {
          if (!s) return;
          slots.push({
            id: s.id || `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            startTime: normalizeTimeString(s.startTime || '09:00'),
            endTime: normalizeTimeString(s.endTime || '10:30'),
            title: s.title || s.topic || s.subject || 'Lerneinheit',
            content: s.content || s.notes || s.description || undefined,
            codeSnippet: s.codeSnippet || undefined,
            attachments: s.attachments || [],
            completed: s.completed ?? true
          });
        });
      }
      // Case B: slots / tasks array
      else if (Array.isArray(obj.slots || obj.tasks || obj.activities || obj.eintraege)) {
        const rawList = obj.slots || obj.tasks || obj.activities || obj.eintraege;
        rawList.forEach((s: any) => {
          if (!s) return;
          let startTime = '09:00';
          let endTime = '10:30';

          if (s.time || s.zeitraum) {
            const timeStr = String(s.time || s.zeitraum);
            const tm = timeStr.match(/(\d{1,2}[:.]\d{2})\s*(?:[-–—~]|bis|to)\s*(\d{1,2}[:.]\d{2})/);
            if (tm) {
              startTime = normalizeTimeString(tm[1]);
              endTime = normalizeTimeString(tm[2]);
            }
          } else {
            if (s.startTime) startTime = normalizeTimeString(s.startTime);
            if (s.endTime) endTime = normalizeTimeString(s.endTime);
          }

          slots.push({
            id: s.id || `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            startTime,
            endTime,
            title: s.title || s.topic || s.name || s.thema || 'Lerneinheit',
            content: s.content || s.notes || s.notizen || s.desc || undefined,
            codeSnippet: s.codeSnippet || undefined,
            attachments: s.attachments || [],
            completed: s.completed ?? true
          });
        });
      }
      // Case C: Legacy format (fixedLecture, customSlots)
      else {
        if (obj.fixedLecture && obj.fixedLecture.topic) {
          slots.push({
            id: `slot-lecture-${Date.now()}`,
            startTime: '09:00',
            endTime: '10:20',
            title: obj.fixedLecture.topic,
            content: obj.fixedLecture.instructorNotes || '',
            completed: true
          });
        }
        if (Array.isArray(obj.customSlots)) {
          obj.customSlots.forEach((cs: any) => {
            slots.push({
              id: cs.id || `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              startTime: normalizeTimeString(cs.startTime || '11:00'),
              endTime: normalizeTimeString(cs.endTime || '12:30'),
              title: cs.title || 'Coding Slot',
              content: cs.content || '',
              completed: true,
              attachments: cs.attachments || []
            });
          });
        }
      }

      // Sort slots by start time
      slots.sort((a, b) => a.startTime.localeCompare(b.startTime));

      entries[dateStr] = {
        date: dateStr,
        timeSlots: slots,
        summary: obj.summary || '',
        questionsForInstructor: obj.questionsForInstructor || '',
        homeworkStatus: obj.homeworkStatus || 'in_progress',
        attachments: obj.attachments || [],
        updatedAt: obj.updatedAt || new Date().toISOString()
      };

      totalSlots += slots.length;
      logs.push(`JSON 파싱 성공: [${dateStr}] ${slots.length}개 슬롯`);
    };

    // 1. Array of Day Entries
    if (Array.isArray(rawData)) {
      rawData.forEach(item => processDayObj(item));
    }
    // 2. Object with entries container: { entries: {...} } or { diary: [...] }
    else if (rawData.entries || rawData.diary || rawData.data) {
      const container = rawData.entries || rawData.diary || rawData.data;
      if (Array.isArray(container)) {
        container.forEach(item => processDayObj(item));
      } else if (typeof container === 'object') {
        Object.keys(container).forEach(key => processDayObj(container[key], key));
      }
    }
    // 3. Object key-value map: { "2026-09-02": { ... }, "2026-09-03": { ... } }
    else if (typeof rawData === 'object') {
      Object.keys(rawData).forEach(key => {
        processDayObj(rawData[key], key);
      });
    }

    const detectedDaysCount = Object.keys(entries).length;

    return {
      success: detectedDaysCount > 0,
      entries,
      detectedDaysCount,
      totalSlotsCount: totalSlots,
      logs,
      rawFormatDetected: 'json'
    };
  } catch (err: any) {
    return {
      success: false,
      entries: {},
      detectedDaysCount: 0,
      totalSlotsCount: 0,
      logs: [`JSON 파싱 에러: ${err.message}`],
      rawFormatDetected: 'unknown'
    };
  }
}
