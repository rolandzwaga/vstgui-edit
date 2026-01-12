# Quickstart: Create New uidesc File

**Feature**: 041-create-new-uidesc
**Date**: 2026-01-12

## Overview

This feature adds a "Create New" button to the home page that opens a dialog for creating new uidesc documents with custom dimensions and container class.

## User Flow

1. User visits home page (no document loaded)
2. User clicks "Create New" button in upload zone
3. Dialog opens with:
   - Width input (default: 400)
   - Height input (default: 300)
   - Container class dropdown (default: CViewContainer)
4. User enters dimensions and optionally changes container class
5. User clicks "Create" (or presses Enter)
6. New document is created and user sees editor with empty canvas

## Files to Create

### Types (`src/types/createNew.ts`)

```typescript
export type ContainerClass =
  | 'CViewContainer'
  | 'CScrollView'
  | 'CRowColumnView'
  | 'CSplitView'
  | 'CLayeredViewContainer'
  | 'UIViewSwitchContainer'
  | 'CShadowViewContainer';

export const CONTAINER_CLASSES: readonly ContainerClass[] = [
  'CViewContainer',
  'CScrollView',
  'CRowColumnView',
  'CSplitView',
  'CLayeredViewContainer',
  'UIViewSwitchContainer',
  'CShadowViewContainer',
] as const;

export interface NewDocumentConfig {
  width: number;
  height: number;
  containerClass: ContainerClass;
}

export interface DimensionValidationResult {
  valid: boolean;
  error?: string;
  value?: number;
}

export const DEFAULT_CONFIG: NewDocumentConfig = {
  width: 400,
  height: 300,
  containerClass: 'CViewContainer',
};

export const DIMENSION_CONSTRAINTS = {
  MIN: 1,
  MAX: 10000,
} as const;
```

### Validation (`src/domain/createNew/validation.ts`)

```typescript
import type { DimensionValidationResult } from '../../types/createNew';
import { DIMENSION_CONSTRAINTS } from '../../types/createNew';

export function validateDimension(
  value: string,
  fieldName: 'Width' | 'Height'
): DimensionValidationResult {
  const trimmed = value.trim();

  if (trimmed === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    return { valid: false, error: 'Must be a number' };
  }

  const rounded = Math.round(parsed);

  if (rounded < DIMENSION_CONSTRAINTS.MIN) {
    return { valid: false, error: `Must be at least ${DIMENSION_CONSTRAINTS.MIN}` };
  }

  if (rounded > DIMENSION_CONSTRAINTS.MAX) {
    return { valid: false, error: `Must be at most ${DIMENSION_CONSTRAINTS.MAX}` };
  }

  return { valid: true, value: rounded };
}

export function validateDimensions(width: string, height: string) {
  return {
    width: validateDimension(width, 'Width'),
    height: validateDimension(height, 'Height'),
  };
}

export function areDimensionsValid(results: {
  width: DimensionValidationResult;
  height: DimensionValidationResult;
}): boolean {
  return results.width.valid && results.height.valid;
}
```

### Document Factory (`src/domain/createNew/documentFactory.ts`)

```typescript
import type { VSTGUIUIDescription } from '../../types/uidesc';
import type { NewDocumentConfig } from '../../types/createNew';

export const DEFAULT_TEMPLATE_NAME = 'view';
export const DEFAULT_ORIGIN = '0, 0';
export const DEFAULT_BACKGROUND_COLOR = '~ BlackCColor';

export function createDocument(config: NewDocumentConfig): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      templates: {
        [DEFAULT_TEMPLATE_NAME]: {
          attributes: {
            class: config.containerClass,
            origin: DEFAULT_ORIGIN,
            size: `${config.width}, ${config.height}`,
            'background-color': DEFAULT_BACKGROUND_COLOR,
          },
        },
      },
    },
  };
}
```

### Document Store Extension (`src/stores/documentStore.ts`)

Add this function:

