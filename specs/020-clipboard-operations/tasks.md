# Tasks: Clipboard Operations

**Input**: Design documents from `/specs/020-clipboard-operations/`
**Prerequisites**: plan.md, spec.md, research.md

**Important Context**: Core clipboard functionality already exists in the codebase from feature 017-view-creation. This task list focuses on verification, gap-filling, and test coverage.

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Verification & Gap Analysis

**Purpose**: Verify existing implementation against spec requirements before adding new code

- [ ] T001 Review existing clipboard tests in `src/stores/__tests__/clipboardStore.spec.ts`
- [ ] T002 [P] Review existing view operations tests in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T003 [P] Review existing keyboard tests in `src/hooks/canvas/__tests__/useCanvasKeyboard.spec.ts`
- [ ] T004 Document test coverage gaps against FR-001 through FR-015 requirements
- [ ] T005 **Commit**: Stage and commit Phase 1 analysis notes (if any documentation added)

---

## Phase 2: User Story 1 - Copy and Paste Views (Priority: P1) 🎯 MVP

**Goal**: Verify copy/paste works correctly with offset and multi-view support

**Independent Test**: Select a view, press Ctrl+C, press Ctrl+V, verify duplicate appears offset from original

### Tests for User Story 1

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T006 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T007 [P] [US1] Test FR-001: copySelectedViews stores data in clipboard in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T008 [P] [US1] Test FR-002: container with children serializes recursively in `src/domain/views/__tests__/serialization.spec.ts`
- [ ] T009 [P] [US1] Test FR-003: pasteViews creates new views with unique IDs in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T010 [P] [US1] Test FR-004: pasted views have 10px offset from original in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T011 [P] [US1] Test FR-005: multiple pasted views preserve relative positions in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T012 [P] [US1] Test FR-012: copy with empty selection returns false in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T013 [P] [US1] Test FR-014: pasted views are selected after paste in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T014 [P] [US1] Test FR-015: all attributes preserved except ID in `src/domain/views/__tests__/serialization.spec.ts`
- [ ] T015 [P] [US1] Test SC-005: incremental paste offset (paste count * 10px) in `src/domain/canvas/__tests__/viewOperations.spec.ts`

### Implementation for User Story 1 (if tests reveal gaps)

- [ ] T016 [US1] Fix any failing tests by updating implementation in `src/domain/canvas/viewOperations.ts`
- [ ] T017 [US1] **Commit**: Stage and commit User Story 1 changes with descriptive message

**Checkpoint**: Copy/Paste fully functional and tested

---

## Phase 3: User Story 2 - Cut and Paste Views (Priority: P1)

**Goal**: Verify cut removes view, stores in clipboard, and supports undo

**Independent Test**: Select a view, press Ctrl+X, verify removed, Ctrl+Z restores it

### Tests for User Story 2

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T018 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T019 [P] [US2] Test FR-006: cutSelectedViews copies to clipboard AND removes view in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T020 [P] [US2] Test FR-007: undo cut restores view to original position in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T021 [P] [US2] Test FR-013: cutting root template returns empty array in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T022 [P] [US2] Test: cut then paste sequence works correctly in `src/domain/canvas/__tests__/viewOperations.spec.ts`

### Implementation for User Story 2 (if tests reveal gaps)

- [ ] T023 [US2] Fix any failing tests by updating implementation
- [ ] T024 [US2] **Commit**: Stage and commit User Story 2 changes with descriptive message

**Checkpoint**: Cut/Paste fully functional with undo support

---

## Phase 4: User Story 3 - Duplicate Views (Priority: P1)

**Goal**: Verify Ctrl+D duplicates selected views with offset

**Independent Test**: Select a view, press Ctrl+D, verify duplicate appears offset

### Tests for User Story 3

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T025 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T026 [P] [US3] Test FR-009: duplicateSelectedViews creates offset copy in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T027 [P] [US3] Test: duplicate multiple views preserves relative positions in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T028 [P] [US3] Test: undo duplicate removes duplicated view in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [ ] T029 [P] [US3] Test: duplicate with empty selection returns empty array in `src/domain/canvas/__tests__/viewOperations.spec.ts`

