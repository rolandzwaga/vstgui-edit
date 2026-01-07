# Data Model: Property Editing

**Date**: 2026-01-07
**Feature**: 016-property-editing

## Entities

### EditorType (enum)

Classifies attributes into editor categories for selecting appropriate input controls.

```typescript
type EditorType =
  | 'text'      // Free-form string input
  | 'point'     // "x, y" coordinate pair
  | 'number'    // Numeric input with optional range
  | 'boolean'   // Checkbox toggle
  | 'enum'      // Dropdown with fixed options
  | 'color'     // Color picker (document resources + hex)
  | 'font'      // Font picker (document resources)
  | 'bitmap'    // Bitmap picker (document resources)
  | 'readonly'; // Display only, not editable
```

### AttributeTypeConfig

Configuration for each attribute defining its editor type and validation rules.

```typescript
interface AttributeTypeConfig {
  editorType: EditorType;
  options?: string[];       // For enum type
  min?: number;             // For number type
  max?: number;             // For number type
  step?: number;            // For number type increment
  flags?: string[];         // For multi-flag enum (autosize)
}
```

### ValidationResult

Result of validating an attribute value.

```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;           // Human-readable error message
  normalizedValue?: string; // Normalized/cleaned value if valid
}
```

### EditorProps (base interface)

Common props for all editor components.

```typescript
interface EditorProps {
  value: string;
  onChange: (newValue: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  disabled?: boolean;
  error?: string | null;
}
```

### EditorState

Internal state for tracking edit session.

```typescript
interface EditorState {
  isEditing: boolean;
  originalValue: string;    // Captured at edit start for cancel
  currentValue: string;     // Live editing value
  validationError: string | null;
}
```

### PropertyEditOperation

History operation for undo/redo.

```typescript
interface PropertyEditOperation {
  type: 'property-change';
  description: string;
  timestamp: number;
  viewIds: string[];
  attributeName: string;
  previousValues: Record<string, string>;  // viewId → previous value
  newValue: string;
  undo: () => void;
  redo: () => void;
}
```

## Attribute Type Mapping

### ATTRIBUTE_TYPE_MAP

Maps attribute names to their editor configurations.

```typescript
const ATTRIBUTE_TYPE_MAP: Record<string, AttributeTypeConfig> = {
  // Identity (readonly)
  'class': { editorType: 'readonly' },

  // Geometry (point)
  'origin': { editorType: 'point' },
  'size': { editorType: 'point' },
  'min-size': { editorType: 'point' },
  'max-size': { editorType: 'point' },
  'text-inset': { editorType: 'point' },
  'shadow-offset': { editorType: 'point' },
  'margin': { editorType: 'point' },  // Note: "left, top, right, bottom" - special case

  // Numbers
  'opacity': { editorType: 'number', min: 0, max: 1, step: 0.1 },
  'wheel-inc-value': { editorType: 'number', min: 0, step: 0.01 },
  'frame-width': { editorType: 'number', min: 0, step: 1 },
  'round-rect-radius': { editorType: 'number', min: 0, step: 1 },
  'spacing': { editorType: 'number', min: 0, step: 1 },
  'z-index': { editorType: 'number', step: 1 },
  'default-value': { editorType: 'number', min: 0, max: 1, step: 0.01 },
  'min-value': { editorType: 'number', step: 0.01 },
  'max-value': { editorType: 'number', step: 0.01 },

  // Booleans
  'mouse-enabled': { editorType: 'boolean' },
  'transparent': { editorType: 'boolean' },
  'wants-focus': { editorType: 'boolean' },
  'visible': { editorType: 'boolean' },
  'bordered': { editorType: 'boolean' },
  'draw-antialiased': { editorType: 'boolean' },
  'font-antialias': { editorType: 'boolean' },
  'style-3D-in': { editorType: 'boolean' },
  'style-3D-out': { editorType: 'boolean' },
  'style-no-frame': { editorType: 'boolean' },
  'style-no-text': { editorType: 'boolean' },
  'style-no-draw': { editorType: 'boolean' },
  'style-round-rect': { editorType: 'boolean' },
  'style-shadow-text': { editorType: 'boolean' },

  // Enums
  'text-alignment': { 
    editorType: 'enum', 
    options: ['left', 'center', 'right'] 
  },
  'background-color-draw-style': { 
    editorType: 'enum', 
    options: ['filled', 'stroked', 'filled and stroked'] 
  },
  'truncate-mode': { 
    editorType: 'enum', 
    options: ['head', 'tail', 'none'] 
  },
  'orientation': { 
    editorType: 'enum', 
    options: ['horizontal', 'vertical'] 
  },
  'line-layout': { 
    editorType: 'enum', 
    options: ['clip', 'truncate', 'wrap'] 
  },

  // Autosize (multi-flag enum - special handling)
  'autosize': { 
    editorType: 'enum', 
    flags: ['left', 'right', 'top', 'bottom', 'row', 'column'] 
  },

  // Colors
  'background-color': { editorType: 'color' },
  'font-color': { editorType: 'color' },
  'frame-color': { editorType: 'color' },
  'shadow-color': { editorType: 'color' },
  'back-color': { editorType: 'color' },

  // Fonts
  'font': { editorType: 'font' },

  // Bitmaps
  'bitmap': { editorType: 'bitmap' },

  // Text
  'title': { editorType: 'text' },
  'tooltip': { editorType: 'text' },
  'uidesc-label': { editorType: 'text' },
  'custom-view-name': { editorType: 'text' },
  'sub-controller': { editorType: 'text' },
  'control-tag': { editorType: 'text' },  // Future: control-tag picker
};
```

