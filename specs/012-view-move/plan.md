# Implementation Plan: View Move

**Branch**: `012-view-move` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-view-move/spec.md`

## Summary

Implement drag-to-move for selected views on the canvas with undo/redo history system, arrow key nudge support, shift-constrained axis movement, and ghost preview during drag operations.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store (already installed - no new dependencies)
**Storage**: In-memory SolidJS store (documentStore for view origins, new historyStore for undo/redo)
**Testing**: Vitest 4.0.16 with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (modern browsers with ES2020+ support)
**Project Type**: Single SolidJS web application
**Performance Goals**: 60fps during drag, <100ms response for moves, <16ms for arrow key nudge
**Constraints**: No external dependencies; reuse existing store patterns
**Scale/Scope**: Single document editing, typical uidesc files have <500 views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | All code will have tests first |
| II. Technology Stack | ✅ PASS | SolidJS only, no new dependencies |
| III. Security & Compliance | ✅ PASS | No sensitive data involved |
| IV. Code Quality | ✅ PASS | Will run biome/tsc checks |
| V. GUI Editor Domain | ✅ PASS | Undo/redo required per constitution |
| XII. SolidJS Only | ✅ PASS | No React patterns |
| XVIII. Zero Failing Tests | ✅ PASS | All tests must pass |
| XX. Technical Overview | ✅ PASS | CLAUDE.md consulted |
| XXI. Static Imports Only | ✅ PASS | No dynamic imports |
| XXII. Honest Completion | ✅ PASS | Will verify all FR/SC |

## Project Structure

### Documentation (this feature)

```text
specs/012-view-move/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── stores/
│   ├── documentStore.ts      # MODIFY: Add updateViewOrigin action
│   └── historyStore.ts       # NEW: Undo/redo stack management
├── domain/
│   └── canvas/
│       ├── move.ts           # NEW: Move calculation utilities
│       └── constrainAxis.ts  # NEW: Shift-constrain logic
├── components/
│   └── Canvas/
│       ├── Canvas.tsx        # MODIFY: Add drag-to-move handlers
│       ├── DragPreview.tsx   # NEW: Ghost preview component
│       └── __tests__/
│           ├── Canvas.move.spec.tsx    # NEW: Move tests
│           └── Canvas.nudge.spec.tsx   # NEW: Nudge tests
└── types/
    └── history.ts            # NEW: History operation types
```

**Structure Decision**: Follows existing project structure. History store is new global store following documentStore/selectionStore pattern. Move utilities go in domain/canvas alongside existing zoom/pan utilities.

## Complexity Tracking

No violations to justify - design follows existing patterns.
