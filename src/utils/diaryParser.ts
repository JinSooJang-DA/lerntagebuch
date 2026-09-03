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

/**
 * Checks if a title is a generic placeholder rather than an actual learning theme.
 */
export function isGenericTitle(t?: string | null): boolean {
  if (!t) return true;
  const clean = String(t).trim().toLowerCase().replace(/[-_\s]+/g, ' ');
  return (
    clean === '' ||
    clean === 'study session' ||
    clean === 'study sessions' ||
    clean === 'studysession' ||
    clean === 'coding slot' ||
    clean === 'coding slots' ||
    clean === 'lerneinheit' ||
    clean === 'lerneinheiten' ||
    clean === 'session' ||
    clean === 'slot' ||
    clean === 'study' ||
    clean === 'zeitraum' ||
    clean === 'thema' ||
    clean === 'thema & notizen' ||
    clean === 'theme' ||
    clean === 'unbenannt' ||
    clean === 'untitled'
  );
}

/**
 * Robustly extracts the real learning theme (Thema -> title) and notes/description (content)
 * from any slot, task, or activity object. Guarantees that the original theme always enters
 * the primary `title` position instead of being replaced by "Study Session".
 */
export function extractSlotTitleAndContent(rawSlot: any): { title: string; content?: string } {
  if (!rawSlot || typeof rawSlot !== 'object') {
    return { title: 'Lerneinheit' };
  }

  // 1. First priority: Check explicit theme/topic properties in the JSON
  const explicitThemeCandidate =
    rawSlot.theme ??
    rawSlot.thema ??
    rawSlot.topic ??
    rawSlot.subject ??
    rawSlot.titel ??
    rawSlot.headline ??
    rawSlot.task ??
    rawSlot.activity ??
    (!isGenericTitle(rawSlot.title) ? rawSlot.title : undefined) ??
    (!isGenericTitle(rawSlot.name) ? rawSlot.name : undefined);

  // Check available notes/description/content fields in the JSON
  const rawContent =
    rawSlot.content ??
    rawSlot.notes ??
    rawSlot.notizen ??
    rawSlot.description ??
    rawSlot.beschreibung ??
    rawSlot.desc ??
    rawSlot.inhalt ??
    rawSlot.details ??
    '';

  const contentStr = typeof rawContent === 'string' ? rawContent.trim() : String(rawContent || '').trim();

  // If an explicit theme candidate is present and is not a generic placeholder
  if (explicitThemeCandidate && !isGenericTitle(String(explicitThemeCandidate))) {
    const cleanTitle = String(explicitThemeCandidate)
      .trim()
      .replace(/^[•*\-\s]+/, '')
      .replace(/\*\*/g, '');

    let finalContent: string | undefined = contentStr || undefined;
    // If the content just repeats the exact title, don't duplicate it
    if (finalContent && finalContent.replace(/^[•*\-\s]+/, '').replace(/\*\*/g, '').trim() === cleanTitle) {
      finalContent = undefined;
    }

    return {
      title: cleanTitle || 'Lerneinheit',
      content: finalContent
    };
  }

  // 2. Second priority: When title is generic ("Study Session") or missing,
  // the theme was written inside the notes/content/description field!
  if (contentStr) {
    // Case 2a: Pattern like "Thema: Fotogram Project\nNotizen: Grid Layout"
    const themaPrefixMatch = contentStr.match(
      /^(?:thema|theme)\s*:\s*([^\n]+)(?:\n+(?:notizen|notes|beschreibung|description|inhalt)\s*:\s*([\s\S]*))?$/i
    );
    if (themaPrefixMatch) {
      return {
        title: themaPrefixMatch[1].trim().replace(/^[•*\-\s]+/, '').replace(/\*\*/g, ''),
        content: themaPrefixMatch[2]?.trim() || undefined
      };
    }

    // Case 2b: Bullet with colon or separator: "• Fotogram Project : Responsive Grid..."
    const bulletColonMatch = contentStr.match(
      /^[•*\-\s]*(?:\*\*)?([^*\n:–—-]+)(?:\*\*)?\s*(?::|[-–—]\s)([\s\S]*)$/
    );
    if (bulletColonMatch) {
      const extractedTitle = bulletColonMatch[1].trim().replace(/\*\*/g, '');
      const remainder = bulletColonMatch[2].trim();
      if (extractedTitle && !isGenericTitle(extractedTitle)) {
        return {
          title: extractedTitle,
          content: remainder || undefined
        };
      }
    }

    // Case 2c: Multi-line text: First line is the Theme, remaining lines are Notizen
    if (contentStr.includes('\n')) {
      const lines = contentStr.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        const firstLine = lines[0].replace(/^[•*\-\s]+/, '').replace(/\*\*/g, '').trim();
        const rest = lines.slice(1).join('\n').trim();
        if (firstLine && !isGenericTitle(firstLine)) {
          return {
            title: firstLine,
            content: rest || undefined
          };
        }
      }
    }

    // Case 2d: Single-line string without colon: The whole string is the theme!
    const singleClean = contentStr.replace(/^[•*\-\s]+/, '').replace(/\*\*/g, '').trim();
    if (singleClean && !isGenericTitle(singleClean)) {
      return {
        title: singleClean,
        content: undefined
      };
    }
  }

  // 3. Fallback: If rawSlot.title exists and is not generic, use it; otherwise 'Lerneinheit'
  const fallbackTitle = !isGenericTitle(rawSlot.title)
    ? String(rawSlot.title).trim()
    : 'Lerneinheit';

  return {
    title: fallbackTitle,
    content: contentStr || undefined
  };
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
      let content: string | undefined = undefined;

      // Check if it's a tab-separated line (Direct Google Docs table paste)
      if (rawLine.includes('\t')) {
        detectedFormat = 'google_docs_table';
        const parts = rawLine.split('\t').map(p => p.trim()).filter(Boolean);
        const nonTimeParts = parts.filter(p => !timeRangeRegex.test(p));
        if (nonTimeParts.length > 0) {
          if (nonTimeParts.length > 1) {
            const extracted = extractSlotTitleAndContent({
              title: nonTimeParts[0],
              content: nonTimeParts.slice(1).join('\n')
            });
            title = extracted.title;
            content = extracted.content;
          } else {
            // Single cell in Google Docs table containing theme and notes
            const extracted = extractSlotTitleAndContent({ content: nonTimeParts[0] });
            title = extracted.title;
            content = extracted.content;
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
        const extracted = extractSlotTitleAndContent({ content: cleanContent });
        title = extracted.title;
        content = extracted.content;
      } else {
        // Plain text row: "09:00 - 10:20 : Live-Calls - notes..."
        const remainder = line.replace(timeMatch[0], '').replace(/^[:\-–|\s]+/, '').trim();
        let candidateText = remainder;

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
          subNotes.push(nextLine);
          nextIdx++;
        }

        if (!candidateText && subNotes.length > 0) {
          // If the line only had the time, the first subsequent line IS the theme!
          candidateText = subNotes[0];
          const remainingSubNotes = subNotes.slice(1);
          const extracted = extractSlotTitleAndContent({
            content: candidateText + (remainingSubNotes.length > 0 ? '\n' + remainingSubNotes.join('\n') : '')
          });
          title = extracted.title;
          content = extracted.content;
          i = nextIdx - 1; // Advance outer loop
        } else if (candidateText) {
          const combined = subNotes.length > 0 ? candidateText + '\n' + subNotes.join('\n') : candidateText;
          const extracted = extractSlotTitleAndContent({ content: combined });
          title = extracted.title;
          content = extracted.content;
          if (subNotes.length > 0) {
            i = nextIdx - 1; // Advance outer loop
          }
        }
      }

      // Final cleanup - ensure title is non-empty and never generic
      if (!title || isGenericTitle(title)) {
        if (content) {
          const reExtract = extractSlotTitleAndContent({ content });
          title = reExtract.title;
          content = reExtract.content;
        } else {
          title = 'Lerneinheit';
        }
      }
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
          const extracted = extractSlotTitleAndContent(s);
          slots.push({
            id: s.id || `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            startTime: normalizeTimeString(s.startTime || s.start || '09:00'),
            endTime: normalizeTimeString(s.endTime || s.end || '10:30'),
            title: extracted.title,
            content: extracted.content,
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

          const extracted = extractSlotTitleAndContent(s);
          slots.push({
            id: s.id || `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            startTime,
            endTime,
            title: extracted.title,
            content: extracted.content,
            codeSnippet: s.codeSnippet || undefined,
            attachments: s.attachments || [],
            completed: s.completed ?? true
          });
        });
      }
      // Case C: Legacy format (fixedLecture, customSlots)
      else {
        if (obj.fixedLecture && (obj.fixedLecture.topic || obj.fixedLecture.thema || obj.fixedLecture.theme)) {
          const extracted = extractSlotTitleAndContent({
            theme: obj.fixedLecture.topic || obj.fixedLecture.thema || obj.fixedLecture.theme,
            content: obj.fixedLecture.instructorNotes || (obj.fixedLecture.keyConcepts ? obj.fixedLecture.keyConcepts.join(', ') : '')
          });
          slots.push({
            id: `slot-lecture-${Date.now()}`,
            startTime: '09:00',
            endTime: '10:20',
            title: extracted.title,
            content: extracted.content,
            completed: true
          });
        }
        if (Array.isArray(obj.customSlots)) {
          obj.customSlots.forEach((cs: any) => {
            const extracted = extractSlotTitleAndContent(cs);
            slots.push({
              id: cs.id || `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              startTime: normalizeTimeString(cs.startTime || '11:00'),
              endTime: normalizeTimeString(cs.endTime || '12:30'),
              title: extracted.title,
              content: extracted.content,
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
