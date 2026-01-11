/**
 * Theme Domain Module
 *
 * Theme application and OS detection functions.
 */

export {
  applyTheme,
  getEffectiveTheme,
  initializeTheme,
  isSystemDarkMode,
  subscribeToSystemThemeChanges,
  updateTheme,
} from './themeService';
export type { EffectiveTheme } from './types';
