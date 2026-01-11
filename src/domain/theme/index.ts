/**
 * Theme Domain Module
 *
 * Theme application and OS detection functions.
 */

export type { EffectiveTheme } from './types';
export {
  getEffectiveTheme,
  isSystemDarkMode,
  applyTheme,
  subscribeToSystemThemeChanges,
  updateTheme,
  initializeTheme,
} from './themeService';
