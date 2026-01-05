# Research: Canvas Zoom Navigation

**Date**: 2026-01-05 | **Feature**: 005-canvas-zoom

## Cursor-Centered Zoom Algorithm

**Decision**: Use transform-origin adjustment via pan offset compensation

**Rationale**: The standard approach for cursor-centered zoom involves adjusting the pan offset when zoom changes so the point under the cursor remains stationary. This is mathematically equivalent to changing transform-origin but works better with CSS transforms.

**Algorithm**:
```
Given:
- cursorX, cursorY: cursor position in viewport coordinates
- oldZoom: current zoom level
- newZoom: target zoom level
- panOffset: current pan offset {x, y}

Calculate new pan offset:
1. Get cursor position relative to canvas wrapper origin:
   relX = cursorX - wrapperRect.left
   relY = cursorY - wrapperRect.top

2. Calculate the canvas-space point under cursor:
   canvasX = (relX - panOffset.x) / oldZoom
   canvasY = (relY - panOffset.y) / oldZoom

3. Calculate new pan offset to keep same canvas point under cursor:
   newPanX = relX - (canvasX * newZoom)
   newPanY = relY - (canvasY * newZoom)
```

**Alternatives Considered**:
1. CSS transform-origin: Requires dynamic origin changes, more complex to combine with pan
2. SVG viewBox manipulation: Would require different coordinate system, not compatible with current DOM-based approach

## Zoom Increment Strategy

**Decision**: Multiplicative factor of 1.1 (10% per wheel tick)

**Rationale**:
- Multiplicative zoom feels more natural than additive (same visual change at all zoom levels)
- 1.1 factor = ~15 ticks to go from 100% to 500% (comfortable speed)
- Matches spec edge case: "×1.1 for zoom in, ÷1.1 for zoom out"

**Alternatives Considered**:
1. Additive 10%: Feels slow at high zoom, fast at low zoom
2. Larger factor (1.2): Too jumpy, doesn't feel smooth

## Wheel Event Handling

**Decision**: Use `wheel` event with `deltaY` sign detection, prevent default

**Rationale**:
- `wheel` event is the modern standard (replaces deprecated `mousewheel`)
- `deltaY < 0` = scroll up = zoom in (per spec assumption)
- Must call `preventDefault()` to stop browser zoom (Ctrl+wheel) - FR-008

**Implementation Notes**:
- Use `{ passive: false }` if adding via addEventListener (not needed for JSX onWheel)
- Normalize deltaY to direction only (ignore magnitude for consistent behavior)

## Transform Order

**Decision**: Apply `translate` then `scale` in CSS transform

**Rationale**:
- Current pan uses: `transform: translate(${panX}px, ${panY}px)`
- Combined will be: `transform: translate(${panX}px, ${panY}px) scale(${zoom})`
- This order means pan is in screen pixels, scale affects content size

**Why This Order**:
- Pan offset calculated in screen coordinates (from cursor movement)
- Scale applied after means content scales around top-left of wrapper
- Zoom algorithm compensates pan to achieve cursor-centered effect

## State Structure

**Decision**: Add `zoomLevel` signal to existing canvasStore pattern

**Rationale**:
- Matches existing `panOffset` signal pattern in canvasStore
- Simple numeric value (1.0 = 100%)
- Separate signal allows fine-grained reactivity (zoom changes don't invalidate pan)

**State Shape**:
```typescript
// New signals in canvasStore.ts
const [zoomLevel, setZoomLevel] = createSignal(1.0);

// Exposed in canvasStore object
export const canvasStore = {
  get zoomLevel() { return zoomLevel(); },
  // ... existing pan state
};

// New actions
export function setZoom(level: number): void;
export function applyZoom(cursorX: number, cursorY: number, delta: number): void;
export function resetZoom(): void;
```

## Reset Behavior

**Decision**: Reset zoom to 100% when new document loads (per clarification)

**Rationale**: Standard behavior in design tools, prevents disorientation when switching between templates of different sizes.

**Implementation**: Call `resetZoom()` in documentStore's `loadFile` success path.
