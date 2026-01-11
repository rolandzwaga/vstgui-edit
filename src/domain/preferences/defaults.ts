/**
 * Default Preferences
 *
 * Default values used when:
 * - First-time user (no stored preferences)
 * - Corrupted preferences (schema validation fails)
 * - Missing fields in stored preferences
 */

import type { UserPreferences } from './types';

/**
 * Default user preferences.
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  version: 1,

  grid: {
    size: 10,
    style: 'lines',
    visibleByDefault: true,
  },

  snap: {
    enabledByDefault: true,
    threshold: 5,
  },

  smartGuides: {
    enabledByDefault: true,
  },

  customGuides: {
    snapEnabledByDefault: true,
  },

  theme: {
    mode: 'system',
  },

  ui: {
    alignmentToolbar: {
      isDocked: true,
      floatingPosition: null,
    },
  },

  save: {
    format: null, // Uses file's original format
  },
};
