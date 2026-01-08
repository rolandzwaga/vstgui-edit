# Quickstart: Fonts Panel

**Feature**: 023-fonts-panel  
**Date**: 2026-01-08

## Overview

The Fonts Panel manages font definitions in uidesc files. It displays a list of defined fonts with sample previews, allows adding/editing/deleting fonts, tracks usage across views, and integrates with undo/redo.

## Getting Started

### 1. Run Tests

```bash
# Run all tests
npm test -- --run

# Run fonts-specific tests (after implementation)
npm test -- --run FontsPanel
npm test -- --run domain/fonts
```

### 2. Development Server

```bash
npm run dev
```

### 3. Quality Checks

```bash
npm run lint:css    # CSS linting
npm run check       # Biome lint + format
npm run typecheck   # TypeScript check
```

## Key Components

### FontsPanel

Main panel component displaying the fonts list.

```tsx
import { FontsPanel } from './components/FontsPanel';

// In sidebar layout
<FontsPanel />
```

### FontItem

Individual font row with inline editing.

```tsx
<FontItem
  name="TitleFont"
  font={{ 'font-name': 'Arial', size: '18', bold: 'true' }}
  onDelete={(name) => handleDelete(name)}
  usageCount={3}
  onUsageClick={(name) => showUsages(name)}
/>
```

### FontPreview

Sample text preview with font styling.

```tsx
<FontPreview
  fontName="Arial"
  size="14"
  bold={true}
  italic={false}
/>
// Renders: "AaBbCc 123" with specified styling
```

## Domain Functions

### Validation

```typescript
import { 
  validateFontName, 
  validateFontSize, 
  validateSystemFontName 
} from './domain/fonts';

// Validate font resource name
const result = validateFontName('TitleFont', ['ExistingFont']);
// { valid: true }

// Validate size
const sizeResult = validateFontSize('-5');
// { valid: false, error: 'Size must be a positive number' }
```

### Usage Tracking

```typescript
import { findFontUsages } from './domain/fonts';

const usages = findFontUsages('TitleFont', documentStore.document);
// [{ viewId: 'MainView-label', viewClass: 'CTextLabel', attribute: 'font' }]
```

### History Operations

```typescript
import { 
  createAddFontOperation,
  createDeleteFontOperation,
  createEditFontPropertyOperation 
} from './domain/fonts';

// Add font with undo support
const op = createAddFontOperation('TitleFont', { 'font-name': 'Arial', size: '18' });
pushOperation(op);
```

## Store Operations

```typescript
import { 
  getFonts, 
  addFont, 
  updateFontName, 
  updateFontProperty, 
  deleteFont 
} from './stores/documentStore';

// Get all fonts
const fonts = getFonts();

// Add font
addFont('NewFont', { 'font-name': 'Arial', size: '12' });

// Update font property
const oldValue = updateFontProperty('NewFont', 'bold', 'true');

// Delete font
const result = deleteFont('OldFont');
// result.removedReferences: views that had this font
```

## File Structure

```
src/
├── components/FontsPanel/
│   ├── FontsPanel.tsx       # Main panel
│   ├── FontItem.tsx         # Font row with editing
│   ├── FontPreview.tsx      # Sample text preview
│   ├── AddFontButton.tsx    # Add button
│   ├── EmptyState.tsx       # Empty state
│   └── __tests__/           # Component tests
│
└── domain/fonts/
    ├── validation.ts        # Validation logic
    ├── formatting.ts        # Display formatting
    ├── usage.ts             # Usage tracking
    ├── historyOperations.ts # Undo/redo
    └── __tests__/           # Domain tests
```

## Testing Pattern

```typescript
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { FontsPanel } from './FontsPanel';
import { setDocumentForTest, resetDocumentStore } from '../../stores/documentStore';

describe('FontsPanel', () => {
  beforeEach(() => {
    resetDocumentStore();
  });

  it('displays fonts from document', () => {
    setDocumentForTest({
      'vstgui-ui-description': {
        version: '1',
        fonts: {
          'TitleFont': { 'font-name': 'Arial', size: '18' }
        }
      }
    });

    render(() => <FontsPanel />);

    expect(screen.getByText('TitleFont')).toBeInTheDocument();
  });
});
```

## Design Tokens

CSS custom properties used for fonts panel styling (defined in `src/styles/tokens.css`):

```css
/* Reuse existing panel tokens */
--color-panel-bg
--color-panel-border
--color-text-primary
--color-text-secondary
--color-error
--color-button-primary
--spacing-xs, --spacing-sm, --spacing-md
```

## References

- Colors Panel implementation: `src/components/ColorsPanel/`
- Domain patterns: `src/domain/colors/`
- History store: `src/stores/historyStore.ts`
- Document store: `src/stores/documentStore.ts`
- Testing guide: `specs/TESTING-GUIDE.md`
