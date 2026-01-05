# Research: Uidesc Parsing and Validation

**Feature**: 002-uidesc-parsing
**Date**: 2026-01-05

## Research Tasks

### 1. AJV Configuration for Strict Validation

**Decision**: Use AJV with `allErrors: true` and strict mode options

**Rationale**:
- `allErrors: true` - Collects all validation errors instead of stopping at first (FR-006)
- `strict: true` - Warns about potentially problematic schema patterns
- Schema already has `additionalProperties: false` on key objects

**Configuration**:
```typescript
import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: true,     // Collect all errors (FR-006)
  verbose: true,       // Include data in error objects for better messages
  strict: true,        // Strict schema validation
});
```

**Error Output**: AJV returns errors with `instancePath` (JSON pointer) for error location (FR-007)

**Alternatives Considered**:
- Zod: Type-first, but we already have JSON Schema
- Yup: Schema-based but less performant for large schemas
- Custom validation: More work, less battle-tested

---

### 2. Browser DOMParser for XML

**Decision**: Use native `DOMParser` API

**Rationale**:
- Built into all modern browsers
- No additional dependencies
- Sufficient for parsing VSTGUI XML format

**Usage Pattern**:
```typescript
function parseXml(content: string): Document | { error: string } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'application/xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    return { error: parseError.textContent ?? 'XML parse error' };
  }
  return doc;
}
```

**Error Detection**: DOMParser doesn't throw - it returns a document with `<parsererror>` element

**Alternatives Considered**:
- fast-xml-parser: Good but adds ~30KB to bundle
- xml2js: Node.js focused, not ideal for browser
- sax-js: Streaming parser, overkill for file-sized documents

---

### 3. XML to JSON Conversion Strategy

**Decision**: Custom recursive converter based on VSTGUI XML structure

**Rationale**:
- VSTGUI XML has specific patterns (elements become objects, attributes become properties)
- Generic converters don't match the JSON schema structure
- Need to maintain mapping for error location tracking

**Conversion Rules**:
1. Root `<vstgui-ui-description>` → `{ "vstgui-ui-description": {...} }`
2. Named children (colors, fonts, bitmaps, templates) → object with name as key
3. Element attributes → object properties
4. Child elements → nested according to type

**Example**:
```xml
<vstgui-ui-description version="1">
  <colors>
    <color name="Background" rgba="#ff0000ff"/>
  </colors>
</vstgui-ui-description>
```
Becomes:
```json
{
  "vstgui-ui-description": {
    "version": "1",
    "colors": {
      "Background": "#ff0000ff"
    }
  }
}
```

**Alternatives Considered**:
- Generic XML-to-JSON libraries: Don't produce schema-compatible output
- XSLT transformation: Overkill, requires additional tooling

---

### 4. Format Detection Algorithm

**Decision**: Inspect first non-whitespace character

**Rationale**:
- JSON starts with `{` or `[`
- XML starts with `<` (including `<?xml` declaration)
- Simple, fast, reliable

**Implementation**:
```typescript
type FormatType = 'json' | 'xml' | 'unknown';

function detectFormat(content: string): FormatType {
  const trimmed = content.trimStart();
  const firstChar = trimmed[0];

  if (firstChar === '{' || firstChar === '[') return 'json';
  if (firstChar === '<') return 'xml';
  return 'unknown';
}
```

**Edge Cases**:
- BOM characters: `trimStart()` handles UTF-8 BOM (EF BB BF) in most cases
- Explicit BOM stripping if needed: `content.replace(/^\uFEFF/, '')`

---

### 5. Error Location Mapping (XML → JSON path)

**Decision**: Track element path during XML-to-JSON conversion

**Rationale**:
- AJV returns JSON pointer paths (e.g., `/vstgui-ui-description/colors/Background`)
- Need to map back to original XML element for meaningful errors
- Track conversion with source location metadata

**Approach**:
```typescript
interface ConversionContext {
  jsonPath: string[];
  xmlPath: string[];  // Element names/indices
}

// During conversion, maintain mapping
const pathMap = new Map<string, string>();
// "/vstgui-ui-description/colors/Background" → "<colors><color name='Background'>"
```

**Trade-off**: Memory overhead for path mapping vs. user-friendly error messages. Acceptable for typical uidesc file sizes (<1MB).

---

### 6. Integration with Existing documentStore

**Decision**: Extend existing store with parsed document field

**Rationale**:
- 001-uidesc-upload already stores raw `content: string`
- Add `document: UidescDocument | null` for parsed result
- Add `parseErrors: ValidationError[] | null` for validation errors
- Trigger parsing automatically when `uploadState` becomes 'success'

**Store Extension**:
```typescript
interface DocumentStoreState {
  // Existing from 001-uidesc-upload
  content: string | null;
  metadata: DocumentMetadata | null;
  uploadState: UploadState;
  error: UploadError | null;

  // New for 002-uidesc-parsing
  document: UidescDocument | null;
  parseState: 'idle' | 'parsing' | 'valid' | 'invalid';
  parseErrors: ValidationError[] | null;
}
```

---

### 7. Type Generation from JSON Schema

**Decision**: Use json-schema-to-typescript at build time

**Rationale**:
- Already configured in package.json (`npm run generate:types`)
- Ensures TypeScript types always match schema
- Output to `src/types/uidesc.d.ts`

**Command**: `json2ts vstgui-uidesc.schema.json src/types/uidesc.d.ts`

**Note**: Generated types will need `UidescDocument` to be the root type representing the parsed structure.

---

## Summary

All research items resolved. No NEEDS CLARIFICATION remaining. Ready for Phase 1 design.

| Topic | Decision | Key Dependency |
|-------|----------|----------------|
| JSON Validation | AJV with allErrors | ajv@8.17.1 (installed) |
| XML Parsing | Native DOMParser | Browser built-in |
| XML→JSON | Custom converter | None |
| Format Detection | First char inspection | None |
| Error Mapping | Path tracking during conversion | None |
| Store Integration | Extend existing documentStore | solid-js/store |
| Type Generation | json-schema-to-typescript | Dev dependency (installed) |
