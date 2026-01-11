# Implementation Plan: Find/Replace

**Branch**: `035-find-replace` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/035-find-replace/spec.md`

## Summary

Add Find/Replace functionality for searching views by class name or attribute values, navigating through results with keyboard shortcuts (Ctrl+F, F3, Shift+F3), and replacing attribute values with full undo support. The panel appears as a floating VS Code-style panel at the top-right of the editor viewport.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode
**Primary Dependencies**: SolidJS 1.9.10, @floating-ui/dom 1.7.4 (existing)
**Storage**: In-memory SolidJS stores (searchStore)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (desktop)
**Project Type**: Single SPA
**Performance Goals**:
- Search results update within 200ms (150ms debounce + <50ms search)
- Replace All on 100 views completes within 1 second
- 60fps during result navigation
**Constraints**:
- No external dependencies (debounce implemented manually)
- Static imports only
- SolidJS reactive primitives only
**Scale/Scope**: ~50-200 views per template, ~30-50 attributes per view

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | WILL COMPLY | Tests before implementation |
| II. Technology Stack | WILL COMPLY | SolidJS, Vitest, existing deps |
| III. Security & Compliance | WILL COMPLY | Input validation on search/replace |
| IV. Code Quality | WILL COMPLY | Quality gates at completion |
| V. GUI Editor Domain | WILL COMPLY | Undo/redo for replace operations |
| VI. Testing Standards | WILL COMPLY | 80% coverage, TESTING-GUIDE |
| XI. Dependency Management | WILL COMPLY | No new dependencies |
| XII. Framework Restrictions | WILL COMPLY | SolidJS only, no React |
| XVIII. Zero Failing Tests | WILL COMPLY | All tests pass before completion |
| XXI. Static Imports Only | WILL COMPLY | No dynamic imports |
| XXII. Honest Completion | WILL COMPLY | All FR-xxx/SC-xxx verified |
| XXIII. Quality Gates | WILL COMPLY | lint:css, check, typecheck |

## Project Structure

### Documentation (this feature)

```text
specs/035-find-replace/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── stores/
│   └── searchStore.ts              # NEW: Search state management
├── domain/
│   └── search/
│       ├── index.ts                # NEW: Module barrel export
│       ├── searchQuery.ts          # NEW: Query parsing (class/attribute)
│       ├── searchEngine.ts         # NEW: Substring matching algorithm
│       ├── searchResults.ts        # NEW: Result formatting
│       ├── replaceOperations.ts    # NEW: Replace with validation
│       └── historyOperations.ts    # NEW: Undo/redo for replace
├── components/
│   └── FindPanel/
│       ├── FindPanel.tsx           # NEW: Main panel component
│       ├── FindPanel.module.css    # NEW: Panel styling
│       ├── SearchInput.tsx         # NEW: Debounced search input
│       ├── ResultsList.tsx         # NEW: Scrollable results list
│       ├── ResultItem.tsx          # NEW: Single result row
│       ├── NavigationButtons.tsx   # NEW: Find Next/Previous
│       ├── CategoryFilter.tsx      # NEW: View category filter
│       ├── ReplaceControls.tsx     # NEW: Replace input & buttons
│       └── __tests__/
│           ├── FindPanel.spec.tsx
│           ├── SearchInput.spec.tsx
│           ├── ResultsList.spec.tsx
│           ├── ResultItem.spec.tsx
│           ├── NavigationButtons.spec.tsx
│           ├── CategoryFilter.spec.tsx
│           └── ReplaceControls.spec.tsx
└── types/
    └── search.ts                   # NEW: Search type definitions
```

## Complexity Tracking

No constitution violations identified. The feature uses existing architectural patterns:
- Store pattern (matches selectionStore, canvasStore)
- Domain utility pattern (matches domain/alignment, domain/guides)
- Component pattern (matches AlignmentToolbar floating panel)
- History operation pattern (matches existing undo/redo)
