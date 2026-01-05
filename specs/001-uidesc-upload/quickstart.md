# Quickstart: Uidesc File Upload

**Feature**: 001-uidesc-upload
**Date**: 2026-01-05

## Overview

This feature adds a file upload view for loading `.uidesc` files into the editor. Users can drag-and-drop or use a file picker.

## Key Files

| File | Purpose |
|------|---------|
| `src/components/UploadZone/UploadZone.tsx` | Main upload UI component |
| `src/domain/uidesc/parser.ts` | JSON parsing logic |
| `src/domain/uidesc/validator.ts` | AJV schema validation |
| `src/domain/uidesc/types.ts` | TypeScript type definitions |
| `src/stores/documentStore.ts` | Global document state |

## Usage

### Loading a Document

```typescript
import { documentStore } from './stores/documentStore';

// Access loaded document
const doc = documentStore.document;

// Check if document is loaded
if (doc) {
  console.log('Templates:', Object.keys(doc['vstgui-ui-description'].templates ?? {}));
}
```

### Upload State

```typescript
import { documentStore } from './stores/documentStore';

// Check upload state
const state = documentStore.uploadState(); // 'idle' | 'loading' | 'success' | 'error'

// Check for errors
const error = documentStore.error();
if (error) {
  console.log('Upload failed:', error.type);
}
```

### Programmatic Upload

```typescript
import { documentStore } from './stores/documentStore';

// Load from File object
await documentStore.loadFile(file);

// Reset store
documentStore.reset();
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/domain/uidesc/__tests__/parser.spec.ts
```

### Test Fixtures

Located in `src/__tests__/fixtures/`:
- `valid-minimal.uidesc` - Minimal valid document
- `valid-full.uidesc` - Full document with all sections
- `invalid-json.uidesc` - Malformed JSON
- `invalid-schema.uidesc` - Valid JSON, invalid schema

## Component Props

### UploadZone

```typescript
interface UploadZoneProps {
  onUpload?: (document: UidescDocument, metadata: DocumentMetadata) => void;
  onError?: (error: UploadError) => void;
}
```

## Error Handling

| Error Type | Cause | User Message |
|------------|-------|--------------|
| `invalid-extension` | File not `.uidesc` | "Please select a .uidesc file" |
| `empty-file` | Zero-byte file | "The file is empty" |
| `parse-error` | Invalid JSON | "File contains invalid JSON" |
| `validation-error` | Schema mismatch | "File is not a valid uidesc document" |

## Accessibility

- Drop zone: `role="region"` with `aria-label="File upload area"`
- Upload button: Standard `<button>` with clear label
- Errors: `role="alert"` for screen reader announcement
- Loading: `aria-busy="true"` on container