### Implementation for User Story 3 (if tests reveal gaps)

- [ ] T030 [US3] Fix any failing tests by updating implementation
- [ ] T031 [US3] **Commit**: Stage and commit User Story 3 changes with descriptive message

**Checkpoint**: Duplicate fully functional with undo support

---

## Phase 5: User Story 4 - Paste into Container (Priority: P2)

**Goal**: When a container is selected, pasted views become children of that container

**Independent Test**: Copy a view, select a CViewContainer, paste, verify view is child of container

### Tests for User Story 4

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T032 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T033 [P] [US4] Test FR-010: paste into selected container makes view child of container in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [x] T034 [P] [US4] Test FR-011: paste with no selection uses original parent in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [x] T035 [P] [US4] Test FR-011: paste with non-container selected uses parent of selected view in `src/domain/canvas/__tests__/viewOperations.spec.ts`

### Implementation for User Story 4

- [x] T036 [US4] Implement paste-into-container logic in `src/domain/canvas/viewOperations.ts` - check selectionStore for selected container
- [x] T037 [US4] Update `pasteViews()` to use selected container as parent when applicable
- [ ] T038 [US4] **Commit**: Stage and commit User Story 4 changes with descriptive message

**Checkpoint**: Paste-into-container functional

---

## Phase 6: User Story 5 - Paste at Mouse Pointer Position (Priority: P3)

**Goal**: Pasted views appear near mouse pointer position instead of fixed offset

**Clarification**: "Cursor" means **mouse pointer**, not a text cursor (this app has no text cursor on the canvas).

**Constraint**: Only paste at pointer position if pointer is **inside the main container bounds**. If outside (toolbar, panel, empty canvas), fall back to standard offset paste.

**Independent Test**: Copy view, move mouse pointer inside template bounds, paste, verify view appears at pointer

### Tests for User Story 5

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T039 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T040 [P] [US5] Test: paste at mouse pointer centers view group at pointer position when pointer is inside container in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [x] T040b [P] [US5] Test: paste falls back to offset logic when pointer is outside container bounds in `src/domain/canvas/__tests__/viewOperations.spec.ts`

### Implementation for User Story 5

- [x] T041 [US5] Add mouse pointer position tracking (local signal in Canvas component - no global store needed)
- [x] T042 [US5] Update `pasteViews()` to accept optional pointer position parameter in `src/domain/canvas/viewOperations.ts`
- [x] T042b [US5] Add bounds check: only use pointer position if inside main container, otherwise use offset logic
- [x] T043 [US5] Wire mouse pointer position from keyboard handler to paste in `src/hooks/canvas/useCanvasKeyboard.ts`
- [x] T044 [US5] **Commit**: Stage and commit User Story 5 changes with descriptive message

**Checkpoint**: Mouse pointer paste functional ✅

---

## Phase 7: Undo/Redo Verification

**Purpose**: Ensure all operations have complete undo/redo support (SC-004)

**Redo Handler Clarification**: Paste and duplicate operations create new views with fresh unique IDs each time. This means redo cannot restore the exact same view IDs - it creates new views. The redo handlers may intentionally be no-ops or create fresh copies. Tests should verify the expected behavior:
- If redo is no-op: Test that redo does nothing after undo
- If redo creates new: Test that redo creates new views (different IDs than original paste)

- [x] T045 Test SC-004: verify redo behavior for paste operation - document whether redo is no-op or creates new views in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [x] T046 Test SC-004: verify redo behavior for duplicate operation - document whether redo is no-op or creates new views in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [x] T047 Evaluate empty redo handlers in `createPasteOperation` and `createDuplicateOperation` - implement proper redo if needed, or document that no-op is intentional
- [ ] T048 **Commit**: Stage and commit undo/redo fixes with descriptive message

