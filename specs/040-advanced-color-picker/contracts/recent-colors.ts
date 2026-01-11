/**
 * Recent Colors Storage API Contract
 *
 * Persistence layer for recently used colors.
 * Uses localStorage with graceful degradation.
 */

// =============================================================================
// Constants
// =============================================================================

/** localStorage key for recent colors storage */
export const STORAGE_KEY = 'vstgui-edit:recent-colors';

/** Maximum number of recent colors to store */
export const MAX_RECENT_COLORS = 10;

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get the list of recently used colors.
 *
 * @returns Array of hex color strings (e.g., ['#FF0000FF', '#00FF00FF'])
 *          Returns empty array if localStorage is unavailable or corrupted.
 *
 * @example
 * getRecentColors() // ['#FF5500FF', '#2D2D2DFF', ...]
 * getRecentColors() // [] (no recent colors or localStorage unavailable)
 */
export function getRecentColors(): string[];

/**
 * Add a color to the recent colors list.
 *
 * - If the color already exists, it is moved to the front
 * - The list is limited to MAX_RECENT_COLORS
 * - Oldest colors are removed when the limit is exceeded
 * - Silently fails if localStorage is unavailable
 *
 * @param hex - Hex color string (must be valid 8-digit hex)
 *
 * @example
 * addRecentColor('#FF0000FF') // Adds red to front of list
 * addRecentColor('#FF0000FF') // Moves red to front (no duplicate)
 */
export function addRecentColor(hex: string): void;

/**
 * Clear all recent colors.
 *
 * Silently fails if localStorage is unavailable.
 */
export function clearRecentColors(): void;

/**
 * Check if localStorage is available for recent colors.
 *
 * @returns True if localStorage is accessible
 *
 * @example
 * isStorageAvailable() // true (normal browsing)
 * isStorageAvailable() // false (private mode, storage disabled)
 */
export function isStorageAvailable(): boolean;