```typescript
import { createDocument } from '../domain/createNew/documentFactory';
import type { NewDocumentConfig } from '../types/createNew';

export function createNewDocument(config: NewDocumentConfig): void {
  const doc = createDocument(config);

  resetCanvas();
  resetTemplateStore();
  resetGuidesStore();
  resetLockHideStore();

  setStore({
    document: doc,
    parseState: 'valid',
    parseErrors: null,
    detectedFormat: 'json',
    originalFormat: 'json',
    isDirty: false,
    content: null,
    metadata: null,
    fileHandle: null,
    lastSavedAt: null,
    uploadState: 'idle',
    error: null,
  });

  selectFirstTemplate(doc);
  applyDefaultStatesOnDocumentLoad();
}
```

### Dialog Component (`src/components/CreateNewDialog/CreateNewDialog.tsx`)

```typescript
import { type Component, createSignal, createEffect, Show, For } from 'solid-js';
import { validateDimensions, areDimensionsValid } from '../../domain/createNew/validation';
import { CONTAINER_CLASSES, DEFAULT_CONFIG } from '../../types/createNew';
import type { ContainerClass, NewDocumentConfig } from '../../types/createNew';
import styles from './CreateNewDialog.module.css';

export interface CreateNewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: NewDocumentConfig) => void;
}

export const CreateNewDialog: Component<CreateNewDialogProps> = (props) => {
  const [width, setWidth] = createSignal(String(DEFAULT_CONFIG.width));
  const [height, setHeight] = createSignal(String(DEFAULT_CONFIG.height));
  const [containerClass, setContainerClass] = createSignal<ContainerClass>(DEFAULT_CONFIG.containerClass);
  const [widthError, setWidthError] = createSignal<string | null>(null);
  const [heightError, setHeightError] = createSignal<string | null>(null);

  // Reset form when dialog opens
  createEffect(() => {
    if (props.isOpen) {
      setWidth(String(DEFAULT_CONFIG.width));
      setHeight(String(DEFAULT_CONFIG.height));
      setContainerClass(DEFAULT_CONFIG.containerClass);
      setWidthError(null);
      setHeightError(null);
    }
  });

  const handleCreate = () => {
    const results = validateDimensions(width(), height());

    setWidthError(results.width.error ?? null);
    setHeightError(results.height.error ?? null);

    if (!areDimensionsValid(results)) {
      return;
    }

    props.onCreate({
      width: results.width.value!,
      height: results.height.value!,
      containerClass: containerClass(),
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onClose();
    } else if (e.key === 'Enter') {
      handleCreate();
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  return (
    <Show when={props.isOpen}>
      <div
        class={styles.backdrop}
        onClick={handleBackdropClick}
        data-testid="create-new-backdrop"
      >
        <div
          class={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-new-title"
          onKeyDown={handleKeyDown}
          data-testid="create-new-dialog"
        >
          <div class={styles.header}>
            <h2 id="create-new-title" class={styles.title}>Create New Document</h2>
            <button
              type="button"
              class={styles.closeButton}
              onClick={props.onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div class={styles.body}>
            <div class={styles.field}>
              <label class={styles.label} for="create-new-width">Width</label>
              <input
                id="create-new-width"
                type="number"
                min="1"
                max="10000"
                class={`${styles.input} ${widthError() ? styles.inputError : ''}`}
                value={width()}
                onInput={(e) => {
                  setWidth(e.currentTarget.value);
                  setWidthError(null);
                }}
                onKeyDown={handleKeyDown}
                ref={(el) => setTimeout(() => el.focus(), 0)}
                data-testid="create-new-width"
              />
              <Show when={widthError()}>
                <span class={styles.error} data-testid="create-new-width-error">
                  {widthError()}
                </span>
              </Show>
            </div>

            <div class={styles.field}>
              <label class={styles.label} for="create-new-height">Height</label>
              <input
                id="create-new-height"
                type="number"
                min="1"
                max="10000"
                class={`${styles.input} ${heightError() ? styles.inputError : ''}`}
                value={height()}
                onInput={(e) => {
                  setHeight(e.currentTarget.value);
                  setHeightError(null);
                }}
                onKeyDown={handleKeyDown}
                data-testid="create-new-height"
              />
              <Show when={heightError()}>
                <span class={styles.error} data-testid="create-new-height-error">
                  {heightError()}
                </span>
              </Show>
            </div>

            <div class={styles.field}>
              <label class={styles.label} for="create-new-class">Container Class</label>
              <select
                id="create-new-class"
                class={styles.select}
                value={containerClass()}
                onChange={(e) => setContainerClass(e.currentTarget.value as ContainerClass)}
                data-testid="create-new-class"
              >
                <For each={CONTAINER_CLASSES}>
                  {(cls) => <option value={cls}>{cls}</option>}
                </For>
              </select>
            </div>
          </div>

          <div class={styles.footer}>
            <button
              type="button"
              class={styles.cancelButton}
              onClick={props.onClose}
              data-testid="create-new-cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              class={styles.createButton}
              onClick={handleCreate}
              data-testid="create-new-create"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
```

