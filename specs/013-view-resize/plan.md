# Implementation Plan: View Resize

**Branch**: `013-view-resize` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-view-resize/spec.md`

## Summary

Implement resize functionality for selected views via 8 drag handles (corners and edges). Supports modifier keys (Shift for aspect ratio lock, Alt for center resize), enforces minimum 10×10 size, provides ghost preview during drag, and integrates with existing historyStore for undo/redo.

## Technical Context

**Language/Version**: TypeScript 5.9.x with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store (already installed - no new dependencies)
**Storage**: N/A (extends existing documentStore for view size mutations)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks  
**Target Platform**: Web browser (modern browsers supporting ES2020+)
**Project Type**: Single SolidJS frontend application  
**Performance Goals**: 100ms response time for resize, 60fps preview updates during drag  
**Constraints**: Minimum view size 10×10 pixels, 3px click tolerance before resize initiates  
**Scale/Scope**: Single view resize per operation (multi-view resize out of scope)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ WILL COMPLY | All implementation follows RED-GREEN-REFACTOR |
| II. Technology Stack | ✅ COMPLIANT | SolidJS only, no new dependencies needed |
| III. Security & Compliance | ✅ N/A | No sensitive data, local editor only |
| IV. Code Quality | ✅ WILL COMPLY | Biome, Stylelint, tsc checks required |
| V. GUI Editor Domain | ✅ COMPLIANT | Undo/redo required, real-time feedback |
| VI. Testing Standards | ✅ WILL COMPLY | Unit + component tests, 80% coverage |
| XII. SolidJS Only | ✅ COMPLIANT | No React patterns |
| XVIII. Zero Failing Tests | ✅ WILL COMPLY | All tests must pass |
| XX. Technical Overview | ✅ CONSULTED | CLAUDE.md reviewed for existing utilities |
| XXI. Static Imports Only | ✅ WILL COMPLY | No dynamic imports |
| XXII. Honest Completion | ✅ WILL COMPLY | Compliance table required |

## Project Structure

### Documentation (this feature)

```text
specs/013-view-resize/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/          # Quality checklists
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── Canvas/
│       ├── Canvas.tsx                    # Integrate resize handlers (modify)
│       ├── SelectionOverlay.tsx          # Add mousedown to handles (modify)
│       ├── ResizePreview.tsx             # NEW: Ghost preview during resize
│       ├── ResizePreview.module.css      # NEW: Preview styles
│       ├── DimensionIndicator.tsx        # NEW: "200×150" tooltip during resize
│       └── __tests__/
│           ├── Canvas.resize.spec.tsx    # NEW: Resize integration tests
│           ├── Canvas.resize.undo.spec.tsx # NEW: Undo/redo tests
│           ├── ResizePreview.spec.tsx    # NEW: Preview component tests
│           └── DimensionIndicator.spec.tsx # NEW: Indicator tests
├── domain/
│   └── canvas/
│       ├── resize.ts                     # NEW: Resize calculation utilities
│       └── __tests__/
│           └── resize.spec.ts            # NEW: Resize utility tests
├── stores/
│   ├── resizeStore.ts                    # NEW: Transient resize state
│   ├── documentStore.ts                  # Add updateViewSize (modify)
│   └── __tests__/
│       ├── resizeStore.spec.ts           # NEW: Resize store tests
│       └── documentStore.resize.spec.ts  # NEW: updateViewSize tests
└── types/
    └── resize.ts                         # NEW: Resize type definitions
```

**Structure Decision**: Extends existing Canvas component structure. New files follow established patterns from 012-view-move (dragStore → resizeStore, DragPreview → ResizePreview).

## Complexity Tracking

No constitution violations requiring justification. Design follows existing patterns.

## Existing Infrastructure to Reuse

From CLAUDE.md analysis:

| Existing Module | Reuse For |
|----------------|-----------|
| `historyStore` | Undo/redo integration (pushOperation, undo, redo) |
| `selectionStore` | Get selected view IDs |
| `documentStore.updateViewOrigin` | Pattern for `updateViewSize` |
| `dragStore` | Pattern for `resizeStore` structure |
| `DragPreview` | Pattern for `ResizePreview` component |
| `HANDLE_CURSORS` | Already defined in types/selection.ts |
| `HandlePosition` | Already defined ('nw', 'n', etc.) |
| `flattenHierarchy` | Get RenderableView with dimensions |
| `parsePoint`, `parseSize` | Parse origin/size strings |
| `formatOrigin` | Pattern for `formatSize` |

## Phase 0 Research Summary

No NEEDS CLARIFICATION items. All technical decisions are clear:

1. **Handle Hit Detection**: Use existing `data-position` attribute on handle circles
2. **Resize Calculation**: Standard corner/edge resize math (well-known algorithms)
3. **Aspect Ratio Lock**: Constrain based on original aspect ratio
4. **Center Resize**: Mirror delta to opposite corner/edge
5. **History Integration**: Same pattern as move operations

## Phase 1 Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for:
- `ResizeState` interface
- `ResizeOperation` type
- Calculation function signatures

### Quick Start

See [quickstart.md](./quickstart.md) for implementation guide.
