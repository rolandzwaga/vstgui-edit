# Quickstart: JSON Save Format Option

**Feature**: 030-json-save-format | **Date**: 2026-01-10

## Overview

This feature adds a split button dropdown to the Save button, allowing users to choose between JSON and XML save formats. The button displays the current format, remembers the last selection, and shows a confirmation dialog when switching from the original file format.

## Key Files

| File | Purpose |
|------|---------|
| `src/components/SaveButton/SaveButton.tsx` | Extend with split button and dropdown |
| `src/components/SaveButton/SaveButton.module.css` | Split button and dropdown styles |
| `src/components/SaveButton/FormatChangeDialog.tsx` | Confirmation modal component |
| `src/stores/saveFormatStore.ts` | Format selection state management |
| `src/domain/save/formatPreference.ts` | localStorage utilities |

## Implementation Steps

### 1. Format Preference Utilities

Create `src/domain/save/formatPreference.ts`:

```typescript
import type { SaveFormat } from '../serializer/types';

export const STORAGE_KEY = 'vstgui-edit:save-format';

export function isValidSaveFormat(value: unknown): value is SaveFormat {
  return value === 'json' || value === 'xml';
}

export function getFormatPreference(): SaveFormat | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isValidSaveFormat(value) ? value : null;
  } catch {
    return null;
  }
}

export function setFormatPreference(format: SaveFormat): void {
  try {
    localStorage.setItem(STORAGE_KEY, format);
  } catch {
    // Silently fail
  }
}
```

### 2. Save Format Store

Create `src/stores/saveFormatStore.ts`:

```typescript
import { createStore } from 'solid-js/store';
import type { SaveFormat } from '../domain/serializer/types';
import { getFormatPreference, setFormatPreference } from '../domain/save/formatPreference';

interface SaveFormatState {
  selectedFormat: SaveFormat;
  isDropdownOpen: boolean;
  isConfirmDialogOpen: boolean;
  pendingFormat: SaveFormat | null;
}

const [store, setStore] = createStore<SaveFormatState>({
  selectedFormat: 'json',
  isDropdownOpen: false,
  isConfirmDialogOpen: false,
  pendingFormat: null,
});

export const saveFormatStore = store;

// Store originalFormat reference for confirmation logic
let originalFormat: SaveFormat | null = null;

export function initializeFormat(format: SaveFormat | null): void {
  originalFormat = format;
  const preference = getFormatPreference();
  setStore({
    selectedFormat: format ?? preference ?? 'json',
    isDropdownOpen: false,
    isConfirmDialogOpen: false,
    pendingFormat: null,
  });
}

export function openDropdown(): void {
  setStore('isDropdownOpen', true);
}

export function closeDropdown(): void {
  setStore('isDropdownOpen', false);
}

export function selectFormat(format: SaveFormat): void {
  closeDropdown();

  if (format === store.selectedFormat) return;

  // No confirmation needed if no original format or same as original
  if (originalFormat === null || format === originalFormat) {
    setStore('selectedFormat', format);
    setFormatPreference(format);
    return;
  }

  // Show confirmation dialog
  setStore({
    pendingFormat: format,
    isConfirmDialogOpen: true,
  });
}

export function confirmFormatChange(): void {
  if (store.pendingFormat) {
    setStore('selectedFormat', store.pendingFormat);
    setFormatPreference(store.pendingFormat);
  }
  setStore({
    pendingFormat: null,
    isConfirmDialogOpen: false,
  });
}

export function cancelFormatChange(): void {
  setStore({
    pendingFormat: null,
    isConfirmDialogOpen: false,
  });
}

export function resetSaveFormatStore(): void {
  originalFormat = null;
  setStore({
    selectedFormat: 'json',
    isDropdownOpen: false,
    isConfirmDialogOpen: false,
    pendingFormat: null,
  });
}
```

### 3. Format Change Dialog

Create `src/components/SaveButton/FormatChangeDialog.tsx`:

