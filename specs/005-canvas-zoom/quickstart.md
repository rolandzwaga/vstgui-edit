# Quickstart: Canvas Zoom Navigation

**Date**: 2026-01-05 | **Feature**: 005-canvas-zoom

## Overview

Add mouse wheel zoom to canvas with cursor-centered zooming. Extends existing pan functionality.

## Files to Modify/Create

| File | Action | Purpose |
|------|--------|---------|
| `src/stores/canvasStore.ts` | Modify | Add zoomLevel signal and zoom actions |
| `src/domain/canvas/zoom.ts` | Create | Zoom calculation utilities |
| `src/domain/canvas/zoom.spec.ts` | Create | Tests for zoom utilities |
| `src/components/Canvas/Canvas.tsx` | Modify | Add wheel handler, update transform |
| `src/components/Canvas/__tests__/Canvas.spec.tsx` | Modify | Add zoom tests |

## Implementation Steps

### 1. Zoom Utilities (`src/domain/canvas/zoom.ts`)

```typescript
// Constants
export const MIN_ZOOM = 0.1;  // 10%
export const MAX_ZOOM = 5.0;  // 500%
export const ZOOM_FACTOR = 1.1;  // 10% per tick

// Clamp zoom to valid range
export function clampZoom(zoom: number): number;

// Calculate new zoom level from wheel delta
export function calculateNewZoom(current: number, deltaY: number): number;

// Calculate pan offset adjustment for cursor-centered zoom
export function calculateZoomPanAdjustment(
  cursorX: number,
  cursorY: number,
  wrapperRect: DOMRect,
  currentPan: Point,
  oldZoom: number,
  newZoom: number
): Point;
```

### 2. Canvas Store Extensions

```typescript
// Add to canvasStore.ts
const [zoomLevel, setZoomLevel] = createSignal(1.0);

export const canvasStore = {
  get zoomLevel() { return zoomLevel(); },
  // ... existing
};

export function setZoom(level: number): void;
export function applyZoom(cursorX: number, cursorY: number, wrapperRect: DOMRect, deltaY: number): void;
export function resetZoom(): void;
export function resetCanvas(): void;  // Resets both pan and zoom
```

### 3. Canvas Component Changes

```typescript
// In Canvas.tsx
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();  // FR-008: Prevent browser zoom
  const wrapper = e.currentTarget as HTMLElement;
  applyZoom(e.clientX, e.clientY, wrapper.getBoundingClientRect(), e.deltaY);
};

// Update style binding
style={{
  transform: `translate(${canvasStore.panOffset.x}px, ${canvasStore.panOffset.y}px) scale(${canvasStore.zoomLevel})`,
}}

// Add wheel handler
onWheel={handleWheel}
```

### 4. Document Store Integration

```typescript
// In documentStore.ts loadFile success path
import { resetCanvas } from './canvasStore';

// After successful parse
resetCanvas();  // FR-009: Reset zoom on new document
```

## Test Scenarios

1. **Zoom in**: Wheel up increases zoomLevel
2. **Zoom out**: Wheel down decreases zoomLevel
3. **Min limit**: Cannot zoom below 0.1
4. **Max limit**: Cannot zoom above 5.0
5. **Cursor centering**: Point under cursor stays stationary
6. **Reset on load**: New document resets to 1.0
7. **Prevent default**: Browser zoom blocked

## Verification Commands

```bash
# Run tests
npm test

# Type check
npx tsc --noEmit

# Lint/format
npx biome check --write .
```
