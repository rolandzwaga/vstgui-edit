# Implementation Plan: Styled View Mode

**Branch**: `042-styled-view-mode` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/042-styled-view-mode/spec.md`

## Summary

Add a "Styled" view mode to the canvas that renders views with their actual visual properties (background-color, frame-color, frame-width) from the uidesc file, as opposed to the current "Wireframe" mode. The feature includes a toolbar toggle button with eye icon, P keyboard shortcut, color reference resolution (document colors, predefined colors), adaptive selection/hover overlays based on luminance, and preference persistence.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)
**Primary Dependencies**: SolidJS 1.9.10, Vite 7.3.0, solid-fontawesome 0.2.1
**Storage**: SolidJS stores (in-memory), localStorage (preferences persistence)
**Testing**: Vitest 4.0.16 with @solidjs/testing-library 0.8.10
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Browser (modern browsers supporting CSS custom properties)
**Project Type**: Web application (SolidJS SPA)
**Performance Goals**: Mode toggle response time under 100ms (instant visual feedback)
**Constraints**: No new dependencies, must integrate with existing preferences system
**Scale/Scope**: ~30+ view classes, typical documents have 10-100 views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | All domain functions, stores, and components will have tests written before implementation |
| II. Technology Stack | PASS | Using existing SolidJS, Vitest, Biome stack |
| IV. Code Quality | PASS | Will run quality gates after each task |
| V. GUI Editor Domain | PASS | Immediate visual feedback on mode toggle |
| VI. Testing Standards | PASS | Unit + component tests with 80%+ coverage |
| XI. Dependency Management | PASS | No new dependencies required |
| XII. Framework-Specific | PASS | SolidJS patterns only (createSignal, createMemo, createStore) |
| XVIII. Zero Failing Tests | PASS | All tests must pass before completion |
| XIX. Domain Knowledge | PASS | Will leverage UIDESC_GUIDE.md for color formats |
| XX. Technical Overview | PASS | CLAUDE.md consulted for existing patterns |
| XXI. Static Imports Only | PASS | No dynamic imports will be used |
| XXII. Honest Completion | PASS | All FR-xxx and SC-xxx will be verified |
| XXIII. Quality Gates | PASS | lint:css, check, typecheck must pass |
| XXIV. Test Suite Efficiency | PASS | npm test run once per task |

## Project Structure

### Documentation (this feature)

```text
specs/042-styled-view-mode/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Canvas/
│   │   ├── ViewRectangle.tsx          # MODIFY: Add styled rendering
│   │   ├── SelectionOverlay.tsx       # MODIFY: Add adaptive overlay colors
│   │   └── TemplateBounds.tsx         # MODIFY: Add template background color
│   └── ViewModeToolbar/               # NEW: View mode toggle toolbar
│       ├── ViewModeToolbar.tsx
│       ├── ViewModeToolbar.module.css
│       └── __tests__/
│           └── ViewModeToolbar.spec.tsx
├── domain/
│   ├── viewMode/                      # NEW: View mode domain logic
│   │   ├── index.ts
│   │   ├── colorResolution.ts         # Color reference resolution
│   │   ├── luminance.ts               # Luminance calculation for adaptive overlays
│   │   ├── styledViewProps.ts         # Build styled view properties
│   │   └── __tests__/
│   │       ├── colorResolution.spec.ts
│   │       ├── luminance.spec.ts
│   │       └── styledViewProps.spec.ts
│   └── shortcuts/
│       └── registry.ts                # MODIFY: Add P shortcut
├── stores/
│   └── viewModeStore.ts               # NEW: View mode state management
├── types/
│   ├── viewMode.ts                    # NEW: View mode types
│   └── preferences.ts                 # MODIFY: Add canvas preferences
└── hooks/
    └── canvas/
        └── useCanvasKeyboard.ts       # MODIFY: Add P shortcut handler
```

**Structure Decision**: Single web application following existing project structure. New domain module for view mode logic, new store for view mode state, and modifications to existing Canvas components.

## Complexity Tracking

No constitution violations requiring justification.

## Post-Design Constitution Re-Check

*Re-validated after Phase 1 design completion.*

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. Test-First Development | PASS | Test contracts defined for all domain functions and stores |
| II. Technology Stack | PASS | Design uses only existing stack (SolidJS, Vitest) |
| IV. Code Quality | PASS | CSS tokens defined, consistent patterns with existing code |
| V. GUI Editor Domain | PASS | Mode toggle provides immediate visual feedback |
| VI. Testing Standards | PASS | Test patterns documented in quickstart.md |
| XI. Dependency Management | PASS | No new dependencies - uses existing FontAwesome icons |
| XII. Framework-Specific | PASS | createStore for viewModeStore, createMemo for computed props |
| XVIII. Zero Failing Tests | PASS | All existing tests unaffected by new code |
| XIX. Domain Knowledge | PASS | Color formats from UIDESC_GUIDE properly handled |
| XX. Technical Overview | PASS | Patterns consistent with existing stores (gridStore, preferencesStore) |
| XXI. Static Imports Only | PASS | All imports in contracts are static |
| XXII. Honest Completion | PASS | All 21 FRs and 8 SCs mapped to implementation tasks |
| XXIII. Quality Gates | PASS | Quality gate checklist in quickstart.md |
| XXIV. Test Suite Efficiency | PASS | Test patterns avoid redundant test runs |

**Constitution Check Status**: ALL GATES PASSED - Ready for Phase 2 task generation.

## Generated Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Research | `specs/042-styled-view-mode/research.md` | 10 research questions resolved |
| Data Model | `specs/042-styled-view-mode/data-model.md` | Entity definitions and relationships |
| Type Contract | `specs/042-styled-view-mode/contracts/viewMode.types.ts` | Core type definitions |
| Store Contract | `specs/042-styled-view-mode/contracts/viewModeStore.ts` | Store API contract |
| Color Resolution | `specs/042-styled-view-mode/contracts/colorResolution.ts` | Color resolution API |
| Luminance | `specs/042-styled-view-mode/contracts/luminance.ts` | Luminance calculation API |
| Styled Props | `specs/042-styled-view-mode/contracts/styledViewProps.ts` | Styled props builder API |
| Component | `specs/042-styled-view-mode/contracts/ViewModeToolbar.tsx` | Toolbar component contract |
| Quickstart | `specs/042-styled-view-mode/quickstart.md` | Implementation guide and checklist |

## Requirements Mapping

| Requirement | Implementation Component |
|-------------|-------------------------|
| FR-001 | viewModeStore, ViewModeToolbar |
| FR-002 | ViewModeToolbar with eye icon |
| FR-003 | useCanvasKeyboard.ts P handler |
| FR-004 | shortcuts/registry.ts |
| FR-005 | preferencesStore canvas.viewMode |
| FR-006 | colorResolution.ts document colors |
| FR-007 | colorResolution.ts predefined colors |
| FR-008 | ViewRectangle styled rendering |
| FR-009 | ViewRectangle frame-color |
| FR-010 | ViewRectangle frame-width |
| FR-011 | styledViewProps.ts wireframe fallback |
| FR-012 | ViewRectangle label hiding |
| FR-013 | SelectionOverlay adaptive overlay |
| FR-014 | ViewRectangle hover adaptive overlay |
| FR-015 | TemplateBounds background |
| FR-016 | SVG z-index (render order) |
| FR-017 | ViewRectangle opacity attribute |
| FR-018 | styledViewProps.ts transparent handling |
| FR-019 | preferencesStore initialization |
| FR-020 | ViewModeToolbar active state/tooltip |
| FR-021 | luminance.ts calculation |

