# Data Model: Canvas Grid System

**Feature**: 007-canvas-grid
**Date**: 2026-01-05

## Type Definitions

### Grid Types (`src/types/grid.ts`)

```typescript
/**
 * Grid visual style options.
 */
export type GridStyle = 'lines' | 'dots' | 'crosshairs';

/**
 * Valid grid size presets in pixels.
 */
export type GridSizePreset = 5 | 8 | 10 | 12 | 16 | 20;

/**
 * Grid settings state.
 */
export interface GridSettings {
  /** Whether grid is visible (default: true) */
  isVisible: boolean;
  /** Grid spacing in pixels (default: 10) */
  size: GridSizePreset;
  /** Visual style of grid (default: 'lines') */
  style: GridStyle;
}

/**
 * Props for Grid component.
 */
export interface GridProps {
  /** Template bounds width */
  width: number;
  /** Template bounds height */
  height: number;
}

/**
 * Props for GridToolbar component.
 */
export interface GridToolbarProps {
  // No props required - reads from gridStore
}
```

## Store Definition

### Grid Store (`src/stores/gridStore.ts`)

```typescript
import { createSignal } from 'solid-js';
import type { GridSettings, GridSizePreset, GridStyle } from '../types/grid';

// Constants
export const GRID_SIZE_PRESETS: GridSizePreset[] = [5, 8, 10, 12, 16, 20];
export const DEFAULT_GRID_SIZE: GridSizePreset = 10;
export const DEFAULT_GRID_STYLE: GridStyle = 'lines';
export const MAJOR_LINE_INTERVAL = 5;

// Signals
const [isVisible, setIsVisible] = createSignal<boolean>(true);
const [size, setSize] = createSignal<GridSizePreset>(DEFAULT_GRID_SIZE);
const [style, setStyle] = createSignal<GridStyle>(DEFAULT_GRID_STYLE);

// Exported store object (read-only access)
export const gridStore = {
  get isVisible() { return isVisible(); },
  get size() { return size(); },
  get style() { return style(); },
};

// Actions
export function toggleVisibility(): void;
export function setGridSize(newSize: GridSizePreset): void;
export function setGridStyle(newStyle: GridStyle): void;
export function resetGrid(): void;
```

## Domain Utilities

### Grid Calculations (`src/domain/canvas/grid.ts`)

```typescript
import type { GridSizePreset, GridStyle } from '../../types/grid';

/**
 * Check if a line index is a major line (every 5th line).
 */
export function isMajorLine(index: number): boolean;

/**
 * Calculate the number of grid lines needed for a dimension.
 */
export function calculateLineCount(dimension: number, gridSize: number): number;

/**
 * Generate SVG pattern ID based on style.
 */
export function getPatternId(style: GridStyle, size: number): string;

/**
 * Validate grid size is a valid preset.
 */
export function isValidGridSize(size: number): size is GridSizePreset;
```

## CSS Design Tokens

### Grid Colors (`src/styles/tokens.css`)

```css
:root {
  /* Grid colors - light theme */
  --color-grid-minor: rgba(0, 0, 0, 0.08);
  --color-grid-major: rgba(0, 0, 0, 0.20);
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Grid colors - dark theme */
    --color-grid-minor: rgba(255, 255, 255, 0.08);
    --color-grid-major: rgba(255, 255, 255, 0.20);
  }
}
```

## Entity Relationships

```
┌─────────────────┐
│   gridStore     │
│ (SolidJS Signals)│
├─────────────────┤
│ isVisible       │──────────────────────────┐
│ size            │                          │
│ style           │                          ▼
└─────────────────┘              ┌─────────────────────┐
        │                        │      Canvas         │
        │                        │ (reads gridStore)   │
        ▼                        ├─────────────────────┤
┌─────────────────┐              │ ┌─────────────────┐ │
│  GridToolbar    │              │ │      Grid       │ │
│ (controls)      │              │ │ (SVG pattern)   │ │
├─────────────────┤              │ └─────────────────┘ │
│ Toggle button   │              └─────────────────────┘
│ Size dropdown   │
│ Style selector  │
└─────────────────┘
```

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| size | Must be one of GRID_SIZE_PRESETS | "Invalid grid size" |
| style | Must be 'lines', 'dots', or 'crosshairs' | "Invalid grid style" |
| isVisible | Boolean only | N/A (TypeScript enforced) |

## State Transitions

```
Initial State:
  isVisible: true
  size: 10
  style: 'lines'

User Actions:
  Press G key → toggleVisibility() → isVisible = !isVisible
  Select size → setGridSize(size) → size = newSize
  Select style → setGridStyle(style) → style = newStyle

No persistence - state resets on page reload.
```

## Performance Considerations

- Grid renders as single SVG `<rect>` with `<pattern>` fill
- Pattern cached by browser, only re-rendered on size/style change
- No recalculation needed on pan (CSS transform handles position)
- Zoom handled by parent transform, no per-zoom recalculation
- Major line interval (5) is constant, no dynamic calculation
