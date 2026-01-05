# Data Model: Uidesc Parsing and Validation

**Feature**: 002-uidesc-parsing
**Date**: 2026-01-05

## Entities

### UidescDocument (Generated from Schema)

The root document type is generated from `vstgui-uidesc.schema.json` via `json-schema-to-typescript`. Key structure:

```typescript
// Generated in src/types/uidesc.d.ts
interface VstguiUiDescription {
  'vstgui-ui-description': {
    version: '1';
    colors?: Record<string, ColorValue>;
    fonts?: Record<string, FontDefinition>;
    bitmaps?: Record<string, BitmapDefinition>;
    gradients?: Record<string, GradientDefinition>;
    'control-tags'?: Record<string, ControlTagValue>;
    variables?: Record<string, string>;
    templates?: Record<string, ViewDefinition>;
    custom?: CustomDefinition;
  };
}
```

### FormatType

```typescript
// src/types/parser.ts
type FormatType = 'json' | 'xml' | 'unknown';
```

### ParseResult (Discriminated Union)

```typescript
// src/types/parser.ts
type ParseResult =
  | { success: true; document: VstguiUiDescription; format: FormatType }
  | { success: false; errors: ValidationError[]; format: FormatType };
```

### ValidationError

```typescript
// src/types/parser.ts
interface ValidationError {
  /** Error category */
  type: 'syntax' | 'schema' | 'format';

  /** Human-readable error message */
  message: string;

  /** JSON pointer path (e.g., "/vstgui-ui-description/colors/Background") */
  path?: string;

  /** For XML: original element path */
  xmlPath?: string;

  /** Line number if available (1-indexed) */
  line?: number;

  /** Column number if available (1-indexed) */
  column?: number;
}
```

### ParseState

```typescript
// src/types/parser.ts
type ParseState = 'idle' | 'parsing' | 'valid' | 'invalid';
```

### Extended DocumentStoreState

```typescript
// src/types/index.ts (extended)
interface DocumentStoreState {
  // From 001-uidesc-upload
  content: string | null;
  metadata: DocumentMetadata | null;
  uploadState: UploadState;
  error: UploadError | null;

  // New for 002-uidesc-parsing
  document: VstguiUiDescription | null;
  parseState: ParseState;
  parseErrors: ValidationError[] | null;
  detectedFormat: FormatType | null;
}
```

## State Transitions

### ParseState Machine

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
                    ▼                                         │
    ┌───────┐  uploadState='success'  ┌─────────┐            │
    │ idle  │ ──────────────────────► │ parsing │            │
    └───────┘                         └────┬────┘            │
        ▲                                  │                 │
        │                          ┌───────┴───────┐         │
        │                          ▼               ▼         │
        │                    ┌─────────┐     ┌─────────┐     │
        │                    │  valid  │     │ invalid │     │
        │                    └─────────┘     └─────────┘     │
        │                          │               │         │
        └──────────────────────────┴───────────────┴─────────┘
                              reset()
```

### State Descriptions

| State | Description | document | parseErrors |
|-------|-------------|----------|-------------|
| idle | No parsing attempted | null | null |
| parsing | Parsing in progress | null | null |
| valid | Successfully parsed and validated | VstguiUiDescription | null |
| invalid | Parse or validation failed | null | ValidationError[] |

## Validation Rules

### Format Detection (FR-001, FR-002)
- Trim leading whitespace before detection
- `{` or `[` → JSON format
- `<` → XML format
- Otherwise → unknown (error)

### JSON Validation (FR-004 to FR-008a)
- Use AJV with JSON Schema
- `allErrors: true` to collect all errors
- Strict mode rejects unknown properties
- Errors include JSON pointer paths

### XML Validation (FR-009 to FR-012)
1. Parse with DOMParser
2. Check for `<parsererror>` element
3. Convert to JSON structure
4. Validate converted JSON with AJV
5. Map error paths back to XML elements

## Relationships

```
DocumentStoreState
├── content (string)      ← Raw file content from upload
├── metadata              ← File info from upload
├── uploadState           ← Upload state machine
├── error                 ← Upload errors
│
├── document              ← Parsed UidescDocument (success only)
├── parseState            ← Parse state machine
├── parseErrors           ← Validation errors (failure only)
└── detectedFormat        ← 'json' | 'xml' | 'unknown'

VstguiUiDescription
└── vstgui-ui-description
    ├── version: "1"
    ├── colors?: {[name]: ColorValue}
    ├── fonts?: {[name]: FontDefinition}
    ├── bitmaps?: {[name]: BitmapDefinition}
    ├── gradients?: {[name]: GradientDefinition}
    ├── control-tags?: {[name]: ControlTagValue}
    ├── variables?: {[name]: string}
    ├── templates?: {[name]: ViewDefinition}
    └── custom?: CustomDefinition
```

## Key Value Types (from Schema)

| Type | Pattern | Example |
|------|---------|---------|
| ColorValue | `#RRGGBB` or `#RRGGBBAA` or ref | `#ff0000`, `~BlackCColor` |
| PointValue | `x, y` | `10, 20` |
| SizeValue | `width, height` | `100, 50` |
| RectValue | `x, y, width, height` | `0, 0, 100, 50` |
| BooleanValue | `"true"` or `"false"` | `"true"` |
| NumericValue | Integer or float string | `"12"`, `"1.5"` |
