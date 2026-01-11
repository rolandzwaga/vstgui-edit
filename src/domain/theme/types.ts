/**
 * Theme Types
 *
 * Type definitions for the theme system.
 */

/**
 * The actual theme being applied to the document.
 * Derived from ThemeMode - when mode is 'system', this is resolved
 * based on OS preference.
 */
export type EffectiveTheme = 'light' | 'dark';
