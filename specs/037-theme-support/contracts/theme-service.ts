/**
 * Theme Service Contract
 *
 * TypeScript interface definitions for the theme service module.
 * This is the API contract - implementations must satisfy these signatures.
 */

import type { ThemeMode } from '../../../src/domain/preferences/types';

/**
 * The actual theme being applied to the document.
 * When mode is 'system', this is resolved based on OS preference.
 */
export type EffectiveTheme = 'light' | 'dark';

/**
 * Gets the effective theme based on mode and system preference.
 *
 * @param mode - The user's selected theme mode
 * @param systemPrefersDark - Whether the OS prefers dark mode
 * @returns The effective theme to apply
 *
 * @example
 * getEffectiveTheme('light', true) // => 'light'
 * getEffectiveTheme('dark', false) // => 'dark'
 * getEffectiveTheme('system', true) // => 'dark'
 * getEffectiveTheme('system', false) // => 'light'
 */
export function getEffectiveTheme(mode: ThemeMode, systemPrefersDark: boolean): EffectiveTheme;

/**
 * Checks if the operating system prefers dark mode.
 *
 * @returns True if OS prefers dark mode, false otherwise
 *
 * @example
 * const prefersDark = isSystemDarkMode();
 */
export function isSystemDarkMode(): boolean;

/**
 * Applies the specified theme to the document.
 * Sets the data-theme attribute on document.documentElement.
 *
 * @param theme - The theme to apply ('light' or 'dark')
 *
 * @example
 * applyTheme('dark');
 * // document.documentElement.dataset.theme === 'dark'
 */
export function applyTheme(theme: EffectiveTheme): void;

/**
 * Initializes the theme system.
 * - Reads current mode from preferencesStore
 * - Calculates effective theme
 * - Applies theme to document
 * - Sets up OS theme change listener (if mode is 'system')
 *
 * Should be called once after preferencesStore is initialized.
 *
 * @example
 * // In App.tsx
 * initializePreferences();
 * initializeTheme();
 */
export function initializeTheme(): void;

/**
 * Subscribes to system theme changes.
 * Callback is invoked when OS theme preference changes.
 *
 * @param callback - Function to call when system theme changes
 * @returns Cleanup function to unsubscribe
 *
 * @example
 * const unsubscribe = subscribeToSystemThemeChanges(() => {
 *   console.log('System theme changed');
 * });
 * // Later: unsubscribe();
 */
export function subscribeToSystemThemeChanges(callback: () => void): () => void;

/**
 * Updates theme based on current preferences.
 * Should be called when theme mode preference changes.
 *
 * @example
 * // In createEffect watching preferencesStore.preferences.theme.mode
 * createEffect(() => {
 *   const mode = preferencesStore.preferences.theme.mode;
 *   updateTheme();
 * });
 */
export function updateTheme(): void;
