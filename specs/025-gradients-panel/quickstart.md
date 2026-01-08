# Quickstart: Gradients Panel

**Feature**: 025-gradients-panel  
**Date**: 2026-01-08

## Overview

This feature adds a Gradients Panel to the left sidebar for managing gradient resources in VSTGUI uidesc files. It follows the established pattern from Colors, Fonts, and Bitmaps panels.

## Key Files

### Domain Layer (`src/domain/gradients/`)

| File | Purpose |
|------|---------|
| `validation.ts` | Gradient name validation |
| `formatting.ts` | Display string formatting |
| `usage.ts` | Find gradient references in views |
| `stopCalculations.ts` | Position normalization, color interpolation |
| `historyOperations.ts` | Undo/redo operation factories |
| `index.ts` | Barrel exports |

### UI Components (`src/components/GradientsPanel/`)

| File | Purpose |
|------|---------|
| `GradientsPanel.tsx` | Main panel with CollapsibleSection |
| `GradientItem.tsx` | Expandable gradient row |
| `GradientStopEditor.tsx` | Visual editor with draggable stops |
| `GradientPreview.tsx` | Horizontal gradient preview bar |
| `AddGradientButton.tsx` | Add button in section header |
| `EmptyState.tsx` | Shown when no gradients exist |

### Store Extensions (`src/stores/documentStore.ts`)

New functions:
- `getGradients()` - Read all gradients
- `addGradient()` - Create new gradient
- `updateGradientName()` - Rename gradient
- `updateGradientStops()` - Modify gradient stops
- `deleteGradient()` - Delete and clear references

## Usage Examples

### Reading Gradients

```typescript
import { documentStore, getGradients } from '../stores/documentStore';

// Get all gradients
const gradients = getGradients();
// Returns: Record<string, GradientColorStop[]> | undefined

// Access specific gradient
const myGradient = gradients?.['Background Gradient'];
// Returns: GradientColorStop[] | undefined
```

### Creating a Gradient

```typescript
import { addGradient } from '../stores/documentStore';
import { createAddGradientOperation } from '../domain/gradients';
import { pushOperation } from '../stores/historyStore';

const name = 'New Gradient';
const stops = [
  { rgba: '#FF0000FF', start: '0.00' },
  { rgba: '#0000FFFF', start: '1.00' }
];

// Create history operation
const operation = createAddGradientOperation(name, stops, addGradient, deleteGradient);
pushOperation(operation);

// Operation executes addGradient automatically
```

### Editing Gradient Stops

```typescript
import { updateGradientStops } from '../stores/documentStore';
import { createEditGradientStopsOperation } from '../domain/gradients';

const name = 'My Gradient';
const oldStops = getGradients()?.[name] ?? [];
const newStops = [
  ...oldStops,
  { rgba: '#00FF00FF', start: '0.50' }
];

const operation = createEditGradientStopsOperation(name, oldStops, newStops, updateGradientStops);
pushOperation(operation);
```

### Finding Gradient Usage

```typescript
import { findGradientUsages } from '../domain/gradients';
import { documentStore } from '../stores/documentStore';

const usages = findGradientUsages('Background Gradient', documentStore.document);
// Returns: GradientUsage[] with viewId, viewClass, attribute
```

### Rendering Gradient Preview

```typescript
import { GradientPreview } from '../components/GradientsPanel';

<GradientPreview stops={myGradient} />
// Renders horizontal gradient bar with CSS linear-gradient
```

### Stop Calculations

```typescript
import { normalizePosition, interpolateColor, sortStops } from '../domain/gradients';

// Normalize to 2 decimal places
const pos = normalizePosition(0.333); // "0.33"

// Interpolate color at midpoint
const midColor = interpolateColor('#FF0000FF', '#0000FFFF', 0.5);
// Returns: '#8000FFFF' (purple)

// Sort stops by position
const sorted = sortStops(unsortedStops);
```

## Data Structures

### GradientColorStop

```typescript
interface GradientColorStop {
  rgba: string;   // "#RRGGBBAA" format
  start: string;  // "0.00" to "1.00"
}
```

### GradientUsage

```typescript
interface GradientUsage {
  viewId: string;      // "MainView-0-1"
  viewClass: string;   // "CGradientView"
  attribute: string;   // "gradient"
}
```

## Test Patterns

### Domain Tests

```typescript
import { describe, test, expect } from 'vitest';
import { validateGradientName } from './validation';

describe('validateGradientName', () => {
  test('rejects empty name', () => {
    const result = validateGradientName('', []);
    expect(result.valid).toBe(false);
  });
});
```

### Component Tests

```typescript
import { render, screen } from '@solidjs/testing-library';
import { GradientPreview } from './GradientPreview';

test('renders gradient with stops', () => {
  const stops = [
    { rgba: '#FF0000FF', start: '0.00' },
    { rgba: '#0000FFFF', start: '1.00' }
  ];
  
  render(() => <GradientPreview stops={stops} />);
  
  const bar = screen.getByRole('img', { name: /gradient preview/i });
  expect(bar).toHaveStyle({
    background: expect.stringContaining('linear-gradient')
  });
});
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Confirm rename |
| Escape | Cancel rename |
| Ctrl+Z | Undo |
| Ctrl+Y / Ctrl+Shift+Z | Redo |

## CSS Classes

| Class | Purpose |
|-------|---------|
| `.gradients-panel` | Panel container |
| `.gradient-item` | Individual gradient row |
| `.gradient-preview` | Preview bar |
| `.gradient-stop-editor` | Stop editor container |
| `.gradient-stop-handle` | Draggable stop handle |
| `.gradient-stop-handle--selected` | Selected stop handle |
