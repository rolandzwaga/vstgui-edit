# Research: Schema-Driven Property Panel

**Feature**: 022-schema-driven-properties
**Date**: 2026-01-08

## Research Tasks

### 1. JSON Schema $ref Resolution

**Question**: How to resolve `$ref` and `allOf` inheritance in the JSON schema?

**Decision**: Parse schema at build/load time, recursively resolve `$ref` pointers, merge `properties` from `allOf` arrays.

**Rationale**: The schema uses `allOf` for inheritance (e.g., `CTextLabel` inherits from `CParamDisplay` via `allOf: [{ "$ref": "#/$defs/CParamDisplayAttributes" }]`). We need to flatten this into a complete attribute set.

**Alternatives Considered**:
- Use AJV's schema compilation (rejected: AJV is for validation, not schema introspection)
- Use json-schema-ref-parser library (rejected: adds dependency, overkill for our simple schema)
- Manual recursive resolution (chosen: schema is well-structured, simple to traverse)

### 2. Schema Structure Analysis

**Question**: What is the exact structure of the schema's view class definitions?

**Decision**: Each class definition has:
- `type: "object"`
- `description`: Human-readable class description
- `allOf`: Array with single `$ref` to parent class (except CView which has none)
- `properties`: Object mapping attribute names to type definitions

**Findings from schema analysis**:
```json
"CTextLabelAttributes": {
  "type": "object",
  "description": "CTextLabel - ...",
  "allOf": [{ "$ref": "#/$defs/CParamDisplayAttributes" }],
  "properties": {
    "text-shadow-offset": { ... },
    "text-rotation": { ... }
  }
}
```

**Inheritance chains**:
- CTextLabel → CParamDisplay → CControl → CView
- CSlider → CControl → CView
- CViewContainer → CView
- etc.

### 3. Attribute Type Mapping

**Question**: How to map schema types to editor components?

**Decision**: Map based on `$ref` value and property name patterns:

| Schema Pattern | Editor Type | Component |
|----------------|-------------|-----------|
| `$ref: "#/$defs/colorValue"` | color | ColorPicker |
| `$ref: "#/$defs/pointValue"` | point | PointEditor |
| `$ref: "#/$defs/booleanValue"` | boolean | Checkbox |
| `$ref: "#/$defs/numericValue"` | number | NumberInput |
| `enum: [...]` | enum | Dropdown |
| Property ends with `-bitmap` | bitmap | BitmapPicker |
| Property is `font` | font | FontPicker |
| Default string | text | TextInput |

**Rationale**: Schema uses consistent `$ref` patterns for typed values. We can reliably detect type from the `$ref` target.

### 4. Performance Considerations

**Question**: How to ensure schema resolution is fast enough (<50ms)?

**Decision**: 
1. Parse and cache full schema at app initialization
2. Pre-compute resolved attribute sets for all known classes
3. Use Map for O(1) lookup by class name

**Rationale**: Schema is static, doesn't change at runtime. Pre-computation is safe and eliminates repeated resolution.

**Implementation**:
```typescript
// Singleton cache populated at module load
const classAttributeCache = new Map<string, AttributeDefinition[]>();

export function getAttributesForClass(className: string): AttributeDefinition[] {
  if (!classAttributeCache.has(className)) {
    // Lazy initialization for unknown classes
    classAttributeCache.set(className, resolveClassAttributes(className));
  }
  return classAttributeCache.get(className)!;
}
```

### 5. Multi-Selection Class Resolution

**Question**: How to find common base class for mixed selection?

**Decision**: Build inheritance chain for each selected class, find lowest common ancestor.

**Algorithm**:
1. For each class, compute full inheritance chain (e.g., `['CTextLabel', 'CParamDisplay', 'CControl', 'CView']`)
2. Find intersection of all chains
3. Return first (most specific) common class
4. Default to 'CView' if no common ancestor

**Example**:
- CTextLabel chain: `[CTextLabel, CParamDisplay, CControl, CView]`
- CSlider chain: `[CSlider, CControl, CView]`
- Common: `[CControl, CView]`
- Result: Show CControl attributes

### 6. Existing Code Integration

**Question**: How does current `mergeSelections.ts` work and what changes are needed?

**Decision**: Modify `mergeSelections` to accept schema context and iterate over schema attributes instead of instance keys.

**Current behavior** (from code analysis):
```typescript
// Lines 41-46: Iterates INSTANCE attributes
const allAttrNames = new Set<string>();
for (const attrs of viewAttributes) {
  for (const name of Object.keys(attrs)) {
    allAttrNames.add(name);
  }
}
```

**New behavior**:
```typescript
// Get ALL attributes from schema for the class
const schemaAttrs = getAttributesForClass(className ?? 'CViewContainer');
for (const attrDef of schemaAttrs) {
  // Check if instance has value, otherwise mark as unset
}
```

### 7. UI/UX for Unset Properties

**Question**: How to visually distinguish unset properties?

**Decision**: 
- Unset properties show with dimmed text and placeholder styling
- Background slightly different (subtle gray)
- Value shows as empty or "—" placeholder
- Clicking allows immediate value entry

**CSS approach**:
```css
.attributeRow.unset {
  opacity: 0.7;
}
.attributeRow.unset .value {
  color: var(--color-neutral-400);
  font-style: italic;
}
```

## Summary

All technical questions resolved. No external dependencies needed. Implementation can proceed with:

1. **schemaAttributes.ts**: Parse schema, resolve inheritance, cache results
2. **attributeTypes.ts**: Map schema types to editor types
3. **mergeSelections.ts**: Use schema instead of instance for attribute enumeration
4. **PropertiesPanel**: Add unset styling and attribute addition flow