### UploadZone Integration

Add to `src/components/UploadZone/UploadZone.tsx`:

```typescript
// Add import
import { CreateNewDialog } from '../CreateNewDialog/CreateNewDialog';
import { createNewDocument } from '../../stores/documentStore';
import type { NewDocumentConfig } from '../../types/createNew';

// Add state
const [isCreateDialogOpen, setIsCreateDialogOpen] = createSignal(false);

// Add handlers
const handleCreateNew = () => setIsCreateDialogOpen(true);
const handleCreateClose = () => setIsCreateDialogOpen(false);
const handleCreate = (config: NewDocumentConfig) => {
  createNewDocument(config);
  setIsCreateDialogOpen(false);
};

// Update idle/dragging Show block to include Create New button
<Show when={documentStore.uploadState === 'idle' || documentStore.uploadState === 'dragging'}>
  {/* existing content */}
  <div class={styles.buttonGroup}>
    <button class={styles.button} onClick={handleButtonClick} type="button">
      Browse files
    </button>
    <button class={styles.buttonSecondary} onClick={handleCreateNew} type="button">
      Create New
    </button>
  </div>
</Show>

// Add dialog at end of component
<CreateNewDialog
  isOpen={isCreateDialogOpen()}
  onClose={handleCreateClose}
  onCreate={handleCreate}
/>
```

## Testing Checklist

### Unit Tests

- [ ] `validateDimension` - valid values
- [ ] `validateDimension` - empty string
- [ ] `validateDimension` - negative numbers
- [ ] `validateDimension` - zero
- [ ] `validateDimension` - exceeds max
- [ ] `validateDimension` - decimal rounding
- [ ] `validateDimension` - non-numeric
- [ ] `validateDimensions` - combined validation
- [ ] `areDimensionsValid` - both valid
- [ ] `areDimensionsValid` - one invalid
- [ ] `createDocument` - creates valid structure
- [ ] `createDocument` - uses config values
- [ ] `createNewDocument` - sets store state
- [ ] `createNewDocument` - marks not dirty

### Component Tests

- [ ] Dialog renders when isOpen=true
- [ ] Dialog hidden when isOpen=false
- [ ] Width input has default value
- [ ] Height input has default value
- [ ] Container dropdown has all options
- [ ] CViewContainer is default selection
- [ ] Create button calls onCreate with config
- [ ] Cancel button calls onClose
- [ ] Escape key calls onClose
- [ ] Backdrop click calls onClose
- [ ] Enter key triggers create
- [ ] Invalid width shows error
- [ ] Invalid height shows error
- [ ] Form resets when reopened
- [ ] Focus on width input when opened

### Integration Tests

- [ ] Create New button visible on home page
- [ ] Click opens dialog
- [ ] Create with valid values navigates to editor
- [ ] Document has correct dimensions
- [ ] Document has correct container class
- [ ] Document is not marked dirty

## Implementation Order

1. Types (`src/types/createNew.ts`)
2. Validation domain (`src/domain/createNew/validation.ts`) + tests
3. Document factory (`src/domain/createNew/documentFactory.ts`) + tests
4. Document store extension (`createNewDocument`) + tests
5. Dialog CSS (`src/components/CreateNewDialog/CreateNewDialog.module.css`)
6. Dialog component + tests
7. UploadZone integration + tests
8. Quality gates and cleanup
