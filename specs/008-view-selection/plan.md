# Implementation Plan: View Selection

**Branch**: `008-view-selection` | **Date**: 2026-01-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-view-selection/spec.md`

## Summary

Implement click-based view selection on the canvas with visual feedback (selection border, 8-point resize handles), multi-selection via Shift+click, keyboard shortcuts (Ctrl+A, Escape), hover states with tooltips, and parent highlighting when child views are selected. Resize handles are visual-only (no resize functionality).

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, @floating-ui/dom 1.7.4 (tooltips)
**Storage**: In-memory SolidJS store (selectionStore)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)
**Project Type**: Single SolidJS web application
**Performance Goals**: <100ms selection response, 16ms visual updates, 60fps during interactions
**Constraints**: Support up to 500 views without lag, 4:1 visual contrast ratio
**Scale/Scope**: Single canvas with nested view hierarchies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | All tasks will follow Red-Green-Refactor |
| II. Technology Stack | ✅ PASS | Using SolidJS, no new dependencies needed |
| III. Security & Compliance | ✅ PASS | No user data, no external APIs |
| IV. Code Quality | ✅ PASS | Will run biome check, tsc after each task |
| V. GUI Editor Domain | ✅ PASS | Visual fidelity, real-time feedback, accessibility |
| VI. Testing Standards | ✅ PASS | Unit + component tests, 80% coverage target |
| VII. Development Workflow | ✅ PASS | TDD workflow will be followed |
| VIII. Performance & UX | ✅ PASS | 100ms response, 60fps targets |
| IX. Accessibility | ✅ PASS | Keyboard navigation, ARIA labels, contrast |
| X. Research & Documentation | ✅ PASS | Official SolidJS docs will be used |
| XI. Dependency Management | ✅ PASS | No new dependencies required |
| XII. Framework Restrictions | ✅ PASS | SolidJS only, no React patterns |
| XVIII. Zero Failing Tests | ✅ PASS | All tests must pass before completion |
| XXI. Static Imports ONLY | ✅ PASS | No dynamic imports |
| XXII. Honest Completion | ✅ PASS | All FR/SC requirements will be verified |

## Project Structure

### Documentation (this feature)

```text
specs/008-view-selection/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── stores/
│   ├── selectionStore.ts          # NEW: Selection state management
│   └── __tests__/
│       └── selectionStore.spec.ts # Tests for selection store
├── domain/
│   └── canvas/
│       ├── hitTest.ts             # NEW: Point-in-view hit testing
│       ├── mouseToCanvas.ts       # NEW: Coordinate transform utility
│       ├── ancestors.ts           # NEW: Parent ID lookup utility
│       └── __tests__/
│           ├── hitTest.spec.ts    # Tests for hit testing
│           ├── mouseToCanvas.spec.ts # Tests for coordinate transform
│           └── ancestors.spec.ts  # Tests for ancestor lookup
├── components/
│   └── Canvas/
│       ├── Canvas.tsx             # MODIFY: Add click/hover handlers
│       ├── Canvas.module.css      # MODIFY: Add selection/hover styles
│       ├── ViewRectangle.tsx      # MODIFY: Selection/hover visual state
│       ├── ViewRectangle.module.css # MODIFY: Add selection/hover styles
│       ├── SelectionOverlay.tsx   # NEW: Selection border + handles
│       ├── SelectionOverlay.module.css # NEW: Selection overlay styles
│       ├── HoverTooltip.tsx       # NEW: Tooltip component
│       ├── HoverTooltip.module.css # NEW: Tooltip styles
│       └── __tests__/
│           ├── Canvas.selection.spec.tsx
│           ├── Canvas.multiselect.spec.tsx
│           ├── Canvas.keyboard.spec.tsx
│           ├── ViewRectangle.selection.spec.tsx
│           ├── ViewRectangle.hover.spec.tsx
│           ├── ViewRectangle.parent.spec.tsx
│           ├── SelectionOverlay.spec.tsx
│           ├── SelectionOverlay.cursor.spec.tsx
│           └── HoverTooltip.spec.tsx
├── styles/
│   └── tokens.css                 # MODIFY: Add selection/hover tokens
└── types/
    └── selection.ts               # NEW: Selection type definitions
```

**Structure Decision**: Single SolidJS application following existing patterns. New files co-located with related functionality. Selection store follows canvasStore/gridStore pattern.

## Architecture Overview

### Data Flow

```
Mouse Event → Canvas
    ↓
mouseToCanvas() → Canvas coordinates
    ↓
hitTest() → View ID or null
    ↓
selectionStore.select() → Update selection state
    ↓
ViewRectangle reads selectionStore → Apply visual styles
    ↓
SelectionOverlay renders → Border + 8 handles
```

### State Management

```
selectionStore (SolidJS signals)
├── selectedIds: Set<string>      # Currently selected view IDs
├── hoveredId: string | null      # View under cursor
└── Actions:
    ├── select(id)                # Single selection (clears others)
    ├── toggleSelect(id)          # Shift+click behavior
    ├── selectAll()               # Ctrl+A
    ├── clearSelection()          # Escape or click empty
    └── setHovered(id | null)     # Mouse enter/leave
```

### Key Components

1. **selectionStore**: Reactive state for selection and hover
2. **hitTest()**: Find topmost view at canvas coordinates (z-order aware)
3. **mouseToCanvas()**: Convert viewport coords to canvas space (pan/zoom aware)
4. **SelectionOverlay**: SVG group with border + 8 resize handles
5. **HoverTooltip**: Floating tooltip using @floating-ui/dom

### Integration Points

- **Canvas.tsx**: Mouse/keyboard event handlers
- **ViewRectangle.tsx**: Hover highlight styling
- **canvasStore**: Pan offset and zoom level for coordinate transform
- **documentStore**: Access to view data for tooltips

## Complexity Tracking

> No constitution violations requiring justification.

| Decision | Rationale |
|----------|-----------|
| Separate SelectionOverlay component | Cleaner separation; selection visuals rendered on top of all views |
| @floating-ui/dom for tooltips | Already in dependencies; handles positioning edge cases |
| Set<string> for selection | O(1) lookup for large selection sets (up to 500 views) |