---

## Phase 8: Performance & Polish

**Purpose**: Verify performance requirements and final documentation

- [x] T049 Test SC-003: verify all clipboard operations complete in < 100ms (copy, cut, paste, duplicate) in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [x] T050 Test SC-006: container hierarchies preserved in copy/paste in `src/domain/canvas/__tests__/viewOperations.spec.ts`
- [x] T051 Verify all edge cases from spec: empty clipboard paste, root template cut blocked
- [x] T052 Update spec.md compliance table with test evidence for all FR-xxx and SC-xxx
- [ ] T053 Update CLAUDE.md with any new clipboard utilities or patterns
- [ ] T054 **Commit**: Stage and commit Polish phase changes with descriptive message

---

## Phase Final-1: Quality Gates (MANDATORY)

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

- [x] TFINAL-1 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [x] TFINAL-2 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [x] TFINAL-3 **Confirm Clean**: Verify working tree is clean (nothing to commit)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Verification)**: No dependencies - start immediately
- **Phase 2-4 (P1 Stories)**: Can proceed in parallel after Phase 1
- **Phase 5 (P2 Story)**: Can start after Phase 1, independent of P1 stories
- **Phase 6 (P3 Story)**: Can be deferred - lowest priority
- **Phase 7-8 (Polish)**: After core stories complete
- **Quality Gates & Git**: After all implementation

### User Story Dependencies

- **US1 (Copy/Paste)**: Independent - can start immediately
- **US2 (Cut/Paste)**: Independent - shares test file with US1 but different tests
- **US3 (Duplicate)**: Independent - shares test file with US1 but different tests
- **US4 (Paste into Container)**: Depends on basic paste working (US1)
- **US5 (Cursor Paste)**: Depends on basic paste working (US1)

### Parallel Opportunities

- T007-T015 (US1 tests) - all can run in parallel
- T019-T022 (US2 tests) - all can run in parallel
- T026-T029 (US3 tests) - all can run in parallel
- T033-T035 (US4 tests) - all can run in parallel
- US1, US2, US3 can be worked in parallel (different test scenarios)

---

## Parallel Example: All P1 Tests

```bash
# Launch all P1 story tests in parallel (different test scenarios, same file):
Task: "T007 Test FR-001: copySelectedViews stores data in clipboard"
Task: "T019 Test FR-006: cutSelectedViews copies and removes"
Task: "T026 Test FR-009: duplicateSelectedViews creates offset copy"
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Verification
2. Complete Phase 2: Copy/Paste (US1)
3. Complete Phase 3: Cut/Paste (US2)
4. Complete Phase 4: Duplicate (US3)
5. **STOP and VALIDATE**: All P1 requirements met
6. Update compliance table

### Incremental Delivery

1. P1 Stories → MVP complete (core clipboard works)
2. Add US4 (Paste into Container) → Enhanced workflow
3. Add US5 (Cursor Paste) → Nice-to-have polish

### Task Summary

| Phase | Story | Task Count | Priority |
|-------|-------|------------|----------|
| 1 | Setup | 5 | Required |
| 2 | US1 Copy/Paste | 12 | P1 - MVP |
| 3 | US2 Cut/Paste | 7 | P1 - MVP |
| 4 | US3 Duplicate | 7 | P1 - MVP |
| 5 | US4 Paste Container | 7 | P2 |
| 6 | US5 Cursor Paste | 6 | P3 |
| 7 | Undo/Redo | 4 | Required |
| 8 | Performance & Polish | 6 | Required |
| Final | Quality Gates | 7 | Required |
| **Total** | | **61** | |

---

## Notes

- Most clipboard code already exists - focus on verification and gap-filling
- Tests may already exist - check before creating duplicates
- P3 (Cursor Paste) can be deferred if time-constrained
- Redo handlers may intentionally be no-ops (new IDs each time)
- **IMPORTANT**: Always complete "Phase Final: Git Verification" before marking feature complete
