# Quickstart: Preferences Panel

**Feature**: 036-preferences-panel
**Date**: 2026-01-11

## Overview

This guide provides implementation patterns for the preferences panel feature. Follow existing codebase conventions and reference the contracts in `./contracts/`.

## Implementation Order

1. **Domain layer** (no dependencies)
   - `src/domain/preferences/types.ts`
   - `src/domain/preferences/defaults.ts`
   - `src/domain/preferences/validation.ts`
   - `src/domain/preferences/persistence.ts`
   - `src/domain/preferences/migration.ts`
   - `src/domain/preferences/keyboardShortcuts.ts`

2. **Types export**
   - `src/types/preferences.ts` (re-exports from domain)

3. **Store layer**
   - `src/stores/preferencesStore.ts`

4. **Control components** (reusable)
   - `src/components/PreferencesPanel/controls/SettingToggle.tsx`
   - `src/components/PreferencesPanel/controls/SettingSelect.tsx`
   - `src/components/PreferencesPanel/controls/SettingSlider.tsx`

5. **Section components**
   - `src/components/PreferencesPanel/sections/GridSection.tsx`
   - `src/components/PreferencesPanel/sections/SnapSection.tsx`
   - `src/components/PreferencesPanel/sections/SmartGuidesSection.tsx`
   - `src/components/PreferencesPanel/sections/CustomGuidesSection.tsx`
   - `src/components/PreferencesPanel/sections/ThemeSection.tsx`
   - `src/components/PreferencesPanel/sections/KeyboardShortcutsSection.tsx`

6. **Panel components**
   - `src/components/PreferencesPanel/PreferencesSidebar.tsx`
   - `src/components/PreferencesPanel/ResetConfirmDialog.tsx`
   - `src/components/PreferencesPanel/PreferencesPanel.tsx`
   - `src/components/PreferencesPanel/index.ts`

7. **Integration**
   - Update `src/components/MainToolbar/MainToolbar.tsx`
   - Add keyboard shortcut handler (Ctrl+,)
   - Initialize preferences on app load

## Key Patterns

### Validation with AJV

```typescript
// src/domain/preferences/validation.ts
import Ajv from 'ajv';
import type { UserPreferences, PreferencesValidationResult } from './types';
import { PREFERENCES_SCHEMA } from './schema';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(PREFERENCES_SCHEMA);

export function validatePreferences(data: unknown): PreferencesValidationResult {
  const valid = validate(data);

  if (!valid) {
    const errors = validate.errors?.map(e =>
      `${e.instancePath || 'root'}: ${e.message}`
    ) ?? [];
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}
```

### Persistence with Silent Failure

```typescript
// src/domain/preferences/persistence.ts
import type { UserPreferences } from './types';
import { DEFAULT_PREFERENCES } from './defaults';
import { validatePreferences } from './validation';

export const STORAGE_KEY = 'vstgui-edit:preferences';

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PREFERENCES };
    }

    const parsed = JSON.parse(raw);
    const validation = validatePreferences(parsed);

    if (!validation.valid) {
      console.warn('[preferences] Stored preferences invalid, resetting:', validation.errors);
      return { ...DEFAULT_PREFERENCES };
    }

    return mergeWithDefaults(parsed);
  } catch (error) {
    console.warn('[preferences] Failed to load, resetting:', error);
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Silent fail - localStorage unavailable
  }
}

function mergeWithDefaults(partial: Partial<UserPreferences>): UserPreferences {
  return {
    ...DEFAULT_PREFERENCES,
    ...partial,
    grid: { ...DEFAULT_PREFERENCES.grid, ...partial.grid },
    snap: { ...DEFAULT_PREFERENCES.snap, ...partial.snap },
    smartGuides: { ...DEFAULT_PREFERENCES.smartGuides, ...partial.smartGuides },
    customGuides: { ...DEFAULT_PREFERENCES.customGuides, ...partial.customGuides },
    theme: { ...DEFAULT_PREFERENCES.theme, ...partial.theme },
    ui: { ...DEFAULT_PREFERENCES.ui, ...partial.ui },
    save: { ...DEFAULT_PREFERENCES.save, ...partial.save },
  };
}
```

