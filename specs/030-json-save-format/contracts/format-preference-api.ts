/**
 * Format Preference API Contract
 *
 * This file defines the TypeScript interface for localStorage persistence.
 * Implementation: src/domain/save/formatPreference.ts
 */

import type { SaveFormat } from '../../../src/domain/serializer/types';

/**
 * localStorage key for format preference
 */
export declare const STORAGE_KEY: 'vstgui-edit:save-format';

/**
 * Retrieve saved format preference from localStorage.
 *
 * @returns The saved format preference, or null if:
 *   - No preference has been saved
 *   - localStorage is unavailable (private browsing)
 *   - Stored value is invalid
 */
export declare function getFormatPreference(): SaveFormat | null;

/**
 * Save format preference to localStorage.
 *
 * @param format - The format to save
 *
 * Silently fails if localStorage is unavailable.
 */
export declare function setFormatPreference(format: SaveFormat): void;

/**
 * Clear format preference from localStorage.
 *
 * Silently fails if localStorage is unavailable.
 */
export declare function clearFormatPreference(): void;

/**
 * Check if a value is a valid SaveFormat.
 *
 * @param value - Value to check
 * @returns True if value is 'json' or 'xml'
 */
export declare function isValidSaveFormat(value: unknown): value is SaveFormat;
