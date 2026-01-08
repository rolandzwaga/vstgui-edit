# Data Model: Schema-Driven Property Panel

**Feature**: 022-schema-driven-properties
**Date**: 2026-01-08

## Entities

### AttributeDefinition

Represents a single attribute definition extracted from the JSON schema.

```typescript
interface AttributeDefinition {
  /** Attribute name (e.g., "font-color", "origin") */
  name: string;
  
  /** Editor type derived from schema */
  editorType: EditorType;
  
  /** Human-readable description from schema */
  description?: string;
  
  /** For enum types, the allowed values */
  enumValues?: string[];
  
  /** Original schema $ref for type resolution */
  schemaRef?: string;
}

type EditorType = 
  | 'color'    // Color picker
  | 'point'    // Point editor (x, y)
  | 'boolean'  // Checkbox
  | 'number'   // Number input
  | 'enum'     // Dropdown select
  | 'font'     // Font picker
  | 'bitmap'   // Bitmap picker
  | 'text';    // Text input (default)
```

### ViewClassSchema

Resolved set of all attributes for a view class including inherited attributes.

```typescript
interface ViewClassSchema {
  /** Class name (e.g., "CTextLabel") */
  className: string;
  
  /** Display name from schema (e.g., "Text Label") */
  displayName?: string;
  
  /** Parent class name for inheritance */
  parentClass?: string;
  
  /** All attributes including inherited ones */
  attributes: AttributeDefinition[];
  
  /** Inheritance chain from most specific to base */
  inheritanceChain: string[];
}
```

### AttributeEntry (Enhanced)

Extended from existing type to support schema-driven properties.

```typescript
interface AttributeEntry {
  /** Attribute name */
  name: string;
  
  /** Current value (null if mixed across selection) */
  value: string | null;
  
  /** True if different values across multi-selection */
  isMixed: boolean;
  
  /** True if value can be copied */
  isCopyable: boolean;
  
  /** NEW: True if attribute exists in schema but not in instance */
  isUnset: boolean;
  
  /** NEW: Editor type from schema */
  editorType: EditorType;
  
  /** NEW: Enum values if editorType is 'enum' */
  enumValues?: string[];
  
  /** NEW: Tooltip text from schema description */
  description?: string;
}
```

### SchemaCache

Internal cache structure for resolved schemas.

```typescript
interface SchemaCache {
  /** Map of class name to resolved schema */
  classSchemas: Map<string, ViewClassSchema>;
  
  /** Map of class name to inheritance chain */
  inheritanceChains: Map<string, string[]>;
  
  /** Schema definitions from $defs */
  definitions: Record<string, unknown>;
}
```

## Relationships

```
┌─────────────────────┐
│  JSON Schema File   │
│ (vstgui-uidesc.json)│
└──────────┬──────────┘
           │ parsed at load
           ▼
┌─────────────────────┐
│    SchemaCache      │
│  (singleton)        │
└──────────┬──────────┘
           │ resolves
           ▼
┌─────────────────────┐
│  ViewClassSchema    │◄────────┐
│  - className        │         │
│  - attributes[]     │         │ parent ref
│  - parentClass      │─────────┘
└──────────┬──────────┘
           │ contains
           ▼
┌─────────────────────┐
│ AttributeDefinition │
│  - name             │
│  - editorType       │
│  - enumValues?      │
└──────────┬──────────┘
           │ merged with instance
           ▼
┌─────────────────────┐
│   AttributeEntry    │
│  - value            │
│  - isUnset          │
│  - editorType       │
└─────────────────────┘
```

## State Transitions

### Attribute State Machine

```
                    ┌─────────────┐
                    │   UNSET     │
                    │ (in schema, │
                    │ not in view)│
                    └──────┬──────┘
                           │
           user sets value │
                           ▼
                    ┌─────────────┐
                    │    SET      │
                    │ (in schema, │
                    │  in view)   │
                    └──────┬──────┘
                           │
          user clears value│
                           ▼
                    ┌─────────────┐
                    │   UNSET     │
                    └─────────────┘
```

### Multi-Selection States

| Scenario | Class Resolution | Attributes Shown |
|----------|------------------|------------------|
| Single view | View's class | All class attributes |
| Multiple, same class | Common class | All class attributes |
| Multiple, different classes | Common ancestor | Ancestor attributes |
| No selection | N/A | Empty panel |

## Validation Rules

1. **Class Name**: Must be a known class in schema or default to 'CViewContainer'
2. **Attribute Name**: Must exist in resolved class schema
3. **Attribute Value**: Validated by existing editors (color format, numeric range, etc.)
4. **Inheritance**: Must resolve without circular references

## Default Values

| Scenario | Default |
|----------|---------|
| Missing `class` attribute | 'CViewContainer' |
| Unknown class name | Fall back to 'CView' attributes |
| Schema load failure | Instance-only attributes (current behavior) |
