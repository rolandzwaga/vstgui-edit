# Quickstart: Uidesc Parsing and Validation

**Feature**: 002-uidesc-parsing
**Date**: 2026-01-05

## Setup

```bash
# Types are already configured to generate
npm run generate:types

# Run tests
npm test

# Type check
npm run typecheck
```

## Core APIs

### Format Detection

```typescript
import { detectFormat } from '~/domain/parser';

const format = detectFormat(content);
// Returns: 'json' | 'xml' | 'unknown'
```

### Parse and Validate

```typescript
import { parseUidesc } from '~/domain/parser';

const result = await parseUidesc(content);

if (result.success) {
  console.log(result.document);  // VstguiUiDescription
  console.log(result.format);    // 'json' | 'xml'
} else {
  console.log(result.errors);    // ValidationError[]
  console.log(result.format);    // detected format (may be 'unknown')
}
```

### Store Usage

```typescript
import { documentStore, parseDocument } from '~/stores/documentStore';

// After upload succeeds, parsing triggers automatically
// Access parsed document:
const doc = documentStore.document;

// Check parse state:
if (documentStore.parseState === 'valid') {
  // Use documentStore.document
}

if (documentStore.parseState === 'invalid') {
  // Show documentStore.parseErrors
}
```

## File Structure

```
src/domain/parser/
├── index.ts              # Export: parseUidesc, detectFormat
├── formatDetector.ts     # detectFormat(content)
├── jsonParser.ts         # parseJson(content) → ParseResult
├── xmlParser.ts          # parseXml(content) → Document | Error
├── xmlToJson.ts          # xmlToJson(doc) → JSON + path map
├── validator.ts          # validateSchema(json) → errors[]
└── __tests__/
    └── *.spec.ts
```

## Test Examples

### Format Detection

```typescript
describe('detectFormat', () => {
  it('detects JSON starting with {', () => {
    expect(detectFormat('{"key": "value"}')).toBe('json');
  });

  it('detects XML starting with <', () => {
    expect(detectFormat('<root/>')).toBe('xml');
  });

  it('handles leading whitespace', () => {
    expect(detectFormat('  \n  {"key": "value"}')).toBe('json');
  });
});
```

### JSON Validation

```typescript
describe('parseJson', () => {
  it('validates against schema', async () => {
    const validJson = `{
      "vstgui-ui-description": {
        "version": "1"
      }
    }`;
    const result = await parseJson(validJson);
    expect(result.success).toBe(true);
  });

  it('reports schema errors with paths', async () => {
    const invalidJson = `{
      "vstgui-ui-description": {
        "version": "2"
      }
    }`;
    const result = await parseJson(invalidJson);
    expect(result.success).toBe(false);
    expect(result.errors[0].path).toContain('version');
  });
});
```

### XML Conversion

```typescript
describe('xmlToJson', () => {
  it('converts colors element to object', () => {
    const xml = `
      <vstgui-ui-description version="1">
        <colors>
          <color name="Bg" rgba="#ff0000ff"/>
        </colors>
      </vstgui-ui-description>
    `;
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const result = xmlToJson(doc);

    expect(result.json['vstgui-ui-description'].colors).toEqual({
      Bg: '#ff0000ff'
    });
  });
});
```

## Error Handling

```typescript
// ValidationError structure
interface ValidationError {
  type: 'syntax' | 'schema' | 'format';
  message: string;
  path?: string;      // JSON pointer
  xmlPath?: string;   // Original XML path (if XML source)
  line?: number;
  column?: number;
}

// Example error for unknown property
{
  type: 'schema',
  message: "Property 'unknownProp' is not allowed",
  path: '/vstgui-ui-description/unknownProp'
}

// Example error for syntax
{
  type: 'syntax',
  message: 'Unexpected token } at line 5',
  line: 5
}
```

## Integration Pattern

```typescript
// In documentStore.ts
import { parseUidesc } from '~/domain/parser';

// When uploadState becomes 'success'
createEffect(() => {
  if (store.uploadState === 'success' && store.content) {
    parseDocumentContent(store.content);
  }
});

async function parseDocumentContent(content: string) {
  setStore({ parseState: 'parsing' });

  const result = await parseUidesc(content);

  if (result.success) {
    setStore({
      document: result.document,
      parseState: 'valid',
      parseErrors: null,
      detectedFormat: result.format,
    });
  } else {
    setStore({
      document: null,
      parseState: 'invalid',
      parseErrors: result.errors,
      detectedFormat: result.format,
    });
  }
}
```

## Common Patterns

### Importing Schema for AJV

```typescript
// Import JSON schema
import schema from '../../../vstgui-uidesc.schema.json';

const ajv = new Ajv({ allErrors: true, verbose: true });
const validate = ajv.compile(schema);
```

### Path Mapping for XML Errors

```typescript
// Store mapping during conversion
const pathMap = new Map<string, string>();

// When converting XML element:
pathMap.set(
  '/vstgui-ui-description/colors/Background',
  '<colors><color name="Background">'
);

// When reporting error, look up original path
const xmlPath = pathMap.get(error.instancePath);
```
