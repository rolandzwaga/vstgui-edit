# Tasks: Batch Edit

**Input**: Design documents from `/specs/039-batch-edit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Tests are REQUIRED - spec includes comprehensive test requirements for FR-xxx and SC-xxx compliance.

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests. This ensures SolidJS-specific patterns (microtask flushing, testInRoot, etc.) are followed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Branch creation and foundational prep - no code changes yet

- [X] T001 Create feature branch `039-batch-edit` from main
- [X] T002 Verify existing test suite passes with `npm test`
- [X] T003 **Commit**: Initial branch creation (if any config changes needed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core changes that enable batch editing functionality - MUST be complete before user stories

**This feature has minimal foundational work** - most infrastructure already exists. The key foundational change is enabling editing of mixed attributes.

- [X] T004 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [X] T005 In `src/components/PropertiesPanel/AttributeRow.tsx`, remove `!props.entry.isMixed` from `canEdit()` function (line ~44)
- [X] T006 Add `getOriginalValues` callback prop to `AttributeRowProps` interface in `src/components/PropertiesPanel/AttributeRow.tsx`
- [X] T007 Implement `getOriginalValues` callback in `src/components/PropertiesPanel/PropertiesPanel.tsx` that queries `getViewAttribute()` for each selected view
- [X] T008 Update `handleValueChange` in `src/components/PropertiesPanel/PropertiesPanel.tsx` to filter out locked views using `isLocked()` from lockHideStore
- [X] T009 Update `handleValueCommit` in `src/components/PropertiesPanel/PropertiesPanel.tsx` to detect `'__MIXED__'` marker and fetch per-view original values
- [X] T010 Pass `getOriginalValues` callback from PropertiesPanel through AttributeGroup to AttributeRow in `src/components/PropertiesPanel/PropertiesPanel.tsx`
- [ ] T011 **Commit**: Stage and commit Phase 2 foundational changes with descriptive message

**Checkpoint**: Mixed attribute editing is now enabled - user story implementation can proceed

---

## Phase 3: User Story 1 - Edit Shared Attribute Across Multiple Views (Priority: P1)

**Goal**: Enable editing of attributes marked as "Mixed" when multiple views are selected. Apply changes to all selected views.

**Independent Test**: Select 2+ views with different attribute values, edit the attribute, verify all selected views receive the new value.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: `specs/TESTING-GUIDE.md` must be in context from T004**

- [ ] T012 [P] [US1] Add test in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`: verify `canEdit()` returns true for mixed attributes when editable=true
- [ ] T013 [P] [US1] Add test in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`: verify double-click on mixed attribute enables editing mode
- [ ] T014 [P] [US1] Add test in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`: verify editing mixed value calls `onValueChange` with new value
- [ ] T015 [P] [US1] Add test in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`: verify committing mixed value calls `onValueCommit` with `'__MIXED__'` marker

### Implementation for User Story 1

- [ ] T016 [US1] Update inline editor handlers (`handleTextCommit`, `handlePointCommit`, `handleNumberCommit`) in `src/components/PropertiesPanel/AttributeRow.tsx` to pass `'__MIXED__'` marker for mixed values
- [ ] T017 [US1] Update `handleDoubleClick` in `src/components/PropertiesPanel/AttributeRow.tsx` to set empty edit value when `props.entry.isMixed` is true
- [ ] T018 [P] [US1] Add integration test in `src/components/PropertiesPanel/__tests__/PropertiesPanel.batch.spec.tsx`: batch edit applies to all selected views (FR-002)
- [ ] T019 [US1] **Commit**: Stage and commit User Story 1 changes with descriptive message

**Checkpoint**: User Story 1 complete - batch editing of mixed attributes is functional

---

## Phase 4: User Story 2 - Single Undo/Redo for Batch Changes (Priority: P1)

**Goal**: Single Ctrl+Z undoes all changes from a batch edit, restoring each view to its individual original value.

**Independent Test**: Perform batch edit on views with different original values, verify single undo restores each view to its previous value.

### Tests for User Story 2

> **REQUIRED: `specs/TESTING-GUIDE.md` must be in context from T004**

- [ ] T020 [P] [US2] Add test in `src/components/PropertiesPanel/__tests__/PropertiesPanel.batch.spec.tsx`: verify batch edit creates single history operation (FR-004)
- [ ] T021 [P] [US2] Add test in `src/components/PropertiesPanel/__tests__/PropertiesPanel.batch.spec.tsx`: verify undo restores per-view original values (FR-005)
- [ ] T022 [P] [US2] Add test in `src/components/PropertiesPanel/__tests__/PropertiesPanel.batch.spec.tsx`: verify redo reapplies batch value to all views (FR-006)
- [ ] T023 [P] [US2] Add test in `src/components/PropertiesPanel/__tests__/PropertiesPanel.batch.spec.tsx`: verify history description includes view count (FR-012)

### Implementation for User Story 2

- [ ] T024 [US2] Verify `createPropertyEditOperation` in `src/domain/properties/historyOperations.ts` correctly formats description with view count (existing code may already handle this)
- [ ] T025 [US2] Add integration test in `src/components/PropertiesPanel/__tests__/PropertiesPanel.batch.spec.tsx`: full undo/redo cycle with mixed values
- [ ] T026 [US2] **Commit**: Stage and commit User Story 2 changes with descriptive message

**Checkpoint**: User Story 2 complete - undo/redo works correctly for batch edits

---

## Phase 5: User Story 3 - Visual Feedback for Mixed Values (Priority: P2)

**Goal**: Show "Mixed" placeholder in editor fields when multiple views have different values. Field clears on focus.

**Independent Test**: Select views with different values, verify "Mixed" placeholder appears in input field and clears when focused.

### Tests for User Story 3

> **REQUIRED: `specs/TESTING-GUIDE.md` must be in context from T004**

- [ ] T027 [P] [US3] Add test in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`: verify "Mixed" placeholder shown in text input when `isMixed=true`
- [ ] T028 [P] [US3] Add test in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`: verify placeholder clears on focus
- [ ] T029 [P] [US3] Add test in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`: verify Escape cancels edit and reverts (FR-011)

