/**
 * Date utilities for Telofy
 */

import { 
  format, 
  formatDistanceToNow, 
  isToday, 
  isTomorrow, 
  isYesterday,
  startOfDay,
  endOfDay,
  addDays,
  differenceInDays,
  differenceInMinutes,
} from 'date-fns';

/**
 * Format a date for display in task lists
 */
export function formatTaskDate(date: Date): string {
  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  }
  if (isTomorrow(date)) {
    return `Tomorrow, ${format(date, 'h:mm a')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, h:mm a');
}

/**
 * Format time for display (HH:mm format)
 */
export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Get relative time string (e.g., "in 5 minutes", "2 hours ago")
 */
export function getRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Check if a task is overdue
 */
export function isOverdue(scheduledAt: Date): boolean {
  return new Date() > scheduledAt;
}

/**
 * Get minutes until a scheduled time
 */
export function getMinutesUntil(date: Date): number {
  return differenceInMinutes(date, new Date());
}

/**
 * Get days since a date
 */
export function getDaysSince(date: Date): number {
  return differenceInDays(new Date(), date);
}

/**
 * Get start and end of day for date filtering
 */
export function getDayBounds(date: Date): { start: Date; end: Date } {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}

/**
 * Generate an array of dates for a week view
 */
export function getWeekDates(startDate: Date = new Date()): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startOfDay(startDate), i));
}

/**
 * Check if a date is the same local day as another date
 * Uses local timezone, not UTC
 */
export function isSameLocalDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Re-export isToday from date-fns for convenience
export { isToday, isTomorrow, isYesterday };