```typescript
import { type Component, Show } from 'solid-js';
import type { SaveFormat } from '../../domain/serializer/types';
import styles from './FormatChangeDialog.module.css';

interface FormatChangeDialogProps {
  isOpen: boolean;
  originalFormat: SaveFormat;
  newFormat: SaveFormat;
  onConfirm: () => void;
  onCancel: () => void;
}

export const FormatChangeDialog: Component<FormatChangeDialogProps> = (props) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onCancel();
    }
  };

  const formatLabel = (format: SaveFormat) => format.toUpperCase();

  return (
    <Show when={props.isOpen}>
      <div class={styles.backdrop} onKeyDown={handleKeyDown}>
        <div
          class={styles.dialog}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="format-dialog-title"
          aria-describedby="format-dialog-desc"
        >
          <div class={styles.header}>
            <span id="format-dialog-title" class={styles.title}>
              Change Save Format?
            </span>
          </div>
          <div class={styles.body}>
            <p id="format-dialog-desc" class={styles.message}>
              The file was originally saved as {formatLabel(props.originalFormat)}.
              Saving as {formatLabel(props.newFormat)} may cause compatibility changes.
            </p>
          </div>
          <div class={styles.footer}>
            <button
              type="button"
              class={styles.cancelButton}
              onClick={props.onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              class={styles.confirmButton}
              onClick={props.onConfirm}
              ref={(el) => setTimeout(() => el.focus(), 0)}
            >
              Change Format
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
```

### 4. Update SaveButton Component

Key changes to `src/components/SaveButton/SaveButton.tsx`:

```typescript
// Add imports
import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import {
  saveFormatStore,
  initializeFormat,
  openDropdown,
  closeDropdown,
  selectFormat,
  confirmFormatChange,
  cancelFormatChange,
} from '../../stores/saveFormatStore';
import { FormatChangeDialog } from './FormatChangeDialog';

// In component:
// - Replace single button with split button structure
// - Add dropdown menu for format selection
// - Add FormatChangeDialog component
// - Update getSerializedContent to use saveFormatStore.selectedFormat
// - Call initializeFormat when document changes
```

## Testing Focus

1. **Unit Tests** (`formatPreference.spec.ts`):
   - localStorage read/write with valid formats
   - Invalid value handling
   - localStorage unavailable handling

2. **Store Tests** (`saveFormatStore.spec.ts`):
   - initializeFormat priority logic
   - selectFormat with/without confirmation
   - confirm/cancel flow
   - reset behavior

3. **Component Tests** (`FormatChangeDialog.spec.tsx`):
   - Renders when isOpen is true
   - Displays correct format names
   - Calls onConfirm/onCancel appropriately
   - Escape key closes dialog

4. **Integration Tests** (`SaveButton.spec.tsx`):
   - Split button renders correctly
   - Dropdown opens/closes
   - Format selection triggers save in correct format
   - Keyboard navigation
   - Ctrl+S uses current format

## CSS Structure

```css
/* Split button container */
.splitButton {
  display: flex;
  align-items: center;
}

/* Main save action button */
.mainAction {
  /* Rounded left corners only */
  border-radius: var(--radius-base) 0 0 var(--radius-base);
  border-right: none;
}

/* Chevron/dropdown trigger */
.chevron {
  /* Rounded right corners only */
  border-radius: 0 var(--radius-base) var(--radius-base) 0;
  border-left: 1px solid var(--color-border);
  padding: 0 var(--spacing-1);
}

/* Dropdown menu */
.dropdown {
  position: fixed;
  z-index: var(--z-dropdown);
  /* ... standard dropdown styles */
}
```

## Accessibility Checklist

- [ ] Split button has `role="group"` with descriptive `aria-label`
- [ ] Chevron button has `aria-haspopup="menu"` and `aria-expanded`
- [ ] Dropdown options have `role="menuitem"`
- [ ] Dialog has `role="alertdialog"`, `aria-modal="true"`
- [ ] Focus moves to dialog when opened
- [ ] Escape closes dropdown and dialog
- [ ] Arrow keys navigate dropdown options
- [ ] Screen reader announces format in button label
