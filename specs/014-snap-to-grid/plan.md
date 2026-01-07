# Implementation Plan: Snap to Grid

**Branch**: `014-snap-to-grid` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-snap-to-grid/spec.md`

## Summary

Add grid snapping during move and resize operations. Views automatically align to grid lines when within a snap threshold (default 5px). Users can toggle snap via Shift+G keyboard shortcut, temporarily disable with Alt key during drag, and receive visual feedback when snap engages. Builds on existing gridStore, dragStore, and resizeStore infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store (already installed - no new dependencies)
**Storage**: In-memory SolidJS signals (extends gridStore for snap state)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)
**Project Type**: Single SPA - SolidJS frontend only
**Performance Goals**: 60fps during drag/resize, <16ms snap calculation
**Constraints**: Snap must not interfere with existing drag/resize UX, Alt key already used for center-resize (both behaviors must coexist)
**Scale/Scope**: Session-only state, no persistence needed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | WILL COMPLY | All snap logic TDD with tests first |
| II. Technology Stack | COMPLIANT | Uses SolidJS signals, no new deps |
| III. Security & Compliance | N/A | No sensitive data involved |
| IV. Code Quality & Architecture | WILL COMPLY | biome, tsc, stylelint checks |
| V. GUI Editor Domain | WILL COMPLY | Undo/redo via existing historyStore |
| VI. Testing Standards | WILL COMPLY | Unit tests for snap utils, integration for UX |
| XII. SolidJS Only | COMPLIANT | No React patterns |
| XVIII. Zero Failing Tests | WILL COMPLY | All tests must pass |
| XX. Technical Overview Reference | COMPLIANT | CLAUDE.md consulted |
| XXI. Static Imports Only | WILL COMPLY | No dynamic imports |
| XXII. Honest Completion | WILL COMPLY | Full compliance table at end |

**GATE STATUS**: ✅ PASS - No violations, proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/014-snap-to-grid/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A - no API contracts for this feature
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── stores/
│   ├── gridStore.ts           # EXTEND: Add snapEnabled signal
│   └── __tests__/
│       └── gridStore.spec.ts  # EXTEND: Add snap toggle tests
├── domain/
│   └── canvas/
│       ├── snap.ts            # NEW: Snap calculation utilities
│       └── __tests__/
│           └── snap.spec.ts   # NEW: Snap utility tests
├── hooks/
│   └── canvas/
│       ├── useCanvasInteractions.ts  # MODIFY: Integrate snap into drag/resize
│       └── useCanvasKeyboard.ts      # MODIFY: Add Shift+G shortcut
├── components/
│   ├── Canvas/
│   │   └── Canvas.tsx         # MODIFY: Add SnapIndicator rendering
│   ├── SnapIndicator/
│   │   ├── SnapIndicator.tsx       # NEW: Visual feedback component
│   │   ├── SnapIndicator.module.css
│   │   └── __tests__/
│   │       └── SnapIndicator.spec.tsx
│   └── GridToolbar/
│       └── GridToolbar.tsx    # MODIFY: Add snap toggle button
└── types/
    └── snap.ts                # NEW: Snap-related type definitions
```

**Structure Decision**: Single SPA structure. Snap feature extends existing canvas infrastructure without adding new top-level directories.

## Complexity Tracking

No constitution violations to justify. Feature complexity is appropriate:
- Extends existing stores (gridStore)
- Uses established patterns (signals, domain utilities)
- Integrates into existing hooks
- No new dependencies required

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design completion.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | WILL COMPLY | TDD for snap.ts, gridStore extensions, SnapIndicator |
| II. Technology Stack | COMPLIANT | No new dependencies, SolidJS only |
| IV. Code Quality & Architecture | WILL COMPLY | Clean separation: types → domain → store → hooks → components |
| V. GUI Editor Domain | COMPLIANT | Snap integrates with existing undo/redo (move/resize operations) |
| VI. Testing Standards | WILL COMPLY | Unit tests for utilities, integration tests for UX flows |
| XII. SolidJS Only | COMPLIANT | All patterns use SolidJS primitives (createSignal, createEffect) |
| XXI. Static Imports Only | WILL COMPLY | All imports will be static |

**POST-DESIGN GATE STATUS**: ✅ PASS - Design aligns with constitution

## Generated Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Research | `specs/014-snap-to-grid/research.md` | ✅ Complete |
| Data Model | `specs/014-snap-to-grid/data-model.md` | ✅ Complete |
| Quickstart | `specs/014-snap-to-grid/quickstart.md` | ✅ Complete |
| Contracts | N/A | Not applicable (no API) |

## Next Steps

Run `/speckit.tasks` to generate the implementation task list.
