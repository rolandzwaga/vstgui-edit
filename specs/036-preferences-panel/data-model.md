# Data Model: Preferences Panel

**Feature**: 036-preferences-panel
**Date**: 2026-01-11

## Overview

This document defines the data structures for the unified preferences system. All preferences are stored as a single JSON object in localStorage under the key `vstgui-edit:preferences`.

## Core Types

### UserPreferences

The root object stored in localStorage.

```typescript
/**
 * Complete user preferences structure stored in localStorage.
 * All fields are optional during parsing to handle partial/corrupted data.
 */
export interface UserPreferences {
  /** Preferences schema version for future migrations */
  version: 1;

  /** Grid display and behavior settings */
  grid: GridPreferences;

  /** Snap-to-grid settings */
  snap: SnapPreferences;

  /** Smart alignment guides settings */
  smartGuides: SmartGuidesPreferences;

  /** Custom guide lines settings */
  customGuides: CustomGuidesPreferences;

  /** Visual theme settings */
  theme: ThemePreferences;

  /** UI component state (migrated from legacy keys) */
  ui: UIPreferences;

  /** Save format settings (migrated from legacy keys) */
  save: SavePreferences;
}
```

### GridPreferences

```typescript
/**
 * Grid display settings.
 */
export interface GridPreferences {
  /** Grid spacing in pixels */
  size: GridSizePreset;

  /** Visual style of grid lines */
  style: GridStyle;

  /** Whether grid is visible when opening a document */
  visibleByDefault: boolean;
}

/** Valid grid size presets */
export type GridSizePreset = 5 | 8 | 10 | 12 | 16 | 20;

/** Grid visual styles */
export type GridStyle = 'lines' | 'dots' | 'crosshairs';
```

### SnapPreferences

```typescript
/**
 * Snap-to-grid behavior settings.
 */
export interface SnapPreferences {
  /** Whether snap-to-grid is enabled when opening a document */
  enabledByDefault: boolean;

  /** Distance in pixels within which views snap to grid lines (1-20) */
  threshold: number;
}
```

### SmartGuidesPreferences

```typescript
/**
 * Smart alignment guides settings.
 */
export interface SmartGuidesPreferences {
  /** Whether smart guides are enabled when opening a document */
  enabledByDefault: boolean;
}
```

### CustomGuidesPreferences

```typescript
/**
 * Custom guide lines settings.
 */
export interface CustomGuidesPreferences {
  /** Whether snap-to-guides is enabled when opening a document */
  snapEnabledByDefault: boolean;
}
```

### ThemePreferences

```typescript
/**
 * Visual theme settings.
 * Note: Theme application is stubbed in initial implementation.
 */
export interface ThemePreferences {
  /** Selected theme mode */
  mode: ThemeMode;
}

/** Theme mode options */
export type ThemeMode = 'light' | 'dark' | 'system';
```

### UIPreferences

```typescript
/**
 * UI component state (migrated from legacy localStorage keys).
 */
export interface UIPreferences {
  /** Alignment toolbar dock/float state */
  alignmentToolbar: AlignmentToolbarState;
}

/** Alignment toolbar state (from alignmentToolbarStore) */
export interface AlignmentToolbarState {
  /** Whether toolbar is docked or floating */
  isDocked: boolean;

  /** Position when floating (null when docked) */
  floatingPosition: { x: number; y: number } | null;
}
```

### SavePreferences

```typescript
/**
 * Save format settings (migrated from legacy localStorage keys).
 */
export interface SavePreferences {
  /** Preferred save format */
  format: SaveFormat | null;
}

/** Save format options */
export type SaveFormat = 'json' | 'xml';
```

## UI Types

### PreferencesSection

```typescript
/**
 * Navigation sections in the preferences panel.
 */
export type PreferencesSection =
  | 'grid'
  | 'snap'
  | 'smartGuides'
  | 'customGuides'
  | 'theme'
  | 'shortcuts';

/**
 * Section metadata for sidebar navigation.
 */
export interface PreferencesSectionInfo {
  id: PreferencesSection;
  label: string;
  icon: IconDefinition;  // FontAwesome icon
}

/**
 * All sections in display order.
 */
export const PREFERENCES_SECTIONS: PreferencesSectionInfo[] = [
  { id: 'grid', label: 'Grid', icon: faGrid },
  { id: 'snap', label: 'Snap', icon: faMagnet },
  { id: 'smartGuides', label: 'Smart Guides', icon: faRulerCombined },
  { id: 'customGuides', label: 'Custom Guides', icon: faRuler },
  { id: 'theme', label: 'Theme', icon: faPalette },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: faKeyboard },
];
```

