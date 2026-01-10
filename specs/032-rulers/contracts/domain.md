# Domain Contracts: Canvas Rulers

**Feature**: 032-rulers | **Date**: 2026-01-10

## tickCalculation.ts

### calculateTickIntervals

```typescript
/**
 * Calculate major and minor tick intervals for the current zoom level.
 * Uses power-of-2 scaling to maintain minimum 30px screen spacing.
 *
 * The algorithm ensures that majorInterval * zoomLevel >= minScreenSpacing (30px).
 * When zooming out, intervals double (100 -> 200 -> 400) to stay readable.
 * When zooming in, intervals halve (100 -> 50 -> 25) to show more detail.
 *
 * @param zoomLevel - Current zoom level (0.1 to 5.0)
 * @param config - Optional override for default configuration
 * @returns Tick intervals in canvas pixels
 *
 * @example
 * // At 100% zoom (1.0), base intervals: 100px canvas = 100px screen
 * calculateTickIntervals(1.0) // { major: 100, minor: 10 }
 *
 * // At 50% zoom (0.5), doubled intervals: 200px canvas = 100px screen
 * calculateTickIntervals(0.5) // { major: 200, minor: 20 }
 *
 * // At 25% zoom (0.25), quadrupled: 400px canvas = 100px screen
 * calculateTickIntervals(0.25) // { major: 400, minor: 40 }
 *
 * // At 200% zoom (2.0), halved intervals: 50px canvas = 100px screen
 * calculateTickIntervals(2.0) // { major: 50, minor: 5 }
 *
 * // At 10% zoom (0.1), extreme: 1000px canvas = 100px screen
 * calculateTickIntervals(0.1) // { major: 1000, minor: 100 }
 *
 * // At 500% zoom (5.0), fine detail: 20px canvas = 100px screen
 * calculateTickIntervals(5.0) // { major: 20, minor: 2 }
 */
export function calculateTickIntervals(
  zoomLevel: number,
  config?: Partial<TickIntervalConfig>
): TickIntervals;
```

**Contract**:
- Input: zoomLevel in range [0.1, 5.0]
- Output: { major: number, minor: number } where major >= minor
- Invariant: major * zoomLevel >= 30 (minScreenSpacing)
- Invariant: minor = major / minorTickRatio (default 10)

### alignIntervalToGrid

```typescript
/**
 * Adjust tick interval to align with grid when grid is enabled.
 * Finds nearest grid-multiple that maintains readability.
 *
 * @param interval - Calculated tick interval
 * @param gridSize - Current grid size preset (5, 8, 10, 12, 16, 20)
 * @param gridEnabled - Whether grid is visible
 * @returns Adjusted interval aligned to grid
 *
 * @example
 * // Grid disabled, no adjustment
 * alignIntervalToGrid(100, 16, false) // 100
 *
 * // Grid enabled, align to 16px grid
 * alignIntervalToGrid(100, 16, true) // 96 (6 * 16)
 *
 * // Grid enabled, already aligned
 * alignIntervalToGrid(100, 10, true) // 100
 */
export function alignIntervalToGrid(
  interval: number,
  gridSize: GridSizePreset,
  gridEnabled: boolean
): number;
```

**Contract**:
- Input: interval > 0, gridSize in GRID_SIZE_PRESETS
- Output: interval when !gridEnabled, grid-aligned value otherwise
- Invariant: result % gridSize === 0 when gridEnabled

---

## tickGeneration.ts

### generateTicks

```typescript
/**
 * Generate tick marks for a visible range.
 * Produces both major and minor ticks within the range.
 *
 * @param range - Visible range in canvas coordinates
 * @param intervals - Major and minor tick intervals
 * @returns Array of tick marks sorted by position
 *
 * @example
 * generateTicks(
 *   { start: -50, end: 250 },
 *   { major: 100, minor: 10 }
 * )
 * // Returns ticks at: -50(minor), -40(minor), ..., 0(major), 10(minor), ..., 100(major), ...
 */
export function generateTicks(
  range: VisibleRange,
  intervals: TickIntervals
): TickMark[];
```

**Contract**:
- Input: range.start <= range.end, intervals.major >= intervals.minor > 0
- Output: TickMark[] sorted ascending by position
- Output includes all ticks where range.start <= position <= range.end
- Major ticks have label !== null, minor ticks have label === null

### calculateVisibleRange

```typescript
/**
 * Calculate visible range from viewport and transform.
 * Determines which canvas coordinates are visible in the viewport.
 *
 * @param viewportLength - Viewport dimension in screen pixels
 * @param panOffset - Pan offset along this axis
 * @param zoomLevel - Current zoom level
 * @returns Visible range in canvas coordinates
 *
 * @example
 * // 800px viewport, no pan, 100% zoom
 * calculateVisibleRange(800, 0, 1.0) // { start: 0, end: 800 }
 *
 * // 800px viewport, panned left by 100px, 100% zoom
 * calculateVisibleRange(800, -100, 1.0) // { start: 100, end: 900 }
 *
 * // 800px viewport, no pan, 200% zoom
 * calculateVisibleRange(800, 0, 2.0) // { start: 0, end: 400 }
 */
export function calculateVisibleRange(
  viewportLength: number,
  panOffset: number,
  zoomLevel: number
): VisibleRange;
```

**Contract**:
- Input: viewportLength > 0, zoomLevel > 0
- Output: { start: number, end: number } where start < end
- Invariant: end - start = viewportLength / zoomLevel

### formatTickLabel

