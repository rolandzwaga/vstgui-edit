# Quickstart: Colors Panel

## Overview

The Colors Panel displays and manages color resources in uidesc files. It appears in the left sidebar below ViewPalette.

## Key Components

### ColorsPanel

Main container component. Renders color list or empty state.

```typescript
import { ColorsPanel } from './components/ColorsPanel';

// Usage in sidebar
<ColorsPanel />
```

### ColorItem

Individual color row with name, value, swatch, and inline editing.

```typescript
import { ColorItem } from './components/ColorsPanel/ColorItem';

<ColorItem
  name="Background"
  value="#2d2d2dff"
  usageCount={3}
  onEdit={(name, value) => updateColor(name, value)}
  onDelete={(name) => deleteColor(name)}
/>
```

### ColorSwatch

Visual preview of a color with transparency support.

```typescript
import { ColorSwatch } from './components/ColorsPanel/ColorSwatch';

<ColorSwatch color="#ff5500cc" size="sm" />  // 16x16
<ColorSwatch color="#ff5500cc" size="md" />  // 24x24
<ColorSwatch color="#ff5500cc" size="lg" />  // 32x32
```

## Domain Utilities

### Color Validation

```typescript
import { validateHexColor, validateColorName } from './domain/colors';

// Validate hex format
const result = validateHexColor('#ff5500');
// { valid: true, normalized: '#ff5500' }

const result = validateHexColor('invalid');
// { valid: false, error: 'Invalid hex color...' }

// Validate name uniqueness
const result = validateColorName('NewColor', ['Background', 'Text']);
// { valid: true }

const result = validateColorName('Background', ['Background', 'Text']);
// { valid: false, error: 'A color with this name already exists' }
```

### Color Parsing

```typescript
import { parseHexColor, formatHexColor } from './domain/colors';

// Parse to RGBA values
const color = parseHexColor('#ff5500cc');
// { r: 255, g: 85, b: 0, a: 204 }

// Format for CSS
const css = formatHexColor({ r: 255, g: 85, b: 0, a: 204 });
// 'rgba(255, 85, 0, 0.8)'
```

### Color Usage Tracking

```typescript
import { findColorUsages } from './domain/colors';

// Find views referencing a color
const usages = findColorUsages('Background', document);
// [
//   { viewId: 'main', viewClass: 'CViewContainer', attribute: 'background-color' },
//   { viewId: 'panel', viewClass: 'CViewContainer', attribute: 'background-color' }
// ]
```

## Store Integration

### Adding Colors

```typescript
import { addColor } from './stores/documentStore';
import { pushOperation } from './stores/historyStore';

// Add with undo support
const operation = createAddColorOperation('NewColor', '#ffffffff', addColor, deleteColor);
pushOperation(operation);
```

### Updating Colors

```typescript
import { updateColorName, updateColorValue } from './stores/documentStore';

// Rename
updateColorName('OldName', 'NewName');

// Change value
updateColorValue('Background', '#333333ff');
```

### Deleting Colors

```typescript
import { deleteColor } from './stores/documentStore';
import { findColorUsages } from './domain/colors';

// Check usages first
const usages = findColorUsages('Background', documentStore.document);
if (usages.length > 0) {
  // Show confirmation dialog
}

// Delete
deleteColor('Background');
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Edit selected color / Confirm edit |
| Escape | Cancel edit / Clear selection |
| Delete | Delete selected color |
| Tab | Move to next field in edit mode |

## CSS Tokens

New tokens in `tokens.css`:

```css
/* Color panel */
--color-swatch-border: var(--border-color);
--color-swatch-checkerboard-light: #ccc;
--color-swatch-checkerboard-dark: #999;
--color-item-hover-bg: var(--bg-hover);
--color-item-selected-bg: var(--bg-selected);
```

## Testing

Follow TESTING-GUIDE.md. Key patterns:

```typescript
import { render } from '@solidjs/testing-library';
import { ColorsPanel } from './ColorsPanel';
import { documentStore, setDocument } from '../../stores/documentStore';

beforeEach(() => {
  resetDocument();
});

test('displays colors from document', async () => {
  setDocument(mockDocumentWithColors);
  
  const { findByText } = render(() => <ColorsPanel />);
  
  expect(await findByText('Background')).toBeInTheDocument();
  expect(await findByText('#2d2d2dff')).toBeInTheDocument();
});
```
