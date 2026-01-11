# Data Model: Theme Support

**Feature**: 037-theme-support
**Date**: 2026-01-11

## Overview

Theme support uses existing types and extends the CSS custom property system. No new data entities are required - the `ThemeMode` type and `ThemePreferences` interface already exist in the codebase.

## Existing Types (No Changes Required)

### ThemeMode

**Location**: `src/domain/preferences/types.ts` (line 75)

```typescript
/** Theme mode options */
export type ThemeMode = 'light' | 'dark' | 'system';
```

### ThemePreferences

**Location**: `src/domain/preferences/types.ts` (lines 80-84)

```typescript
/**
 * Visual theme settings.
 * Note: Theme application is stubbed in initial implementation.
 */
export interface ThemePreferences {
  /** Selected theme mode */
  mode: ThemeMode;
}
```

### DEFAULT_PREFERENCES.theme

**Location**: `src/domain/preferences/defaults.ts` (lines 36-38)

```typescript
theme: {
  mode: 'system',
},
```

## New Type: EffectiveTheme

**Location**: `src/domain/theme/types.ts` (new file)

```typescript
/**
 * The actual theme being applied to the document.
 * Derived from ThemeMode - when mode is 'system', this is resolved
 * based on OS preference.
 */
export type EffectiveTheme = 'light' | 'dark';
```

## CSS Custom Property Schema

### Semantic Color Variables

All semantic colors use this pattern in `tokens.css`:

| Variable | Light Theme Value | Dark Theme Value |
|----------|------------------|------------------|
| `--color-background` | `var(--color-neutral-50)` | `var(--color-neutral-900)` |
| `--color-surface` | `#ffffff` | `var(--color-neutral-800)` |
| `--color-text-primary` | `var(--color-neutral-900)` | `var(--color-neutral-50)` |
| `--color-text-secondary` | `var(--color-neutral-600)` | `var(--color-neutral-400)` |
| `--color-text-muted` | `var(--color-neutral-400)` | `var(--color-neutral-500)` |
| `--color-border` | `var(--color-neutral-200)` | `var(--color-neutral-700)` |
| `--color-border-focus` | `var(--color-primary-500)` | `var(--color-primary-400)` |

### Upload Zone Colors

| Variable | Light Theme Value | Dark Theme Value |
|----------|------------------|------------------|
| `--upload-zone-bg-idle` | `var(--color-neutral-100)` | `var(--color-neutral-800)` |
| `--upload-zone-bg-dragging` | `var(--color-primary-50)` | `var(--color-primary-900)` |
| `--upload-zone-bg-success` | `var(--color-success-50)` | `var(--color-success-700)` |
| `--upload-zone-bg-error` | `var(--color-error-50)` | `var(--color-error-700)` |
| `--upload-zone-border-idle` | `var(--color-neutral-300)` | `var(--color-neutral-600)` |
| `--upload-zone-border-dragging` | `var(--color-primary-500)` | `var(--color-primary-400)` |
| `--upload-zone-border-success` | `var(--color-success-500)` | `var(--color-success-400)` |
| `--upload-zone-border-error` | `var(--color-error-500)` | `var(--color-error-400)` |

### Canvas Colors

| Variable | Light Theme Value | Dark Theme Value |
|----------|------------------|------------------|
| `--color-canvas-background` | `#f9fafb` | `var(--color-neutral-900)` |
| `--color-template-bounds` | `#374151` | `var(--color-neutral-500)` |
| `--color-grid-minor` | `rgba(0, 0, 0, 0.08)` | `rgba(255, 255, 255, 0.08)` |
| `--color-grid-major` | `rgba(0, 0, 0, 0.20)` | `rgba(255, 255, 255, 0.20)` |

### Selection and Hover Colors

| Variable | Light Theme Value | Dark Theme Value |
|----------|------------------|------------------|
| `--color-selection-stroke` | `#0066cc` | `#4da6ff` |
| `--color-selection-fill` | `rgba(0, 102, 204, 0.1)` | `rgba(77, 166, 255, 0.15)` |
| `--color-selection-handle-fill` | `#0066cc` | `#4da6ff` |
| `--color-selection-handle-stroke` | `#ffffff` | `#171717` |
| `--color-hover-stroke` | `#666666` | `#999999` |
| `--color-hover-fill` | `rgba(102, 102, 102, 0.05)` | `rgba(153, 153, 153, 0.1)` |
| `--color-parent-highlight-fill` | `rgba(0, 102, 204, 0.05)` | `rgba(77, 166, 255, 0.08)` |
| `--color-parent-highlight-stroke` | `rgba(0, 102, 204, 0.3)` | `rgba(77, 166, 255, 0.4)` |
| `--color-marquee-fill` | `rgba(66, 153, 225, 0.15)` | `rgba(99, 179, 237, 0.2)` |
| `--color-marquee-stroke` | `#3182ce` | `#63b3ed` |

### Tooltip Colors

| Variable | Light Theme Value | Dark Theme Value |
|----------|------------------|------------------|
| `--color-tooltip-background` | `var(--color-neutral-800)` | `var(--color-neutral-100)` |
| `--color-tooltip-text` | `var(--color-neutral-50)` | `var(--color-neutral-900)` |
| `--color-tooltip-border` | `var(--color-neutral-700)` | `var(--color-neutral-300)` |

