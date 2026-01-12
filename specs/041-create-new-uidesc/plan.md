# Implementation Plan: Create New uidesc File

**Branch**: `041-create-new-uidesc` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/041-create-new-uidesc/spec.md`

## Summary

Add "Create New" functionality to the home page upload zone. Users can click a button to open a modal dialog where they configure initial template dimensions (width/height) and select a container class. On confirmation, the system creates a valid uidesc document structure and transitions to the editor view.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode
**Primary Dependencies**: SolidJS 1.9.10, Vite 7.3.0
**Storage**: In-memory via SolidJS stores (documentStore)
**Testing**: Vitest 4.0.16 with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Browser (desktop-first, cross-platform)
**Project Type**: Single SPA with component-based architecture
**Performance Goals**: Dialog opens instantly (<100ms), document creation <100ms
**Constraints**: No external dependencies, 10000x10000 max dimensions
**Scale/Scope**: Single dialog component, validation utilities, document creation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | Tests will be written before implementation |
| II. Technology Stack | PASS | SolidJS, TypeScript strict, Vitest - all correct |
| IV. Code Quality | PASS | Will run biome, stylelint, tsc after each task |
| VI. Testing Standards | PASS | Unit tests for validation, component tests for dialog |
| XII. SolidJS Only | PASS | No React patterns - using createSignal, createEffect |
| XV. Styling Architecture | PASS | CSS Modules co-located with component |
| XVIII. Zero Failing Tests | PASS | All tests must pass |
| XXI. Static Imports Only | PASS | No dynamic imports |
| XXIII. Quality Gates | PASS | lint:css, check, typecheck required |

## Project Structure

### Documentation (this feature)

```text
specs/041-create-new-uidesc/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── CreateNewDialog/
│       ├── CreateNewDialog.tsx           # Modal dialog component
│       ├── CreateNewDialog.module.css    # Dialog styles
│       └── __tests__/
│           └── CreateNewDialog.spec.tsx  # Component tests
├── domain/
│   └── createNew/
│       ├── validation.ts                 # Width/height validation
│       ├── documentFactory.ts            # Creates uidesc document
│       ├── containerClasses.ts           # Container class list
│       └── __tests__/
│           ├── validation.spec.ts
│           ├── documentFactory.spec.ts
│           └── containerClasses.spec.ts
├── stores/
│   └── documentStore.ts                  # Extended with createNewDocument
└── types/
    └── createNew.ts                      # Type definitions
```

**Structure Decision**: Following existing patterns from AddControlTagDialog and FormatChangeDialog. Domain logic separated from UI components. Dialog state managed via component signals (no separate store needed for this simple dialog).

## Complexity Tracking

> No violations. Design follows existing patterns.

| Item | Decision | Rationale |
|------|----------|-----------|
| Store vs Props | Props only | Dialog is simple, parent manages state |
| Validation Location | domain/createNew | Follows controlTags pattern |
| Document Creation | documentStore extension | Reuses existing setDocumentForTest pattern |

## Constitution Re-Check (Post Phase 1 Design)

| Principle | Status | Design Compliance |
|-----------|--------|-------------------|
| I. Test-First Development | PASS | Test files specified in project structure |
| II. Technology Stack | PASS | Using SolidJS primitives, TypeScript, Vitest |
| IV. Code Quality | PASS | CSS Modules, domain separation, type safety |
| VI. Testing Standards | PASS | Unit tests for validation/factory, component tests for dialog |
| XII. SolidJS Only | PASS | createSignal, createEffect, Show, For - no React |
| XV. Styling Architecture | PASS | .module.css co-located with component |
| XVIII. Zero Failing Tests | PASS | No test modifications that weaken coverage |
| XXI. Static Imports Only | PASS | All imports static, no lazy/dynamic loading |
| XXIII. Quality Gates | PASS | lint:css, check, typecheck in implementation |

## Phase Completion Status

| Phase | Status | Artifacts |
|-------|--------|-----------|
| Phase 0: Research | COMPLETE | research.md |
| Phase 1: Design | COMPLETE | data-model.md, contracts/, quickstart.md |
| Phase 2: Tasks | PENDING | tasks.md (via /speckit.tasks) |

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `src/types/createNew.ts` | Type definitions for ContainerClass, NewDocumentConfig |
| `src/domain/createNew/validation.ts` | validateDimension, validateDimensions functions |
| `src/domain/createNew/documentFactory.ts` | createDocument function |
| `src/domain/createNew/index.ts` | Barrel export |
| `src/components/CreateNewDialog/CreateNewDialog.tsx` | Dialog component |
| `src/components/CreateNewDialog/CreateNewDialog.module.css` | Dialog styles |
| `src/components/CreateNewDialog/index.ts` | Barrel export |
| `src/domain/createNew/__tests__/validation.spec.ts` | Validation tests |
| `src/domain/createNew/__tests__/documentFactory.spec.ts` | Factory tests |
| `src/components/CreateNewDialog/__tests__/CreateNewDialog.spec.tsx` | Component tests |

### Modified Files

| File | Changes |
|------|---------|
| `src/stores/documentStore.ts` | Add createNewDocument function |
| `src/stores/__tests__/documentStore.spec.ts` | Tests for createNewDocument |
| `src/components/UploadZone/UploadZone.tsx` | Add Create New button, dialog integration |
| `src/components/UploadZone/UploadZone.module.css` | Add buttonGroup, buttonSecondary styles |
| `src/components/UploadZone/__tests__/UploadZone.spec.tsx` | Tests for Create New integration |

## Key Design Decisions

1. **No separate store** - Dialog state managed via component signals (simpler)
2. **Validation in domain** - Follows existing pattern from controlTags
3. **documentStore extension** - createNewDocument function reuses existing reset logic
4. **Template name "view"** - Matches addTemplate default behavior
5. **Background "~ BlackCColor"** - Provides visible canvas boundary
6. **Props-based dialog** - Parent (UploadZone) owns open/close state
