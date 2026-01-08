# Tasks: Control Tags Panel

**Input**: Design documents from `/specs/026-control-tags-panel/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, quickstart.md

**Tests**: Test-first development is REQUIRED per constitution. All tests must be written FIRST and FAIL before implementation.

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Domain Layer Foundation)

**Purpose**: Create domain utilities for control tag validation, usage tracking, and history operations

- [ ] T001 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T002 Create domain directory structure: `src/domain/controlTags/`
- [ ] T003 [P] Write tests for validation functions in `src/domain/controlTags/__tests__/validation.spec.ts`
- [ ] T004 [P] Implement validation functions in `src/domain/controlTags/validation.ts` (validateTagName, validateTagId, getNextAvailableTagId)
- [ ] T005 [P] Write tests for usage tracking in `src/domain/controlTags/__tests__/usage.spec.ts`
- [ ] T006 [P] Implement usage tracking in `src/domain/controlTags/usage.ts` (findControlTagUsages)
- [ ] T007 [P] Write tests for history operations in `src/domain/controlTags/__tests__/historyOperations.spec.ts`
- [ ] T008 [P] Implement history operations in `src/domain/controlTags/historyOperations.ts`
- [ ] T009 Create barrel exports in `src/domain/controlTags/index.ts`
- [ ] T010 **Commit**: Stage and commit Phase 1 changes with message "feat(026): Add control tags domain utilities"

---

## Phase 2: Store Layer (documentStore Extensions)

**Purpose**: Add CRUD functions to documentStore for control tag management

**⚠️ CRITICAL**: This phase must complete before UI phases can begin

- [ ] T011 Write tests for getControlTags in `src/stores/__tests__/documentStore.controlTags.spec.ts`
- [ ] T012 Implement getControlTags() in `src/stores/documentStore.ts`
- [ ] T013 Write tests for addControlTag in `src/stores/__tests__/documentStore.controlTags.spec.ts`
- [ ] T014 Implement addControlTag() in `src/stores/documentStore.ts`
- [ ] T015 Write tests for updateControlTagName in `src/stores/__tests__/documentStore.controlTags.spec.ts`
- [ ] T016 Implement updateControlTagName() in `src/stores/documentStore.ts`
- [ ] T017 Write tests for updateControlTagId in `src/stores/__tests__/documentStore.controlTags.spec.ts`
- [ ] T018 Implement updateControlTagId() in `src/stores/documentStore.ts`
- [ ] T019 Write tests for deleteControlTag in `src/stores/__tests__/documentStore.controlTags.spec.ts`
- [ ] T020 Implement deleteControlTag() in `src/stores/documentStore.ts`
- [ ] T021 Write tests for restoreControlTagReference in `src/stores/__tests__/documentStore.controlTags.spec.ts`
- [ ] T022 Implement restoreControlTagReference() in `src/stores/documentStore.ts`
- [ ] T023 **Commit**: Stage and commit Phase 2 changes with message "feat(026): Add control tags store functions"

**Checkpoint**: Domain and store layers ready - UI implementation can begin

---

## Phase 3: User Story 1 - View Control Tag Resources (Priority: P1) 🎯 MVP

**Goal**: Display all control-tag definitions in a dedicated sidebar panel

**Independent Test**: Load a uidesc file with control-tags and verify all tags appear with name and ID

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T024 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T025 [P] [US1] Write tests for EmptyState in `src/components/ControlTagsPanel/__tests__/EmptyState.spec.tsx`
- [ ] T026 [P] [US1] Write tests for ControlTagsPanel display in `src/components/ControlTagsPanel/__tests__/ControlTagsPanel.spec.tsx`

### Implementation for User Story 1

- [ ] T027 [US1] Create component directory: `src/components/ControlTagsPanel/`
- [ ] T028 [P] [US1] Implement EmptyState component in `src/components/ControlTagsPanel/EmptyState.tsx`
- [ ] T029 [P] [US1] Create EmptyState styles in `src/components/ControlTagsPanel/EmptyState.module.css`
- [ ] T030 [P] [US1] Implement ControlTagsPanel component (display only) in `src/components/ControlTagsPanel/ControlTagsPanel.tsx`
- [ ] T031 [P] [US1] Create ControlTagsPanel styles in `src/components/ControlTagsPanel/ControlTagsPanel.module.css`
- [ ] T032 [US1] Create barrel exports in `src/components/ControlTagsPanel/index.ts`
- [ ] T033 [US1] Add ControlTagsPanel to LeftSidebar in `src/components/LeftSidebar/LeftSidebar.tsx`
- [ ] T034 [US1] Verify FR-001, FR-002, FR-003, FR-004 are met
- [ ] T035 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(026): Add ControlTagsPanel display (US1)"

**Checkpoint**: User Story 1 complete - tags are visible in sidebar

---

## Phase 4: User Story 2 - Add New Control Tag (Priority: P2)

**Goal**: Users can add new control tags with auto-generated name and ID

**Independent Test**: Click Add button, verify new tag appears with unique name and lowest available ID

### Tests for User Story 2

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T036 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T037 [P] [US2] Write tests for AddControlTagButton in `src/components/ControlTagsPanel/__tests__/AddControlTagButton.spec.tsx`
- [ ] T038 [P] [US2] Write tests for add functionality in `src/components/ControlTagsPanel/__tests__/ControlTagsPanel.add.spec.tsx`
- [ ] T039 [P] [US2] Write tests for undo/redo of add in `src/components/ControlTagsPanel/__tests__/ControlTagsPanel.history.spec.tsx`

### Implementation for User Story 2

- [ ] T040 [P] [US2] Implement AddControlTagButton in `src/components/ControlTagsPanel/AddControlTagButton.tsx`
- [ ] T041 [P] [US2] Create AddControlTagButton styles in `src/components/ControlTagsPanel/AddControlTagButton.module.css`
- [ ] T042 [US2] Add generateUniqueTagName function to ControlTagsPanel
- [ ] T043 [US2] Wire up add functionality with history operation in ControlTagsPanel.tsx
- [ ] T044 [US2] Verify FR-005, FR-006, FR-007, FR-017 (undo for add) are met
- [ ] T045 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(026): Add new control tag functionality (US2)"

**Checkpoint**: User Story 2 complete - users can add tags

---

## Phase 5: User Story 3 - Edit Control Tag (Priority: P2)

**Goal**: Users can edit tag names and IDs with validation

**Independent Test**: Double-click name to rename, click ID to edit, validation prevents duplicates

### Tests for User Story 3

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T046 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T047 [P] [US3] Write tests for ControlTagItem display in `src/components/ControlTagsPanel/__tests__/ControlTagItem.spec.tsx`
- [ ] T048 [P] [US3] Write tests for name editing in `src/components/ControlTagsPanel/__tests__/ControlTagItem.edit.spec.tsx`
- [ ] T049 [P] [US3] Write tests for ID editing in `src/components/ControlTagsPanel/__tests__/ControlTagItem.edit.spec.tsx`
- [ ] T050 [P] [US3] Write tests for validation in `src/components/ControlTagsPanel/__tests__/ControlTagItem.validation.spec.tsx`

### Implementation for User Story 3

- [ ] T051 [P] [US3] Implement ControlTagItem component (display mode) in `src/components/ControlTagsPanel/ControlTagItem.tsx`
- [ ] T052 [P] [US3] Create ControlTagItem styles in `src/components/ControlTagsPanel/ControlTagItem.module.css`
- [ ] T053 [US3] Add inline name editing (double-click) to ControlTagItem
- [ ] T054 [US3] Add inline ID editing (click) to ControlTagItem
- [ ] T055 [US3] Wire up validation for name uniqueness and non-empty
- [ ] T056 [US3] Wire up validation for ID uniqueness and integer format
- [ ] T057 [US3] Add history operations for name and ID edits
- [ ] T058 [US3] Verify FR-008, FR-009, FR-010, FR-011, FR-017 (undo for edit) are met
- [ ] T059 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(026): Edit control tag name and ID (US3)"

**Checkpoint**: User Story 3 complete - users can edit tags with validation

---

## Phase 6: User Story 4 - Delete Control Tag (Priority: P3)

**Goal**: Users can delete tags with confirmation for used tags

**Independent Test**: Delete unused tag immediately, delete used tag after confirmation

### Tests for User Story 4

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T060 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T061 [P] [US4] Write tests for delete (unused) in `src/components/ControlTagsPanel/__tests__/ControlTagItem.delete.spec.tsx`
- [ ] T062 [P] [US4] Write tests for delete (used with confirmation) in `src/components/ControlTagsPanel/__tests__/ControlTagItem.delete.spec.tsx`
- [ ] T063 [P] [US4] Write tests for undo/redo of delete in `src/components/ControlTagsPanel/__tests__/ControlTagsPanel.history.spec.tsx`

### Implementation for User Story 4

- [ ] T064 [US4] Add delete button (hover) to ControlTagItem
- [ ] T065 [US4] Implement delete confirmation dialog in ControlTagsPanel
- [ ] T066 [US4] Wire up delete with reference removal for used tags
- [ ] T067 [US4] Add history operation for delete (restore tag and references on undo)
- [ ] T068 [US4] Verify FR-012, FR-013, FR-014, FR-017 (undo for delete) are met
- [ ] T069 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(026): Delete control tag with confirmation (US4)"

**Checkpoint**: User Story 4 complete - users can delete tags safely

---

## Phase 7: User Story 5 - View Control Tag Usage (Priority: P3)

**Goal**: Users can see which views use each tag

**Independent Test**: Click usage badge to see popover with referencing views

### Tests for User Story 5

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T070 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T071 [P] [US5] Write tests for usage badge display in `src/components/ControlTagsPanel/__tests__/ControlTagItem.usage.spec.tsx`
- [ ] T072 [P] [US5] Write tests for usage popover in `src/components/ControlTagsPanel/__tests__/ControlTagItem.usage.spec.tsx`

### Implementation for User Story 5

- [ ] T073 [US5] Add usage count calculation to ControlTagsPanel
- [ ] T074 [US5] Add usage badge to ControlTagItem (hidden when 0)
- [ ] T075 [US5] Implement usage popover (click badge to show list of views)
- [ ] T076 [US5] Verify FR-015, FR-016 are met
- [ ] T077 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(026): View control tag usage (US5)"

**Checkpoint**: All user stories complete

---

## Phase 8: Polish & Integration

**Purpose**: Final verification of all requirements and success criteria

- [ ] T078 Update barrel exports in `src/components/ControlTagsPanel/index.ts` if needed
- [ ] T079 Verify SC-001: All tags visible within 1 second of load
- [ ] T080 Verify SC-002: All operations complete in under 5 seconds
- [ ] T081 Verify SC-003: All operations undoable/redoable without data loss
- [ ] T082 Verify SC-004: Usage tracking accurately identifies all referencing views
- [ ] T083 Run all tests: `npm test`
- [ ] T084 **Commit**: Stage and commit Polish phase changes with message "feat(026): Control tags panel polish and verification"

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

**NO EXCEPTIONS**: Even "pre-existing" issues MUST be resolved. The spec is NOT complete until all quality gates pass.

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

- **Phase 1 (Domain)**: No dependencies - can start immediately
- **Phase 2 (Store)**: Depends on Phase 1 completion
- **Phase 3+ (User Stories)**: All depend on Phase 2 completion
- **Phase 8 (Polish)**: Depends on all user stories being complete
- **Phase Final-1 (Quality Gates)**: Depends on Phase 8 completion
- **Phase Final (Git)**: Depends on Quality Gates passing

### User Story Dependencies

- **User Story 1 (View)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 2 (Add)**: Can start after Phase 2 - Independent
- **User Story 3 (Edit)**: Can start after Phase 2 - Independent
- **User Story 4 (Delete)**: Can start after Phase 2 - Uses usage from US5 but can stub
- **User Story 5 (Usage)**: Can start after Phase 2 - Independent

### Within Each User Story

- **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
- Tests MUST be written and FAIL before implementation
- Components before wiring
- Styles parallel to components
- Verification at end

---

## Parallel Opportunities

### Phase 1 Parallel Tasks
```
T003, T005, T007 - Tests can be written in parallel
T004, T006, T008 - Implementation can be done in parallel after tests
```

### Phase 3 (US1) Parallel Tasks
```
T025, T026 - Tests can be written in parallel
T028, T030 - Components can be built in parallel
T029, T031 - Styles can be created in parallel
```

### User Stories Can Run in Parallel
After Phase 2 completes, all user stories (US1-US5) can be worked on simultaneously by different developers.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Domain utilities
2. Complete Phase 2: Store functions
3. Complete Phase 3: User Story 1 (View)
4. **STOP and VALIDATE**: Tags are visible in sidebar
5. Can demo basic functionality

### Incremental Delivery

1. Domain + Store → Foundation ready
2. Add US1 (View) → Tags visible (MVP!)
3. Add US2 (Add) → Can create tags
4. Add US3 (Edit) → Can modify tags
5. Add US4 (Delete) → Can remove tags
6. Add US5 (Usage) → Full feature complete

---

## Task Summary

| Phase | Tasks | Parallelizable |
|-------|-------|----------------|
| Phase 1: Domain | T001-T010 (10) | T003-T008 (6) |
| Phase 2: Store | T011-T023 (13) | None (sequential TDD) |
| Phase 3: US1 View | T024-T035 (12) | T025-T026, T028-T031 |
| Phase 4: US2 Add | T036-T045 (10) | T037-T041 |
| Phase 5: US3 Edit | T046-T059 (14) | T047-T052 |
| Phase 6: US4 Delete | T060-T069 (10) | T061-T063 |
| Phase 7: US5 Usage | T070-T077 (8) | T071-T072 |
| Phase 8: Polish | T078-T084 (7) | None |
| Quality Gates | TQG-1 to TQG-4 (4) | None |
| Git Verification | TFINAL-1 to TFINAL-3 (3) | None |

**Total Tasks**: 91
**Parallelizable**: ~35