```typescript
/**
 * Format a tick label for display.
 * Handles negative numbers and rounds to integers.
 *
 * @param value - Canvas coordinate value
 * @returns Formatted label string
 *
 * @example
 * formatTickLabel(100)    // "100"
 * formatTickLabel(-50)    // "-50"
 * formatTickLabel(99.7)   // "100"
 * formatTickLabel(1000)   // "1000"
 */
export function formatTickLabel(value: number): string;
```

**Contract**:
- Input: any number
- Output: integer string representation
- Rounding: Math.round applied

---

## coordinateMapping.ts

### screenToCanvasCoordinates

```typescript
/**
 * Convert screen coordinates to canvas coordinates.
 * Accounts for ruler offset, pan, and zoom.
 *
 * @param screenX - Screen X coordinate (relative to RulerContainer)
 * @param screenY - Screen Y coordinate (relative to RulerContainer)
 * @param panOffset - Current pan offset
 * @param zoomLevel - Current zoom level
 * @returns Canvas coordinates
 *
 * @example
 * // No pan, 100% zoom, ruler offset is 20px
 * screenToCanvasCoordinates(120, 70, { x: 0, y: 0 }, 1.0)
 * // Returns { x: 100, y: 50 } (subtract 20px ruler, no transform)
 *
 * // Panned 50px right, 200% zoom
 * screenToCanvasCoordinates(120, 70, { x: 50, y: 0 }, 2.0)
 * // Returns { x: 25, y: 25 } ((120-20-50)/2, (70-20)/2)
 */
export function screenToCanvasCoordinates(
  screenX: number,
  screenY: number,
  panOffset: Point,
  zoomLevel: number
): Point;
```

**Contract**:
- Input: screen coordinates relative to RulerContainer origin
- Output: canvas coordinates in template space
- Formula: canvasX = (screenX - RULER_THICKNESS - panOffset.x) / zoomLevel

### canvasToScreenPosition

```typescript
/**
 * Convert canvas coordinate to screen position on ruler.
 * Used for positioning tick marks and indicators.
 *
 * @param canvasValue - Canvas coordinate value
 * @param panOffset - Pan offset along this axis
 * @param zoomLevel - Current zoom level
 * @returns Screen position in pixels
 *
 * @example
 * // Canvas coord 100, no pan, 100% zoom
 * canvasToScreenPosition(100, 0, 1.0) // 100
 *
 * // Canvas coord 100, panned 50px right, 100% zoom
 * canvasToScreenPosition(100, 50, 1.0) // 150
 *
 * // Canvas coord 100, no pan, 200% zoom
 * canvasToScreenPosition(100, 0, 2.0) // 200
 */
export function canvasToScreenPosition(
  canvasValue: number,
  panOffset: number,
  zoomLevel: number
): number;
```

**Contract**:
- Input: canvasValue (any number), panOffset, zoomLevel > 0
- Output: screen position in pixels
- Formula: screenPos = canvasValue * zoomLevel + panOffset

### calculateTemplateBoundsPosition

```typescript
/**
 * Calculate screen positions for template bounds indicator.
 * Returns start (always at canvas origin) and end (at template extent).
 *
 * @param templateExtent - Template width or height
 * @param panOffset - Pan offset along this axis
 * @param zoomLevel - Current zoom level
 * @returns Start and end positions in screen pixels
 *
 * @example
 * // 800px template, no pan, 100% zoom
 * calculateTemplateBoundsPosition(800, 0, 1.0)
 * // { start: 0, end: 800 }
 *
 * // 800px template, panned 100px left, 100% zoom
 * calculateTemplateBoundsPosition(800, -100, 1.0)
 * // { start: -100, end: 700 }
 *
 * // 800px template, no pan, 50% zoom
 * calculateTemplateBoundsPosition(800, 0, 0.5)
 * // { start: 0, end: 400 }
 */
export function calculateTemplateBoundsPosition(
  templateExtent: number,
  panOffset: number,
  zoomLevel: number
): { start: number; end: number };
```

**Contract**:
- Input: templateExtent >= 0, zoomLevel > 0
- Output: { start: number, end: number }
- start = canvasToScreenPosition(0, panOffset, zoomLevel)
- end = canvasToScreenPosition(templateExtent, panOffset, zoomLevel)

---

## Constants

```typescript
// tickCalculation.ts
export const DEFAULT_TICK_CONFIG: TickIntervalConfig = {
  baseInterval: 100,
  minScreenSpacing: 30,
  minorTickRatio: 10,
};

// coordinateMapping.ts
export const RULER_THICKNESS = 20;
```

---

## Barrel Exports

### src/domain/rulers/index.ts

```typescript
// tickCalculation.ts exports
export { calculateTickIntervals, alignIntervalToGrid, DEFAULT_TICK_CONFIG } from './tickCalculation';

// tickGeneration.ts exports
export { generateTicks, calculateVisibleRange, formatTickLabel } from './tickGeneration';

// coordinateMapping.ts exports
export {
  screenToCanvasCoordinates,
  canvasToScreenPosition,
  calculateTemplateBoundsPosition,
  RULER_THICKNESS,
} from './coordinateMapping';

// Type re-exports
export type { TickIntervalConfig, TickIntervals, VisibleRange, TickMark, GridSizePreset } from '../../types/ruler';
```

**Usage**: Import domain utilities from this barrel:
```typescript
import { calculateTickIntervals, generateTicks, RULER_THICKNESS } from '../domain/rulers';
```