### Migration

```typescript
// src/domain/preferences/migration.ts
import type { UserPreferences, MigrationResult, LegacyKey } from './types';
import { DEFAULT_PREFERENCES } from './defaults';
import { STORAGE_KEY, savePreferences } from './persistence';

const LEGACY_KEYS: LegacyKey[] = [
  'vstgui-edit:alignment-toolbar',
  'vstgui-edit:save-format',
];

export function needsMigration(): boolean {
  const hasNewKey = localStorage.getItem(STORAGE_KEY) !== null;
  if (hasNewKey) return false;

  return LEGACY_KEYS.some(key => localStorage.getItem(key) !== null);
}

export function migratePreferences(): MigrationResult {
  const result: MigrationResult = {
    migrated: false,
    migratedKeys: [],
    failedKeys: [],
  };

  if (!needsMigration()) {
    return result;
  }

  const prefs: UserPreferences = { ...DEFAULT_PREFERENCES };

  // Migrate alignment toolbar
  try {
    const alignmentRaw = localStorage.getItem('vstgui-edit:alignment-toolbar');
    if (alignmentRaw) {
      const parsed = JSON.parse(alignmentRaw);
      prefs.ui.alignmentToolbar = {
        isDocked: parsed.isDocked ?? true,
        floatingPosition: parsed.floatingPosition ?? null,
      };
      result.migratedKeys.push('vstgui-edit:alignment-toolbar');
    }
  } catch {
    result.failedKeys.push('vstgui-edit:alignment-toolbar');
  }

  // Migrate save format
  try {
    const formatRaw = localStorage.getItem('vstgui-edit:save-format');
    if (formatRaw === 'json' || formatRaw === 'xml') {
      prefs.save.format = formatRaw;
      result.migratedKeys.push('vstgui-edit:save-format');
    }
  } catch {
    result.failedKeys.push('vstgui-edit:save-format');
  }

  // Save migrated preferences
  savePreferences(prefs);

  // Delete legacy keys immediately
  for (const key of LEGACY_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }

  result.migrated = result.migratedKeys.length > 0;
  if (result.migrated) {
    console.info('[preferences] Migrated keys:', result.migratedKeys);
  }

  return result;
}
```

### Store Pattern

```typescript
// src/stores/preferencesStore.ts
import { createStore } from 'solid-js/store';
import { createEffect } from 'solid-js';
import type { PreferencesState, PreferencesSection, UserPreferences } from '../types/preferences';
import { DEFAULT_PREFERENCES } from '../domain/preferences/defaults';
import { loadPreferences, savePreferences } from '../domain/preferences/persistence';
import { migratePreferences, needsMigration } from '../domain/preferences/migration';
import { setGridSize, setGridStyle, setSnapThreshold } from './gridStore';
// ... other store imports

const initialState: PreferencesState = {
  preferences: { ...DEFAULT_PREFERENCES },
  isOpen: false,
  activeSection: 'grid',
  isResetDialogOpen: false,
};

const [store, setStore] = createStore<PreferencesState>({ ...initialState });

export const preferencesStore = store;

// Panel state
export function openPreferences(): void {
  setStore({ isOpen: true });
}

export function closePreferences(): void {
  setStore({ isOpen: false });
}

export function setActiveSection(section: PreferencesSection): void {
  setStore({ activeSection: section });
}

// Grid settings
export function setGridSizePreference(size: UserPreferences['grid']['size']): void {
  setStore('preferences', 'grid', 'size', size);
  setGridSize(size);  // Apply immediately
}

// ... other setters

// Initialization
export function initializePreferences(): void {
  if (needsMigration()) {
    migratePreferences();
  }

  const prefs = loadPreferences();
  setStore('preferences', prefs);
  applyPreferencesToStores();
}

export function applyPreferencesToStores(): void {
  const prefs = store.preferences;

  // Apply to gridStore
  setGridSize(prefs.grid.size);
  setGridStyle(prefs.grid.style);
  setSnapThreshold(prefs.snap.threshold);
  // Note: visibleByDefault applied on document load, not here

  // Apply to smartGuidesStore if needed
  // Apply to guidesStore if needed
  // Apply to alignmentToolbarStore if needed
}

// Auto-save effect
createEffect(() => {
  // This runs whenever store.preferences changes
  const prefs = store.preferences;
  savePreferences(prefs);
});
```

