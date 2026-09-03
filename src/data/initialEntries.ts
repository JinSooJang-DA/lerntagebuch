import { DayEntry } from '../types';

export function createDefaultDayEntry(dateStr: string): DayEntry {
  return {
    date: dateStr,
    timeSlots: [],
    summary: '',
    questionsForInstructor: '',
    homeworkStatus: 'not_started',
    attachments: [],
    updatedAt: new Date().toISOString()
  };
}

/**
 * All calendars start completely clean and empty as requested.
 */
export const INITIAL_ENTRIES: Record<string, DayEntry> = {};
