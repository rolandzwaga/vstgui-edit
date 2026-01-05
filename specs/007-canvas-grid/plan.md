# Implementation Plan: Canvas Grid System

**Branch**: `007-canvas-grid` | **Date**: 2026-01-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-canvas-grid/spec.md`

## Summary

Implement a configurable grid overlay for the canvas that renders behind template views, respects pan/zoom transforms, supports G key toggle, configurable size presets (5-20px), major/minor line hierarchy, three visual styles (lines, dots, crosshairs), and theme-adaptive colors. A separate GridToolbar component provides UI controls alongside the existing ZoomToolbar.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10
**Primary Dependencies**: solid-js, solid-js/store (already installed - no new dependencies)
**Storage**: N/A (grid settings are session-only, in-memory via SolidJS signals)
**Testing**: Vitest 4.0.16 with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (modern browsers with SVG support)
**Project Type**: Single SPA - SolidJS application
**Performance Goals**: Grid renders within 16ms (60fps) at any zoom level 10%-500%
**Constraints**: No external dependencies; follow existing patterns from ZoomToolbar/canvasStore
**Scale/Scope**: Single canvas view, grid overlay with ~100-500 lines at typical zoom

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | All code will follow TDD (Red-Green-Refactor) |
| II. Technology Stack | ✅ PASS | SolidJS 1.9.10, TypeScript 5.9.3, Vitest 4.0.16 |
| III. Security & Compliance | ✅ PASS | No sensitive data; input validation for presets |
| IV. Code Quality | ✅ PASS | Biome + tsc --noEmit after each task |
| V. GUI Editor Domain | ✅ PASS | Real-time feedback, visual fidelity |
| VI. Testing Standards | ✅ PASS | 80%+ coverage, co-located tests |
| VII. Development Workflow | ✅ PASS | TDD workflow enforced |
| VIII. Performance & UX | ✅ PASS | 60fps target, <100ms response |
| IX. Accessibility | ✅ PASS | Keyboard navigation, ARIA labels |
| X. Research & Documentation | ✅ PASS | Official docs referenced |
| XI. Dependency Management | ✅ PASS | No new dependencies required |
| XII. Framework Restrictions | ✅ PASS | SolidJS only, no React patterns |
| XIII. Debugging Limit | ✅ PASS | 5 attempt limit acknowledged |
| XIV. Concise Communication | ✅ PASS | Brief technical updates |
| XV. Styling Architecture | ✅ PASS | CSS Modules, design tokens |
| XVI. Token Efficiency | ✅ PASS | No redundant documentation |
| XVIII. Zero Failing Tests | ✅ PASS | All tests must pass |
| XIX. Domain Knowledge | ✅ PASS | UIDESC_GUIDE.md consulted |
| XX. Technical Overview | ✅ PASS | CLAUDE.md consulted for patterns |
| XXI. Static Imports | ✅ PASS | Only static imports (except vi.importActual) |
| XXII. Honest Completion | ✅ PASS | All FR/SC requirements verified |

**Gate Result**: ✅ PASSED - No violations

## Project Structure

### Documentation (this feature)

```text
specs/007-canvas-grid/
├── plan.md              # This file
├── research.md          # Phase 0 output (minimal - patterns established)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Canvas/
│   │   ├── Canvas.tsx              # UPDATE: Add Grid component, G key handler
│   │   ├── Grid.tsx                # NEW: Grid overlay component
│   │   ├── __tests__/
│   │   │   ├── Canvas.spec.tsx     # UPDATE: G key toggle tests
│   │   │   └── Grid.spec.tsx       # NEW: Grid rendering tests
│   │   └── Grid.module.css         # NEW: Grid styles
│   ├── GridToolbar/
│   │   ├── index.ts                # NEW: Barrel export
│   │   ├── GridToolbar.tsx         # NEW: Grid controls UI
│   │   ├── GridToolbar.module.css  # NEW: Toolbar styles
│   │   └── __tests__/
│   │       └── GridToolbar.spec.tsx # NEW: Toolbar tests
│   └── MainToolbar/                 # NEW: Container for Zoom+Grid toolbars
│       ├── index.ts
│       ├── MainToolbar.tsx
│       ├── MainToolbar.module.css
│       └── __tests__/
│           └── MainToolbar.spec.tsx
├── domain/
│   └── canvas/
│       ├── grid.ts                 # NEW: Grid calculation utilities
│       └── __tests__/
│           └── grid.spec.ts        # NEW: Grid utility tests
├── stores/
│   └── gridStore.ts                # NEW: Grid state management
├── styles/
│   └── tokens.css                  # UPDATE: Add grid color tokens
└── types/
    └── grid.ts                     # NEW: Grid type definitions
```

**Structure Decision**: Follows existing single-project pattern. Grid component co-located with Canvas. GridToolbar mirrors ZoomToolbar pattern. New gridStore follows canvasStore pattern.

## Architecture Overview

### Component Hierarchy

```
App
└── MainToolbar (NEW - contains both toolbars)
    ├── ZoomToolbar (existing)
    └── GridToolbar (NEW)
└── Canvas (existing)
    └── Grid (NEW - SVG overlay behind views)
```

### State Flow

```
gridStore (signals)
├── isVisible: boolean (default: true)
├── size: number (default: 10, presets: 5,8,10,12,16,20)
└── style: 'lines' | 'dots' | 'crosshairs' (default: 'lines')

Actions:
├── toggleVisibility() - FR-003
├── setSize(size) - FR-006
├── setStyle(style) - FR-008
└── resetGrid() - reset to defaults
```

### Rendering Approach

Grid rendered as SVG `<pattern>` + `<rect>` for optimal performance:
- Pattern defines repeating unit (major/minor lines, dots, or crosshairs)
- Single rect fills canvas area with pattern
- Transform applied via parent wrapper (inherits pan/zoom)
- Theme colors via CSS custom properties

## Complexity Tracking

> No violations to justify - design follows established patterns.

| Aspect | Approach | Simpler Alternative Considered |
|--------|----------|-------------------------------|
| Grid rendering | SVG pattern | Direct line drawing (more DOM elements, slower) |
| State management | Separate gridStore | Combined with canvasStore (violates single responsibility) |
| UI controls | Separate GridToolbar | Add to ZoomToolbar (per clarification: separate toolbars) |
