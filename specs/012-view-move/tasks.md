# Tasks: View Move

**Input**: Design documents from `/specs/012-view-move/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md

**Tests**: Following constitution principle I (Test-First Development), all tasks include tests written FIRST.

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create type definitions and domain utilities needed by multiple user stories

- [ ] T001 Create history operation types in `src/types/history.ts`
- [ ] T002 [P] Create move calculation utilities in `src/domain/canvas/move.ts`
- [ ] T003 [P] Create axis constraint utilities in `src/domain/canvas/constrainAxis.ts`
- [ ] T004 **Commit**: Stage and commit Phase 1 changes with message "feat(012): add types and domain utilities for view move"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core stores that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T006 [P] Write tests for historyStore in `src/stores/__tests__/historyStore.spec.ts`
- [ ] T007 [P] Write tests for dragStore in `src/stores/__tests__/dragStore.spec.ts`
- [ ] T008 Implement historyStore in `src/stores/historyStore.ts` (pass T006 tests)
- [ ] T009 Implement dragStore in `src/stores/dragStore.ts` (pass T007 tests)
- [ ] T010 [P] Write tests for updateViewOrigin in `src/stores/__tests__/documentStore.move.spec.ts`
- [ ] T011 Add updateViewOrigin action to `src/stores/documentStore.ts` (pass T010 tests)
- [ ] T012 **Commit**: Stage and commit Phase 2 changes with message "feat(012): add historyStore, dragStore, and updateViewOrigin"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Drag to Move (Priority: P1) 🎯 MVP

**Goal**: Drag selected views to reposition them on the canvas

**Independent Test**: Select a view, drag it to a new position, verify origin attribute updates

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T014 [P] [US1] Write drag initiation tests in `src/components/Canvas/__tests__/Canvas.move.spec.tsx`
- [ ] T015 [P] [US1] Write multi-view drag tests in `src/components/Canvas/__tests__/Canvas.move.spec.tsx`
- [ ] T016 [P] [US1] Write drag commit tests in `src/components/Canvas/__tests__/Canvas.move.spec.tsx`

### Implementation for User Story 1

- [ ] T017 [US1] Add drag detection to mousedown handler in `src/components/Canvas/Canvas.tsx` (FR-014: 3px click tolerance)
- [ ] T018 [US1] Add drag update logic to mousemove handler in `src/components/Canvas/Canvas.tsx`
- [ ] T019 [US1] Add drag commit logic to mouseup handler in `src/components/Canvas/Canvas.tsx` (FR-001, FR-002, FR-003)
- [ ] T020 [US1] Add move cursor feedback during drag in `src/components/Canvas/Canvas.tsx` (FR-013)
- [ ] T021 [US1] Verify all US1 tests pass and run `npx biome check --write . && npx tsc --noEmit`
- [ ] T022 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(012): implement drag-to-move for selected views"

**Checkpoint**: Drag-to-move is fully functional - can be tested independently

---

## Phase 4: User Story 2 - Undo/Redo (Priority: P1)

**Goal**: Undo and redo move operations with Ctrl+Z / Ctrl+Y

**Independent Test**: Move a view, press Ctrl+Z, verify position reverts, press Ctrl+Y, verify position restores

### Tests for User Story 2

- [ ] T023 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T024 [P] [US2] Write undo keyboard handler tests in `src/components/Canvas/__tests__/Canvas.undo.spec.tsx`
- [ ] T025 [P] [US2] Write redo keyboard handler tests in `src/components/Canvas/__tests__/Canvas.undo.spec.tsx`
- [ ] T026 [P] [US2] Write redo stack clearing tests in `src/components/Canvas/__tests__/Canvas.undo.spec.tsx`

### Implementation for User Story 2

- [ ] T027 [US2] Create move operation factory in `src/domain/canvas/move.ts` (creates HistoryOperation with undo/redo)
- [ ] T028 [US2] Integrate history push on drag commit in `src/components/Canvas/Canvas.tsx` (FR-006)
- [ ] T029 [US2] Add Ctrl+Z keyboard handler in `src/components/Canvas/Canvas.tsx` (FR-004)
- [ ] T030 [US2] Add Ctrl+Y and Ctrl+Shift+Z keyboard handlers in `src/components/Canvas/Canvas.tsx` (FR-005)
- [ ] T031 [US2] Verify redo stack clears on new operation (FR-007) - already in historyStore
- [ ] T032 [US2] Verify all US2 tests pass and run `npx biome check --write . && npx tsc --noEmit`
- [ ] T033 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(012): implement undo/redo for move operations"

**Checkpoint**: Undo/redo is fully functional - all moves are reversible

---

## Phase 5: User Story 3 - Arrow Key Nudge (Priority: P2)

**Goal**: Move selected views using arrow keys (1px) and Shift+Arrow (10px)

**Independent Test**: Select a view, press arrow key, verify 1px movement; press Shift+Arrow, verify 10px movement

### Tests for User Story 3

- [ ] T034 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T035 [P] [US3] Write arrow key nudge tests in `src/components/Canvas/__tests__/Canvas.nudge.spec.tsx`
- [ ] T036 [P] [US3] Write Shift+Arrow fast nudge tests in `src/components/Canvas/__tests__/Canvas.nudge.spec.tsx`
- [ ] T037 [P] [US3] Write multi-view nudge tests in `src/components/Canvas/__tests__/Canvas.nudge.spec.tsx`

### Implementation for User Story 3

- [ ] T038 [US3] Add arrow key handler in `src/components/Canvas/Canvas.tsx` (FR-008)
- [ ] T039 [US3] Add Shift+Arrow modifier detection for 10px nudge (FR-009)
- [ ] T040 [US3] Integrate nudge operations with history store (FR-015)
- [ ] T041 [US3] Verify all US3 tests pass and run `npx biome check --write . && npx tsc --noEmit`
- [ ] T042 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(012): implement arrow key nudge for selected views"

**Checkpoint**: Arrow key nudge is fully functional

---

## Phase 6: User Story 4 - Constrained Movement (Priority: P2)

**Goal**: Hold Shift while dragging to constrain movement to horizontal or vertical axis

**Independent Test**: Hold Shift while dragging, verify movement locks to one axis after 5px

### Tests for User Story 4

- [ ] T043 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T044 [P] [US4] Write axis constraint tests in `src/domain/canvas/__tests__/constrainAxis.spec.ts`
- [ ] T045 [P] [US4] Write Shift+drag integration tests in `src/components/Canvas/__tests__/Canvas.constrain.spec.tsx`

### Implementation for User Story 4

- [ ] T046 [US4] Implement determineConstraintAxis in `src/domain/canvas/constrainAxis.ts` (FR-011: 5px threshold)
- [ ] T047 [US4] Implement constrainDelta in `src/domain/canvas/constrainAxis.ts`
- [ ] T048 [US4] Integrate axis constraint into drag update in `src/components/Canvas/Canvas.tsx` (FR-010)
- [ ] T049 [US4] Verify all US4 tests pass and run `npx biome check --write . && npx tsc --noEmit`
- [ ] T050 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(012): implement shift-constrained axis movement"

**Checkpoint**: Constrained movement is fully functional

---

## Phase 7: User Story 5 - Ghost Preview (Priority: P3)

**Goal**: Display ghost preview of view positions during drag

**Independent Test**: Start dragging, verify semi-transparent preview appears at cursor position

### Tests for User Story 5

- [ ] T051 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T052 [P] [US5] Write DragPreview component tests in `src/components/Canvas/__tests__/DragPreview.spec.tsx`
- [ ] T053 [P] [US5] Write preview rendering integration tests in `src/components/Canvas/__tests__/Canvas.preview.spec.tsx`

### Implementation for User Story 5

- [ ] T054 [US5] Create DragPreview component in `src/components/Canvas/DragPreview.tsx` (FR-012)
- [ ] T055 [US5] Create DragPreview styles in `src/components/Canvas/DragPreview.module.css`
- [ ] T056 [US5] Integrate DragPreview into Canvas rendering in `src/components/Canvas/Canvas.tsx`
- [ ] T057 [US5] Verify all US5 tests pass and run `npx biome check --write . && npx tsc --noEmit`
- [ ] T058 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(012): implement ghost preview during drag"

**Checkpoint**: Ghost preview is fully functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, edge cases, and final verification

- [ ] T059 Add edge case handling: Escape to cancel drag in `src/components/Canvas/Canvas.tsx`
- [ ] T060 Add edge case handling: no-op when no selection for arrow keys
- [ ] T061 Update CLAUDE.md with historyStore and dragStore documentation
- [ ] T062 Update CLAUDE.md with move/constrainAxis domain utilities
- [ ] T063 Run full test suite: `npm test -- --run`
- [ ] T064 Run quality checks: `npx biome check --write . && npx tsc --noEmit`
- [ ] T065 Verify all 15 FR requirements are met - update spec.md compliance table
- [ ] T066 [P] Verify SC-001: Measure drag response time is under 100ms (manual test or browser devtools)
- [ ] T067 [P] Verify SC-004: Measure arrow key nudge response is under 16ms (single frame)
- [ ] T068 [P] Verify SC-005: Confirm ghost preview updates at 60fps during drag (no visible lag)
- [ ] T069 Verify SC-002 and SC-003 via undo tests (exact coordinate restoration, 100% reversibility)
- [ ] T070 **Commit**: Stage and commit Polish phase changes with message "docs(012): update CLAUDE.md and complete compliance verification"

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] T071 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] T072 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [ ] T073 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational completion
  - US1 (Drag) and US2 (Undo) are both P1 - can proceed in parallel
  - US3 (Nudge) and US4 (Constrain) are both P2 - can proceed after P1 or in parallel
  - US5 (Preview) is P3 - can proceed after core functionality
- **Polish (Phase 8)**: Depends on all user stories being complete
- **Git Verification (Final)**: Depends on Polish

### User Story Dependencies

- **User Story 1 (Drag)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (Undo)**: Can start after Foundational - Integrates with US1 but independently testable
- **User Story 3 (Nudge)**: Can start after Foundational - Reuses history integration from US2
- **User Story 4 (Constrain)**: Can start after Foundational - Enhances US1 drag behavior
- **User Story 5 (Preview)**: Can start after Foundational - Enhances US1 drag visuals

### Within Each User Story

1. **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md`
2. Write tests - ensure they FAIL
3. Implement code - ensure tests PASS
4. Run quality checks
5. Commit

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002 and T003 can run in parallel (different files)

**Phase 2 (Foundational)**:
- T006 and T007 can run in parallel (different test files)
- T010 can run in parallel with T008/T009

**User Stories** (after Foundational):
- US1 and US2 can be worked in parallel (both P1)
- US3 and US4 can be worked in parallel (both P2)
- All test tasks within a phase marked [P] can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch store tests in parallel:
Task: "Write tests for historyStore in src/stores/__tests__/historyStore.spec.ts"
Task: "Write tests for dragStore in src/stores/__tests__/dragStore.spec.ts"
Task: "Write tests for updateViewOrigin in src/stores/__tests__/documentStore.move.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Drag to Move)
4. Complete Phase 4: User Story 2 (Undo/Redo)
5. **STOP and VALIDATE**: Test drag + undo independently
6. This is a functional MVP - views can be moved and mistakes undone

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Drag) → Test independently → Functional but no undo
3. Add US2 (Undo) → Test independently → MVP complete!
4. Add US3 (Nudge) → Test independently → Precision editing
5. Add US4 (Constrain) → Test independently → Aligned editing
6. Add US5 (Preview) → Test independently → Polished UX

---

## Notes

- Constitution requires test-first development - all tests written before implementation
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
