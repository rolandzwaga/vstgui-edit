# Quickstart: Canvas Grid System

**Feature**: 007-canvas-grid
**Date**: 2026-01-05

## Overview

This feature adds a configurable grid overlay to the canvas for view alignment. The grid supports visibility toggle (G key), size presets, major/minor lines, and three visual styles.

## Key Files

| File | Purpose |
|------|---------|
| `src/stores/gridStore.ts` | Grid state (visibility, size, style) |
| `src/components/Canvas/Grid.tsx` | SVG grid rendering |
| `src/components/GridToolbar/GridToolbar.tsx` | UI controls |
| `src/components/MainToolbar/MainToolbar.tsx` | Toolbar container |
| `src/domain/canvas/grid.ts` | Grid calculation utilities |
| `src/types/grid.ts` | TypeScript type definitions |

## Usage

### Toggle Grid Visibility

```typescript
// Keyboard shortcut
// Press 'G' key (when not in text input)

// Programmatic
import { toggleVisibility } from './stores/gridStore';
toggleVisibility();
```

### Change Grid Size

```typescript
import { setGridSize, GRID_SIZE_PRESETS } from './stores/gridStore';

// Valid presets: 5, 8, 10, 12, 16, 20
setGridSize(20); // 20px spacing
```

### Change Grid Style

```typescript
import { setGridStyle } from './stores/gridStore';

setGridStyle('lines');      // Continuous lines (default)
setGridStyle('dots');       // Intersection dots
setGridStyle('crosshairs'); // Small crosses at intersections
```

### Read Grid State

```typescript
import { gridStore } from './stores/gridStore';

console.log(gridStore.isVisible); // boolean
console.log(gridStore.size);      // 5 | 8 | 10 | 12 | 16 | 20
console.log(gridStore.style);     // 'lines' | 'dots' | 'crosshairs'
```

## Component Integration

### Canvas with Grid

```tsx
import { Canvas } from './components/Canvas';
// Grid is rendered automatically when document loaded
<Canvas />
```

### MainToolbar with GridToolbar

```tsx
import { MainToolbar } from './components/MainToolbar';
// Contains ZoomToolbar + GridToolbar
<MainToolbar onFitToView={handleFitToView} />
```

## Keyboard Shortcuts

| Key | Action | Condition |
|-----|--------|-----------|
| G | Toggle grid visibility | Not in text input, no modifiers |

## CSS Customization

Grid colors adapt to theme via CSS custom properties:

```css
/* Override in your CSS */
:root {
  --color-grid-minor: rgba(0, 0, 0, 0.08);
  --color-grid-major: rgba(0, 0, 0, 0.20);
}
```

## Testing

```bash
# Run all tests
npm test

# Run grid-specific tests
npm test -- --grep "Grid"

# Run with coverage
npm run test:coverage
```

## Requirements Coverage

| Requirement | Implementation |
|-------------|----------------|
| FR-001 | Grid component renders behind views |
| FR-002 | Grid inherits canvas transform |
| FR-003 | G key toggles in Canvas.tsx |
| FR-004 | Keyboard filter checks tagName |
| FR-005 | Keyboard filter checks modifiers |
| FR-006 | GRID_SIZE_PRESETS constant |
| FR-007 | Major line every 5th (MAJOR_LINE_INTERVAL) |
| FR-008 | GridStyle type with 3 options |
| FR-009 | CSS custom properties for theme |
| FR-010 | DEFAULT_GRID_SIZE, DEFAULT_GRID_STYLE |
| FR-011 | GridToolbar component |
| FR-012 | Grid hidden when no document |
