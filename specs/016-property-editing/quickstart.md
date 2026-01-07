# Quickstart: Property Editing

**Date**: 2026-01-07
**Feature**: 016-property-editing

## Overview

This feature adds editing capabilities to the properties panel, allowing users to modify view attributes with type-appropriate input controls.

## Key Components

### Editor Components (NEW)

Located in `src/components/editors/`:

| Component | Purpose | Props |
|-----------|---------|-------|
| `TextEditor` | String attributes (title, tooltip) | value, onChange, onCommit, onCancel |
| `NumberEditor` | Numeric attributes (opacity) | value, onChange, min, max, step |
| `BooleanEditor` | Toggle attributes (mouse-enabled) | value, onChange |
| `PointEditor` | Coordinate pairs (origin, size) | value, onChange, onCommit, onCancel |
| `EnumEditor` | Fixed options (text-alignment) | value, options, onChange |
| `ColorPicker` | Color selection | value, onChange, colors (from document) |
| `FontPicker` | Font selection | value, onChange, fonts (from document) |
| `BitmapPicker` | Bitmap selection | value, onChange, bitmaps (from document) |

### Domain Utilities (NEW)

Located in `src/domain/properties/`:

| Module | Purpose |
|--------|---------|
| `attributeTypes.ts` | Editor type classification, ATTRIBUTE_TYPE_MAP |
| `validation.ts` | Type-specific validators |

### Store Extensions

| Store | New Functions |
|-------|--------------|
| `documentStore` | `updateViewAttribute()`, `getViewAttribute()` |

## Usage Pattern

### 1. Determine Editor Type

```typescript
import { getAttributeConfig } from './domain/properties/attributeTypes';

const config = getAttributeConfig('opacity');
// { editorType: 'number', min: 0, max: 1, step: 0.1 }
```

### 2. Render Appropriate Editor

```typescript
import { NumberEditor } from './components/editors/NumberEditor';

<NumberEditor
  value={attributeValue}
  min={config.min}
  max={config.max}
  step={config.step}
  onChange={handleChange}
  onCommit={handleCommit}
  onCancel={handleCancel}
/>
```

### 3. Validate Before Commit

```typescript
import { validateNumber } from './domain/properties/validation';

const result = validateNumber(newValue, config.min, config.max);
if (!result.valid) {
  setError(result.error);
  return;
}
```

### 4. Update Document Store

```typescript
import { updateViewAttribute } from './stores/documentStore';

const previousValue = updateViewAttribute(viewId, 'opacity', '0.75');
```

### 5. Push History Operation

```typescript
import { pushOperation } from './stores/historyStore';

pushOperation({
  type: 'property-change',
  description: 'Change opacity',
  timestamp: Date.now(),
  undo: () => updateViewAttribute(viewId, 'opacity', previousValue),
  redo: () => updateViewAttribute(viewId, 'opacity', '0.75'),
});
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Commit edit |
| Escape | Cancel edit |
| Tab | Commit and move to next field |
| Up/Down | Increment/decrement (number fields) |

## Multi-Selection Editing

When multiple views are selected:

1. Shared values display normally
2. Differing values show "Mixed"
3. Editing Mixed applies new value to ALL selected views
4. Single undo operation restores all previous values

## Existing Infrastructure

Reuse from previous features:

- `propertiesStore` - Group expand/collapse state (011)
- `selectionStore` - Selected view IDs (008)
- `historyStore` - Undo/redo stack (012)
- `documentStore` - Document state (001-002)
- `AttributeRow` component - Extend for editing (011)
- `AttributeGroup` component - Reuse as-is (011)
- `@floating-ui/dom` - Picker positioning (008)

## Test Files

Each component needs tests in `__tests__/` subdirectory:

```
src/components/editors/__tests__/
├── TextEditor.spec.tsx
├── NumberEditor.spec.tsx
├── BooleanEditor.spec.tsx
├── PointEditor.spec.tsx
├── EnumEditor.spec.tsx
├── ColorPicker.spec.tsx
├── FontPicker.spec.tsx
└── BitmapPicker.spec.tsx

src/domain/properties/__tests__/
├── attributeTypes.spec.ts
└── validation.spec.ts
```

## Development Order

1. Domain utilities (attributeTypes, validation)
2. Simple editors (TextEditor, BooleanEditor)
3. Complex editors (PointEditor, NumberEditor, EnumEditor)
4. Resource pickers (ColorPicker, FontPicker, BitmapPicker)
5. AttributeRow integration
6. Multi-selection support
7. History integration