### KeyboardShortcut

```typescript
/**
 * A single keyboard shortcut entry.
 */
export interface KeyboardShortcut {
  /** Key combination display string */
  keys: string;

  /** Action description */
  description: string;
}

/**
 * A category of related shortcuts.
 */
export interface ShortcutCategory {
  /** Category name */
  name: string;

  /** Shortcuts in this category */
  shortcuts: KeyboardShortcut[];
}
```

## Default Values

```typescript
/**
 * Default preferences used when:
 * - First-time user (no stored preferences)
 * - Corrupted preferences (schema validation fails)
 * - Missing fields in stored preferences
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
    format: null,  // Uses file's original format
  },
};
```

## Validation Schema

```typescript
/**
 * JSON Schema for preferences validation (AJV).
 */
export const PREFERENCES_SCHEMA = {
  type: 'object',
  required: ['version'],
  properties: {
    version: { type: 'number', const: 1 },

    grid: {
      type: 'object',
      properties: {
        size: { type: 'number', enum: [5, 8, 10, 12, 16, 20] },
        style: { type: 'string', enum: ['lines', 'dots', 'crosshairs'] },
        visibleByDefault: { type: 'boolean' },
      },
    },

    snap: {
      type: 'object',
      properties: {
        enabledByDefault: { type: 'boolean' },
        threshold: { type: 'number', minimum: 1, maximum: 20 },
      },
    },

    smartGuides: {
      type: 'object',
      properties: {
        enabledByDefault: { type: 'boolean' },
      },
    },

    customGuides: {
      type: 'object',
      properties: {
        snapEnabledByDefault: { type: 'boolean' },
      },
    },

    theme: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['light', 'dark', 'system'] },
      },
    },

    ui: {
      type: 'object',
      properties: {
        alignmentToolbar: {
          type: 'object',
          properties: {
            isDocked: { type: 'boolean' },
            floatingPosition: {
              oneOf: [
                { type: 'null' },
                {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' },
                  },
                  required: ['x', 'y'],
                },
              ],
            },
          },
        },
      },
    },

    save: {
      type: 'object',
      properties: {
        format: {
          oneOf: [
            { type: 'null' },
            { type: 'string', enum: ['json', 'xml'] },
          ],
        },
      },
    },
  },
};
```

## Migration Mapping

| Legacy Key | Legacy Structure | New Location |
|------------|------------------|--------------|
| `vstgui-edit:alignment-toolbar` | `{ isDocked: boolean, floatingPosition: Point \| null }` | `preferences.ui.alignmentToolbar` |
| `vstgui-edit:save-format` | `'json' \| 'xml'` (plain string) | `preferences.save.format` |

## Store State

```typescript
/**
 * Reactive store state for preferences panel.
 */
export interface PreferencesState {
  /** Current preferences (reactive) */
  preferences: UserPreferences;

  /** Whether preferences panel is open */
  isOpen: boolean;

  /** Currently selected section in sidebar */
  activeSection: PreferencesSection;

  /** Whether reset confirmation dialog is shown */
  isResetDialogOpen: boolean;

  /** Whether preferences have been modified from defaults */
  isDirty: boolean;
}
```

## Relationships

```
UserPreferences
├── GridPreferences
├── SnapPreferences
├── SmartGuidesPreferences
├── CustomGuidesPreferences
├── ThemePreferences
├── UIPreferences
│   └── AlignmentToolbarState
└── SavePreferences

PreferencesState
├── UserPreferences
├── isOpen (boolean)
├── activeSection (PreferencesSection)
├── isResetDialogOpen (boolean)
└── isDirty (boolean)

ShortcutCategory[]
└── KeyboardShortcut[]
```

## Entity Constraints

### GridPreferences
- `size`: Must be one of [5, 8, 10, 12, 16, 20]
- `style`: Must be one of ['lines', 'dots', 'crosshairs']
- `visibleByDefault`: Boolean

### SnapPreferences
- `enabledByDefault`: Boolean
- `threshold`: Integer 1-20 inclusive

### ThemePreferences
- `mode`: Must be one of ['light', 'dark', 'system']
- Note: 'system' follows `prefers-color-scheme` media query

### AlignmentToolbarState
- `floatingPosition`: Either null (docked) or `{ x: number, y: number }`
- When `isDocked` is true, `floatingPosition` should be null
