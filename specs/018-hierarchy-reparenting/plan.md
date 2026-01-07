# Implementation Plan: Hierarchy Reparenting

**Branch**: `018-hierarchy-reparenting` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-hierarchy-reparenting/spec.md`

## Summary

Implement drag-and-drop hierarchy manipulation in the HierarchyPanel: reparent views by dropping onto containers, reorder siblings by dropping between items, group selected siblings into new CViewContainer (Ctrl+G), and ungroup containers (Ctrl+Shift+G). All operations support undo/redo via existing historyStore.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store (already installed)
**Storage**: N/A (in-memory state via existing documentStore)
**Testing**: Vitest 4.0.16 with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks  
**Target Platform**: Web browser (modern browsers)
**Project Type**: Single SolidJS application
**Performance Goals**: Visual feedback within 100ms of drag start (SC-006)
**Constraints**: All operations must be undoable, view positions preserved after reparent
**Scale/Scope**: Typical uidesc files have 10-100 views in hierarchy

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | All tasks will follow RED-GREEN-REFACTOR |
| II. Technology Stack | ✅ PASS | Using SolidJS, no new dependencies needed |
| III. Security & Compliance | ✅ PASS | No external data, no sensitive info |
| IV. Code Quality | ✅ PASS | Will run biome, stylelint, tsc after each task |
| V. GUI Editor Domain | ✅ PASS | All operations undoable (FR-019 to FR-022) |
| VI. Testing Standards | ✅ PASS | Unit + component tests, 80% coverage target |
| XII. Framework Restrictions | ✅ PASS | SolidJS only, no React patterns |
| XVIII. Zero Failing Tests | ✅ PASS | All tests must pass before completion |
| XX. Technical Overview | ✅ PASS | CLAUDE.md consulted for existing patterns |
| XXI. Static Imports | ✅ PASS | No dynamic imports |
| XXII. Honest Completion | ✅ PASS | Compliance table required |
| XXIII. Quality Gates | ✅ PASS | lint:css, check, typecheck must pass |

## Project Structure

### Documentation (this feature)

```text
specs/018-hierarchy-reparenting/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── HierarchyPanel/
│       ├── HierarchyPanel.tsx       # Existing - add drag-drop handlers
│       ├── HierarchyPanel.module.css # Existing - add drop indicator styles
│       ├── TreeNode.tsx             # Existing - add draggable + drop target
│       └── __tests__/
│           └── HierarchyPanel.spec.tsx # Existing - add drag-drop tests
├── domain/
│   └── hierarchy/
│       ├── reparent.ts              # NEW: reparent logic
│       ├── reorder.ts               # NEW: sibling reorder logic
│       ├── group.ts                 # NEW: group/ungroup logic
│       └── __tests__/
│           ├── reparent.spec.ts
│           ├── reorder.spec.ts
│           └── group.spec.ts
├── hooks/
│   └── hierarchy/
│       ├── useHierarchyDrag.ts      # NEW: drag state management
│       └── __tests__/
│           └── useHierarchyDrag.spec.ts
├── stores/
│   └── documentStore.ts             # Existing - add reparent/reorder mutations
└── types/
    └── hierarchy.ts                 # NEW: drag-drop types
```

**Structure Decision**: Extends existing HierarchyPanel with drag-drop capabilities. Domain logic separated into `src/domain/hierarchy/` for testability. New hook `useHierarchyDrag` manages drag state.

## Complexity Tracking

> No violations to justify - feature uses existing patterns.
