/**
 * Theme Service
 *
 * Theme application and OS detection functions.
 * Handles applying themes to the document and detecting system preferences.
 */

import { preferencesStore } from '../../stores/preferencesStore';
import type { ThemeMode } from '../preferences/types';
import type { EffectiveTheme } from './types';

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
export function getEffectiveTheme(
  mode: ThemeMode,
  systemPrefersDark: boolean
): EffectiveTheme {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  // mode === 'system'
  return systemPrefersDark ? 'dark' : 'light';
}

/**
 * Checks if the operating system prefers dark mode.
 *
 * @returns True if OS prefers dark mode, false otherwise
 *
 * @example
 * const prefersDark = isSystemDarkMode();
 */
export function isSystemDarkMode(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

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
export function applyTheme(theme: EffectiveTheme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

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
export function subscribeToSystemThemeChanges(callback: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);

  return () => {
    mediaQuery.removeEventListener('change', callback);
  };
}

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
export function updateTheme(): void {
  const mode = preferencesStore.preferences.theme.mode;
  const effectiveTheme = getEffectiveTheme(mode, isSystemDarkMode());
  applyTheme(effectiveTheme);
}

/**
 * Initializes the theme system.
 * - Reads current mode from preferencesStore
 * - Calculates effective theme
 * - Applies theme to document
 *
 * Should be called once after preferencesStore is initialized.
 *
 * @example
 * // In App.tsx
 * initializePreferences();
 * initializeTheme();
 */
export function initializeTheme(): void {
  updateTheme();
}
