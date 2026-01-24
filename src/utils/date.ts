// Date utility functions

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Format a date string for display
 */
export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateString === getTodayDate()) {
    return 'Today';
  }
  
  if (dateString === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format a date for short display (e.g., "Mon, Jan 15")
 */
export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Add or subtract days from a date
 */
export const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Check if a date is today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayDate();
};

/**
 * Check if a date is yesterday
 */
export const isYesterday = (dateString: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateString === yesterday.toISOString().split('T')[0];
};

/**
 * Get the start of the week (Monday) for a given date
 */
export const getWeekStart = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
};

/**
 * Get the start of the month for a given date
 */
export const getMonthStart = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
};

/**
 * Get an array of dates between two dates
 */
export const getDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};

/**
 * Format time from Date object
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatShortDate(date.toISOString().split('T')[0]);
};
