/**
 * Recent Colors Persistence
 *
 * Manages the list of recently used colors in localStorage.
 * Provides graceful degradation when localStorage is unavailable.
 */

// =============================================================================
// Constants
// =============================================================================

/** localStorage key for recent colors storage */
export const STORAGE_KEY = 'vstgui-edit:recent-colors';

/** Maximum number of recent colors to store */
export const MAX_RECENT_COLORS = 10;

// =============================================================================
// Storage Availability
// =============================================================================

/**
 * Check if localStorage is available for recent colors.
 *
 * @returns True if localStorage is accessible
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof localStorage === 'undefined' || localStorage === null) {
      return false;
    }
    // Test write access
    const testKey = '__test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get the list of recently used colors.
 *
 * @returns Array of hex color strings (e.g., ['#FF0000FF', '#00FF00FF'])
 *          Returns empty array if localStorage is unavailable or corrupted.
 */
export function getRecentColors(): string[] {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    // Validate parsed data is an array
    if (!Array.isArray(parsed)) {
      return [];
    }

    // Filter to only valid string entries
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    // Invalid JSON or other error
    return [];
  }
}

/**
 * Add a color to the recent colors list.
 *
 * - If the color already exists, it is moved to the front
 * - The list is limited to MAX_RECENT_COLORS
 * - Oldest colors are removed when the limit is exceeded
 * - Silently fails if localStorage is unavailable
 *
 * @param hex - Hex color string (must be valid 8-digit hex)
 */
export function addRecentColor(hex: string): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    // Get current colors
    const current = getRecentColors();

    // Remove duplicate if exists (will be re-added at front)
    const filtered = current.filter(color => color !== hex);

    // Add new color at the front
    const updated = [hex, ...filtered];

    // Limit to MAX_RECENT_COLORS
    const limited = updated.slice(0, MAX_RECENT_COLORS);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Clear all recent colors.
 *
 * Silently fails if localStorage is unavailable.
 */
export function clearRecentColors(): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}
