# Implementation Plan: Marquee Selection

**Branch**: `009-marquee-selection` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-marquee-selection/spec.md`

## Summary

Implement marquee (rubber-band) selection for the canvas. Click+drag on empty canvas space draws a visible selection rectangle that selects all views intersecting with it. Shift+drag adds to existing selection. Escape or right-click cancels. Uses existing selectionStore for state management and extends Canvas component with new event handlers and visual feedback.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10
**Primary Dependencies**: solid-js, solid-js/store (already installed - no new dependencies required)
**Storage**: N/A (marquee state is transient, in-memory via SolidJS signals)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)
**Project Type**: Single web application
**Performance Goals**: 60fps during marquee drag, <50ms selection update on release (SC-002, SC-003)
**Constraints**: Must not conflict with existing pan/zoom operations, intersection accuracy 100% (SC-005)
**Scale/Scope**: Support up to 500 views without lag (SC-006)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | WILL COMPLY | Tests written before implementation |
| II. Technology Stack | COMPLIANT | SolidJS only, no new dependencies |
| III. Security & Compliance | COMPLIANT | No sensitive data, input validation for coordinates |
| IV. Code Quality | WILL COMPLY | Biome, Stylelint, tsc checks after each task |
| V. GUI Editor Domain | WILL COMPLY | Real-time feedback, visual fidelity |
| VI. Testing Standards | WILL COMPLY | Unit + component tests, 80%+ coverage |
| VII. Development Workflow | WILL COMPLY | Red-Green-Refactor cycle |
| VIII. Performance & UX | WILL COMPLY | 60fps target, <50ms response |
| IX. Accessibility | WILL COMPLY | Keyboard cancel (Escape), cursor feedback |
| X. Research & Documentation | WILL COMPLY | Consult official docs |
| XI. Dependency Management | COMPLIANT | No new dependencies required |
| XII. SolidJS Only | WILL COMPLY | No React patterns |
| XIII. Debugging Limit | ACKNOWLEDGED | 5-attempt limit |
| XIV. Concise Communication | ACKNOWLEDGED | Brief updates |
| XV. Styling Architecture | WILL COMPLY | CSS Modules, design tokens |
| XVI. Token Efficiency | WILL COMPLY | No redundant docs |
| XVIII. Zero Failing Tests | WILL COMPLY | All tests pass before completion |
| XIX. VSTGUI Domain | N/A | Marquee is UI feature, not uidesc format |
| XX. Technical Overview | WILL COMPLY | CLAUDE.md consulted, will update |
| XXI. Static Imports Only | WILL COMPLY | No dynamic imports |
| XXII. Honest Completion | WILL COMPLY | Compliance table at end |

**Gate Status**: PASS - No violations, all principles will be followed.

## Project Structure

### Documentation (this feature)

```text
specs/009-marquee-selection/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── Canvas/
│       ├── Canvas.tsx                    # MODIFY: Add marquee event handlers
│       ├── Canvas.module.css             # MODIFY: Add marquee styles
│       ├── MarqueeRectangle.tsx          # NEW: Visual marquee during drag
│       └── __tests__/
│           └── Canvas.marquee.spec.tsx   # NEW: Marquee tests
├── domain/
│   └── canvas/
│       ├── marquee.ts                    # NEW: Intersection utilities
│       └── __tests__/
│           └── marquee.spec.ts           # NEW: Unit tests
├── stores/
│   └── marqueeStore.ts                   # NEW: Marquee state management
│   └── __tests__/
│       └── marqueeStore.spec.ts          # NEW: Store tests
└── types/
    └── marquee.ts                        # NEW: MarqueeState type
```

**Structure Decision**: Single web application. New marquee functionality added as domain utilities, a dedicated store, and Canvas component extensions. Follows existing patterns from 008-view-selection.

## Complexity Tracking

> No constitution violations requiring justification.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| State Location | Dedicated marqueeStore | Consistent with selectionStore/canvasStore pattern |
| Intersection Algorithm | Simple AABB overlap | Sufficient for axis-aligned rectangles |
| Event Handling | Extend Canvas.tsx | Centralized event handling, follows existing pattern |

## Architecture Overview

### Event Flow

```
mousedown (on empty canvas)
  ├─→ Check: Not on view (hitTest returns null)
  ├─→ Check: Not panning (canvasStore.isPanning === false)
  ├─→ Check: Left button (event.button === 0)
  └─→ startMarquee(canvasPoint, event.shiftKey)
      └─→ marqueeStore: isActive=true, startPoint, isAdditive, save previousSelection

