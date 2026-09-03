import { DayEntry } from '../types';
import { FOTOGRAM_IMAGE_DATA_URL } from './fotogramAsset';

export function createDefaultDayEntry(dateStr: string): DayEntry {
  return {
    date: dateStr,
    timeSlots: [
      {
        id: `slot-${dateStr}-1`,
        startTime: '09:00',
        endTime: '10:20',
        title: 'Live-Calls',
        content: 'Online Frontend Live-Call & Daily Standup',
        completed: true
      },
      {
        id: `slot-${dateStr}-2`,
        startTime: '10:30',
        endTime: '12:30',
        title: 'Fotogram Project gemacht',
        content: 'Feature implementation and code structuring',
        completed: false
      }
    ],
    summary: '',
    questionsForInstructor: '',
    homeworkStatus: 'not_started',
    attachments: [],
    updatedAt: new Date().toISOString()
  };
}

export const INITIAL_ENTRIES: Record<string, DayEntry> = {
  // Monday, Aug 31, 2026
  '2026-08-31': {
    date: '2026-08-31',
    timeSlots: [
      {
        id: 'slot-31-1',
        startTime: '09:00',
        endTime: '10:30',
        title: 'Live-Calls',
        content: 'Modern TypeScript Generics & Type-Safe Patterns. Discriminated unions for async API states.',
        completed: true
      },
      {
        id: 'slot-31-2',
        startTime: '10:45',
        endTime: '12:15',
        title: 'Refactoring Component Props with Discriminated Unions',
        content: 'Converted AsyncStatusCard component to use discriminated unions instead of multiple nullable boolean flags.',
        codeSnippet: `type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };`,
        completed: true
      },
      {
        id: 'slot-31-3',
        startTime: '13:30',
        endTime: '15:30',
        title: 'Generic Table Component Architecture',
        content: 'Built DataTable<T> with custom accessor functions and type-safe sort definitions.',
        completed: true
      },
      {
        id: 'slot-31-4',
        startTime: '16:00',
        endTime: '17:30',
        title: 'Daily Code Review & Git Branch Cleanup',
        content: 'Created feature PR for generic table component. Self-reviewed diff and tested edge cases.',
        completed: true
      }
    ],
    summary: 'Great start to the week. Solidified generic constraints and cleaned up ambiguous component props.',
    questionsForInstructor: 'When building polymorphic React components, what is the cleanest approach in TypeScript 5+ without excessive assertion?',
    homeworkStatus: 'submitted',
    attachments: [],
    updatedAt: '2026-08-31T17:45:00Z'
  },

  // Tuesday, Sep 1, 2026
  '2026-09-01': {
    date: '2026-09-01',
    timeSlots: [
      {
        id: 'slot-01-1',
        startTime: '09:00',
        endTime: '10:30',
        title: 'Live-Calls',
        content: 'React 19 Server Components, Actions & useActionState. Optimistic UI updates with useOptimistic.',
        completed: true
      },
      {
        id: 'slot-01-2',
        startTime: '10:45',
        endTime: '12:30',
        title: 'Testing useOptimistic in a Todo List Prototype',
        content: 'Created an isolated experimental branch to test instant item completion before server resolution.',
        codeSnippet: `const [optimisticItems, setOptimisticItems] = useOptimistic(
  items,
  (current, newItem: Item) => [...current, newItem]
);`,
        completed: true
      },
      {
        id: 'slot-01-3',
        startTime: '14:00',
        endTime: '16:30',
        title: 'Assignment: Shopping Cart Optimistic Counter',
        content: 'Implemented optimistic cart quantity increase with roll-back on server rejected status.',
        completed: true
      }
    ],
    summary: 'Learned the difference between classical useEffect fetching and modern React 19 form actions.',
    questionsForInstructor: 'If a network action fails after 3 seconds, what is the best UX pattern for notifying the user that optimistic state was rolled back?',
    homeworkStatus: 'reviewed',
    attachments: [],
    updatedAt: '2026-09-01T17:00:00Z'
  },

  // Wednesday, Sep 2, 2026 - Exactly matches Screenshot 2!
  '2026-09-02': {
    date: '2026-09-02',
    timeSlots: [
      {
        id: 'slot-02-1',
        startTime: '09:00',
        endTime: '10:20',
        title: 'Live-Calls',
        content: 'Online Frontend Live-Call & Daily Standup. Reviewed architectural blueprints for media album application.',
        completed: true
      },
      {
        id: 'slot-02-2',
        startTime: '10:20',
        endTime: '12:00',
        title: 'Fotogram Project gemacht',
        content: 'Setup base repository, responsive grid scaffold, and dark slate color scheme for album cards.',
        completed: true
      },
      {
        id: 'slot-02-3',
        startTime: '12:30',
        endTime: '14:30',
        title: 'Fotogram Project gemacht',
        content: 'Card components styling, album grid hover effects, and typography pairing.',
        completed: true
      },
      {
        id: 'slot-02-4',
        startTime: '16:00',
        endTime: '17:00',
        title: 'Fotogram Project gemacht',
        content: 'Integrated image modal viewer and light/dark theme contrast handling.',
        completed: true
      },
      {
        id: 'slot-02-5',
        startTime: '19:00',
        endTime: '20:30',
        title: 'Fotogram Project gemacht',
        content: 'Refined album preview cards and asset optimization for mobile devices.',
        completed: true
      },
      {
        id: 'slot-02-6',
        startTime: '22:00',
        endTime: '00:30',
        title: 'Fotogram Project gemacht',
        content: 'Completed personal photo album gallery showcase with Citycat band member cards.',
        attachments: [
          {
            id: 'att-fotogram-preview',
            name: 'fotogram-project-album-preview.png',
            size: 384000,
            type: 'image/png',
            dataUrl: FOTOGRAM_IMAGE_DATA_URL,
            uploadedAt: '2026-09-02T23:30:00Z'
          }
        ],
        completed: true
      }
    ],
    summary: 'Completed full Fotogram album project sprint. Grid layout behaves responsively across all breakpoints.',
    questionsForInstructor: 'How to best optimize heavy image galleries with virtual scrolling in React 19?',
    homeworkStatus: 'submitted',
    attachments: [],
    updatedAt: '2026-09-02T23:55:00Z'
  },

  // Thursday, Sep 3, 2026
  '2026-09-03': {
    date: '2026-09-03',
    timeSlots: [
      {
        id: 'slot-03-1',
        startTime: '09:00',
        endTime: '10:20',
        title: 'Live-Calls',
        content: 'Web Vitals & Performance optimization. Profiling long tasks with Chrome DevTools.',
        completed: true
      },
      {
        id: 'slot-03-2',
        startTime: '10:45',
        endTime: '12:30',
        title: 'Bundle Size Analysis with Rollup Plugin Visualizer',
        content: 'Analyzed vendor chunk size. Discovered large moment.js dependency in an older package, migrated to date-fns.',
        completed: true
      },
      {
        id: 'slot-03-3',
        startTime: '14:00',
        endTime: '16:00',
        title: 'Implementing Dynamic Imports for Heavy Chart and Modal Views',
        content: 'Wrapped markdown parsers and canvas renderers with dynamic import to reduce initial bundle.',
        codeSnippet: `const HeavyChart = lazy(() => import('./components/HeavyChart'));`,
        completed: true
      },
      {
        id: 'slot-03-4',
        startTime: '16:15',
        endTime: '18:00',
        title: 'Preparing Learning Diary App and Deployment Pipeline',
        content: 'Building Jin Soo Jang\'s Learning Diary with minimalist table view and GitHub export.',
        completed: true
      }
    ],
    summary: 'Analyzed web vitals metrics. Reduced bundle footprint significantly by lazy-loading route-level modules.',
    questionsForInstructor: 'What are the recommended thresholds for INP in high-frequency interactive canvas apps?',
    homeworkStatus: 'in_progress',
    attachments: [],
    updatedAt: '2026-09-03T18:00:00Z'
  },

  // Friday, Sep 4, 2026
  '2026-09-04': {
    date: '2026-09-04',
    timeSlots: [
      {
        id: 'slot-04-1',
        startTime: '09:00',
        endTime: '10:30',
        title: 'Live-Calls',
        content: 'Weekly Project Presentation, Code Review & Production Deployment. CI/CD with GitHub Actions.',
        completed: false
      },
      {
        id: 'slot-04-2',
        startTime: '10:45',
        endTime: '12:30',
        title: 'Final Code Cleanup & PR Submission',
        content: 'Verify all TypeScript types pass without errors, write comprehensive README, and push to GitHub repository.',
        completed: false
      },
      {
        id: 'slot-04-3',
        startTime: '14:00',
        endTime: '16:30',
        title: 'Peer Review & Weekly Learning Log Export',
        content: 'Export weekly learning diary for instructor review and participate in team feedback session.',
        completed: false
      }
    ],
    summary: '',
    questionsForInstructor: '',
    homeworkStatus: 'not_started',
    attachments: [],
    updatedAt: '2026-09-04T08:00:00Z'
  }
};
