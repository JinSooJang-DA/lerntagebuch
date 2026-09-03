export interface DiaryAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: string;
}

export type SlotCategory = 'coding' | 'review' | 'lecture' | 'assignment' | 'reading' | 'debugging' | 'project';

export interface TimeSlotRow {
  id: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:20"
  title: string;     // e.g. "Live-Calls" or "Fotogram Project gemacht"
  category?: SlotCategory;
  content?: string;  // Detailed notes or description
  codeSnippet?: string;
  attachments?: DiaryAttachment[];
  completed?: boolean;
}

// Backward compatibility helper type
export interface FixedLecture {
  timeSlot: string;
  topic: string;
  instructorNotes: string;
  keyConcepts?: string[];
  completed?: boolean;
  meetingLink?: string;
}

export interface DayEntry {
  date: string; // "YYYY-MM-DD" e.g. "2026-09-02"
  timeSlots: TimeSlotRow[];
  summary?: string;
  questionsForInstructor?: string;
  homeworkStatus?: 'not_started' | 'in_progress' | 'submitted' | 'reviewed';
  attachments?: DiaryAttachment[];
  updatedAt: string;

  // Legacy fields for backward compatibility with existing saved localStorage entries
  fixedLecture?: FixedLecture;
  customSlots?: any[];
}

export type ViewScope = 'single' | 'weekly';
export type AppMode = 'view' | 'edit';
