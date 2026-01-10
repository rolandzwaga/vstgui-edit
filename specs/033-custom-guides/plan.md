# Implementation Plan: Custom Guides

**Branch**: `033-custom-guides` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/033-custom-guides/spec.md`

## Summary

Custom guides are user-created alignment reference lines that can be dragged from rulers onto the canvas. They enable precise view positioning through visual reference and edge snapping. The implementation extends the existing 032-rulers infrastructure with drag-from-ruler interaction, integrates with the snap system for move/resize operations, and provides full undo/redo support via historyStore.

## Technical Context

**Language/Version**: TypeScript 5.9.x (strict mode)
**Primary Dependencies**: SolidJS 1.9.x, Vite 7.x
**Storage**: In-memory only via SolidJS signals/stores (ephemeral, no localStorage)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Browser (modern ES2020+)
**Project Type**: Single SolidJS SPA
**Performance Goals**: 60fps during guide drag, snap detection within 16ms (single frame)
**Constraints**: Guides are ephemeral (lost on page refresh), max 50 guides without degradation
**Scale/Scope**: Single-user visual editor

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | All components require tests before implementation |
| II. Technology Stack | PASS | Uses SolidJS signals/stores, no new dependencies |
| III. Security & Compliance | PASS | No sensitive data, user input is coordinate values only |
| IV. Code Quality & Architecture | PASS | Will use domain/guides, stores/guidesStore pattern |
| V. GUI Editor Domain | PASS | Full undo/redo, real-time feedback, keyboard accessible |
| VI. Testing Standards | PASS | Co-located tests, 80% coverage target |
| XII. SolidJS Only | PASS | createSignal, createMemo, no React patterns |
| XV. Styling Architecture | PASS | CSS Modules for GuideLine component |
| XVIII. Zero Failing Tests | PASS | All tests must pass before completion |
| XIX. VSTGUI Domain | N/A | Guides are editor-only, not uidesc format |
| XX. Technical Overview | PASS | Will update CLAUDE.md with guidesStore |
| XXI. Static Imports Only | PASS | No dynamic imports |
| XXII. Honest Completion | PASS | Compliance table required at completion |
| XXIII. Quality Gates | PASS | lint:css, check, typecheck must pass |

## Project Structure

### Documentation (this feature)

```text
specs/033-custom-guides/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal APIs)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── Canvas/
│       ├── Rulers/
│       │   ├── HorizontalRuler.tsx    # Extend with drag-to-create
│       │   ├── VerticalRuler.tsx      # Extend with drag-to-create
│       │   └── __tests__/
│       └── Guides/
│           ├── GuideLine.tsx          # NEW: Single guide line renderer
│           ├── GuideLine.module.css   # NEW: Guide styling
│           ├── GuidesOverlay.tsx      # NEW: All guides container
│           ├── GuidePreview.tsx       # NEW: Preview during drag-to-create
│           └── __tests__/
│               ├── GuideLine.spec.tsx
│               ├── GuidesOverlay.spec.tsx
│               └── GuidePreview.spec.tsx
├── domain/
│   └── guides/
│       ├── index.ts                   # NEW: Guide domain exports
│       ├── guideOperations.ts         # NEW: Create, delete, reposition logic
│       ├── guideSnap.ts               # NEW: Guide snap calculations
│       ├── historyOperations.ts       # NEW: Undo/redo operation factories
│       └── __tests__/
│           ├── guideOperations.spec.ts
│           ├── guideSnap.spec.ts
│           └── historyOperations.spec.ts
├── stores/
│   ├── guidesStore.ts                 # NEW: Guide state management
│   └── __tests__/
│       └── guidesStore.spec.ts
├── types/
│   └── guides.ts                      # NEW: Guide type definitions
└── styles/
    └── tokens.css                     # Add guide color token
```

**Structure Decision**: Extends existing Canvas component hierarchy. New `/domain/guides/` module follows established pattern (see `/domain/canvas/`, `/domain/rulers/`). New store follows pattern from gridStore, smartGuidesStore.

## Complexity Tracking

No constitution violations requiring justification. Design follows established patterns:
- Store pattern: guidesStore follows gridStore, smartGuidesStore structure
- Domain pattern: domain/guides follows domain/canvas, domain/rulers structure
- Component pattern: Guides/ follows Rulers/ structure
- Snap integration: Extends snap.ts functions, does not replace them

## Post-Design Constitution Re-Check

| Principle | Status | Verification |
|-----------|--------|--------------|
| I. Test-First Development | PASS | All contracts define testable interfaces |
| II. Technology Stack | PASS | No new dependencies, uses SolidJS primitives |
| III. Security & Compliance | PASS | No sensitive data handling |
| IV. Code Quality & Architecture | PASS | Domain/store separation maintained |
| V. GUI Editor Domain | PASS | Undo/redo via historyStore integration |
| VI. Testing Standards | PASS | Test files defined for all new modules |
| XII. SolidJS Only | PASS | Contracts use SolidJS patterns only |
| XV. Styling Architecture | PASS | CSS Module + design token defined |
| XXI. Static Imports Only | PASS | No dynamic imports in contracts |
| XXIII. Quality Gates | PASS | Implementation must pass all gates |

**Gate Result**: PASS - Ready for task generation

## Phase 0 Artifacts

- **research.md**: Complete - 10 research questions resolved
  - Guide snap integration approach
  - Drag-from-ruler implementation
  - Zoom-invariant rendering
  - Undo/redo pattern
  - Visibility toggle
  - Duplicate prevention
  - Drag-to-ruler deletion
  - Context menu approach
  - CSS token for guide color
  - Keyboard shortcut handling

## Phase 1 Artifacts

- **data-model.md**: Complete - 4 entities defined
  - CustomGuide
  - GuidesState
  - GuideCreationDrag
  - GuideRepositionDrag

- **contracts/**: Complete - 4 API contracts
  - guidesStore.ts - Store API (~25 exports)
  - guideSnap.ts - Snap integration API (10 exports)
  - guideOperations.ts - CRUD operations API (12 exports)
  - historyOperations.ts - Undo/redo factories (12 exports: 4 factories + 4 constants + 4 formatters)

- **quickstart.md**: Complete - Usage patterns and examples

## Implementation Order Recommendation

1. **Types** (types/guides.ts) - No dependencies
2. **Domain Operations** (domain/guides/guideOperations.ts) - Depends on types
3. **History Operations** (domain/guides/historyOperations.ts) - Depends on types, history
4. **Store** (stores/guidesStore.ts) - Depends on types, domain operations
5. **Guide Snap** (domain/guides/guideSnap.ts) - Depends on types, store
6. **CSS Token** (styles/tokens.css) - No code dependencies
7. **GuideLine Component** - Depends on types, store
8. **GuidesOverlay Component** - Depends on GuideLine
9. **GuidePreview Component** - Depends on types, store
10. **Ruler Modifications** - Depends on store, preview
11. **Snap Integration** - Depends on guideSnap, existing move/resize
12. **Keyboard Shortcuts** - Depends on store

## Next Steps

Run `/speckit.tasks` to generate the implementation task breakdown.
