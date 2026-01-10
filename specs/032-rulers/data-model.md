# Data Model: Canvas Rulers

**Feature**: 032-rulers | **Date**: 2026-01-10

## Type Definitions

### Core Types (`src/types/ruler.ts`)

```typescript
import type { Point } from './canvas';

/**
 * Grid size preset values (imported from existing grid types).
 * Matches GRID_SIZE_PRESETS from src/domain/canvas/grid.ts
 */
export type GridSizePreset = 5 | 8 | 10 | 12 | 16 | 20;

/**
 * Tick mark types for ruler rendering.
 */
export type TickType = 'major' | 'minor';

/**
 * A single tick mark on a ruler.
 */
export interface TickMark {
  /** Canvas coordinate (pixels) */
  position: number;
  /** Type determines visual styling */
  type: TickType;
  /** Label text (only for major ticks, null for minor) */
  label: string | null;
}

/**
 * Ruler orientation for component reuse.
 */
export type RulerOrientation = 'horizontal' | 'vertical';

/**
 * Configuration for tick interval calculation.
 */
export interface TickIntervalConfig {
  /** Base interval at 100% zoom (default: 100) */
  baseInterval: number;
  /** Minimum screen pixels between major ticks (default: 30) */
  minScreenSpacing: number;
  /** Ratio of minor to major ticks (default: 10) */
  minorTickRatio: number;
}

/**
 * Calculated tick intervals for current zoom level.
 */
export interface TickIntervals {
  /** Major tick interval in canvas pixels */
  major: number;
  /** Minor tick interval in canvas pixels */
  minor: number;
}

/**
 * Visible range in canvas coordinates.
 */
export interface VisibleRange {
  /** Start coordinate (may be negative if panned) */
  start: number;
  /** End coordinate */
  end: number;
}

/**
 * Props for ruler components.
 */
export interface RulerProps {
  /** Orientation of the ruler */
  orientation: RulerOrientation;
  /** Length of the ruler in screen pixels */
  length: number;
}

/**
 * Props for the horizontal ruler.
 */
export interface HorizontalRulerProps {
  /** Width in screen pixels */
  width: number;
  /** Current cursor position in canvas coordinates (null if outside) */
  cursorPosition: Point | null;
  /** Template width for bounds indicator */
  templateWidth: number;
}

/**
 * Props for the vertical ruler.
 */
export interface VerticalRulerProps {
  /** Height in screen pixels */
  height: number;
  /** Current cursor position in canvas coordinates (null if outside) */
  cursorPosition: Point | null;
  /** Template height for bounds indicator */
  templateHeight: number;
}

/**
 * Props for the origin indicator.
 */
export interface RulerOriginProps {
  /** Current pan offset from canvasStore */
  panOffset: Point;
}

/**
 * Props for the cursor indicator.
 */
export interface CursorIndicatorProps {
  /** Position along the ruler axis in screen pixels */
  screenPosition: number;
  /** Canvas coordinate value for tooltip */
  canvasValue: number;
  /** Orientation determines axis label (X or Y) */
  orientation: RulerOrientation;
  /** Whether to show the indicator */
  visible: boolean;
}

/**
 * Props for the ruler container.
 */
export interface RulerContainerProps {
  /** Children to render in the canvas viewport area */
  children: JSX.Element;
}
```

## Store Interface

### rulerStore (`src/stores/rulerStore.ts`)

```typescript
import type { Point } from '../types/canvas';

/**
 * Ruler store state - tracks cursor position for ruler indicators.
 */
interface RulerStoreState {
  /** Cursor position in canvas coordinates (null when outside canvas) */
  cursorPosition: Point | null;
}

// Exported store object (readonly access via getters)
export const rulerStore: {
  readonly cursorPosition: Point | null;
};

// Actions
export function setCursorPosition(position: Point | null): void;
export function clearCursorPosition(): void;
```

## Domain Utilities

### tickCalculation.ts

```typescript
import type { TickIntervalConfig, TickIntervals, GridSizePreset } from '../types';

/**
 * Default configuration for tick interval calculation.
 */
export const DEFAULT_TICK_CONFIG: TickIntervalConfig = {
  baseInterval: 100,
  minScreenSpacing: 30,
  minorTickRatio: 10,
};

/**
 * Calculate tick intervals based on zoom level.
 * Uses power-of-2 scaling to maintain readability.
 *
 * @param zoomLevel - Current zoom level (0.1 to 5.0)
 * @param config - Optional tick configuration
 * @returns Major and minor tick intervals in canvas pixels
 */
export function calculateTickIntervals(
  zoomLevel: number,
  config?: Partial<TickIntervalConfig>
): TickIntervals;

/**
 * Adjust tick interval to align with grid when grid is enabled.
 *
 * @param interval - Calculated tick interval
 * @param gridSize - Current grid size preset
 * @param gridEnabled - Whether grid is visible
 * @returns Aligned tick interval
 */
export function alignIntervalToGrid(
  interval: number,
  gridSize: GridSizePreset,
  gridEnabled: boolean
): number;
```

