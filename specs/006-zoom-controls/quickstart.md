# Quickstart: Zoom Controls

**Branch**: `006-zoom-controls` | **Date**: 2026-01-05 | **Spec**: [spec.md](spec.md)

## Implementation Starting Point

This guide provides the minimal context needed to begin implementing the zoom controls feature.

## Prerequisites

- Feature branch `006-zoom-controls` checked out
- All 356 existing tests passing (`npm test`)
- Familiar with existing canvasStore and zoom.ts from 005-canvas-zoom

## Key Files to Modify

### Existing Files

| File | Changes |
|------|---------|
| `src/stores/canvasStore.ts` | Add `zoomIn()`, `zoomOut()`, `fitToView()` actions |
| `src/domain/canvas/zoom.ts` | Add `formatZoomPercent()` utility |
| `src/components/Canvas/Canvas.tsx` | Add keyboard handler, integrate ZoomToolbar |

### New Files

| File | Purpose |
|------|---------|
| `src/domain/canvas/fitToView.ts` | Pure function for fit-to-view calculation |
| `src/domain/canvas/__tests__/fitToView.spec.ts` | Tests for fit-to-view |
| `src/components/ZoomToolbar/ZoomToolbar.tsx` | Toolbar component |
| `src/components/ZoomToolbar/ZoomToolbar.module.css` | Component styles |
| `src/components/ZoomToolbar/__tests__/ZoomToolbar.spec.tsx` | Component tests |

## Implementation Order

```
1. zoom.ts: formatZoomPercent()
   └─> 2. canvasStore: zoomIn(), zoomOut()
       └─> 3. fitToView.ts: calculateFitZoom()
           └─> 4. canvasStore: fitToView()
               └─> 5. ZoomToolbar component
                   └─> 6. Canvas keyboard handlers
                       └─> 7. Integration
```

## Quick Reference

### Zoom Constants (from zoom.ts)

```typescript
MIN_ZOOM = 0.1;    // 10%
MAX_ZOOM = 5.0;    // 500%
ZOOM_FACTOR = 1.1; // 10% per step
```

### Store Pattern (from canvasStore.ts)

```typescript
// Existing pattern to follow
export function setZoom(level: number): void {
  setCanvasStore('zoomLevel', clampZoom(level));
}

// New actions follow same pattern
export function zoomIn(): void {
  setZoom(canvasStore.zoomLevel * ZOOM_FACTOR);
}
```

### Component Testing Pattern

```typescript
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ZoomToolbar', () => {
  beforeEach(() => {
    resetCanvas(); // Clean state
  });

  it('displays current zoom level as percentage', () => {
    render(() => <ZoomToolbar />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
```

## Success Criteria Quick Check

| SC | Metric | How to Verify |
|----|--------|---------------|
| SC-001 | Current zoom visible | ZoomToolbar displays percentage |
| SC-002 | Zoom via buttons | Click +/- buttons, verify zoom changes |
| SC-003 | Reset to 100% | Click 100% button, verify zoom = 1.0 |
| SC-004 | Fit to view | Click Fit button, verify template fits |
| SC-005 | Keyboard shortcuts | Press F/0/+/- keys, verify actions |
| SC-006 | Response <100ms | Manual observation, no lag |

## Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/domain/canvas/__tests__/fitToView.spec.ts

# Watch mode for TDD
npm run test:watch

# Coverage report
npm run test:coverage
```

## Ready to Start

1. Run `npm test` to verify baseline
2. Create first test file for `formatZoomPercent()`
3. Follow Red-Green-Refactor cycle
4. Proceed through implementation order above

**Next command**: `/speckit.tasks` to generate detailed task list
