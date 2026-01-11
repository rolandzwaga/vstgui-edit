# Quickstart: Keyboard Shortcuts System

**Feature**: 038-keyboard-shortcuts
**Date**: 2026-01-11

## Overview

This feature implements a centralized keyboard shortcuts system with:
1. A searchable shortcuts reference panel (`?` or `Ctrl+/`)
2. Centralized registry of all 44 shortcuts
3. Conflict detection with console warnings
4. Platform-aware key display (Ctrl vs Cmd)

## File Structure

```
src/
├── types/
│   └── shortcuts.ts                    # NEW: Type definitions
├── domain/
│   └── shortcuts/                      # NEW: Domain logic
│       ├── index.ts                    # Barrel export
│       ├── registry.ts                 # Shortcut registry and categories
│       ├── search.ts                   # Search/filter functions
│       ├── conflicts.ts                # Conflict detection
│       └── platform.ts                 # Platform detection utilities
├── stores/
│   └── shortcutsPanelStore.ts          # NEW: Panel UI state
├── components/
│   └── ShortcutsPanel/                 # NEW: Panel component
│       ├── ShortcutsPanel.tsx          # Main panel modal
│       ├── ShortcutsPanel.module.css   # Panel styles
│       ├── ShortcutSearch.tsx          # Search input
│       ├── ShortcutCategory.tsx        # Collapsible category
│       ├── ShortcutItem.tsx            # Individual shortcut row
│       └── __tests__/                  # Component tests
│           ├── ShortcutsPanel.spec.tsx
│           ├── ShortcutSearch.spec.tsx
│           ├── ShortcutCategory.spec.tsx
│           └── ShortcutItem.spec.tsx
├── domain/preferences/
│   └── keyboardShortcuts.ts            # MODIFY: Use new registry
└── components/PreferencesPanel/sections/
    └── KeyboardShortcutsSection.tsx    # MODIFY: Add "Open Full Panel" button
```

## Implementation Order

### Phase 1: Foundation (Domain + Types)
1. Create `src/types/shortcuts.ts` with all type definitions
2. Create `src/domain/shortcuts/registry.ts` with shortcut data
3. Create `src/domain/shortcuts/platform.ts` for Ctrl/Cmd detection
4. Create `src/domain/shortcuts/search.ts` for filtering
5. Create `src/domain/shortcuts/conflicts.ts` for conflict detection
6. Create barrel export `src/domain/shortcuts/index.ts`

### Phase 2: State Management
7. Create `src/stores/shortcutsPanelStore.ts`

### Phase 3: Components
8. Create `ShortcutItem.tsx` (smallest unit)
9. Create `ShortcutCategory.tsx` (uses ShortcutItem)
10. Create `ShortcutSearch.tsx` (search input)
11. Create `ShortcutsPanel.tsx` (main modal)

### Phase 4: Integration
12. Update `useCanvasKeyboard.ts` to handle `?` and `Ctrl+/`
13. Update `KeyboardShortcutsSection.tsx` to use registry + button
14. Update `CLAUDE.md` with new domain/store documentation

## Key Implementation Patterns

### Creating the Registry

```typescript
// src/domain/shortcuts/registry.ts
import type { ShortcutCategoryId, ShortcutDefinition, ShortcutCategoryMeta } from '../../types/shortcuts';

export const SHORTCUT_CATEGORIES: ShortcutCategoryMeta[] = [
  { id: 'canvas', name: 'Canvas Navigation', order: 1 },
  // ... other categories
];

export const SHORTCUT_REGISTRY: ShortcutDefinition[] = [
  { id: 'canvas-zoom-in', keys: '+/=', description: 'Zoom In', category: 'canvas' },
  // ... all 44 shortcuts
];

export function getShortcutsByCategory(category: ShortcutCategoryId): ShortcutDefinition[] {
  return SHORTCUT_REGISTRY.filter(s => s.category === category);
}
```

### Platform Detection

```typescript
// src/domain/shortcuts/platform.ts
export function isMacPlatform(): boolean {
  return navigator.platform?.toLowerCase().includes('mac') ?? false;
}

export function formatKeysForPlatform(keys: string): string {
  if (isMacPlatform()) {
    return keys.replace(/Ctrl\+/gi, 'Cmd+');
  }
  return keys;
}
```

### Panel Store

```typescript
// src/stores/shortcutsPanelStore.ts
import { createStore } from 'solid-js/store';
import type { ShortcutCategoryId, ShortcutsPanelState } from '../types/shortcuts';
import { SHORTCUT_CATEGORIES } from '../domain/shortcuts';

const initialState: ShortcutsPanelState = {
  isOpen: false,
  searchQuery: '',
  expandedCategories: new Set(SHORTCUT_CATEGORIES.map(c => c.id)),
};

const [store, setStore] = createStore<ShortcutsPanelState>({ ...initialState });

export const shortcutsPanelStore = store;

export function openShortcutsPanel(): void {
  setStore({
    isOpen: true,
    searchQuery: '',
    expandedCategories: new Set(SHORTCUT_CATEGORIES.map(c => c.id)),
  });
}
```

### Panel Component

```typescript
// src/components/ShortcutsPanel/ShortcutsPanel.tsx
import { type Component, createEffect, onCleanup, Show } from 'solid-js';
import { shortcutsPanelStore, closeShortcutsPanel } from '../../stores/shortcutsPanelStore';
import styles from './ShortcutsPanel.module.css';

export const ShortcutsPanel: Component = () => {
  let panelRef: HTMLDivElement | undefined;
  let searchInputRef: HTMLInputElement | undefined;

  // Handle Escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && shortcutsPanelStore.isOpen) {
      e.preventDefault();
      closeShortcutsPanel();
    }
  };

  // Focus management
  createEffect(() => {
    if (shortcutsPanelStore.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      requestAnimationFrame(() => {
        searchInputRef?.focus();  // Auto-focus search (FR-011)
      });
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <Show when={shortcutsPanelStore.isOpen}>
      <div class={styles.overlay} onClick={closeShortcutsPanel}>
        <div
          ref={panelRef}
          class={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-heading"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header, Search, Categories, Close button */}
        </div>
      </div>
    </Show>
  );
};
```

### Keyboard Trigger Integration

```typescript
// In useCanvasKeyboard.ts handleKeyDown function:

// Check for shortcuts panel trigger
if (e.key === '?' || (e.key === '/' && (e.ctrlKey || e.metaKey))) {
  // Don't open if another modal is open
  if (preferencesStore.isOpen) return;
  // Don't open if no document loaded (FR-006)
  if (!documentStore.document) return;

  e.preventDefault();
  openShortcutsPanel();
  return;
}
```

## Testing Checklist

- [ ] Registry contains all 44 shortcuts
- [ ] No duplicate shortcut IDs
- [ ] Search filters correctly by keys and description
- [ ] Platform detection works (mock navigator.platform)
- [ ] Conflict detection logs warnings
- [ ] Panel opens with `?` key
- [ ] Panel opens with `Ctrl+/`
- [ ] Panel closes with Escape
- [ ] Panel closes on overlay click
- [ ] Search input auto-focused on open
- [ ] Categories collapse/expand
- [ ] All categories expanded by default
- [ ] "No results" shown for empty search
- [ ] Panel only opens when document loaded
- [ ] Panel doesn't open when input focused
- [ ] Preferences link opens full panel

## Success Metrics

| Metric | Target |
|--------|--------|
| Panel open time | < 1 second |
| Search response time | < 100ms |
| Total shortcuts catalogued | 44 |
| Conflict count | 0 |
| Test coverage | >= 80% |
