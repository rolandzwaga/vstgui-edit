# Implementation Plan: Hierarchy Panel

**Branch**: `010-hierarchy-panel` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-hierarchy-panel/spec.md`

## Summary

Implement a tree view in the left sidebar showing all views from the loaded uidesc template. The panel supports expand/collapse for containers, bidirectional selection sync with the canvas, category icons for visual identification, and auto-scroll to selected items.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store, @fortawesome/free-solid-svg-icons, solid-fontawesome
**Storage**: N/A (in-memory state via SolidJS signals)
**Testing**: Vitest 4.0.16 with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (modern browsers)
**Project Type**: Single SolidJS application
**Performance Goals**: Selection sync <100ms, tree renders 500+ views without lag
**Constraints**: Must integrate with existing selectionStore, documentStore
**Scale/Scope**: Typical templates have 20-100 views, edge case 500+

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ WILL COMPLY | All components/utilities test-first |
| II. Technology Stack | ✅ COMPLIANT | SolidJS signals, existing stores |
| III. Security & Compliance | ✅ N/A | No sensitive data handling |
| IV. Code Quality | ✅ WILL COMPLY | Biome, Stylelint, TypeScript |
| V. GUI Editor Domain | ✅ COMPLIANT | Selection sync, real-time feedback |
| VI. Testing Standards | ✅ WILL COMPLY | 80% coverage, co-located tests |
| VII. Development Workflow | ✅ WILL COMPLY | Red-Green-Refactor |
| VIII. Performance & UX | ✅ WILL COMPLY | <100ms interaction response |
| IX. Accessibility | ✅ WILL COMPLY | Keyboard nav, ARIA labels |
| X. Research & Documentation | ✅ WILL COMPLY | Consult SolidJS docs |
| XI. Dependency Management | ✅ COMPLIANT | No new dependencies needed |
| XII. SolidJS Only | ✅ COMPLIANT | createSignal, createEffect, createMemo |
| XIII. Debugging Limit | ✅ ACKNOWLEDGED | 5 attempts max |
| XIV. Concise Communication | ✅ ACKNOWLEDGED | Brief responses |
| XV. Styling Architecture | ✅ WILL COMPLY | CSS Modules + design tokens |
| XVI. Token Efficiency | ✅ ACKNOWLEDGED | No redundant docs |
| XVII. i18n | ✅ N/A | Not required for this feature |
| XVIII. Zero Failing Tests | ✅ WILL COMPLY | All tests pass before commit |
| XIX. Domain Knowledge | ✅ WILL COMPLY | Use existing ViewNode, RenderableView types |
| XX. Technical Overview | ✅ WILL COMPLY | Reuse existing utilities |
| XXI. Static Imports Only | ✅ WILL COMPLY | No dynamic imports |
| XXII. Honest Completion | ✅ WILL COMPLY | Compliance table at end |

**Gate Status**: ✅ PASSED - No violations

## Project Structure

### Documentation (this feature)

```text
specs/010-hierarchy-panel/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal component contracts)
│   └── hierarchy-panel.ts
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── HierarchyPanel/
│       ├── HierarchyPanel.tsx       # Main panel component
│       ├── HierarchyPanel.module.css
│       ├── TreeNode.tsx             # Individual tree node component
│       ├── TreeNode.module.css
│       ├── EmptyState.tsx           # Empty state when no template
│       ├── EmptyState.module.css
│       ├── icons.ts                 # Category icon mappings
│       └── __tests__/
│           ├── HierarchyPanel.spec.tsx
│           ├── TreeNode.spec.tsx
│           └── EmptyState.spec.tsx
├── stores/
│   └── hierarchyStore.ts            # Expand/collapse state
│       └── __tests__/
│           └── hierarchyStore.spec.ts
├── domain/
│   └── hierarchy/
│       ├── index.ts                 # Barrel export
│       ├── buildTree.ts             # Transform ViewNode to TreeNode
│       └── __tests__/
│           └── buildTree.spec.ts
└── types/
    └── hierarchy.ts                 # TreeNode type definition
```

**Structure Decision**: Single project structure. New HierarchyPanel component in components/, new hierarchyStore for expand/collapse state, new domain/hierarchy for tree building utilities.

## Complexity Tracking

> No violations to justify. All constitution gates passed.

N/A
