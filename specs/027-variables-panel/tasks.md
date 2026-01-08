# Tasks: Variables Panel

**Input**: Design documents from `/specs/027-variables-panel/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, quickstart.md

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests. This ensures SolidJS-specific patterns (microtask flushing, testInRoot, etc.) are followed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Domain Layer)

**Purpose**: Create domain utilities for variable validation, usage tracking, and history operations

- [ ] T001 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T002 [P] Create `src/domain/variables/validation.ts` with `validateVariableName()` and `generateUniqueVariableName()` functions
- [ ] T003 [P] Create `src/domain/variables/__tests__/validation.spec.ts` with tests for name validation (empty, duplicate, format, case-sensitivity)
- [ ] T004 [P] Create `src/domain/variables/usage.ts` with `VARIABLE_REFERENCE_PATTERN` and `findVariableUsages()` function
- [ ] T005 [P] Create `src/domain/variables/__tests__/usage.spec.ts` with tests for finding `var.X` references in view attributes
- [ ] T006 Create `src/domain/variables/historyOperations.ts` with operations for add, edit name, edit value, and delete
- [ ] T007 Create `src/domain/variables/__tests__/historyOperations.spec.ts` with undo/redo tests
- [ ] T008 Create `src/domain/variables/index.ts` barrel export
- [ ] T009 **Commit**: Stage and commit Phase 1 (domain layer) with message "feat(027): Add domain utilities for variables"

---

## Phase 2: Foundational (Store Layer)

**Purpose**: Extend documentStore with variable CRUD operations - MUST complete before UI components

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T011 Create `src/stores/__tests__/documentStore.variables.spec.ts` with tests for getVariables, addVariable, updateVariableName, updateVariableValue, deleteVariable, restoreVariableReference
- [ ] T012 Extend `src/stores/documentStore.ts` with `getVariables()` function
- [ ] T013 Extend `src/stores/documentStore.ts` with `addVariable(name, value)` function
- [ ] T014 Extend `src/stores/documentStore.ts` with `updateVariableName(oldName, newName)` function
- [ ] T015 Extend `src/stores/documentStore.ts` with `updateVariableValue(name, value)` function
- [ ] T016 Extend `src/stores/documentStore.ts` with `deleteVariable(name)` function returning removed references
- [ ] T017 Extend `src/stores/documentStore.ts` with `restoreVariableReference(viewId, attribute, value)` function
- [ ] T018 Run all variable store tests and verify they pass
- [ ] T019 **Commit**: Stage and commit Phase 2 (store layer) with message "feat(027): Add variable CRUD operations to documentStore"

**Checkpoint**: Store foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Variable Resources (Priority: P1) 🎯 MVP

**Goal**: Display all variables in a collapsible sidebar panel with names and values

**Independent Test**: Load a uidesc file with variable definitions and verify all variables appear in the panel

**Functional Requirements**: FR-001, FR-002, FR-003, FR-004

### Tests for User Story 1

- [ ] T020 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T021 [P] [US1] Create `src/components/VariablesPanel/__tests__/EmptyState.spec.tsx` with tests for empty state message
- [ ] T022 [P] [US1] Create `src/components/VariablesPanel/__tests__/VariablesPanel.spec.tsx` with tests for displaying variables list

### Implementation for User Story 1

- [ ] T023 [P] [US1] Create `src/components/VariablesPanel/EmptyState.tsx` and `EmptyState.module.css` for no-variables message
- [ ] T024 [P] [US1] Create `src/components/VariablesPanel/VariableItem.tsx` and `VariableItem.module.css` for displaying name and value
- [ ] T025 [US1] Create `src/components/VariablesPanel/VariablesPanel.tsx` and `VariablesPanel.module.css` with CollapsibleSection
- [ ] T026 [US1] Create `src/components/VariablesPanel/index.ts` barrel export
- [ ] T027 [US1] Add VariablesPanel to `src/App.tsx` sidebar (after ControlTagsPanel)
- [ ] T028 [US1] Run all US1 tests and verify they pass
- [ ] T029 [US1] **Commit**: Stage and commit User Story 1 with message "feat(027): Add VariablesPanel display (US1)"

**Checkpoint**: User Story 1 complete - variables can be viewed in the panel

---

## Phase 4: User Story 2 - Add New Variable (Priority: P2)

**Goal**: Add new variables via Add button with unique auto-generated names

**Independent Test**: Click Add button, verify new variable created with unique name and empty value

**Functional Requirements**: FR-005, FR-006, FR-007

### Tests for User Story 2

- [ ] T030 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T031 [P] [US2] Create `src/components/VariablesPanel/__tests__/VariablesPanel.add.spec.tsx` with tests for adding variables

### Implementation for User Story 2

- [ ] T032 [P] [US2] Create `src/components/VariablesPanel/AddVariableButton.tsx` and `AddVariableButton.module.css`
- [ ] T033 [US2] Update `src/components/VariablesPanel/VariablesPanel.tsx` to wire up AddVariableButton and history operations
- [ ] T034 [US2] Run all US2 tests and verify they pass
- [ ] T035 [US2] **Commit**: Stage and commit User Story 2 with message "feat(027): Add variable creation (US2)"

**Checkpoint**: User Story 2 complete - new variables can be added

---

## Phase 5: User Story 3 - Edit Variable (Priority: P2)

**Goal**: Edit variable names (double-click) and values (single-click) with validation

**Independent Test**: Double-click name to rename; click value to edit; verify validation on duplicate names

**Functional Requirements**: FR-008, FR-009, FR-010, FR-011

### Tests for User Story 3

- [ ] T036 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T037 [P] [US3] Create `src/components/VariablesPanel/__tests__/VariableItem.edit.spec.tsx` with tests for inline name and value editing

### Implementation for User Story 3

- [ ] T038 [US3] Update `src/components/VariablesPanel/VariableItem.tsx` with inline name editing (double-click) and validation
- [ ] T039 [US3] Update `src/components/VariablesPanel/VariableItem.tsx` with inline value editing (single-click)
- [ ] T040 [US3] Update `src/components/VariablesPanel/VariableItem.module.css` with edit state styling
- [ ] T041 [US3] Run all US3 tests and verify they pass
- [ ] T042 [US3] **Commit**: Stage and commit User Story 3 with message "feat(027): Add variable editing (US3)"

**Checkpoint**: User Story 3 complete - variables can be renamed and values edited

---

## Phase 6: User Story 4 - Delete Variable (Priority: P3)

**Goal**: Delete variables with confirmation dialog for used variables

**Independent Test**: Delete unused variable immediately; delete used variable after confirmation

**Functional Requirements**: FR-012, FR-013

### Tests for User Story 4

- [ ] T043 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T044 [P] [US4] Create `src/components/VariablesPanel/__tests__/VariablesPanel.delete.spec.tsx` with tests for delete and confirmation dialog

### Implementation for User Story 4

- [ ] T045 [US4] Update `src/components/VariablesPanel/VariableItem.tsx` with delete button on hover
- [ ] T046 [US4] Update `src/components/VariablesPanel/VariablesPanel.tsx` with delete confirmation dialog for used variables
- [ ] T047 [US4] Update `src/components/VariablesPanel/VariablesPanel.module.css` with confirmation dialog styling
- [ ] T048 [US4] Run all US4 tests and verify they pass
- [ ] T049 [US4] **Commit**: Stage and commit User Story 4 with message "feat(027): Add variable deletion (US4)"

**Checkpoint**: User Story 4 complete - variables can be deleted

---

## Phase 7: User Story 5 - View Variable Usage (Priority: P3)

**Goal**: Show usage count badge and popover listing referencing views

**Independent Test**: Click usage badge to see popover with referencing view list

**Functional Requirements**: FR-014, FR-015

### Tests for User Story 5

- [ ] T050 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T051 [P] [US5] Create `src/components/VariablesPanel/__tests__/VariableItem.usage.spec.tsx` with tests for usage badge and popover

### Implementation for User Story 5

- [ ] T052 [US5] Update `src/components/VariablesPanel/VariableItem.tsx` with usage count badge
- [ ] T053 [US5] Update `src/components/VariablesPanel/VariablesPanel.tsx` with usage popover component
- [ ] T054 [US5] Update styles for usage badge and popover
- [ ] T055 [US5] Run all US5 tests and verify they pass
- [ ] T056 [US5] **Commit**: Stage and commit User Story 5 with message "feat(027): Add variable usage tracking (US5)"

**Checkpoint**: User Story 5 complete - usage tracking works

---

## Phase 8: User Story 6 - Undo/Redo Support (Priority: P2)

**Goal**: All operations undoable/redoable via Ctrl+Z/Ctrl+Y

**Independent Test**: Add variable, undo, verify removed; redo, verify restored

**Functional Requirements**: FR-016

### Tests for User Story 6

- [ ] T057 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T058 [P] [US6] Create `src/components/VariablesPanel/__tests__/VariablesPanel.history.spec.tsx` with tests for undo/redo all operations

### Implementation for User Story 6

- [ ] T059 [US6] Update `src/components/VariablesPanel/VariablesPanel.tsx` to call `initVariableHistoryOperations()` in onMount
- [ ] T060 [US6] Verify all add/edit/delete operations push to historyStore
- [ ] T061 [US6] Run all US6 tests and verify they pass
- [ ] T062 [US6] **Commit**: Stage and commit User Story 6 with message "feat(027): Add undo/redo support (US6)"

**Checkpoint**: All user stories complete - full functionality ready

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and verification

- [ ] T063 Verify all 16 functional requirements (FR-001 to FR-016) are met with test evidence
- [ ] T064 Verify all 4 success criteria (SC-001 to SC-004) are met
- [ ] T065 Update compliance table in `specs/027-variables-panel/spec.md` with ✅ MET status and evidence
- [ ] T066 Update `CLAUDE.md` with new VariablesPanel utilities and patterns
- [ ] T067 **Commit**: Stage and commit Polish phase with message "docs(027): Update compliance table and documentation"

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
- [ ] TFINAL-2 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with an appropriate message
- [ ] TFINAL-3 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup/Domain)**: No dependencies - can start immediately
- **Phase 2 (Foundational/Store)**: Depends on Phase 1 - BLOCKS all user stories
- **Phases 3-8 (User Stories)**: All depend on Phase 2 completion
  - US1 (View) → MVP, can start first
  - US2 (Add) → Depends on US1 components
  - US3 (Edit) → Depends on US1 components
  - US4 (Delete) → Depends on US1 components, uses US5 usage tracking
  - US5 (Usage) → Depends on US1 components
  - US6 (History) → Depends on US2, US3, US4 operations
- **Phase 9 (Polish)**: Depends on all user stories being complete
- **Phase Final-1 (Quality Gates)**: Depends on Phase 9
- **Phase Final (Git)**: Depends on Phase Final-1

### User Story Dependencies

| Story | Dependencies | Can Parallelize With |
|-------|-------------|---------------------|
| US1 (View) | Phase 2 only | - |
| US2 (Add) | US1 | US3, US5 |
| US3 (Edit) | US1 | US2, US5 |
| US4 (Delete) | US1, US5 | - |
| US5 (Usage) | US1 | US2, US3 |
| US6 (History) | US2, US3, US4 | - |

### Parallel Opportunities

**Phase 1** (all different files):
- T002, T003, T004, T005 can run in parallel

**Phase 2** (sequential - same file):
- T011-T017 should be sequential (same documentStore.ts file)

**Phase 3 (US1)**:
- T021, T022 tests in parallel
- T023, T024 components in parallel

**Phase 4-7 (US2-US5)**:
- Can start after US1 completes
- US2, US3, US5 can run in parallel (different concerns)
- US4 should wait for US5 (needs usage tracking)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Domain utilities
2. Complete Phase 2: Store extensions (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (View variables)
4. **STOP and VALIDATE**: Test viewing variables independently
5. Deploy/demo if ready - users can see variables

### Incremental Delivery

1. Domain + Store → Foundation ready
2. Add US1 (View) → Test independently → Users can see variables
3. Add US2 (Add) → Test independently → Users can create variables
4. Add US3 (Edit) → Test independently → Users can modify variables
5. Add US4+US5 (Delete+Usage) → Test independently → Full CRUD with safety
6. Add US6 (History) → Test independently → Full undo/redo support
7. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Follow existing ControlTagsPanel (026) patterns exactly
- Variable reference syntax: `var.variableName` (from clarification)
- Always read `specs/TESTING-GUIDE.md` before writing tests
- Commit after each phase with descriptive message
