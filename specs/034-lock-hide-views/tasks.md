# Tasks: Lock and Hide Views

**Input**: Design documents from `/specs/034-lock-hide-views/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/lock-hide-api.ts, research.md, quickstart.md

**Tests**: Tests are included as per plan.md constitution check (Test-First Development).

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create types, store, and domain logic that all user stories depend on

- [ ] T001 Create lock/hide type definitions in src/types/lockHide.ts
- [ ] T002 Extend history types with lock/hide operation types in src/types/history.ts
- [ ] T003 [P] Create lockHideStore with signals and query functions in src/stores/lockHideStore.ts
- [ ] T004 [P] Create domain barrel export in src/domain/lockHide/index.ts
- [ ] T005 [P] Implement lock operations (calculateLockStateInfo, filterUnlockedViews, areAllLocked, isAnyLocked) in src/domain/lockHide/lockOperations.ts
- [ ] T006 [P] Implement hide operations (calculateHideStateInfo, shouldViewBeHidden, filterVisibleViews) in src/domain/lockHide/hideOperations.ts
- [ ] T007 [P] Implement history operation factories (createLockOperation, createUnlockOperation, createHideOperation, createShowAllOperation) in src/domain/lockHide/historyOperations.ts
- [ ] T008 Add FontAwesome icons (faLock, faEyeSlash) to src/components/HierarchyPanel/icons.ts
- [ ] T009 **Commit**: Stage and commit Phase 1 changes with message "feat(034): add lock/hide types, store, and domain logic"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T011 [P] Write unit tests for lockHideStore in src/stores/lockHideStore.spec.ts
- [ ] T012 [P] Write unit tests for lockOperations in src/domain/lockHide/lockOperations.spec.ts
- [ ] T013 [P] Write unit tests for hideOperations in src/domain/lockHide/hideOperations.spec.ts
- [ ] T014 [P] Write unit tests for historyOperations in src/domain/lockHide/historyOperations.spec.ts
- [ ] T015 Implement history-aware functions (lockSelectedWithHistory, unlockSelectedWithHistory, hideSelectedWithHistory, showAllWithHistory, toggleHideSelectedWithHistory) in src/stores/lockHideStore.ts
- [ ] T016 Implement resetLockHideStore and integrate with document loading in src/stores/lockHideStore.ts
- [ ] T017 **Commit**: Stage and commit Phase 2 changes with message "feat(034): complete lockHideStore with history support"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Lock Views to Prevent Accidental Modifications (Priority: P1)

**Goal**: Users can lock selected views using Ctrl+L to prevent move, resize, and delete operations while maintaining selection and property viewing

**Independent Test**: Lock a view with Ctrl+L, verify it cannot be moved, resized, or deleted. Visual lock indicator appears on canvas.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T018 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T019 [P] [US1] Write tests for Ctrl+L keyboard shortcut in src/hooks/canvas/useCanvasKeyboard.spec.ts
- [ ] T020 [P] [US1] Write tests for LockIndicator component in src/components/Canvas/LockIndicator.spec.tsx
- [ ] T020a [P] [US1] Write tests for LockIndicator visibility at zoom extremes (0.1x to 5.0x) in src/components/Canvas/LockIndicator.spec.tsx
- [ ] T021 [P] [US1] Write tests for SelectionOverlay hiding resize handles when locked in src/components/Canvas/SelectionOverlay.spec.tsx

### Implementation for User Story 1

- [ ] T022 [US1] Add Ctrl+L keyboard handler to lock selected views in src/hooks/canvas/useCanvasKeyboard.ts
- [ ] T023 [US1] Create LockIndicator SVG component in src/components/Canvas/LockIndicator.tsx
- [ ] T024 [US1] Add LockIndicator.module.css styles in src/components/Canvas/LockIndicator.module.css
- [ ] T025 [US1] Modify ViewRectangle to render LockIndicator for locked views in src/components/Canvas/ViewRectangle.tsx
- [ ] T026 [US1] Modify SelectionOverlay to hide resize handles for locked views (add isLocked prop) in src/components/Canvas/SelectionOverlay.tsx
- [ ] T027 [US1] Modify Canvas to pass isLocked prop to SelectionOverlay in src/components/Canvas/Canvas.tsx
- [ ] T028 [US1] Block drag operations for locked views in src/hooks/canvas/useCanvasInteractions.ts (filter locked from drag start)
- [ ] T029 [US1] Block resize operations for locked views in src/hooks/canvas/useCanvasInteractions.ts (check lock state in resize start)
- [ ] T030 [US1] Block delete operations for locked views in src/hooks/canvas/useCanvasKeyboard.ts (filter locked from delete)
- [ ] T031 [US1] Block arrow key nudge for locked views in src/hooks/canvas/useCanvasKeyboard.ts
- [ ] T032 [US1] Block origin/size property editing for locked views in src/components/PropertiesPanel/PropertiesPanel.tsx
- [ ] T033 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(034): implement view locking with Ctrl+L"

**Checkpoint**: User Story 1 is fully functional - locked views cannot be moved, resized, or deleted

---

## Phase 4: User Story 2 - Unlock Views to Resume Editing (Priority: P1)

**Goal**: Users can unlock previously locked views using Ctrl+Shift+L to resume normal editing

**Independent Test**: Lock a view, then unlock with Ctrl+Shift+L, verify it can be moved and resized again

### Tests for User Story 2

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T034 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T035 [P] [US2] Write tests for Ctrl+Shift+L keyboard shortcut in src/hooks/canvas/useCanvasKeyboard.spec.ts
- [ ] T036 [P] [US2] Write tests for multi-view unlock behavior in src/stores/lockHideStore.spec.ts

### Implementation for User Story 2

- [ ] T037 [US2] Add Ctrl+Shift+L keyboard handler to unlock selected views in src/hooks/canvas/useCanvasKeyboard.ts
- [ ] T038 [US2] Implement mixed-selection drag behavior (only unlocked views move) in src/hooks/canvas/useCanvasInteractions.ts
- [ ] T039 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(034): implement view unlocking with Ctrl+Shift+L"

**Checkpoint**: User Stories 1 AND 2 work - complete lock/unlock workflow functional

---

## Phase 5: User Story 3 - Hide Views to Simplify Complex Layouts (Priority: P2)

**Goal**: Users can hide selected views using Ctrl+H to simplify editing of complex, layered layouts

**Independent Test**: Hide a view with Ctrl+H, verify it disappears from canvas but remains in hierarchy panel

### Tests for User Story 3

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T040 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T041 [P] [US3] Write tests for Ctrl+H keyboard shortcut in src/hooks/canvas/useCanvasKeyboard.spec.ts
- [ ] T042 [P] [US3] Write tests for canvas filtering hidden views in src/components/Canvas/Canvas.spec.tsx
- [ ] T043 [P] [US3] Write tests for hidden container children filtering in src/domain/lockHide/hideOperations.spec.ts

### Implementation for User Story 3

- [ ] T044 [US3] Add Ctrl+H keyboard handler (toggle for single, hide-all for multi) in src/hooks/canvas/useCanvasKeyboard.ts
- [ ] T045 [US3] Modify Canvas to filter out hidden views from rendering in src/components/Canvas/Canvas.tsx
- [ ] T046 [US3] Implement isViewOrAncestorHidden logic for hidden container children in src/stores/lockHideStore.ts
- [ ] T047 [US3] Exclude hidden views from marquee selection in src/domain/canvas/marquee.ts
- [ ] T048 [US3] Exclude hidden views from click selection in src/hooks/canvas/useCanvasInteractions.ts
- [ ] T049 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(034): implement view hiding with Ctrl+H"

**Checkpoint**: User Story 3 is functional - hidden views do not render on canvas

---

## Phase 6: User Story 4 - Show Hidden Views (Priority: P2)

**Goal**: Users can reveal all hidden views using Ctrl+Shift+H

**Independent Test**: Hide views, press Ctrl+Shift+H, verify all hidden views reappear on canvas

### Tests for User Story 4

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T050 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T051 [P] [US4] Write tests for Ctrl+Shift+H keyboard shortcut in src/hooks/canvas/useCanvasKeyboard.spec.ts
- [ ] T052 [P] [US4] Write tests for showAllWithHistory in src/stores/lockHideStore.spec.ts

### Implementation for User Story 4

- [ ] T053 [US4] Add Ctrl+Shift+H keyboard handler to show all hidden views in src/hooks/canvas/useCanvasKeyboard.ts
- [ ] T054 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(034): implement show-all with Ctrl+Shift+H"

**Checkpoint**: User Stories 3 AND 4 work - complete hide/show workflow functional

---

## Phase 7: User Story 5 - Visual Indicators in Hierarchy Panel (Priority: P2)

**Goal**: Users can identify locked and hidden views by icons in the hierarchy panel

**Independent Test**: Lock and hide views, verify lock and eye-slash icons appear in hierarchy panel

### Tests for User Story 5

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T055 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T056 [P] [US5] Write tests for TreeNode lock/hidden icons in src/components/HierarchyPanel/TreeNode.spec.tsx

### Implementation for User Story 5

- [ ] T057 [US5] Add lock icon display for locked views in src/components/HierarchyPanel/TreeNode.tsx
- [ ] T058 [US5] Add eye-slash icon display for hidden views in src/components/HierarchyPanel/TreeNode.tsx
- [ ] T059 [US5] Add CSS styles for status icons in src/components/HierarchyPanel/TreeNode.module.css
- [ ] T060 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(034): add lock/hidden icons to hierarchy panel"

**Checkpoint**: User Story 5 is functional - hierarchy panel shows lock/hidden status

---

## Phase 8: User Story 6 - Select Hidden Views from Hierarchy (Priority: P3)

**Goal**: Users can select hidden views from the hierarchy panel to manage them

**Independent Test**: Hide a view, click on it in hierarchy panel, verify it becomes selected

### Tests for User Story 6

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T061 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T062 [P] [US6] Write tests for selecting hidden views via hierarchy in src/components/HierarchyPanel/TreeNode.spec.tsx
- [ ] T063 [P] [US6] Write tests for Ctrl+H toggle behavior on hidden selection in src/hooks/canvas/useCanvasKeyboard.spec.ts

### Implementation for User Story 6

- [ ] T064 [US6] Ensure hidden views remain clickable in hierarchy panel in src/components/HierarchyPanel/TreeNode.tsx
- [ ] T065 [US6] Implement toggle behavior for Ctrl+H on already-hidden single selection in src/stores/lockHideStore.ts
- [ ] T066 [US6] **Commit**: Stage and commit User Story 6 changes with message "feat(034): enable hidden view selection via hierarchy"

**Checkpoint**: User Story 6 is functional - hidden views manageable via hierarchy

---

## Phase 9: User Story 7 - Lock/Hide via Context Menu (Priority: P3)

**Goal**: Users can access lock/hide operations via right-click context menu

**Independent Test**: Right-click a view, verify Lock/Hide options appear and function correctly

### Tests for User Story 7

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T067 [US7] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T068 [P] [US7] Write tests for context menu Lock/Unlock items in src/components/ContextMenu/ContextMenu.spec.tsx
- [ ] T069 [P] [US7] Write tests for context menu Hide/Show items in src/components/ContextMenu/ContextMenu.spec.tsx
- [ ] T070 [P] [US7] Write tests for getLockMenuItem and getHideMenuItem functions in src/domain/lockHide/lockOperations.spec.ts

### Implementation for User Story 7

- [ ] T071 [US7] Add getLockMenuItem helper function in src/domain/lockHide/lockOperations.ts
- [ ] T072 [US7] Add getHideMenuItem helper function in src/domain/lockHide/hideOperations.ts
- [ ] T073 [US7] Add Lock/Unlock menu item to context menu in src/components/ContextMenu/ContextMenu.tsx
- [ ] T074 [US7] Add Hide/Show menu item to context menu in src/components/ContextMenu/ContextMenu.tsx
- [ ] T075 [US7] Add keyboard shortcut hints to menu items in src/components/ContextMenu/ContextMenu.tsx
- [ ] T076 [US7] **Commit**: Stage and commit User Story 7 changes with message "feat(034): add lock/hide to context menu"

**Checkpoint**: All user stories complete - full lock/hide feature implemented

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T077 [P] Add undo/redo integration tests for lock/hide operations in src/stores/lockHideStore.spec.ts
- [ ] T078 [P] Test state reset on document load in src/stores/lockHideStore.spec.ts
- [ ] T078a [P] Test paste-into-hidden-container edge case (pasted views should be hidden) in src/stores/lockHideStore.spec.ts
- [ ] T079 Run all tests and verify 100+ views performance (SC-007) - must maintain 60fps and <100ms operation time
- [ ] T080 Update CLAUDE.md with new store and domain documentation
- [ ] T081 Run quickstart.md validation scenarios
- [ ] T082 **Commit**: Stage and commit Polish phase changes with message "feat(034): polish and documentation updates"

---

## Phase Final-1: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [ ] TQG-1 **CSS Linting**: Run `npm run lint:css` - Fix ALL errors and warnings
- [ ] TQG-2 **Code Quality**: Run `npm run check` - Fix ALL errors and warnings
- [ ] TQG-3 **Type Safety**: Run `npm run typecheck` - Fix ALL errors and warnings
- [ ] TQG-4 **Verify Clean**: Re-run all three commands to confirm zero issues remain

**If Quality Gates Fail**:
1. STOP - do not proceed to Git Verification
2. FIX all reported errors and warnings
3. RE-RUN the failing command(s)
4. REPEAT until all three commands pass cleanly

**NO EXCEPTIONS**: Even "pre-existing" issues MUST be resolved. The spec is NOT complete until all quality gates pass.

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with an appropriate message
- [ ] TFINAL **Confirm Clean**: Verify working tree is clean (nothing to commit)

**CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1 and US2 (Lock/Unlock) can proceed together
  - US3 and US4 (Hide/Show) can proceed together after US1/US2
  - US5 (Visual Indicators) can proceed after US1/US3
  - US6 (Hierarchy Selection) depends on US3
  - US7 (Context Menu) depends on US1 and US3
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Shares keyboard handler with US1
- **User Story 3 (P2)**: Can start after Foundational - No dependencies on other stories
- **User Story 4 (P2)**: Can start after US3 (needs hide functionality first)
- **User Story 5 (P2)**: Can start after US1 and US3 (needs lock and hide state)
- **User Story 6 (P3)**: Depends on US3 (needs hide functionality)
- **User Story 7 (P3)**: Depends on US1 and US3 (needs both lock and hide)

### Within Each User Story

- **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
- Tests MUST be written and FAIL before implementation
- Core functionality before integration
- Story complete before moving to next priority

### Parallel Opportunities

Within Phase 1 (Setup):
- T003, T004, T005, T006, T007 can run in parallel

Within Phase 2 (Foundational):
- T011, T012, T013, T014 can run in parallel

Within each User Story:
- Test tasks marked [P] can run in parallel
- Implementation tasks typically sequential (file modifications may overlap)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch in parallel:
Task: "Create lockHideStore in src/stores/lockHideStore.ts"
Task: "Create domain barrel in src/domain/lockHide/index.ts"
Task: "Implement lockOperations in src/domain/lockHide/lockOperations.ts"
Task: "Implement hideOperations in src/domain/lockHide/hideOperations.ts"
Task: "Implement historyOperations in src/domain/lockHide/historyOperations.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Lock)
4. Complete Phase 4: User Story 2 (Unlock)
5. **STOP and VALIDATE**: Test lock/unlock workflow independently
6. Deploy/demo if ready - core protection feature works

### Incremental Delivery

1. Setup + Foundational - Foundation ready
2. Add US1 + US2 (Lock/Unlock) - Core protection (MVP!)
3. Add US3 + US4 (Hide/Show) - Layout simplification
4. Add US5 (Visual Indicators) - User feedback
5. Add US6 + US7 (Selection + Context Menu) - Discoverability
6. Each addition enhances without breaking previous functionality

### File Modification Summary

| File | User Stories | Modifications |
|------|--------------|---------------|
| src/types/lockHide.ts | Setup | NEW - Type definitions |
| src/types/history.ts | Setup | ADD - Operation types |
| src/stores/lockHideStore.ts | Setup, Foundation | NEW - State management |
| src/domain/lockHide/*.ts | Setup | NEW - Domain logic |
| src/hooks/canvas/useCanvasKeyboard.ts | US1-4, US6 | ADD - Ctrl+L/H handlers |
| src/hooks/canvas/useCanvasInteractions.ts | US1, US2, US3 | MODIFY - Filter locked/hidden |
| src/components/Canvas/LockIndicator.tsx | US1 | NEW - Lock icon overlay |
| src/components/Canvas/SelectionOverlay.tsx | US1 | MODIFY - Hide handles for locked |
| src/components/Canvas/ViewRectangle.tsx | US1 | MODIFY - Render lock indicator |
| src/components/Canvas/Canvas.tsx | US1, US3 | MODIFY - Pass isLocked, filter hidden |
| src/components/HierarchyPanel/TreeNode.tsx | US5, US6 | MODIFY - Status icons |
| src/components/HierarchyPanel/icons.ts | Setup | ADD - faLock, faEyeSlash |
| src/components/PropertiesPanel/PropertiesPanel.tsx | US1 | MODIFY - Block origin/size |
| src/components/ContextMenu/ContextMenu.tsx | US7 | ADD - Lock/Hide items |
| src/domain/canvas/marquee.ts | US3 | MODIFY - Exclude hidden |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests (SolidJS-specific patterns)
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- Lock/hide state is editor-only, not persisted to uidesc files (FR-017)
- Performance target: 60fps with 100+ views (SC-007)