### Implementation for User Story 3

- [ ] T030 [US3] Add `placeholder` prop support to `TextEditor` in `src/components/editors/TextEditor.tsx` (if not already present)
- [ ] T031 [US3] Add `placeholder` prop support to `PointEditor` in `src/components/editors/PointEditor.tsx` (if not already present)
- [ ] T032 [US3] Add `placeholder` prop support to `NumberEditor` in `src/components/editors/NumberEditor.tsx` (if not already present)
- [ ] T033 [US3] Pass `placeholder="Mixed"` to inline editors when `props.entry.isMixed` in `src/components/PropertiesPanel/AttributeRow.tsx`
- [ ] T034 [P] [US3] Add CSS styling for mixed placeholder in `src/components/PropertiesPanel/AttributeRow.module.css` (gray, italic text)
- [ ] T035 [US3] **Commit**: Stage and commit User Story 3 changes with descriptive message

**Checkpoint**: User Story 3 complete - visual feedback for mixed values is functional

---

## Phase 6: User Story 4 - Live Preview During Batch Edit (Priority: P2)

**Goal**: All selected views update in real-time on canvas during editing, before commit.

**Independent Test**: Start batch edit, verify canvas views update as value changes, verify Escape reverts all views.

### Tests for User Story 4

> **REQUIRED: `specs/TESTING-GUIDE.md` must be in context from T004**

- [ ] T036 [P] [US4] Add test in `src/components/PropertiesPanel/__tests__/PropertiesPanel.batch.spec.tsx`: verify live preview updates all selected views during edit (FR-007)
- [ ] T037 [P] [US4] Add test in `src/components/PropertiesPanel/__tests__/PropertiesPanel.batch.spec.tsx`: verify Escape reverts all views to original values (FR-011)

### Implementation for User Story 4

- [ ] T038 [US4] Verify `handleValueChange` in PropertiesPanel already applies changes to all views during edit (existing implementation)
- [ ] T039 [US4] Verify inline editor cancel (Escape) reverts preview changes correctly for mixed values
- [ ] T040 [US4] **Commit**: Stage and commit User Story 4 changes with descriptive message

**Checkpoint**: User Story 4 complete - live preview works for batch edits

---

## Phase 7: Edge Cases and Immediate Editors

**Purpose**: Handle immediate editors (boolean, enum, color, font, bitmap) and edge cases

### Tests for Edge Cases

> **REQUIRED: `specs/TESTING-GUIDE.md` must be in context from T004**

- [ ] T041 [P] Add test in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`: verify boolean editor batch edit with mixed values
- [ ] T042 [P] Add test in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`: verify enum editor batch edit with mixed values
- [ ] T043 [P] Add test in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`: verify color picker batch edit with mixed values
- [ ] T044 [P] Add test in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`: verify font picker batch edit with mixed values
- [ ] T045 [P] Add test in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`: verify bitmap picker batch edit with mixed values
- [ ] T046 [P] Add test in `src/components/PropertiesPanel/__tests__/PropertiesPanel.batch.spec.tsx`: verify locked views are skipped during batch edit (FR-008)
- [ ] T047 [P] Add test in `src/components/PropertiesPanel/__tests__/PropertiesPanel.batch.spec.tsx`: verify single-view editing still works (FR-010 regression)
- [ ] T047a [P] Add test in `src/components/PropertiesPanel/__tests__/PropertiesPanel.batch.spec.tsx`: verify validation failure on batch edit rejects all changes (FR-009)
- [ ] T047b [P] Add test in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`: verify class attribute remains non-editable with multiple views selected

### Implementation for Immediate Editors

