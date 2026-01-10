/**
 * Format Preference utilities for localStorage persistence.
 *
 * Handles saving and retrieving the user's preferred save format.
 * Gracefully handles localStorage unavailability (e.g., private browsing).
 */

import type { SaveFormat } from '../serializer/types';

/**
 * localStorage key for format preference
 */
export const STORAGE_KEY = 'vstgui-edit:save-format';

/**
 * Check if a value is a valid SaveFormat.
 *
 * @param value - Value to check
 * @returns True if value is 'json' or 'xml'
 */
export function isValidSaveFormat(value: unknown): value is SaveFormat {
  return value === 'json' || value === 'xml';
}

/**
 * Retrieve saved format preference from localStorage.
 *
 * @returns The saved format preference, or null if:
 *   - No preference has been saved
 *   - localStorage is unavailable (private browsing)
 *   - Stored value is invalid
 */
export function getFormatPreference(): SaveFormat | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (isValidSaveFormat(value)) {
      return value;
    }
    return null;
  } catch {
    // localStorage unavailable (private browsing, etc.)
    return null;
  }
}

/**
 * Save format preference to localStorage.
 *
 * @param format - The format to save
 *
 * Silently fails if localStorage is unavailable.
 */
export function setFormatPreference(format: SaveFormat): void {
  try {
    localStorage.setItem(STORAGE_KEY, format);
  } catch {
    // Silently fail if localStorage unavailable
  }
}

/**
 * Clear format preference from localStorage.
 *
 * Silently fails if localStorage is unavailable.
 */
export function clearFormatPreference(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail if localStorage unavailable
  }
}
