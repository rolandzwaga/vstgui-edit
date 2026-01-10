# Implementation Plan: Lock and Hide Views

**Branch**: `034-lock-hide-views` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/034-lock-hide-views/spec.md`

## Summary

Add lock and hide functionality to the VSTGUI visual editor, enabling users to:
1. **Lock views** (Ctrl+L) to prevent accidental move/resize/delete operations while still allowing selection and property editing (except origin/size)
2. **Unlock views** (Ctrl+Shift+L) to resume editing
3. **Hide views** (Ctrl+H) to simplify complex layouts by temporarily removing views from canvas rendering
4. **Show all hidden views** (Ctrl+Shift+H) to reveal hidden elements
5. Visual indicators in both canvas (lock icon overlay) and hierarchy panel (lock/eye-slash icons)
6. Context menu integration for Lock/Unlock and Hide/Show operations
7. Full undo/redo support with atomic operations for bulk actions

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)
**Primary Dependencies**: SolidJS 1.9.10, Vite 7.3.0, solid-fontawesome 0.2.1
**Storage**: In-memory via SolidJS signals (editor-only state, not persisted to uidesc)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (modern ES2020+)
**Project Type**: Single SolidJS application
**Performance Goals**: 60fps during interactions, <100ms for lock/hide operations
**Constraints**: Support locking/hiding 100+ views without degradation (SC-007)
**Scale/Scope**: Complex synth UIs with many overlapping controls

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (PASSED)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | All tasks will follow RED-GREEN-REFACTOR |
| II. Technology Stack | PASS | Using SolidJS signals, existing patterns |
| III. Security & Compliance | PASS | No user data, no external APIs |
| IV. Code Quality | PASS | Biome/Stylelint/TypeScript checks required |
| V. GUI Editor Domain | PASS | Undo/redo required, immediate feedback |
| VI. Testing Standards | PASS | Unit tests for store, domain, components |
| XII. SolidJS Only | PASS | Using createSignal, no React patterns |
| XVIII. Zero Failing Tests | PASS | All tests must pass before completion |
| XXI. Static Imports Only | PASS | No dynamic imports planned |
| XXII. Honest Completion | PASS | Compliance table required |
| XXIII. Quality Gates | PASS | lint:css, check, typecheck before completion |

### Post-Design Re-Check (PASSED)

| Principle | Status | Verification |
|-----------|--------|--------------|
| I. Test-First Development | PASS | Quickstart includes testing strategy |
| II. Technology Stack | PASS | Uses SolidJS signals, FontAwesome icons |
| V. GUI Editor Domain | PASS | Full undo/redo in data-model.md |
| VI. Testing Standards | PASS | Unit + integration tests defined |
| XI. Dependency Management | PASS | No new dependencies required |
| XII. SolidJS Only | PASS | All patterns use createSignal/createMemo |
| XX. Technical Overview | PASS | Reuses existing store/domain patterns |
| XXI. Static Imports Only | PASS | All imports are static ES modules |

## Project Structure

### Documentation (this feature)

```text
specs/034-lock-hide-views/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Canvas/
│   │   ├── SelectionOverlay.tsx    # MODIFY: Hide resize handles for locked views
│   │   ├── ViewRectangle.tsx       # MODIFY: Render lock icon overlay, hidden filtering
│   │   ├── LockIndicator.tsx       # NEW: Lock icon overlay component
│   │   └── Canvas.tsx              # MODIFY: Filter hidden views from rendering
│   ├── HierarchyPanel/
│   │   ├── TreeNode.tsx            # MODIFY: Add lock/hidden icons
│   │   └── icons.ts                # MODIFY: Add lock and eye-slash icons
│   ├── ContextMenu/
│   │   └── ContextMenu.tsx         # MODIFY: Add Lock/Unlock, Hide/Show items
│   └── PropertiesPanel/
│       └── PropertiesPanel.tsx     # MODIFY: Block origin/size editing for locked views
├── domain/
│   └── lockHide/                   # NEW: Domain logic module
│       ├── index.ts                # Barrel exports
│       ├── lockOperations.ts       # Lock/unlock logic
│       ├── hideOperations.ts       # Hide/show logic
│       └── historyOperations.ts    # Undo/redo operation factories
├── stores/
│   └── lockHideStore.ts            # NEW: Lock and hide state management
├── types/
│   ├── lockHide.ts                 # NEW: Type definitions
│   └── history.ts                  # MODIFY: Add lock/hide operation types
└── hooks/
    └── canvas/
        └── useCanvasKeyboard.ts    # MODIFY: Add Ctrl+L, Ctrl+Shift+L, Ctrl+H, Ctrl+Shift+H
```

**Structure Decision**: Single SolidJS application with established patterns. New `lockHideStore` follows `guidesStore` pattern (signals + actions). Domain logic in `src/domain/lockHide/` follows existing domain module pattern.

## Complexity Tracking

> No constitution violations requiring justification.

| Aspect | Approach | Rationale |
|--------|----------|-----------|
| State Management | Single lockHideStore with two Sets | Simple, matches hierarchyStore pattern |
| History Operations | Single atomic operation for bulk actions | FR-019 requirement |
| Visual Indicators | SVG overlay on canvas + FontAwesome icons in hierarchy | Consistent with existing patterns |

## Key Design Decisions

### 1. State Storage Pattern
- Use two `Set<string>` signals: `lockedIds` and `hiddenIds`
- Editor-only state, reset on document load (FR-017, FR-018)
- Follow `hierarchyStore` pattern for Set management

### 2. Lock Behavior Integration Points
- `dragStore.startDrag`: Check if any selected view is locked, filter out locked views
- `resizeStore.startResize`: Block if target view is locked
- `useCanvasKeyboard`: Block nudge (arrow keys) for locked views
- `deleteSelectedViews`: Filter out locked views before deletion
- `SelectionOverlay`: Conditionally hide resize handles
- `PropertiesPanel`: Block origin/size attribute editing

### 3. Hide Behavior Integration Points
- `useCanvasData.renderableViews`: Filter out hidden views (and children of hidden containers)
- `useCanvasInteractions`: Clicks pass through hidden views
- `marquee.ts`: Exclude hidden views from marquee selection
- `HierarchyPanel.TreeNode`: Show hidden views with visual indicator, allow selection

### 4. Undo/Redo Strategy
- Bulk lock/hide creates single history operation
- Store captured view IDs and previous states
- Restore exact previous state on undo

### 5. Visual Indicators
- Canvas: Small lock icon SVG overlay in top-right corner of locked views (always visible)
- Hierarchy: FontAwesome `lock` icon for locked, `eye-slash` for hidden
- Selection: No resize handles for locked views, distinct border style

## Dependencies on Existing Code

| Component | Dependency | Usage |
|-----------|------------|-------|
| selectionStore | selectedIds | Get views to lock/hide |
| historyStore | pushOperation | Undo/redo support |
| hierarchyStore | Pattern reference | Set-based state pattern |
| guidesStore | Pattern reference | Store structure, history integration |
| documentStore | reset callback | Clear lock/hide state on document load |
| useCanvasKeyboard | Keyboard handlers | Add Ctrl+L, Ctrl+Shift+L, Ctrl+H, Ctrl+Shift+H |
| dragStore | startDrag | Filter locked views from drag operations |
| resizeStore | startResize | Block resize for locked views |
| SelectionOverlay | Resize handles | Conditionally hide for locked views |
| TreeNode | Icon rendering | Add lock/hidden indicators |
| ContextMenu | Menu items | Add Lock/Unlock, Hide/Show options |
