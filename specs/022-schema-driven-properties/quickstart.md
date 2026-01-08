# Quickstart: Schema-Driven Property Panel

**Feature**: 022-schema-driven-properties
**Date**: 2026-01-08

## Overview

This feature makes the property panel display ALL attributes defined in the JSON schema for a view's class, not just attributes that have values in the instance. This enables:

1. Discovering available properties
2. Setting properties that weren't initially defined
3. Fixing the bug where deleted resource references hide properties

## Key Files

| File | Purpose |
|------|---------|
| `src/domain/properties/schemaAttributes.ts` | Schema parsing, inheritance resolution |
| `src/domain/properties/attributeTypes.ts` | Schema type → editor type mapping |
| `src/domain/properties/mergeSelections.ts` | Property panel data generation |
| `src/types/properties.ts` | TypeScript interfaces |
| `vstgui-uidesc.schema.json` | Source schema file |

## Usage

### Getting Attributes for a Class

```typescript
import { getAttributesForClass } from './domain/properties/schemaAttributes';

// Get all attributes for CTextLabel (includes inherited from CParamDisplay, CControl, CView)
const attrs = getAttributesForClass('CTextLabel');
// Returns: AttributeDefinition[]
```

### Getting Editor Type

```typescript
import { getEditorType } from './domain/properties/attributeTypes';

const editorType = getEditorType('font-color', attrDefinition);
// Returns: 'color'
```

### Checking if Attribute is Unset

```typescript
// In AttributeEntry
if (entry.isUnset) {
  // Show placeholder styling
  // Allow user to set initial value
}
```

## Testing

```bash
# Run all property-related tests
npm test -- --run src/domain/properties

# Run specific test file
npm test -- --run src/domain/properties/__tests__/schemaAttributes.spec.ts
```

## Common Tasks

### Adding a New View Class

1. Add class definition to `vstgui-uidesc.schema.json` under `$defs`
2. Add to `viewAttributesByClass` mapping
3. Add to `viewClass` enum
4. Cache will auto-resolve on first access

### Adding a New Attribute Type

1. Add type definition to schema `$defs`
2. Add mapping in `attributeTypes.ts` `getEditorType()`
3. Ensure editor component exists for the type

### Debugging Schema Resolution

```typescript
import { getInheritanceChain, resolveClassAttributes } from './schemaAttributes';

// See inheritance chain
console.log(getInheritanceChain('CTextLabel'));
// ['CTextLabel', 'CParamDisplay', 'CControl', 'CView']

// See resolved attributes
console.log(resolveClassAttributes('CTextLabel'));
// All attributes with their definitions
```
