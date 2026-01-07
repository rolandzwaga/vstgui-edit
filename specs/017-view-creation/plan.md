# Implementation Plan: View Creation & Deletion

**Branch**: `017-view-creation` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-view-creation/spec.md`

## Summary

Implement view lifecycle operations: Delete (Delete/Backspace), Duplicate (Ctrl+D), Copy/Cut/Paste (Ctrl+C/X/V), View Palette panel with categorized VSTGUI classes, and drag-to-create from palette to canvas. All operations support undo/redo via existing historyStore.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store, @floating-ui/dom 1.7.4 (existing)
**Storage**: In-memory SolidJS stores (clipboardStore for internal clipboard)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single SolidJS web application
**Performance Goals**: All operations < 100ms response time
**Constraints**: No system clipboard integration (internal clipboard only)
**Scale/Scope**: 30+ view classes in palette, typical documents ~50-200 views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | All implementations will follow RED-GREEN-REFACTOR |
| II. Technology Stack | ✅ PASS | SolidJS only, no React patterns |
| IV. Code Quality | ✅ PASS | Quality gates will be run at completion |
| V. GUI Editor Domain | ✅ PASS | All operations will be undoable |
| VI. Testing Standards | ✅ PASS | 80% coverage required |
| XI. Dependency Management | ✅ PASS | No new dependencies required |
| XII. Framework-Specific | ✅ PASS | SolidJS signals and stores only |
| XVIII. Zero Failing Tests | ✅ PASS | All tests must pass |
| XIX. VSTGUI Domain | ✅ PASS | Using UIDESC_GUIDE.md for view classes |
| XX. Technical Overview | ✅ PASS | CLAUDE.md consulted for existing utilities |
| XXI. Static Imports | ✅ PASS | No dynamic imports |
| XXII. Honest Completion | ✅ PASS | Compliance table required |
| XXIII. Quality Gates | ✅ PASS | lint:css, check, typecheck must pass |

## Project Structure

### Documentation (this feature)

```text
specs/017-view-creation/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/          # Requirements quality checklists
│   └── requirements.md  # Generated checklist
└── tasks.md             # Phase 2 output (from /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Canvas/
│   │   ├── Canvas.tsx           # Add keyboard handlers for Delete, Ctrl+D, clipboard
│   │   ├── DragPreview.tsx      # Existing - reuse for palette drag preview
│   │   └── __tests__/
│   ├── ViewPalette/             # NEW: View palette panel
│   │   ├── ViewPalette.tsx      # Main palette component
│   │   ├── ViewPalette.module.css
│   │   ├── PaletteCategory.tsx  # Collapsible category section
│   │   ├── PaletteItem.tsx      # Draggable view class item
│   │   └── __tests__/
│   ├── editors/                 # Existing editor components
│   └── Sidebar/
│       └── Sidebar.tsx          # Add ViewPalette below HierarchyPanel
├── domain/
│   ├── canvas/
│   │   └── viewOperations.ts    # NEW: Delete, duplicate, clipboard helpers
│   └── views/
│       ├── viewClasses.ts       # NEW: VSTGUI view class definitions
│       ├── viewDefaults.ts      # NEW: Default sizes per view class
│       └── __tests__/
├── hooks/
│   └── canvas/
│       └── useCanvasKeyboard.ts # NEW: Keyboard shortcut handling
├── stores/
│   ├── clipboardStore.ts        # NEW: Internal clipboard state
│   ├── paletteStore.ts          # NEW: Palette expand/search state
│   └── documentStore.ts         # Add: addView, removeView, duplicateView
└── types/
    └── views.ts                 # NEW: ViewClass, PaletteCategory types
```

**Structure Decision**: Extend existing single SolidJS application structure. New ViewPalette component in left sidebar below HierarchyPanel. New stores for clipboard and palette state. New domain utilities for view operations.

## Complexity Tracking

No constitution violations requiring justification.