### Modal Component Pattern

```typescript
// src/components/PreferencesPanel/PreferencesPanel.tsx
import { type Component, createEffect, onCleanup, Show } from 'solid-js';
import { preferencesStore, closePreferences, setActiveSection } from '../../stores/preferencesStore';
import { PreferencesSidebar } from './PreferencesSidebar';
import { GridSection } from './sections/GridSection';
// ... other imports
import styles from './PreferencesPanel.module.css';

export const PreferencesPanel: Component = () => {
  let panelRef: HTMLDivElement | undefined;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closePreferences();
    }
  };

  createEffect(() => {
    if (preferencesStore.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      requestAnimationFrame(() => panelRef?.focus());
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  const renderSection = () => {
    switch (preferencesStore.activeSection) {
      case 'grid': return <GridSection />;
      case 'snap': return <SnapSection />;
      // ... other sections
    }
  };

  return (
    <Show when={preferencesStore.isOpen}>
      <div class={styles.overlay} onClick={closePreferences}>
        <div
          ref={panelRef}
          class={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="preferences-heading"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <header class={styles.header}>
            <h2 id="preferences-heading">Preferences</h2>
            <button
              type="button"
              class={styles.closeButton}
              onClick={closePreferences}
              aria-label="Close preferences"
            >
              &times;
            </button>
          </header>

          <div class={styles.content}>
            <PreferencesSidebar
              activeSection={preferencesStore.activeSection}
              onSectionChange={setActiveSection}
            />
            <main class={styles.main}>
              {renderSection()}
            </main>
          </div>

          <footer class={styles.footer}>
            <button
              type="button"
              class={styles.resetButton}
              onClick={openResetDialog}
            >
              Reset to Defaults
            </button>
          </footer>
        </div>
      </div>
    </Show>
  );
};
```

### Control Component Pattern

```typescript
// src/components/PreferencesPanel/controls/SettingToggle.tsx
import type { Component, JSX } from 'solid-js';
import type { SettingToggleProps } from '../../../types/preferences';
import styles from './controls.module.css';

export const SettingToggle: Component<SettingToggleProps> = (props) => {
  const handleChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    props.onChange(e.currentTarget.checked);
  };

  return (
    <div class={styles.settingRow}>
      <div class={styles.settingInfo}>
        <label for={props.id} class={styles.settingLabel}>
          {props.label}
        </label>
        {props.description && (
          <p class={styles.settingDescription}>{props.description}</p>
        )}
      </div>
      <input
        type="checkbox"
        id={props.id}
        class={styles.toggle}
        checked={props.value}
        onChange={handleChange}
        disabled={props.disabled}
      />
    </div>
  );
};
```

### Keyboard Shortcuts Data