### Default Type Resolution

Attributes not in the map default to `'text'` editor type.

```typescript
function getAttributeConfig(attrName: string): AttributeTypeConfig {
  return ATTRIBUTE_TYPE_MAP[attrName] ?? { editorType: 'text' };
}
```

## Validation Rules

### Point Validation

```typescript
function validatePoint(value: string): ValidationResult {
  const parts = value.split(',').map(p => p.trim());
  if (parts.length !== 2) {
    return { valid: false, error: 'Expected format: "x, y"' };
  }
  const x = Number.parseInt(parts[0], 10);
  const y = Number.parseInt(parts[1], 10);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return { valid: false, error: 'Both values must be integers' };
  }
  return { valid: true, normalizedValue: `${x}, ${y}` };
}
```

### Size Validation (extends point with positive constraint)

```typescript
function validateSize(value: string): ValidationResult {
  const result = validatePoint(value);
  if (!result.valid) return result;
  
  const parts = value.split(',').map(p => Number.parseInt(p.trim(), 10));
  if (parts[0] < 0 || parts[1] < 0) {
    return { valid: false, error: 'Width and height must be non-negative' };
  }
  return result;
}
```

### Number Validation

```typescript
function validateNumber(
  value: string, 
  min?: number, 
  max?: number
): ValidationResult {
  const num = Number.parseFloat(value);
  if (!Number.isFinite(num)) {
    return { valid: false, error: 'Must be a valid number' };
  }
  if (min !== undefined && num < min) {
    return { valid: false, error: `Must be at least ${min}` };
  }
  if (max !== undefined && num > max) {
    return { valid: false, error: `Must be at most ${max}` };
  }
  return { valid: true, normalizedValue: String(num) };
}
```

### Boolean Validation

```typescript
function validateBoolean(value: string): ValidationResult {
  const lower = value.toLowerCase();
  if (lower !== 'true' && lower !== 'false') {
    return { valid: false, error: 'Must be "true" or "false"' };
  }
  return { valid: true, normalizedValue: lower };
}
```

### Color Validation

```typescript
function validateColor(value: string, documentColors: string[]): ValidationResult {
  // Named document color
  if (documentColors.includes(value)) {
    return { valid: true };
  }
  // Predefined color (~ prefix)
  if (value.startsWith('~')) {
    return { valid: true };  // Trust predefined colors
  }
  // Hex color
  const hexPattern = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;
  if (hexPattern.test(value)) {
    return { valid: true, normalizedValue: value.toUpperCase() };
  }
  return { valid: false, error: 'Must be a defined color, predefined (~), or hex (#RRGGBB or #RRGGBBAA)' };
}
```

## State Transitions

### Edit Session Lifecycle

```
IDLE → EDITING → VALIDATING → COMMITTED
                     ↓
                 CANCELLED
```

| State | Entry Condition | Exit Actions |
|-------|-----------------|--------------|
| IDLE | Initial / after commit/cancel | None |
| EDITING | Click on value | Capture originalValue, focus input |
| VALIDATING | Input change | Run validator, update error state |
| COMMITTED | Enter / blur (if valid) | Push history, update store |
| CANCELLED | Escape | Restore originalValue, clear error |

## Relationships

```
┌─────────────────┐
│  AttributeRow   │──uses──▶ AttributeTypeConfig
└────────┬────────┘
         │ renders
         ▼
┌─────────────────┐
│  Editor*        │──validates──▶ ValidationResult
│  (Text/Number/  │
│   Boolean/etc)  │──onChange──▶ documentStore.updateViewAttribute()
└────────┬────────┘
         │ on commit
         ▼
┌─────────────────┐
│  historyStore   │──pushOperation──▶ PropertyEditOperation
└─────────────────┘
```

## Document Store Extensions

New function to add to `documentStore.ts`:

```typescript
/**
 * Update any attribute on a view by ID.
 * @returns Previous value for undo, or null if view not found.
 */
export function updateViewAttribute(
  viewId: string,
  attributeName: string,
  newValue: string
): string | null;

/**
 * Get current value of an attribute from a view.
 * @returns Current value or undefined if not set.
 */
export function getViewAttribute(
  viewId: string,
  attributeName: string
): string | undefined;
```
