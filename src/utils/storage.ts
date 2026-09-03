import { DayEntry, TimeSlotRow } from '../types';
import { INITIAL_ENTRIES, createDefaultDayEntry } from '../data/initialEntries';
import { formatDatumDot, parseDateIso } from './dateUtils';
import { extractSlotTitleAndContent, normalizeTimeString } from './diaryParser';

const STORAGE_KEY = 'jinsoo_learning_diary_clean_v1';

/**
 * Normalizes an entry so it strictly has clean `timeSlots`,
 * ensuring any generic "Study Session" titles are resolved to their true themes.
 */
export function normalizeEntry(raw: any, dateStr: string): DayEntry {
  if (!raw) return createDefaultDayEntry(dateStr);

  let timeSlots: TimeSlotRow[] = [];

  if (Array.isArray(raw.timeSlots) && raw.timeSlots.length > 0) {
    timeSlots = raw.timeSlots.map((s: any) => {
      const extracted = extractSlotTitleAndContent(s);
      return {
        id: s.id || `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        startTime: normalizeTimeString(s.startTime || s.start || '09:00'),
        endTime: normalizeTimeString(s.endTime || s.end || '10:30'),
        title: extracted.title,
        content: extracted.content,
        codeSnippet: s.codeSnippet || undefined,
        attachments: s.attachments || [],
        completed: s.completed ?? true
      };
    });
  } else {
    // Check if legacy fixedLecture or customSlots are present
    if (raw.fixedLecture && (raw.fixedLecture.topic || raw.fixedLecture.thema || raw.fixedLecture.theme)) {
      const extracted = extractSlotTitleAndContent({
        theme: raw.fixedLecture.topic || raw.fixedLecture.thema || raw.fixedLecture.theme,
        content: raw.fixedLecture.instructorNotes || (raw.fixedLecture.keyConcepts ? raw.fixedLecture.keyConcepts.join(', ') : '')
      });
      timeSlots.push({
        id: `slot-migrated-lecture`,
        startTime: '09:00',
        endTime: '10:20',
        title: extracted.title,
        content: extracted.content,
        completed: raw.fixedLecture.completed ?? true
      });
    }

    if (Array.isArray(raw.customSlots)) {
      raw.customSlots.forEach((cs: any, idx: number) => {
        const extracted = extractSlotTitleAndContent(cs);
        timeSlots.push({
          id: cs.id || `slot-migrated-${idx}`,
          startTime: normalizeTimeString(cs.startTime || '11:00'),
          endTime: normalizeTimeString(cs.endTime || '12:30'),
          title: extracted.title,
          content: extracted.content,
          codeSnippet: cs.codeSnippet,
          completed: cs.completed ?? true,
          attachments: cs.attachments || []
        });
      });
    }
  }

  // Sort slots by start time
  timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return {
    date: dateStr,
    timeSlots,
    summary: raw.summary || '',
    questionsForInstructor: raw.questionsForInstructor || '',
    homeworkStatus: raw.homeworkStatus || 'not_started',
    attachments: raw.attachments || [],
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
}

export function loadAllEntries(): Record<string, DayEntry> {
  try {
    // Purge old demo storage caches to ensure all calendars are empty
    ['jinsoo_learning_diary_table_v2', 'jinsoo_learning_diary_table_v1'].forEach(oldKey => {
      try { localStorage.removeItem(oldKey); } catch (_) {}
    });

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const combined: Record<string, DayEntry> = {};
      Object.keys(parsed).forEach(date => {
        combined[date] = normalizeEntry(parsed[date], date);
      });
      return combined;
    }
  } catch (err) {
    console.error('Error loading diary entries from localStorage', err);
  }

  // Initial clean empty slate
  return {};
}

export function saveAllEntries(entries: Record<string, DayEntry>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Error saving diary entries to localStorage', err);
  }
}

export function getOrCreateEntry(entries: Record<string, DayEntry>, dateStr: string): DayEntry {
  if (entries[dateStr]) {
    return normalizeEntry(entries[dateStr], dateStr);
  }
  return createDefaultDayEntry(dateStr);
}

/**
 * Generates clean GitHub-ready Markdown table for a single day entry
 * Matching Screenshot 2: "Lerntagebuch" - "Datum: [DD.MM.YYYY]"
 */
export function generateDayMarkdown(entry: DayEntry): string {
  const dateObj = parseDateIso(entry.date);
  const formattedDate = formatDatumDot(dateObj);

  let md = `# Lerntagebuch\n\n`;
  md += `## Datum: [${formattedDate}]\n\n`;
  md += `| Zeitraum | Thema & Notizen |\n`;
  md += `| :--- | :--- |\n`;

  if (!entry.timeSlots || entry.timeSlots.length === 0) {
    md += `| - | *Keine Einträge für diesen Tag* |\n`;
  } else {
    entry.timeSlots.forEach(slot => {
      const timeStr = `**${slot.startTime} – ${slot.endTime}**`;
      let notes = `• **${slot.title}**`;
      if (slot.content && slot.content.trim()) {
        notes += `<br>${slot.content.replace(/\n/g, '<br>')}`;
      }
      if (slot.codeSnippet && slot.codeSnippet.trim()) {
        notes += `<br><pre><code>${slot.codeSnippet.replace(/\n/g, '<br>')}</code></pre>`;
      }
      if (slot.attachments && slot.attachments.length > 0) {
        slot.attachments.forEach(att => {
          notes += `<br>🖼️ *[Anhang: ${att.name}]*`;
        });
      }
      md += `| ${timeStr} | ${notes} |\n`;
    });
  }

  if (entry.summary && entry.summary.trim()) {
    md += `\n**Zusammenfassung / Notizen:**  \n${entry.summary}\n`;
  }

  if (entry.questionsForInstructor && entry.questionsForInstructor.trim()) {
    md += `\n**Fragen an den Dozenten:**  \n> ${entry.questionsForInstructor.replace(/\n/g, '\n> ')}\n`;
  }

  return md;
}

/**
 * Generates weekly rollup markdown table
 */
export function generateWeeklyMarkdown(dates: string[], entries: Record<string, DayEntry>): string {
  let md = `# Lerntagebuch - Wochenübersicht\n\n`;
  md += `**Autor:** Jin Soo Jang  \n`;
  md += `**Zeitraum:** ${dates[0]} bis ${dates[dates.length - 1]}\n\n`;

  dates.forEach(d => {
    const entry = getOrCreateEntry(entries, d);
    md += generateDayMarkdown(entry);
    md += `\n---\n\n`;
  });

  return md;
}

export function triggerFileDownload(content: string, filename: string, mimeType: string = 'text/markdown'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