```typescript
// src/domain/preferences/keyboardShortcuts.ts
import type { ShortcutCategory } from './types';

export const KEYBOARD_SHORTCUTS: ShortcutCategory[] = [
  {
    name: 'Canvas Navigation',
    shortcuts: [
      { keys: '+/=', description: 'Zoom In' },
      { keys: '-', description: 'Zoom Out' },
      { keys: '0', description: 'Reset Zoom' },
      { keys: 'F', description: 'Fit to View' },
      { keys: 'G', description: 'Toggle Grid Visibility' },
      { keys: 'Shift+G', description: 'Toggle Snap to Grid' },
      { keys: 'S', description: 'Toggle Smart Guides' },
      { keys: 'Ctrl+;', description: 'Toggle Custom Guides Visibility' },
    ],
  },
  {
    name: 'Selection',
    shortcuts: [
      { keys: 'Ctrl+A', description: 'Select All' },
      { keys: 'Escape', description: 'Clear Selection / Cancel Operation' },
    ],
  },
  {
    name: 'Editing',
    shortcuts: [
      { keys: 'Ctrl+Z', description: 'Undo' },
      { keys: 'Ctrl+Y / Ctrl+Shift+Z', description: 'Redo' },
      { keys: 'Arrow Keys', description: 'Nudge (1px)' },
      { keys: 'Shift+Arrow Keys', description: 'Nudge Fast (10px)' },
    ],
  },
  {
    name: 'Alignment',
    shortcuts: [
      { keys: 'Ctrl+Shift+L', description: 'Align Left' },
      { keys: 'Ctrl+Shift+C', description: 'Align Center' },
      { keys: 'Ctrl+Shift+R', description: 'Align Right' },
      { keys: 'Ctrl+Shift+T', description: 'Align Top' },
      { keys: 'Ctrl+Shift+M', description: 'Align Middle' },
      { keys: 'Ctrl+Shift+B', description: 'Align Bottom' },
    ],
  },
  {
    name: 'View Management',
    shortcuts: [
      { keys: 'Ctrl+L', description: 'Lock/Unlock Selected' },
      { keys: 'Ctrl+H', description: 'Hide/Show Selected' },
      { keys: 'Ctrl+Shift+H', description: 'Show All Hidden' },
    ],
  },
];
```

## CSS Patterns

### Panel Layout

```css
/* PreferencesPanel.module.css */
.overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-overlay);
}

.panel {
  width: 100%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main {
  flex: 1;
  padding: var(--spacing-6);
  overflow-y: auto;
}

.footer {
  display: flex;
  justify-content: flex-start;
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid var(--color-border);
}
```

### Sidebar Navigation

```css
/* PreferencesSidebar.module.css */
.sidebar {
  width: 200px;
  border-right: 1px solid var(--color-border);
  background-color: var(--color-neutral-50);
  padding: var(--spacing-2);
}

.navItem {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-base);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background-color var(--transition-fast);
}

.navItem:hover {
  background-color: var(--color-neutral-100);
}

.navItemActive {
  background-color: var(--color-primary-50);
  color: var(--color-primary);
}
```

## Testing Patterns

### Store Tests

```typescript
// src/stores/__tests__/preferencesStore.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  preferencesStore,
  initializePreferences,
  setGridSizePreference,
  resetPreferencesStore,
} from '../preferencesStore';

describe('preferencesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetPreferencesStore();
  });

  it('initializes with defaults when no stored preferences', () => {
    initializePreferences();
    expect(preferencesStore.preferences.grid.size).toBe(10);
  });

  it('loads stored preferences on initialization', () => {
    localStorage.setItem('vstgui-edit:preferences', JSON.stringify({
      version: 1,
      grid: { size: 16, style: 'dots', visibleByDefault: false },
      // ... other fields
    }));

    initializePreferences();
    expect(preferencesStore.preferences.grid.size).toBe(16);
  });

  it('migrates legacy keys on first load', () => {
    localStorage.setItem('vstgui-edit:save-format', 'xml');

    initializePreferences();

    expect(preferencesStore.preferences.save.format).toBe('xml');
    expect(localStorage.getItem('vstgui-edit:save-format')).toBeNull();
  });
});
```

### Component Tests

```typescript
// src/components/PreferencesPanel/__tests__/SettingToggle.spec.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { SettingToggle } from '../controls/SettingToggle';

describe('SettingToggle', () => {
  it('renders label and current value', () => {
    render(() => (
      <SettingToggle
        id="test-toggle"
        label="Enable Feature"
        value={true}
        onChange={() => {}}
      />
    ));

    expect(screen.getByLabelText('Enable Feature')).toBeChecked();
  });

  it('calls onChange when toggled', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(() => (
      <SettingToggle
        id="test-toggle"
        label="Enable Feature"
        value={false}
        onChange={onChange}
      />
    ));

    await user.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
```

## Integration Checklist

- [ ] Add PreferencesButton to MainToolbar
- [ ] Register Ctrl+, keyboard shortcut
- [ ] Call initializePreferences() in App.tsx on mount
- [ ] Apply preferences on document load (visibleByDefault, enabledByDefault)
- [ ] Update CLAUDE.md with new store and utilities
