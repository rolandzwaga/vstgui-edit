# Implementation Plan: Zoom Controls

**Branch**: `006-zoom-controls` | **Date**: 2026-01-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-zoom-controls/spec.md`

## Summary

Add toolbar UI for zoom controls with buttons (+, -, Fit, 100%), zoom level percentage display, and keyboard shortcuts (F, 0, +, -). Extends existing wheel zoom from 005-canvas-zoom with explicit user controls and fit-to-view calculation.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10 (createSignal for component state, createMemo for derived values)
**Storage**: N/A (in-memory state via canvasStore)
**Testing**: Vitest 4.0.16 with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Browser (Vite dev server, production build)
**Project Type**: Single SolidJS web application
**Performance Goals**: <100ms response for all zoom actions (SC-006)
**Constraints**: No new dependencies required; reuses existing canvasStore and zoom utilities
**Scale/Scope**: Single toolbar component with 4 buttons + percentage display + keyboard handlers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | WILL COMPLY | All components/functions get tests first |
| II. Technology Stack | COMPLIANT | SolidJS 1.9.10, TypeScript, Vitest - all approved |
| III. Security & Compliance | N/A | No sensitive data, no external APIs |
| IV. Code Quality | WILL COMPLY | Biome + tsc + Stylelint after each task |
| V. GUI Editor Domain | COMPLIANT | Immediate visual feedback via reactive signals |
| VI. Testing Standards | WILL COMPLY | 80% coverage, co-located tests |
| VII. Development Workflow | WILL COMPLY | Red-Green-Refactor cycle |
| VIII. Performance & UX | WILL COMPLY | Target <100ms per spec |
| IX. Accessibility | WILL COMPLY | Keyboard shortcuts, button labels |
| XI. Dependency Management | COMPLIANT | No new dependencies |
| XII. Framework Restrictions | WILL COMPLY | SolidJS only, no React |
| XVIII. Zero Failing Tests | WILL COMPLY | All tests must pass |
| XX. Technical Overview | CONSULTED | CLAUDE.md reviewed for existing utilities |
| XXI. Honest Completion | WILL COMPLY | Compliance table at completion |

**Gate Status**: PASS - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/006-zoom-controls/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Canvas/
│   │   └── Canvas.tsx                # EXISTING - add keyboard handler, integrate toolbar
│   └── ZoomToolbar/
│       ├── ZoomToolbar.tsx           # NEW - main toolbar component
│       ├── ZoomToolbar.module.css    # NEW - component styles
│       └── __tests__/
│           └── ZoomToolbar.spec.tsx  # NEW - component tests
├── domain/
│   └── canvas/
│       ├── zoom.ts                   # EXISTING - add zoomIn(), zoomOut() helpers
│       ├── fitToView.ts              # NEW - fit-to-view calculation
│       └── __tests__/
│           ├── zoom.spec.ts          # EXISTING - extend tests
│           └── fitToView.spec.ts     # NEW - fit-to-view tests
├── stores/
│   └── canvasStore.ts                # EXISTING - add zoomIn, zoomOut, fitToView actions
└── types/
    └── canvas.ts                     # EXISTING - add ViewportSize type if needed
```

**Structure Decision**: Single SolidJS project. New ZoomToolbar component integrates with existing Canvas via shared canvasStore signals.

## Existing Infrastructure to Reuse

### From 005-canvas-zoom:

1. **canvasStore** (`src/stores/canvasStore.ts`):
   - `canvasStore.zoomLevel` - current zoom (0.1-5.0)
   - `setZoom(level)` - set zoom with clamping
   - `resetZoom()` - reset to 1.0
   - `applyZoom(...)` - wheel zoom with cursor centering
   - `resetCanvas()` - reset pan and zoom

2. **zoom.ts** (`src/domain/canvas/zoom.ts`):
   - `MIN_ZOOM = 0.1`
   - `MAX_ZOOM = 5.0`
   - `ZOOM_FACTOR = 1.1`
   - `clampZoom(zoom)`
   - `calculateNewZoom(current, deltaY)`

### Extensions Needed:

| Location | Addition | Purpose |
|----------|----------|---------|
| `canvasStore.ts` | `zoomIn()` | Single-step zoom in via button/key |
| `canvasStore.ts` | `zoomOut()` | Single-step zoom out via button/key |
| `canvasStore.ts` | `fitToView(viewportSize, templateSize)` | Fit template to viewport |
| `fitToView.ts` | `calculateFitZoom()` | Pure calculation for optimal zoom |
| `zoom.ts` | `formatZoomPercent()` | Format zoom as "100%" string |

## Phase-by-Phase Implementation

### Phase 1: Zoom Store Extensions (US1)
- Add `zoomIn()` and `zoomOut()` actions to canvasStore
- Add `formatZoomPercent()` utility for display
- Tests first, then implementation

### Phase 2: Fit-to-View Calculation (US3)
- Create `fitToView.ts` with `calculateFitZoom(templateSize, viewportSize, padding)`
- Returns optimal zoom level capped at 1.0 (FR-011)
- Add `fitToView()` action to canvasStore
- Pure calculation, fully testable

### Phase 3: ZoomToolbar Component (US1, US2, US3)
- Create ZoomToolbar component with:
  - Zoom percentage display (FR-001)
  - Zoom in (+) button (FR-002)
  - Zoom out (-) button (FR-003)
  - Fit button (FR-004)
  - 100% button (FR-005)
- CSS Module styling with design tokens
- Disabled states at zoom limits (FR-012)

### Phase 4: Keyboard Shortcuts (FR-006 through FR-009, FR-013)
- Add keyboard event handler to Canvas container
- Shortcuts: +/= (zoom in), - (zoom out), F (fit), 0 (100%)
- Filter: ignore when focus in text input (FR-013)
- Tests for each shortcut

### Phase 5: Integration & Polish
- Integrate ZoomToolbar with Canvas component
- Ensure all FR and SC requirements met
- Run coverage verification
- Documentation updates (CLAUDE.md)

## Key Design Decisions

1. **ZoomToolbar is separate component** - Positioned near Canvas but decoupled for flexibility
2. **Actions on canvasStore** - Consistent with existing pan/zoom architecture using SolidJS signals
3. **Fit-to-view caps at 100%** - Per FR-011, prevents over-enlargement of small templates
4. **Keyboard handlers on focusable container** - Not global; requires canvas area focus
5. **Button disabled states derived from zoomLevel** - Reactive via canvasStore signals
6. **Percentage formatting as utility** - Pure function, easy to test
7. **100% button resets zoom only** - Uses existing `resetZoom()`, preserves pan offset; `resetCanvas()` available for full reset

## Complexity Tracking

> No Constitution violations requiring justification.

| Item | Status |
|------|--------|
| All patterns align with existing architecture | No violations |
