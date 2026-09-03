import { DayEntry, TimeSlotRow } from '../types';
import { INITIAL_ENTRIES, createDefaultDayEntry } from '../data/initialEntries';
import { formatDatumDot, parseDateIso } from './dateUtils';

const STORAGE_KEY = 'jinsoo_learning_diary_table_v2';

/**
 * Normalizes an entry so it strictly has clean `timeSlots`
 */
export function normalizeEntry(raw: any, dateStr: string): DayEntry {
  if (!raw) return createDefaultDayEntry(dateStr);

  let timeSlots: TimeSlotRow[] = [];

  if (Array.isArray(raw.timeSlots) && raw.timeSlots.length > 0) {
    timeSlots = raw.timeSlots;
  } else {
    // Migrate legacy fixedLecture and customSlots if present
    if (raw.fixedLecture && raw.fixedLecture.topic) {
      timeSlots.push({
        id: `slot-migrated-lecture`,
        startTime: '09:00',
        endTime: '10:30',
        title: raw.fixedLecture.topic || 'Live-Calls',
        content: raw.fixedLecture.instructorNotes || (raw.fixedLecture.keyConcepts ? raw.fixedLecture.keyConcepts.join(', ') : ''),
        completed: raw.fixedLecture.completed ?? true
      });
    }

    if (Array.isArray(raw.customSlots)) {
      raw.customSlots.forEach((cs: any, idx: number) => {
        timeSlots.push({
          id: cs.id || `slot-migrated-${idx}`,
          startTime: cs.startTime || '11:00',
          endTime: cs.endTime || '12:30',
          title: cs.title || 'Study Session',
          content: cs.content || '',
          codeSnippet: cs.codeSnippet,
          completed: cs.completed ?? true,
          attachments: cs.attachments || []
        });
      });
    }
  }

  // Ensure default fallback if still empty
  if (timeSlots.length === 0) {
    timeSlots = createDefaultDayEntry(dateStr).timeSlots;
  }

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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const combined: Record<string, DayEntry> = { ...INITIAL_ENTRIES };
      Object.keys(parsed).forEach(date => {
        combined[date] = normalizeEntry(parsed[date], date);
      });
      return combined;
    }
  } catch (err) {
    console.error('Error loading diary entries from localStorage', err);
  }

  // First time or error: load initial entries normalized
  const combined: Record<string, DayEntry> = {};
  Object.keys(INITIAL_ENTRIES).forEach(date => {
    combined[date] = normalizeEntry(INITIAL_ENTRIES[date], date);
  });
  return combined;
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