### Panel and Item Colors

| Variable | Light Theme Value | Dark Theme Value |
|----------|------------------|------------------|
| `--color-item-hover-bg` | `var(--color-neutral-100)` | `var(--color-neutral-700)` |
| `--color-item-selected-bg` | `var(--color-primary-50)` | `var(--color-primary-900)` |
| `--color-item-selected-border` | `var(--color-primary-500)` | `var(--color-primary-400)` |
| `--color-item-readonly-bg` | `var(--color-neutral-50)` | `var(--color-neutral-800)` |
| `--color-item-readonly-text` | `var(--color-neutral-500)` | `var(--color-neutral-400)` |

### Ruler Colors

| Variable | Light Theme Value | Dark Theme Value |
|----------|------------------|------------------|
| `--ruler-background` | `var(--color-neutral-100)` | `var(--color-neutral-800)` |
| `--ruler-border-color` | `var(--color-neutral-300)` | `var(--color-neutral-600)` |
| `--ruler-tick-color` | `var(--color-neutral-400)` | `var(--color-neutral-500)` |
| `--ruler-tick-major-color` | `var(--color-neutral-600)` | `var(--color-neutral-400)` |
| `--ruler-label-color` | `var(--color-neutral-700)` | `var(--color-neutral-300)` |
| `--ruler-cursor-indicator-color` | `var(--color-primary-500)` | `var(--color-primary-400)` |
| `--ruler-template-bounds-color` | `rgba(59, 130, 246, 0.08)` | `rgba(59, 130, 246, 0.15)` |
| `--ruler-origin-background` | `var(--color-neutral-200)` | `var(--color-neutral-700)` |

### Shadow Tokens

| Variable | Light Theme Value | Dark Theme Value |
|----------|------------------|------------------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `0 1px 2px 0 rgb(0 0 0 / 0.15)` |
| `--shadow-base` | `0 1px 3px 0 rgb(0 0 0 / 0.1), ...` | `0 1px 3px 0 rgb(0 0 0 / 0.2), ...` |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), ...` | `0 4px 6px -1px rgb(0 0 0 / 0.2), ...` |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), ...` | `0 10px 15px -3px rgb(0 0 0 / 0.2), ...` |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), ...` | `0 20px 25px -5px rgb(0 0 0 / 0.2), ...` |

### Primary Color Adjustments

| Variable | Light Theme Value | Dark Theme Value |
|----------|------------------|------------------|
| `--color-primary` | `var(--color-primary-600)` | `var(--color-primary-400)` |
| `--color-primary-hover` | `var(--color-primary-700)` | `var(--color-primary-300)` |
| `--color-primary-light` | `var(--color-primary-50)` | `var(--color-primary-900)` |

## State Transitions

### Theme Mode State Machine

```
               +------------------+
               |     light        |
               +--------+---------+
                   ^    |
    setMode('light')|   |setMode('dark')
                   |    v
               +------------------+
               |      dark        |
               +--------+---------+
                   ^    |
    setMode('dark')|   |setMode('system')
                   |    v
               +------------------+
               |     system       |<------ OS change event
               +------------------+        (re-evaluates effective theme)
                   ^    |
    setMode('system')|  |setMode('light')
                   |    v
               +------------------+
               |     light        |
               +------------------+
```

### Effective Theme Resolution

```
Input: mode (ThemeMode), systemPrefersDark (boolean)
Output: effectiveTheme ('light' | 'dark')

if mode === 'light':
  return 'light'
else if mode === 'dark':
  return 'dark'
else: // mode === 'system'
  return systemPrefersDark ? 'dark' : 'light'
```

## DOM Attribute

The theme is applied to the document via a data attribute:

```html
<!-- Light theme -->
<html lang="en" data-theme="light">

<!-- Dark theme -->
<html lang="en" data-theme="dark">
```

## Validation Rules

### ThemeMode Validation

```typescript
const VALID_THEME_MODES = ['light', 'dark', 'system'] as const;

function isValidThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && VALID_THEME_MODES.includes(value as ThemeMode);
}
```

### EffectiveTheme Validation

```typescript
const VALID_EFFECTIVE_THEMES = ['light', 'dark'] as const;

function isValidEffectiveTheme(value: unknown): value is EffectiveTheme {
  return typeof value === 'string' && VALID_EFFECTIVE_THEMES.includes(value as EffectiveTheme);
}
```

## Relationships

```
+-------------------+     reads      +----------------------+
| preferencesStore  |<---------------|  themeService        |
| .preferences      |                |                      |
| .theme.mode       |                | getEffectiveTheme()  |
+-------------------+                | applyTheme()         |
        |                            | isSystemDarkMode()   |
        | persists to                +----------------------+
        v                                     |
+-------------------+                         | sets
|   localStorage    |                         v
| vstgui-edit:      |                +----------------------+
| preferences       |                | document             |
+-------------------+                | .documentElement     |
        ^                            | .dataset.theme       |
        |                            +----------------------+
        | read on load                        |
        |                                     | triggers
+-------------------+                         v
|   index.html      |                +----------------------+
|   <head> script   |                |    CSS selectors     |
+-------------------+                | [data-theme="dark"]  |
                                     +----------------------+
```
