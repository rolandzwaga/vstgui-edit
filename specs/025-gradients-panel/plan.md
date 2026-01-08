# Implementation Plan: Gradients Panel

**Branch**: `025-gradients-panel` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/025-gradients-panel/spec.md`

## Summary

Add a Gradients Panel to the left sidebar for viewing, creating, editing, and deleting gradient resources. The panel follows the established pattern from Colors, Fonts, and Bitmaps panels, with the unique addition of a visual gradient stop editor allowing users to drag color stops on a gradient bar.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store (already installed)
**Storage**: N/A (in-memory state via existing documentStore)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web (modern browsers)
**Project Type**: Single (SolidJS SPA)
**Performance Goals**: <100ms visual feedback for gradient interactions (SC-003)
**Constraints**: No new dependencies; follows existing panel patterns
**Scale/Scope**: Typical uidesc files have 1-10 gradients

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | TDD workflow enforced in tasks |
| II. Technology Stack | ✅ PASS | SolidJS 1.9.10, no new deps |
| IV. Code Quality | ✅ PASS | Biome, Stylelint, TSC gates |
| V. GUI Editor Requirements | ✅ PASS | Undo/redo, real-time feedback |
| VI. Testing Standards | ✅ PASS | 80% coverage target |
| XII. Framework Restrictions | ✅ PASS | SolidJS only, no React |
| XIX. Domain Knowledge | ✅ PASS | Uses existing GradientsDefinition type |
| XX. Technical Overview | ✅ PASS | CLAUDE.md consulted |
| XXI. Static Imports | ✅ PASS | No dynamic imports |
| XXIII. Quality Gates | ✅ PASS | lint:css, check, typecheck |

## Project Structure

### Documentation (this feature)

```text
specs/025-gradients-panel/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── gradients/
│       ├── validation.ts         # Name validation (FR-009)
│       ├── formatting.ts         # Display formatting
│       ├── usage.ts              # Find gradient references (FR-020, FR-021)
│       ├── historyOperations.ts  # Undo/redo operations (FR-022)
│       ├── stopCalculations.ts   # Color interpolation, position normalization (FR-023)
│       ├── index.ts              # Barrel export
│       └── __tests__/
│           ├── validation.spec.ts
│           ├── formatting.spec.ts
│           ├── usage.spec.ts
│           ├── historyOperations.spec.ts
│           └── stopCalculations.spec.ts
├── components/
│   └── GradientsPanel/
│       ├── GradientsPanel.tsx      # Main panel with CollapsibleSection
│       ├── GradientItem.tsx        # Expandable gradient row (FR-003, FR-010)
│       ├── GradientStopEditor.tsx  # Visual stop editor (FR-011-FR-016)
│       ├── GradientPreview.tsx     # Horizontal gradient preview bar (FR-003)
│       ├── AddGradientButton.tsx   # Add button (FR-005)
│       ├── EmptyState.tsx          # Empty state (FR-004)
│       ├── index.ts
│       └── __tests__/
│           ├── GradientsPanel.spec.tsx
│           ├── GradientItem.spec.tsx
│           ├── GradientStopEditor.spec.tsx
│           ├── GradientPreview.spec.tsx
│           ├── AddGradientButton.spec.tsx
│           └── EmptyState.spec.tsx
├── stores/
│   └── documentStore.ts            # Extended with gradient CRUD
└── types/
    └── history.ts                  # Extended with gradient operation types
```

**Structure Decision**: Single project following existing pattern. Domain logic in `src/domain/gradients/`, UI components in `src/components/GradientsPanel/`. Store extensions in existing `documentStore.ts`.

## Complexity Tracking

No violations to justify. Feature follows established patterns from Colors, Fonts, Bitmaps panels.
