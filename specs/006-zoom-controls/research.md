# Research: Zoom Controls

**Branch**: `006-zoom-controls` | **Date**: 2026-01-05 | **Spec**: [spec.md](spec.md)

## Phase 0 Output

This document captures research findings and clarification resolutions from the planning phase.

## Clarifications Resolved

**No clarifications were needed.** The specification was comprehensive and unambiguous.

Reasonable defaults were applied for:

| Item | Default Applied | Rationale |
|------|-----------------|-----------|
| Zoom step size | Existing `ZOOM_FACTOR = 1.1` | Reuse from 005-canvas-zoom for consistency |
| Zoom limits | `MIN_ZOOM = 0.1`, `MAX_ZOOM = 5.0` | Reuse from 005-canvas-zoom |
| Fit-to-view padding | 5% margin | Industry standard for visual breathing room |
| Fit-to-view zoom cap | 100% maximum | Prevents over-enlargement of small templates |
| Keyboard shortcut scope | Canvas container focus required | Standard pattern, not global hotkeys |

## Existing Infrastructure Analysis

### canvasStore (src/stores/canvasStore.ts)

Current exports that will be extended:
- `canvasStore.zoomLevel` - Reactive signal for current zoom (0.1-5.0)
- `setZoom(level)` - Set zoom with clamping
- `resetZoom()` - Reset to 1.0
- `applyZoom(cursorX, cursorY, deltaY, wrapperRect)` - Wheel zoom with cursor centering
- `resetCanvas()` - Reset pan and zoom

### zoom.ts (src/domain/canvas/zoom.ts)

Current exports:
- `MIN_ZOOM = 0.1`
- `MAX_ZOOM = 5.0`
- `ZOOM_FACTOR = 1.1`
- `clampZoom(zoom)` - Clamp to valid range
- `calculateNewZoom(currentZoom, deltaY)` - Calculate new zoom from wheel delta
- `calculateZoomPanAdjustment(...)` - Pan adjustment for cursor-centered zoom

## Technical Decisions

### 1. ZoomToolbar Component Location

**Decision**: Create new `src/components/ZoomToolbar/` directory with dedicated component.

**Rationale**:
- Keeps Canvas component focused on rendering
- Allows toolbar to be positioned independently
- Follows existing component organization pattern

### 2. Fit-to-View Implementation

**Decision**: Create `src/domain/canvas/fitToView.ts` as separate pure function module.

**Rationale**:
- Pure calculation is easier to test
- Separates concerns from store actions
- Can be reused if needed elsewhere

### 3. Keyboard Handler Scope

**Decision**: Attach to Canvas container with tabIndex, not window.

**Rationale**:
- Avoids interfering with other app shortcuts
- Clear focus scope for users
- Matches FR-013 requirement to ignore text input focus

### 4. Button Disabled States

**Decision**: Derive from `canvasStore.zoomLevel` using createMemo.

**Rationale**:
- Reactive updates automatically
- No manual state synchronization needed
- Consistent with SolidJS patterns

## Dependencies

No new npm dependencies required. All functionality can be built with:
- SolidJS 1.9.10 (existing)
- TypeScript 5.9.3 (existing)
- Vitest 4.0.16 (existing)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Fit-to-view calculation edge cases | Low | Low | Comprehensive unit tests |
| Keyboard shortcuts conflict | Low | Medium | Scoped to canvas focus |
| Performance on rapid zoom | Low | Low | SolidJS fine-grained reactivity |

## Ready for Implementation

✅ All clarifications resolved
✅ Technical decisions documented
✅ Existing infrastructure identified
✅ No blocking dependencies

**Next**: Generate quickstart.md and proceed to task generation.
