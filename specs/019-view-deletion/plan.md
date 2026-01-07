# Implementation Plan: View Deletion

**Branch**: `019-view-deletion` | **Date**: 2026-01-07 | **Spec**: `specs/019-view-deletion/spec.md`
**Input**: Feature specification from `/specs/019-view-deletion/spec.md`

## Summary

Enable users to delete selected views via keyboard (Delete/Backspace) and context menu, with full undo/redo support and recursive container deletion.

**Key Finding**: Core deletion infrastructure already exists. This feature requires minimal implementation - mainly adding context menu with Delete option.

## Technical Context

**Language/Version**: TypeScript with strict mode
**Primary Dependencies**: SolidJS 1.9.x, @floating-ui/dom (for context menu positioning)
**Storage**: N/A (in-memory document state)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Browser (modern browsers)
**Project Type**: Single SPA
**Performance Goals**: < 100ms response time for deletion operations
**Constraints**: Must support undo/redo, must protect root template from deletion

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| SolidJS ONLY | ✅ PASS | Using SolidJS signals/stores, no React |
| Test-First Development | ✅ PASS | Tests exist for core deletion functionality |
| Static Imports ONLY | ✅ PASS | No dynamic imports needed |
| Quality Gates | ⬜ PENDING | Will verify at completion |
| Zero Failing Tests | ⬜ PENDING | Will verify at completion |

## Project Structure

### Documentation (this feature)

```text
specs/019-view-deletion/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Canvas/
│   │   └── Canvas.tsx           # Uses context menu
│   └── ContextMenu/             # NEW: Context menu component
│       ├── ContextMenu.tsx
│       ├── ContextMenu.module.css
│       └── __tests__/
│           └── ContextMenu.spec.tsx
├── domain/
│   └── canvas/
│       ├── viewOperations.ts    # EXISTING: deleteSelectedViews, createDeleteOperation
│       └── __tests__/
│           └── viewOperations.spec.ts  # EXISTING: comprehensive delete tests
├── hooks/
│   └── canvas/
│       └── useCanvasKeyboard.ts # EXISTING: Delete/Backspace handling already implemented
└── stores/
    ├── documentStore.ts         # EXISTING: removeView, removeViews, restoreView
    └── contextMenuStore.ts      # NEW: Context menu state
```

**Structure Decision**: Context menu will be a new component with its own store for visibility/position management.

## Existing Infrastructure (Research Finding)

### Already Implemented

1. **Core Deletion** (`src/domain/canvas/viewOperations.ts`):
   - `deleteSelectedViews()` - Removes all selected views, clears selection
   - `createDeleteOperation()` - Creates undo/redo operation

2. **Document Store** (`src/stores/documentStore.ts`):
   - `removeView(viewId)` - Removes single view, returns info for undo
   - `removeViews(viewIds)` - Removes multiple views (deepest first)
   - `restoreView(info)` - Restores a removed view (for undo)
   - Root template protection (line 480-482): `removeView` returns null for root

3. **Keyboard Handling** (`src/hooks/canvas/useCanvasKeyboard.ts`):
   - Delete/Backspace key binding (lines 240-252)
   - Integrates with history store for undo/redo

4. **Tests** (`src/domain/canvas/__tests__/viewOperations.spec.ts`):
   - 344 lines of comprehensive tests covering:
     - Single view deletion
     - Multiple view deletion  
     - Container with children deletion
     - Root template protection
     - Undo/redo operations
     - Selection clearing

### Missing Implementation

1. **Context Menu Component** (FR-010):
   - New `ContextMenu` component with floating-ui positioning
   - "Delete" option that triggers deletion
   - Context menu store for state management

2. **Context Menu Integration**:
   - Update `handleContextMenu` in `useCanvasInteractions.ts`
   - Show context menu on right-click when view is selected

## Implementation Tasks

### Task 1: Context Menu Store (TDD)

Create `src/stores/contextMenuStore.ts`:
- `isOpen: boolean` - visibility state
- `position: { x: number, y: number }` - screen position
- `showContextMenu(position)` - show menu at position
- `hideContextMenu()` - hide menu

### Task 2: Context Menu Component (TDD)

Create `src/components/ContextMenu/`:
- Uses floating-ui for positioning
- Renders "Delete" option (disabled when no selection)
- Keyboard accessible (Escape to close)
- Click outside to close

### Task 3: Integration

Update `useCanvasInteractions.ts`:
- Show context menu on right-click when views are selected
- Connect Delete option to `deleteSelectedViews`

### Task 4: Quality Gates

- Run `npm run lint:css`
- Run `npm run check`
- Run `npm run typecheck`
- Run `npm test -- --run`

## Complexity Tracking

No constitution violations to justify - this is a minimal feature building on existing infrastructure.

## Risk Assessment

**Low Risk**: 
- Core deletion already fully tested and working
- Only adding UI layer (context menu)
- No changes to core business logic

**Mitigation**:
- Reuse existing test patterns from viewOperations.spec.ts
- Follow existing component patterns (e.g., ViewToolbar)