### tickGeneration.ts

```typescript
import type { TickMark, TickIntervals, VisibleRange } from '../types';

/**
 * Generate tick marks for a visible range.
 *
 * @param range - Visible range in canvas coordinates
 * @param intervals - Major and minor tick intervals
 * @returns Array of tick marks sorted by position
 */
export function generateTicks(
  range: VisibleRange,
  intervals: TickIntervals
): TickMark[];

/**
 * Calculate the visible range from viewport and transform.
 *
 * @param viewportLength - Viewport size in screen pixels
 * @param panOffset - Pan offset along this axis
 * @param zoomLevel - Current zoom level
 * @returns Visible range in canvas coordinates
 */
export function calculateVisibleRange(
  viewportLength: number,
  panOffset: number,
  zoomLevel: number
): VisibleRange;

/**
 * Format a tick label for display.
 * Handles negative numbers and large values.
 *
 * @param value - Canvas coordinate value
 * @returns Formatted label string
 */
export function formatTickLabel(value: number): string;
```

### coordinateMapping.ts

```typescript
import type { Point } from '../types/canvas';

/**
 * Ruler thickness constant (20px per spec).
 */
export const RULER_THICKNESS = 20;

/**
 * Convert screen coordinates to canvas coordinates.
 * Accounts for ruler offset, pan, and zoom.
 *
 * @param screenX - Screen X coordinate
 * @param screenY - Screen Y coordinate
 * @param panOffset - Current pan offset
 * @param zoomLevel - Current zoom level
 * @returns Canvas coordinates
 */
export function screenToCanvasCoordinates(
  screenX: number,
  screenY: number,
  panOffset: Point,
  zoomLevel: number
): Point;

/**
 * Convert canvas coordinates to screen position on ruler.
 * Used for positioning tick marks and template bounds indicator.
 *
 * @param canvasValue - Canvas coordinate value
 * @param panOffset - Pan offset along this axis
 * @param zoomLevel - Current zoom level
 * @returns Screen position in pixels
 */
export function canvasToScreenPosition(
  canvasValue: number,
  panOffset: number,
  zoomLevel: number
): number;

/**
 * Calculate screen position for template bounds indicator.
 *
 * @param templateExtent - Template width or height
 * @param panOffset - Pan offset along this axis
 * @param zoomLevel - Current zoom level
 * @returns Start and end positions in screen pixels
 */
export function calculateTemplateBoundsPosition(
  templateExtent: number,
  panOffset: number,
  zoomLevel: number
): { start: number; end: number };
```

## Entity Relationships

```
canvasStore (existing)
├── panOffset: Point
└── zoomLevel: number
         │
         ▼
tickCalculation.ts ──► TickIntervals
         │
         ▼
tickGeneration.ts ──► TickMark[]
         │
         ▼
┌────────────────────────┐
│    RulerContainer      │
│  (CSS Grid Layout)     │
├────────────────────────┤
│ ┌────────┬───────────┐ │
│ │ Origin │ Horizontal│ │
│ ├────────┼───────────┤ │
│ │Vertical│  Canvas   │ │
│ │        │ Viewport  │ │
│ └────────┴───────────┘ │
└────────────────────────┘

rulerStore
└── cursorPosition: Point | null
         │
         ▼
CursorIndicator (renders on HorizontalRuler/VerticalRuler)
```

## State Transitions

### Cursor Position States

```
null (outside canvas)
    │
    ▼ [mouse enters canvas viewport]
Point { x, y } (canvas coordinates)
    │
    ▼ [mouse moves]
Point { x', y' } (updated coordinates)
    │
    ▼ [mouse leaves canvas viewport]
null (outside canvas)
```

### Ruler Visibility States

```
hidden (no template loaded)
    │
    ▼ [template loads, parseState === 'valid']
visible (template loaded)
    │
    ▼ [template unloaded, reset called]
hidden (no template loaded)
```

## Validation Rules

1. **Tick Position**: Always integer values (Math.round applied)
2. **Tick Labels**: Only on major ticks, formatted as integers
3. **Screen Position**: Clamped to visible ruler area
4. **Cursor Position**: Null when outside canvas viewport
5. **Template Bounds**: Clamped to positive range (0 to extent)
6. **Zoom Level**: Handled by existing canvasStore (0.1 to 5.0)
