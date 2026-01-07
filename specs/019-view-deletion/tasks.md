# Tasks: View Deletion

**Input**: Design documents from `/specs/019-view-deletion/`
**Prerequisites**: plan.md (complete), spec.md (complete)

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

## Status Summary

**Key Finding**: Most functionality already exists! Only context menu (US6) needs implementation.

| User Story | Priority | Status |
|------------|----------|--------|
| US1: Delete Single View | P1 | ✅ ALREADY IMPLEMENTED |
| US2: Delete Multiple Views | P1 | ✅ ALREADY IMPLEMENTED |
| US3: Undo Deletion | P1 | ✅ ALREADY IMPLEMENTED |
| US4: Delete Container with Children | P2 | ✅ ALREADY IMPLEMENTED |
| US5: Delete from Hierarchy Panel | P2 | ✅ ALREADY IMPLEMENTED |
| US6: Context Menu Delete | P3 | ⬜ NEEDS IMPLEMENTATION |

**Existing Implementation**:
- `src/domain/canvas/viewOperations.ts`: `deleteSelectedViews()`, `createDeleteOperation()`
- `src/stores/documentStore.ts`: `removeView()`, `removeViews()`, `restoreView()`
- `src/hooks/canvas/useCanvasKeyboard.ts`: Delete/Backspace key handling (lines 240-252)
- `src/domain/canvas/__tests__/viewOperations.spec.ts`: Comprehensive tests (1133 lines)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US6)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify existing implementation before adding context menu

- [x] T001 Verify existing deletion tests pass by running `npm test -- --run src/domain/canvas/__tests__/viewOperations.spec.ts`
- [x] T002 Verify existing keyboard handling works by reviewing `src/hooks/canvas/useCanvasKeyboard.ts` lines 240-252

**Checkpoint**: Confirm existing functionality is working

---

## Phase 2: User Story 6 - Context Menu Delete (Priority: P3)

**Goal**: Add right-click context menu with "Delete" option for selected views

**Independent Test**: Right-click on a selected view, verify "Delete" option appears, click it, verify view is deleted

### Tests for User Story 6 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T003 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T004 [P] [US6] Write unit tests for context menu store in `src/stores/__tests__/contextMenuStore.spec.ts`
- [x] T005 [P] [US6] Write component tests for ContextMenu in `src/components/ContextMenu/__tests__/ContextMenu.spec.tsx`

### Implementation for User Story 6

- [x] T006 [P] [US6] Create context menu store in `src/stores/contextMenuStore.ts`
  - Signals: `isOpen`, `position: { x, y }`
  - Functions: `showContextMenu(x, y)`, `hideContextMenu()`
- [x] T007 [P] [US6] Create ContextMenu component in `src/components/ContextMenu/ContextMenu.tsx`
  - Uses floating-ui for positioning
  - Renders "Delete" menu item
  - Disabled state when no selection
  - Escape key to close
  - Click outside to close
- [x] T008 [P] [US6] Create ContextMenu styles in `src/components/ContextMenu/ContextMenu.module.css`
- [x] T009 [US6] Update `handleContextMenu` in `src/hooks/canvas/useCanvasInteractions.ts` to show context menu
  - Show menu at mouse position on right-click
  - Integrate with existing marquee cancellation logic
- [x] T010 [US6] Integrate ContextMenu component into Canvas in `src/components/Canvas/Canvas.tsx`
  - Add ContextMenu component to Canvas
  - Connect Delete option to `deleteSelectedViews` and history push
- [ ] T011 [US6] **Commit**: Stage and commit User Story 6 changes with descriptive message

**Checkpoint**: Context menu with Delete option should be fully functional

---

## Phase 3: Verification

**Purpose**: Verify all requirements from spec.md are met

- [x] T012 Update spec.md compliance table with evidence for all FR-xxx requirements
- [x] T013 Run full test suite: `npm test -- --run`

---

## Phase 4: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**⚠️ CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [x] TQG-1 **CSS Linting**: Run `npm run lint:css` - Fix ALL errors and warnings
- [x] TQG-2 **Code Quality**: Run `npm run check` - Fix ALL errors and warnings
- [x] TQG-3 **Type Safety**: Run `npm run typecheck` - Fix ALL errors and warnings
- [x] TQG-4 **Verify Clean**: Re-run all three commands to confirm zero issues remain

**If Quality Gates Fail**:
1. STOP - do not proceed to Git Verification
2. FIX all reported errors and warnings
3. RE-RUN the failing command(s)
4. REPEAT until all three commands pass cleanly

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with an appropriate message
- [ ] TFINAL **Confirm Clean**: Verify working tree is clean (nothing to commit)

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - verification only
- **Phase 2 (US6)**: Can start immediately - existing infrastructure is complete
- **Phase 3 (Verification)**: Depends on Phase 2 completion
- **Phase 4 (Quality Gates)**: Depends on Phase 3 completion
- **Phase Final**: Depends on Phase 4 completion

### Within User Story 6

1. T003: Read testing guide FIRST
2. T004, T005: Write tests in parallel (different files)
3. T006, T007, T008: Implement store and component in parallel (different files)
4. T009: Update interactions hook (depends on T006 store)
5. T010: Integrate into Canvas (depends on T007 component)
6. T011: Commit

### Parallel Opportunities

```bash
# Tests can run in parallel:
T004: Context menu store tests
T005: Context menu component tests

# Implementation can run in parallel:
T006: Context menu store
T007: Context menu component  
T008: Context menu styles
```

---

## Implementation Strategy

### MVP Already Complete

User Stories 1-5 are already implemented and tested. This feature adds polish (US6: context menu).

### Minimal Scope

Only 8 implementation tasks needed:
- 2 test files
- 3 new files (store, component, styles)
- 2 integration updates
- 1 commit

### Risk: Low

- Core deletion is already tested
- Context menu is additive UI layer
- No changes to business logic

---

## Notes

- **Existing tests**: 1133 lines in `viewOperations.spec.ts` - do not duplicate
- **Floating-ui**: Already a dependency, use for positioning
- **Pattern reference**: See `ViewToolbar` component for similar UI patterns
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
