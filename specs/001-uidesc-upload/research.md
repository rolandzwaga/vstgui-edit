# Research: Uidesc File Upload

**Feature**: 001-uidesc-upload
**Date**: 2026-01-05

## File Format Clarification

### Decision: JSON format (not XML)

**Rationale**: The `vstgui-uidesc.schema.json` in the project root is a JSON Schema, indicating uidesc files are JSON format. The schema requires a root `vstgui-ui-description` object with version field.

**Alternatives considered**:
- XML format: Initial assumption from VSTGUI documentation, but project uses JSON schema
- Both formats: Unnecessary complexity, JSON is the target format

### Uidesc Structure

Root structure:
```json
{
  "vstgui-ui-description": {
    "version": "1",
    "colors": {},
    "fonts": {},
    "bitmaps": {},
    "gradients": {},
    "control-tags": {},
    "variables": {},
    "templates": {},
    "custom": {}
  }
}
```

## Drag and Drop Implementation

### Decision: Native HTML5 Drag and Drop API

**Rationale**: Built into browsers, no additional dependencies. Works well with SolidJS event handling.

**Key events**:
- `ondragenter`: Show drop zone highlight
- `ondragover`: Prevent default to allow drop
- `ondragleave`: Remove highlight
- `ondrop`: Handle file

**Alternatives considered**:
- Third-party library (react-dropzone equivalent): Adds dependency, not needed for simple case

## File Reading

### Decision: FileReader API with readAsText

**Rationale**: Standard browser API, async reading, works with File objects from both drag-drop and file input.

**Pattern**:
```typescript
const reader = new FileReader();
reader.onload = (e) => {
  const content = e.target?.result as string;
  // Parse JSON
};
reader.readAsText(file);
```

**Alternatives considered**:
- `file.text()`: Modern but same result, FileReader is more explicit

## JSON Validation

### Decision: AJV with precompiled schema

**Rationale**: AJV already installed (`"ajv": "^8.17.1"`), industry standard for JSON Schema validation.

**Pattern**:
```typescript
import Ajv from 'ajv';
import schema from '../../vstgui-uidesc.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(schema);

function validateUidesc(data: unknown): boolean {
  return validate(data);
}
```

**Error reporting**: `validate.errors` provides detailed validation errors.

**Alternatives considered**:
- Manual validation: Error-prone, schema already exists
- Zod: Would need to duplicate schema definition

## State Management

### Decision: SolidJS createStore for document, createSignal for upload state

**Rationale**: Follows CLAUDE.md patterns. Store for complex nested document, signals for simple upload state.

**Pattern**:
```typescript
// Upload state (simple)
const [uploadState, setUploadState] = createSignal<UploadState>('idle');
const [error, setError] = createSignal<string | null>(null);

// Document (complex nested)
const [document, setDocument] = createStore<UidescDocument | null>(null);
```

**Alternatives considered**:
- All signals: Nested updates become verbose
- All store: Overkill for simple state like `uploadState`

## Error Handling Strategy

### Decision: Typed error states with user-friendly messages

**Error categories**:
1. **File type error**: Wrong extension (not .uidesc)
2. **Parse error**: Invalid JSON syntax
3. **Validation error**: Valid JSON but doesn't match schema
4. **Empty file error**: File has no content

**Pattern**:
```typescript
type UploadError =
  | { type: 'invalid-extension'; filename: string }
  | { type: 'parse-error'; message: string }
  | { type: 'validation-error'; errors: string[] }
  | { type: 'empty-file' };
```

## Accessibility Requirements

### Decision: Full keyboard support with ARIA

**Requirements**:
- Upload button focusable and activatable with Enter/Space
- Drop zone has `role="region"` with `aria-label`
- Error messages use `role="alert"` for screen reader announcement
- Loading state announced with `aria-live="polite"`

## Testing Strategy

### Decision: Unit tests for parser/validator, component tests for UploadZone

**Parser tests**: Pure function testing with valid/invalid JSON
**Validator tests**: Schema validation with edge cases
**Store tests**: State transitions
**Component tests**: User interactions with @solidjs/testing-library

**Mock strategy**: Create minimal valid uidesc fixtures, no need to mock File API in unit tests.
