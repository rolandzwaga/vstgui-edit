# Data Model: Save & Export

## Core Entities

### 1. DirtyState

Tracks whether the document has unsaved modifications.

```typescript
// Added to DocumentStoreState in src/stores/documentStore.ts
interface DocumentStoreState {
  // ... existing fields
  
  /**
   * True when document has unsaved changes.
   * Set to true by any mutation function.
   * Set to false after successful save or document load.
   */
  isDirty: boolean;
}
```

**State Transitions**:
- `false` → `true`: Any document mutation
- `true` → `false`: Successful save, document load, reset

### 2. SaveFormat

Enumeration of supported output formats.

```typescript
// src/domain/serializer/types.ts
export type SaveFormat = 'json' | 'xml';
```

### 3. FormatOptions

Options for JSON serialization.

```typescript
// src/domain/serializer/types.ts
export interface JsonSerializeOptions {
  /**
   * Output pretty-printed JSON with indentation.
   * @default true
   */
  pretty?: boolean;
  
  /**
   * Number of spaces for indentation (when pretty=true).
   * @default 2
   */
  indent?: number;
}
```

### 4. ValidationResult

Result of pre-save document validation.

```typescript
// src/domain/serializer/types.ts
import type { ValidationError } from '../../types/parser';

export interface SaveValidationResult {
  /**
   * True if document passes all validation checks.
   */
  valid: boolean;
  
  /**
   * Critical errors that should prevent save.
   * Empty array if valid.
   */
  errors: ValidationError[];
  
  /**
   * Non-critical warnings (save can proceed).
   */
  warnings: ValidationError[];
}
```

### 5. SaveResult

Result of a save operation.

```typescript
// src/services/fileService.ts
export interface SaveResult {
  /**
   * True if save completed successfully.
   */
  success: boolean;
  
  /**
   * Error message if save failed.
   */
  error?: string;
  
  /**
   * File handle if using File System Access API.
   */
  fileHandle?: FileSystemFileHandle;
  
  /**
   * Filename that was saved.
   */
  filename?: string;
}
```

### 6. FileHandle State

Extended document state for file operations.

```typescript
// Added to DocumentStoreState
interface DocumentStoreState {
  // ... existing fields
  
  /**
   * File handle from File System Access API.
   * null if file was loaded via drag-drop or not supported.
   */
  fileHandle: FileSystemFileHandle | null;
  
  /**
   * Format the document was originally loaded in.
   * Used to preserve format on Save (not Export).
   */
  originalFormat: FormatType | null;
  
  /**
   * Timestamp of last successful save.
   */
  lastSavedAt: Date | null;
}
```

## Relationships

```
DocumentStoreState
├── isDirty: boolean
├── originalFormat: FormatType | null
├── fileHandle: FileSystemFileHandle | null
├── lastSavedAt: Date | null
└── document: VSTGUIUIDescription
         │
         ▼ (serialization)
    SaveFormat ('json' | 'xml')
         │
         ▼ (options for json)
    JsonSerializeOptions
         │
         ▼ (validation before save)
    SaveValidationResult
         │
         ▼ (save operation)
    SaveResult
```

## Validation Rules

### Document Structure
- Must have `vstgui-ui-description` root
- Must have valid `version` property
- At least one template required

### Schema Validation
- Reuse existing AJV validation from `src/domain/parser/validator.ts`
- All standard JSON Schema rules apply

### Custom Validation (Warnings)
- Templates with no views (empty)
- Colors/fonts/bitmaps defined but not used
- References to undefined resources (will not be blocked, just warned)

### Validation Behavior (FR-014)
- **Errors**: Block save, show modal with "Save Anyway" option
- **Warnings**: Show in modal but allow save to proceed

## State Management

### Initial State
```typescript
const initialState: DocumentStoreState = {
  // ... existing
  isDirty: false,
  originalFormat: null,
  fileHandle: null,
  lastSavedAt: null,
};
```

### State Updates

**On loadFile success**:
```typescript
setStore({
  isDirty: false,
  originalFormat: result.format,
  fileHandle: null,  // Could be set if using showOpenFilePicker
  lastSavedAt: null,
});
```

**On any mutation**:
```typescript
setStore({ isDirty: true });
```

**On successful save**:
```typescript
setStore({
  isDirty: false,
  lastSavedAt: new Date(),
  fileHandle: result.fileHandle ?? store.fileHandle,
});
```

**On reset**:
```typescript
setStore({
  isDirty: false,
  originalFormat: null,
  fileHandle: null,
  lastSavedAt: null,
});
```

## UI State

### Dirty Indicator Display
- Location: Toolbar, before filename
- Format: `* filename.uidesc` when dirty, `filename.uidesc` when clean

### Modal States

```typescript
interface SaveModalState {
  type: 'none' | 'error' | 'validation' | 'browser-fallback';
  errorMessage?: string;
  validationErrors?: ValidationError[];
  validationWarnings?: ValidationError[];
}
```

## Type Definitions Location

All new types will be defined in:
- `src/domain/serializer/types.ts` - Serialization types
- `src/services/fileService.ts` - File operation types
- `src/stores/documentStore.ts` - State extensions (inline)
