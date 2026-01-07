# Tasks: View Creation & Deletion

**Input**: Design documents from `/specs/017-view-creation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Following TDD approach per project constitution (Principle I: Test-First Development)

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create type definitions and shared utilities needed by all user stories

- [x] T001 [P] Create ViewClass and PaletteCategory types in `src/types/views.ts`
- [x] T002 [P] Create view class registry with all 32 VSTGUI classes in `src/domain/views/viewClasses.ts`
- [x] T003 [P] Create view default sizes mapping in `src/domain/views/viewDefaults.ts`
- [x] T004 Create unique ID generator function in `src/domain/views/idGenerator.ts`
- [x] T005 **Commit**: Stage and commit Phase 1 changes with message "feat(017): add view class registry and types"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create stores and domain utilities that multiple user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T007 [P] Create clipboardStore with copy/cut/paste/clear actions in `src/stores/clipboardStore.ts`
- [ ] T008 [P] Write tests for clipboardStore in `src/stores/__tests__/clipboardStore.spec.ts`
- [ ] T009 [P] Create paletteStore with expand/collapse/search state in `src/stores/paletteStore.ts`
- [ ] T010 [P] Write tests for paletteStore in `src/stores/__tests__/paletteStore.spec.ts`
- [ ] T011 Add removeView and removeViews functions to documentStore in `src/stores/documentStore.ts`
- [ ] T012 Add duplicateView function to documentStore in `src/stores/documentStore.ts`
- [ ] T013 Add addView function to documentStore in `src/stores/documentStore.ts`
- [ ] T014 Write tests for new documentStore functions in `src/stores/__tests__/documentStore.spec.ts`
- [ ] T015 Create serializeView and deserializeView utilities in `src/domain/views/serialization.ts`
- [ ] T016 Write tests for serialization utilities in `src/domain/views/__tests__/serialization.spec.ts`
- [ ] T017 **Commit**: Stage and commit Phase 2 changes with message "feat(017): add clipboard/palette stores and document mutations"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Delete Selected Views (Priority: P1) 🎯 MVP

**Goal**: Users can delete selected views using Delete/Backspace key with undo support

**Independent Test**: Select one or more views on canvas, press Delete key, verify views are removed. Press Ctrl+Z to restore.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T018 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T019 [P] [US1] Write tests for delete operation (single view, multiple views, container with children) in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T020 [P] [US1] Write tests for delete keyboard handler in `src/hooks/canvas/__tests__/useCanvasKeyboard.spec.ts`

### Implementation for User Story 1

- [ ] T021 [US1] Create deleteViews domain function in `src/domain/canvas/viewOperations.ts`
- [ ] T022 [US1] Create delete history operation factory in `src/domain/canvas/viewOperations.ts`
- [ ] T023 [US1] Create useCanvasKeyboard hook with Delete/Backspace handling in `src/hooks/canvas/useCanvasKeyboard.ts`
- [ ] T024 [US1] Integrate useCanvasKeyboard into Canvas component in `src/components/Canvas/Canvas.tsx`
- [ ] T025 [US1] Add isTextInputFocused check to skip shortcuts when typing in `src/hooks/canvas/useCanvasKeyboard.ts`
- [ ] T026 [US1] Verify FR-001 to FR-004 pass (delete requirements)
- [ ] T027 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(017): implement view deletion with Delete/Backspace"

**Checkpoint**: Delete operation fully functional and testable independently

---

## Phase 4: User Story 2 - Duplicate Selected Views (Priority: P2)

**Goal**: Users can duplicate selected views using Ctrl+D with 10px offset and undo support

**Independent Test**: Select views, press Ctrl+D, verify duplicates appear offset by 10px with same properties.

### Tests for User Story 2 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T028 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T029 [P] [US2] Write tests for duplicate operation in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T030 [P] [US2] Write tests for Ctrl+D keyboard handler in `src/hooks/canvas/__tests__/useCanvasKeyboard.spec.ts`

### Implementation for User Story 2

- [ ] T031 [US2] Create duplicateViews domain function in `src/domain/canvas/viewOperations.ts`
- [ ] T032 [US2] Create duplicate history operation factory in `src/domain/canvas/viewOperations.ts`
- [ ] T033 [US2] Add Ctrl+D handler to useCanvasKeyboard in `src/hooks/canvas/useCanvasKeyboard.ts`
- [ ] T034 [US2] Ensure duplicates are selected after creation in `src/domain/canvas/viewOperations.ts`
- [ ] T035 [US2] Verify FR-005 to FR-010 pass (duplicate requirements)
- [ ] T036 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(017): implement view duplication with Ctrl+D"

**Checkpoint**: Duplicate operation fully functional and testable independently

---

## Phase 5: User Story 3 - Copy, Cut, and Paste Views (Priority: P3)

**Goal**: Users can copy/cut views and paste them with Ctrl+C/X/V, supporting multiple pastes with incremental offsets

**Independent Test**: Select views, copy with Ctrl+C, paste with Ctrl+V multiple times, verify each paste creates new copies at incremental offsets.

### Tests for User Story 3 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T037 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T038 [P] [US3] Write tests for copy operation in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T039 [P] [US3] Write tests for cut operation (copy + delete) in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T040 [P] [US3] Write tests for paste operation with incremental offsets in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T041 [P] [US3] Write tests for Ctrl+C/X/V handlers in `src/hooks/canvas/__tests__/useCanvasKeyboard.spec.ts`

### Implementation for User Story 3

- [ ] T042 [US3] Create copyViews function using clipboardStore in `src/domain/canvas/viewOperations.ts`
- [ ] T043 [US3] Create cutViews function (copy + delete) in `src/domain/canvas/viewOperations.ts`
- [ ] T044 [US3] Create pasteViews function with offset calculation in `src/domain/canvas/viewOperations.ts`
- [ ] T045 [US3] Create paste history operation factory in `src/domain/canvas/viewOperations.ts`
- [ ] T046 [US3] Add Ctrl+C, Ctrl+X, Ctrl+V handlers to useCanvasKeyboard in `src/hooks/canvas/useCanvasKeyboard.ts`
- [ ] T047 [US3] Implement incremental offset for multiple pastes (10px, 20px, 30px...) in `src/stores/clipboardStore.ts`
- [ ] T048 [US3] Ensure pasted views are selected after paste in `src/domain/canvas/viewOperations.ts`
- [ ] T049 [US3] Verify FR-011 to FR-018 pass (clipboard requirements)
- [ ] T050 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(017): implement copy/cut/paste with Ctrl+C/X/V"

**Checkpoint**: Clipboard operations fully functional and testable independently

---

## Phase 6: User Story 4 - View Palette Panel (Priority: P4)

**Goal**: Display a collapsible, searchable palette panel with all VSTGUI view classes organized by category

**Independent Test**: Open editor, verify palette panel shows categorized view classes, categories collapse/expand, search filters the list.

### Tests for User Story 4 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T051 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T052 [P] [US4] Write tests for ViewPalette component in `src/components/ViewPalette/__tests__/ViewPalette.spec.tsx`
- [ ] T053 [P] [US4] Write tests for PaletteCategory component in `src/components/ViewPalette/__tests__/PaletteCategory.spec.tsx`
- [ ] T054 [P] [US4] Write tests for PaletteItem component in `src/components/ViewPalette/__tests__/PaletteItem.spec.tsx`

### Implementation for User Story 4

- [ ] T055 [P] [US4] Create ViewPalette component in `src/components/ViewPalette/ViewPalette.tsx`
- [ ] T056 [P] [US4] Create ViewPalette styles in `src/components/ViewPalette/ViewPalette.module.css`
- [ ] T057 [P] [US4] Create PaletteCategory component (collapsible) in `src/components/ViewPalette/PaletteCategory.tsx`
- [ ] T058 [P] [US4] Create PaletteCategory styles in `src/components/ViewPalette/PaletteCategory.module.css`
- [ ] T059 [P] [US4] Create PaletteItem component in `src/components/ViewPalette/PaletteItem.tsx`
- [ ] T060 [P] [US4] Create PaletteItem styles in `src/components/ViewPalette/PaletteItem.module.css`
- [ ] T061 [US4] Add search input to ViewPalette with filtering logic in `src/components/ViewPalette/ViewPalette.tsx`
- [ ] T062 [US4] Integrate ViewPalette into Sidebar below HierarchyPanel in `src/components/Sidebar/Sidebar.tsx`
- [ ] T063 [US4] Verify FR-019 to FR-022 pass (palette requirements)
- [ ] T064 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(017): add view palette panel with categories and search"

**Checkpoint**: View palette fully functional and testable independently

---

## Phase 7: User Story 5 - Drag from Palette to Create (Priority: P5)

**Goal**: Users can drag view classes from palette onto canvas to create new views with ghost preview

**Independent Test**: Drag a view class from palette onto canvas, verify new view is created at drop location with correct class and default size.

### Tests for User Story 5 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T065 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T066 [P] [US5] Write tests for drag start from PaletteItem in `src/components/ViewPalette/__tests__/PaletteItem.spec.tsx`
- [ ] T067 [P] [US5] Write tests for drop on canvas in `src/components/Canvas/__tests__/Canvas.spec.tsx`
- [ ] T068 [P] [US5] Write tests for container detection in `src/domain/canvas/__tests__/viewOperations.spec.ts`

### Implementation for User Story 5

- [ ] T069 [US5] Add draggable="true" and onDragStart to PaletteItem in `src/components/ViewPalette/PaletteItem.tsx`
- [ ] T070 [US5] Create findContainerAtPoint function for drop target detection in `src/domain/canvas/viewOperations.ts`
- [ ] T071 [US5] Add onDragOver and onDrop handlers to Canvas in `src/components/Canvas/Canvas.tsx`
- [ ] T072 [US5] Create createView function with default attributes in `src/domain/canvas/viewOperations.ts`
- [ ] T073 [US5] Create create history operation factory in `src/domain/canvas/viewOperations.ts`
- [ ] T074 [US5] Add ghost preview during drag using existing DragPreview pattern in `src/components/Canvas/Canvas.tsx`
- [ ] T075 [US5] Ensure created view is selected after creation in `src/domain/canvas/viewOperations.ts`
- [ ] T076 [US5] Handle drag cancel (release outside canvas) in `src/components/Canvas/Canvas.tsx`
- [ ] T077 [US5] Verify FR-023 to FR-029 pass (drag-to-create requirements)
- [ ] T078 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(017): implement drag-from-palette view creation"

**Checkpoint**: All user stories complete and independently testable

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanup, and validation

- [ ] T079 [P] Update CLAUDE.md with new utilities (clipboardStore, paletteStore, viewOperations) in `CLAUDE.md`
- [ ] T080 [P] Add barrel export for ViewPalette in `src/components/ViewPalette/index.ts`
- [ ] T081 [P] Add barrel export for view domain in `src/domain/views/index.ts`
- [ ] T082 Run quickstart.md validation scenarios manually
- [ ] T083 Verify all success criteria SC-001 to SC-007 pass
- [ ] T084 Update spec.md compliance table with evidence for all FR-xxx and SC-xxx
- [ ] T085 **Commit**: Stage and commit Polish phase changes with message "feat(017): add documentation and barrel exports"

---

## Phase Final-1: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**⚠️ CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [ ] TQG-1 **CSS Linting**: Run `npm run lint:css` - Fix ALL errors and warnings
- [ ] TQG-2 **Code Quality**: Run `npm run check` - Fix ALL errors and warnings
- [ ] TQG-3 **Type Safety**: Run `npm run typecheck` - Fix ALL errors and warnings
- [ ] TQG-4 **Verify Clean**: Re-run all three commands to confirm zero issues remain

**If Quality Gates Fail**:
1. STOP - do not proceed to Git Verification
2. FIX all reported errors and warnings
3. RE-RUN the failing command(s)
4. REPEAT until all three commands pass cleanly

**NO EXCEPTIONS**: Even "pre-existing" issues MUST be resolved.

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL-1 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL-2 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [ ] TFINAL-3 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Delete): No dependencies on other user stories
  - US2 (Duplicate): No dependencies on other user stories
  - US3 (Clipboard): No dependencies on other user stories
  - US4 (Palette): No dependencies on other user stories
  - US5 (Drag-Create): Depends on US4 (Palette) for UI
- **Polish (Phase 8)**: Depends on all user stories being complete
- **Quality Gates (Phase Final-1)**: Depends on Polish completion
- **Git Verification (Phase Final)**: Depends on Quality Gates passing

### User Story Dependencies

```
           ┌─────────────────────────────────────────────┐
           │           Phase 2: Foundational              │
           └─────────────────────────────────────────────┘
                              │
        ┌─────────┬──────────┼──────────┬─────────┐
        ▼         ▼          ▼          ▼         │
      US1       US2        US3        US4        │
    (Delete)  (Dup)     (Clipboard) (Palette)    │
        │         │          │          │         │
        ▼         ▼          ▼          ▼         │
     [Done]    [Done]     [Done]     [Done] ──────┤
                                                  ▼
                                                US5
                                            (Drag-Create)
                                                  │
                                                  ▼
                                               [Done]
```

### Parallel Opportunities

**Phase 1 (Setup)**:
- T001, T002, T003 can all run in parallel

**Phase 2 (Foundational)**:
- T007+T008 (clipboardStore) can run parallel to T009+T010 (paletteStore)
- T015+T016 (serialization) can run parallel to store work

**User Stories (after Phase 2)**:
- US1, US2, US3, US4 can all start in parallel
- US5 must wait for US4 (palette UI required)

**Within Each User Story**:
- Tests marked [P] can run in parallel
- Component + styles marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup ✓
2. Complete Phase 2: Foundational ✓
3. Complete Phase 3: User Story 1 (Delete) ✓
4. **STOP and VALIDATE**: Test delete operation independently
5. Demo: Users can now delete views with undo support

### Incremental Delivery

1. MVP: Delete (US1) → Users can remove unwanted views
2. Add: Duplicate (US2) → Users can quickly copy views
3. Add: Clipboard (US3) → Users can copy/cut/paste
4. Add: Palette (US4) → Users can discover view types
5. Add: Drag-Create (US5) → Users can create new views
6. Each increment adds value without breaking previous functionality

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
- Tests MUST fail before implementation (TDD)
- **Commit after each phase** - atomic commits per user story
- Stop at any checkpoint to validate story independently
