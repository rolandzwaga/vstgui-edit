# Implementation Plan: Colors Panel

**Branch**: `021-colors-panel` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-colors-panel/spec.md`

## Summary

Implement a Colors panel in the sidebar to manage color resources in uidesc files. Users can view all defined colors with swatches, add new colors with validation, edit existing color names/values inline, delete colors with usage checking, and track which views reference each color. All operations integrate with the existing undo/redo system.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store (already installed)
**Storage**: In-memory SolidJS store (extends existing documentStore)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks  
**Target Platform**: Web browser (modern browsers supporting ES2020+)
**Project Type**: Single SPA (SolidJS application)
**Performance Goals**: Colors display within 100ms, live swatch preview within 50ms
**Constraints**: Must follow existing panel patterns (HierarchyPanel, PropertiesPanel)
**Scale/Scope**: Typically 5-50 colors per uidesc file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | All components/utilities require tests first |
| II. Technology Stack | ✅ PASS | SolidJS 1.9.10, no new dependencies |
| III. Security & Compliance | ✅ PASS | Input validation for hex colors |
| IV. Code Quality | ✅ PASS | Biome, Stylelint, TSC checks |
| V. GUI Editor Domain | ✅ PASS | Undo/redo for all color operations |
| VI. Testing Standards | ✅ PASS | Unit + integration tests required |
| XII. SolidJS Only | ✅ PASS | createSignal, createMemo, stores only |
| XV. Styling Architecture | ✅ PASS | CSS Modules, design tokens |
| XXI. Static Imports | ✅ PASS | No dynamic imports |
| XXIII. Quality Gates | ✅ PASS | lint:css, check, typecheck required |

## Project Structure

### Documentation (this feature)

```text
specs/021-colors-panel/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Requirements checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── ColorsPanel/             # NEW: Colors panel component
│       ├── ColorsPanel.tsx
│       ├── ColorsPanel.module.css
│       ├── ColorItem.tsx
│       ├── ColorItem.module.css
│       ├── ColorSwatch.tsx
│       ├── ColorSwatch.module.css
│       ├── AddColorButton.tsx
│       ├── EmptyState.tsx
│       └── __tests__/
│           ├── ColorsPanel.spec.tsx
│           ├── ColorItem.spec.tsx
│           ├── ColorSwatch.spec.tsx
│           └── AddColorButton.spec.tsx
├── domain/
│   └── colors/                  # NEW: Color domain utilities
│       ├── index.ts
│       ├── validation.ts        # Hex color validation
│       ├── parsing.ts           # Parse hex to RGBA
│       ├── formatting.ts        # Format colors for display
│       ├── usage.ts             # Track color references
│       ├── historyOperations.ts # Undo/redo for color ops
│       └── __tests__/
│           ├── validation.spec.ts
│           ├── parsing.spec.ts
│           ├── formatting.spec.ts
│           └── usage.spec.ts
├── stores/
│   └── documentStore.ts         # EXTEND: Add color mutation methods
└── styles/
    └── tokens.css               # EXTEND: Add color panel tokens
```

**Structure Decision**: Single project structure matching existing patterns. New ColorsPanel follows HierarchyPanel/PropertiesPanel conventions.

## Complexity Tracking

No constitution violations requiring justification.
