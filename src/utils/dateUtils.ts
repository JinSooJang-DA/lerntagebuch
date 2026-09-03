/**
 * Utilities for strictly Monday through Friday workdays calendar management
 */

export function formatDateIso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateIso(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0); // midday to avoid DST drift
}

/**
 * Returns the Monday of the week containing the given date
 */
export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  const day = date.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days to Monday; otherwise go to Monday
  date.setDate(date.getDate() + diff);
  return date;
}

/**
 * Returns strictly 5 days (Monday to Friday) for the week of referenceDate
 */
export function getWorkdaysOfWeek(referenceDate: Date): Date[] {
  const monday = getMondayOfWeek(referenceDate);
  const days: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const nextDay = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i, 12, 0, 0);
    days.push(nextDay);
  }
  return days;
}

/**
 * Returns all Monday to Friday dates for a given month, grouped by work weeks
 */
export function getWorkdaysOfMonthGrid(year: number, month: number): Date[][] {
  // First day of month
  const firstDay = new Date(year, month, 1, 12, 0, 0);
  // Last day of month
  const lastDay = new Date(year, month + 1, 0, 12, 0, 0);

  // Find the Monday of the first week
  let currentMonday = getMondayOfWeek(firstDay);
  const weeks: Date[][] = [];

  while (currentMonday <= lastDay || currentMonday.getMonth() === month) {
    const week = getWorkdaysOfWeek(currentMonday);
    // Only include if at least one day in the week is in this month
    const hasDaysInMonth = week.some(d => d.getMonth() === month);
    if (hasDaysInMonth) {
      weeks.push(week);
    }
    // Move to next Monday
    currentMonday = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + 7, 12, 0, 0);
    if (currentMonday > lastDay && currentMonday.getMonth() !== month) {
      break;
    }
  }

  return weeks;
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatWeekRange(dates: Date[]): string {
  if (!dates.length) return '';
  const start = dates[0];
  const end = dates[dates.length - 1];
  
  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

/**
 * Formats date as DD.MM.YYYY e.g. "02.09.2026"
 */
export function formatDatumDot(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function getWeekdayGerman(d: Date): string {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  return days[d.getDay()];
}

export function getWeekdayGermanFull(d: Date): string {
  const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  return days[d.getDay()];
}

/**
 * Calculate duration between two "HH:mm" strings in hours
 */
export function calculateHours(startTime: string, endTime: string): number {
  try {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    if (endMin <= startMin) return 0;
    return parseFloat(((endMin - startMin) / 60).toFixed(1));
  } catch {
    return 0;
  }
}
