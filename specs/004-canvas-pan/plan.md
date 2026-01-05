# Implementation Plan: Canvas Pan Navigation

**Branch**: `004-canvas-pan` | **Date**: 2026-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-canvas-pan/spec.md`

## Summary

Add pan navigation to the canvas component using middle-mouse drag and Space+left-drag. Pan offset is applied via CSS transform on the canvas wrapper, with cursor feedback for grab/grabbing states. The implementation extends the existing Canvas component with reactive pan state management.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10 (createSignal for pan state)
**Storage**: N/A (pan state is transient, not persisted)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)
**Project Type**: Single SolidJS application
**Performance Goals**: 60fps during pan gestures (visual update within same frame as input)
**Constraints**: No artificial pan limits; unlimited pan range
**Scale/Scope**: Single canvas component enhancement

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | Tests written before implementation |
| II. Technology Stack | ✅ PASS | SolidJS only, no new dependencies |
| III. Security & Compliance | ✅ PASS | No user data, no external APIs |
| IV. Code Quality | ✅ PASS | Biome/Stylelint/TSC checks required |
| V. GUI Editor Domain | ✅ PASS | Real-time feedback, immediate updates |
| VI. Testing Standards | ✅ PASS | Component tests with user-event |
| XII. Framework Restrictions | ✅ PASS | createSignal, not useState |
| XV. Styling Architecture | ✅ PASS | CSS Modules for cursor styles |
| XVIII. Zero Failing Tests | ✅ PASS | All tests must pass |
| XIX. Domain Knowledge | ✅ PASS | N/A - no uidesc parsing changes |
| XX. Technical Overview | ✅ PASS | Canvas component documented in CLAUDE.md |
| XXI. Honest Completion | ✅ PASS | Compliance table in spec.md |

**No violations. Proceed to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/004-canvas-pan/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── Canvas/
│       ├── Canvas.tsx           # Modified - add pan handlers
│       ├── Canvas.module.css    # Modified - add cursor classes
│       └── __tests__/
│           └── Canvas.spec.tsx  # Modified - add pan tests
├── stores/
│   └── canvasStore.ts           # NEW - pan state management
│       └── __tests__/
│           └── canvasStore.spec.ts  # NEW - store tests
└── types/
    └── canvas.ts                # Modified - add PanState type
```

**Structure Decision**: Single project structure. Pan functionality is tightly coupled to Canvas component. Store is extracted for testability and potential reuse by future zoom feature.

## Complexity Tracking

> No violations. Table not required.