mousemove (while marquee active)
  └─→ updateMarquee(canvasPoint)
      ├─→ marqueeStore: currentPoint update
      └─→ Render: MarqueeRectangle component updates

mouseup (while marquee active)
  └─→ completeMarquee()
      ├─→ Check: minimum size (5x5px) → if too small, treat as click
      ├─→ findIntersectingViews(marqueeRect, views) → viewIds[]
      ├─→ If isAdditive: merge with previousSelection
      │   Else: replace selection
      └─→ selectionStore.selectAll(viewIds) or select operations
      └─→ marqueeStore: reset

Escape/Right-click (while marquee active)
  └─→ cancelMarquee()
      ├─→ Restore previousSelection to selectionStore
      └─→ marqueeStore: reset
```

### Component Hierarchy

```
Canvas.tsx
├─→ <Grid /> (existing)
├─→ <For each={renderableViews}><ViewRectangle /></For> (existing)
├─→ <For each={selectedViews}><SelectionOverlay /></For> (existing)
├─→ <Show when={marqueeStore.isActive}><MarqueeRectangle /></Show> (NEW)
└─→ <HoverTooltip /> (existing)
```

### Intersection Detection

```
function rectIntersect(a: Rect, b: Rect): boolean {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}
```

AABB (Axis-Aligned Bounding Box) overlap test. Two rectangles intersect if neither is completely to the left, right, above, or below the other.

## Key Implementation Details

### 1. Marquee State (marqueeStore)

```typescript
interface MarqueeState {
  isActive: boolean;
  startPoint: CanvasPoint | null;
  currentPoint: CanvasPoint | null;
  isAdditive: boolean;
  previousSelection: Set<string>;
}
```

### 2. Coordinate Handling

All mouse events converted to canvas space via existing `mouseToCanvas()` utility:
- Accounts for pan offset and zoom level
- Marquee rectangle rendered in canvas space (inside SVG transform)

### 3. Conflict Resolution

- **Pan vs Marquee**: Check `canvasStore.isPanning` before starting marquee
- **View click vs Marquee**: Check hitTest result - if click is on view, don't start marquee
- **Pan/Zoom during Marquee**: Cancel marquee if pan or zoom starts (FR-012)

### 4. Visual Styling

Marquee rectangle uses design tokens:
- Semi-transparent fill: `--color-marquee-fill` with low opacity
- Visible border: `--color-marquee-stroke` with 1px width
- Crosshair cursor during drag

### 5. Performance Considerations

- Intersection testing is O(n) where n = number of views
- For 500 views, this is <1ms on modern hardware
- No debouncing needed for mousemove (60fps native)
- Use `createMemo` for derived marquee bounds

## Dependencies on Existing Code

| Module | Usage |
|--------|-------|
| `selectionStore` | `select()`, `toggleSelect()`, `selectAll()`, `clearSelection()` |
| `canvasStore` | `isPanning`, `panOffset`, `zoomLevel` for conflict detection and coordinate transform |
| `mouseToCanvas()` | Convert viewport coordinates to canvas space |
| `hitTest()` | Determine if mousedown is on a view or empty space |
| `RenderableView` | View data for intersection testing |
| `flattenHierarchy()` | Get all views for intersection check |

## Test Strategy

### Unit Tests (domain/canvas/marquee.ts)

- `rectIntersect()` - various overlap scenarios
- `findIntersectingViews()` - multiple views, partial overlap, no overlap
- `isMinimumSize()` - 5x5px threshold, edge cases
- `normalizeRect()` - handle negative width/height (drag in any direction)

### Store Tests (stores/marqueeStore.ts)

- Initial state
- `startMarquee()` - sets state correctly
- `updateMarquee()` - updates currentPoint
- `completeMarquee()` - resets state
- `cancelMarquee()` - restores previousSelection

### Component Tests (Canvas.marquee.spec.tsx)

- Mousedown on empty space starts marquee
- Mousedown on view does not start marquee
- Marquee rectangle visible during drag
- Mouseup selects intersecting views
- Shift+drag adds to selection
- Escape cancels and restores selection
- Right-click cancels
- Small marquee (<5x5px) treated as click
- Pan during marquee cancels marquee
