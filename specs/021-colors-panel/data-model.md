# Data Model: Colors Panel

## Entities

### Color

A named color resource in the uidesc document.

| Property | Type | Description | Validation |
|----------|------|-------------|------------|
| name | string | Unique identifier | Non-empty, unique within document |
| value | string | Hex color value | #RGB, #RRGGBB, or #RRGGBBAA format |

**Storage location**: `document['vstgui-ui-description'].colors`

**Format in uidesc**:
```json
{
  "colors": {
    "Background": "#2d2d2dff",
    "Text": "#ffffffff",
    "Accent": "#0066cc"
  }
}
```

### ParsedColor

Internal representation of parsed color values for rendering.

| Property | Type | Description | Range |
|----------|------|-------------|-------|
| r | number | Red channel | 0-255 |
| g | number | Green channel | 0-255 |
| b | number | Blue channel | 0-255 |
| a | number | Alpha channel | 0-255 |

### ColorUsage

Tracks which views reference a color.

| Property | Type | Description |
|----------|------|-------------|
| colorName | string | Name of the color |
| viewId | string | ID of the referencing view |
| viewClass | string | Class name of the view |
| attribute | string | Which attribute references the color |

### PredefinedColor

Built-in VSTGUI colors that cannot be modified.

| Name | Value | Display |
|------|-------|---------|
| ~ BlackCColor | #000000FF | Black |
| ~ WhiteCColor | #FFFFFFFF | White |
| ~ GreyCColor | #808080FF | Grey |
| ~ RedCColor | #FF0000FF | Red |
| ~ GreenCColor | #00FF00FF | Green |
| ~ BlueCColor | #0000FFFF | Blue |
| ~ YellowCColor | #FFFF00FF | Yellow |
| ~ CyanCColor | #00FFFFFF | Cyan |
| ~ MagentaCColor | #FF00FFFF | Magenta |
| ~ TransparentCColor | #00000000 | Transparent |

## State

### Document Colors

Lives in existing `documentStore`:

```typescript
interface DocumentStore {
  // ... existing properties
  
  // Computed getter
  colors: Record<string, string> | undefined;
}
```

### Color Panel State

No additional store needed. Panel state is derived from:
- `documentStore.document` - source of color data
- Local component signals for edit mode, pending values

## Operations

### Add Color

1. Generate unique name ("New Color N")
2. Add to `document['vstgui-ui-description'].colors`
3. Push to historyStore

### Edit Color Name

1. Validate new name is unique
2. Remove old key, add new key with same value
3. Push to historyStore

### Edit Color Value

1. Validate hex format
2. Update value at key
3. Push to historyStore

### Delete Color

1. Check for usages (optional warning)
2. Remove key from colors object
3. Push to historyStore (store full color for undo)

### Get Color Usages

1. Walk all views in document
2. Check color attributes: `background-color`, `font-color`, `frame-color`, etc.
3. Collect views where attribute value === colorName
4. Return usage list

## Color Attributes to Scan

These view attributes can reference colors by name:

| Attribute | View Classes |
|-----------|-------------|
| background-color | All views |
| font-color | CTextLabel, CTextEdit, CTextButton, etc. |
| frame-color | All views |
| hover-color | CTextButton |
| value-color | CVuMeter |
| min-value-color | CSlider |
| max-value-color | CSlider |
| default-value-color | CKnob |
| shadow-color | Various |
| highlight-color | Various |
| title-color | CCheckBox |
| back-color | CParamDisplay |
| font-antialias | N/A (not a color) |

## Validation Rules

### Color Name

```typescript
function validateColorName(name: string, existingNames: string[]): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Color name cannot be empty' };
  }
  if (existingNames.includes(name)) {
    return { valid: false, error: 'A color with this name already exists' };
  }
  return { valid: true };
}
```

### Color Value (Hex)

```typescript
const HEX_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

function validateHexColor(value: string): ValidationResult {
  // Auto-correct missing #
  const normalized = value.startsWith('#') ? value : `#${value}`;
  
  if (!HEX_PATTERN.test(normalized)) {
    return {
      valid: false,
      error: 'Invalid hex color. Use #RGB, #RRGGBB, or #RRGGBBAA format'
    };
  }
  return { valid: true, normalized };
}
```

## History Operations

### AddColorOperation

```typescript
const operation: HistoryOperation = {
  type: 'add-color',
  description: `Add color "${name}"`,
  timestamp: Date.now(),
  undo: () => deleteColorFromDocument(name),
  redo: () => addColorToDocument(name, value),
};
```

### EditColorNameOperation

```typescript
const operation: HistoryOperation = {
  type: 'edit-color-name',
  description: `Rename color "${oldName}" to "${newName}"`,
  timestamp: Date.now(),
  undo: () => renameColorInDocument(newName, oldName),
  redo: () => renameColorInDocument(oldName, newName),
};
```

### EditColorValueOperation

```typescript
const operation: HistoryOperation = {
  type: 'edit-color-value',
  description: `Change color "${name}"`,
  timestamp: Date.now(),
  undo: () => updateColorValueInDocument(name, oldValue),
  redo: () => updateColorValueInDocument(name, newValue),
};
```

### DeleteColorOperation

```typescript
const operation: HistoryOperation = {
  type: 'delete-color',
  description: `Delete color "${name}"`,
  timestamp: Date.now(),
  undo: () => addColorToDocument(name, value),
  redo: () => deleteColorFromDocument(name),
};
```