- [ ] T048 Update `handleBooleanChange` in `src/components/PropertiesPanel/AttributeRow.tsx` to use `'__MIXED__'` marker when `isMixed`
- [ ] T049 Update `handleEnumChange` in `src/components/PropertiesPanel/AttributeRow.tsx` to use `'__MIXED__'` marker when `isMixed`
- [ ] T050 Update `handleColorChange` in `src/components/PropertiesPanel/AttributeRow.tsx` to use `'__MIXED__'` marker when `isMixed`
- [ ] T051 Update `handleFontChange` in `src/components/PropertiesPanel/AttributeRow.tsx` to use `'__MIXED__'` marker when `isMixed`
- [ ] T052 Update `handleBitmapChange` in `src/components/PropertiesPanel/AttributeRow.tsx` to use `'__MIXED__'` marker when `isMixed`
- [ ] T053 **Commit**: Stage and commit edge cases and immediate editors changes with descriptive message

**Checkpoint**: All editor types support batch editing (SC-005)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, performance check, documentation

- [ ] T054 Verify existing single-view property editing tests still pass (SC-003 - no regression)
- [ ] T055 Run performance test: batch edit 20+ views completes in <100ms (SC-004)
- [ ] T056 Run `quickstart.md` verification checklist manually
- [ ] T057 Update `CLAUDE.md` if any new patterns or utilities were added
- [ ] T058 **Commit**: Stage and commit Polish phase changes with descriptive message

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

- [ ] TFINAL-1 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL-2 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with an appropriate message
- [ ] TFINAL-3 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) - can run parallel to US1
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) - can run parallel to US1/US2
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) - can run parallel to others
- **Edge Cases (Phase 7)**: Depends on US1 completion (needs basic batch edit working)
- **Polish (Phase 8)**: Depends on all user stories being complete
- **Quality Gates (Final-1)**: Depends on Polish
- **Git Verification (Final)**: Depends on Quality Gates

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation tasks follow test tasks
- Commit at end of each user story phase

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
- T005, T006, T007, T008, T009 modify different functions - can be done sequentially but quickly

**Within User Story Tests**:
- All test tasks marked [P] can run in parallel (different test files or independent test cases)

**Across User Stories**:
- US1, US2, US3, US4 can theoretically run in parallel after Phase 2
- In practice, US1 should complete first as other stories build on it

**Within Phase 7 (Edge Cases)**:
- All immediate editor tests (T041-T047) can run in parallel
- All immediate editor implementations (T048-T052) modify same file but different functions

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all tests for User Story 1 together:
Task T012: "verify canEdit() returns true for mixed attributes"
Task T013: "verify double-click on mixed attribute enables editing mode"
Task T014: "verify editing mixed value calls onValueChange"
Task T015: "verify committing mixed value calls onValueCommit with marker"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - enables mixed editing)
3. Complete Phase 3: User Story 1 (Edit mixed attributes)
4. Complete Phase 4: User Story 2 (Undo/redo)
5. **STOP and VALIDATE**: Core batch editing works with proper undo
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational -> Mixed editing enabled
2. Add User Story 1 -> Test batch editing works -> Core MVP!
3. Add User Story 2 -> Test undo/redo -> Production-ready MVP
4. Add User Story 3 -> Visual feedback polish
5. Add User Story 4 -> Live preview polish
6. Add Edge Cases -> All editor types work
7. Each story adds value without breaking previous stories

---

## Task Summary

| Phase | Task Count | Focus |
|-------|------------|-------|
| Setup | 3 | Branch creation |
| Foundational | 8 | Enable mixed editing, callbacks |
| User Story 1 | 8 | Edit mixed attributes |
| User Story 2 | 7 | Undo/redo support |
| User Story 3 | 9 | Visual feedback |
| User Story 4 | 5 | Live preview |
| Edge Cases | 15 | Immediate editors, locked views, validation |
| Polish | 5 | Verification, docs |
| Quality Gates | 4 | lint:css, check, typecheck |
| Git Final | 3 | Commit verification |

**Total Tasks**: 67

---

## Requirements Traceability

| Requirement | Task(s) | Description |
|-------------|---------|-------------|
| FR-001 | T005 | Allow editing of mixed attributes |
| FR-002 | T018 | Apply to all selected views |
| FR-003 | T007, T009 | Record per-view original values |
| FR-004 | T020 | Single history operation |
| FR-005 | T021 | Undo restores per-view values |
| FR-006 | T022 | Redo reapplies batch value |
| FR-007 | T036 | Live preview during edit |
| FR-008 | T008, T046 | Skip locked views |
| FR-009 | T047a | Validation rejects invalid batch |
| FR-010 | T047 | No regression for single-view |
| FR-011 | T029, T037 | Escape cancels batch edit |
| FR-012 | T023, T024 | Description includes view count |
| SC-001 | T018 | Batch edit in <5s |
| SC-002 | T021 | Single Ctrl+Z undoes batch |
| SC-003 | T054 | No test regression |
| SC-004 | T055 | <100ms commit time |
| SC-005 | T041-T052 | All editor types supported |

---

## Notes

- [P] tasks = different files or independent tests, no dependencies
- [US#] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: `specs/TESTING-GUIDE.md` must be read before writing any test (T004)
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- **IMPORTANT**: Always complete "Phase Final: Git Verification" before marking feature complete
