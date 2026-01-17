/**
 * ID generation utilities
 */

/**
 * Generate a UUID v4
 * This format is compatible with PostgreSQL uuid type
 */
export function generateId(): string {
  // Generate UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a short ID for display purposes
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
