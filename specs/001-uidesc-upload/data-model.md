# Data Model: Uidesc File Upload

**Feature**: 001-uidesc-upload
**Date**: 2026-01-05
**Scope**: Raw file storage only (parsing deferred to future spec)

## Entities

### RawDocument

The raw string contents of a uidesc file. Format may be XML or JSON - determination and parsing deferred to future spec.

```typescript
type RawDocument = string;
```

### UploadState

State machine for upload process.

```typescript
type UploadState = 'idle' | 'dragging' | 'loading' | 'success' | 'error';
```

**State Transitions**:
- `idle` → `dragging` (file enters drop zone)
- `dragging` → `idle` (file leaves drop zone)
- `dragging` → `loading` (file dropped)
- `idle` → `loading` (file selected via picker)
- `loading` → `success` (file read successfully)
- `loading` → `error` (file read failure or validation error)
- `error` → `idle` (user dismisses error)
- `success` → `idle` (user uploads new file)

### UploadError

Discriminated union for error types.

```typescript
type UploadError =
  | { type: 'invalid-extension'; filename: string; message: string }
  | { type: 'empty-file'; message: string };
```

**Note**: Parse errors and validation errors removed - parsing deferred to future spec.

### DocumentMetadata

Metadata about the loaded document.

```typescript
interface DocumentMetadata {
  filename: string;
  fileSize: number;
  loadedAt: Date;
}
```

## Store Structure

### DocumentStore

Global store for the loaded document.

```typescript
interface DocumentStoreState {
  content: string | null;
  metadata: DocumentMetadata | null;
  uploadState: UploadState;
  error: UploadError | null;
}
```

## Validation Rules

1. **File extension**: Must be `.uidesc` (case-insensitive)
2. **Non-empty**: File must have content

**Note**: Format validation (XML/JSON) and schema validation deferred to future spec.

## Future Spec: Parsing

The following will be defined in a future parsing spec:

- UidescDocument type (parsed representation)
- XML parser
- JSON parser
- Format detection (XML vs JSON)
- Schema validation using AJV
- Parse error and validation error types
