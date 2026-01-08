# Tasks: Gradients Panel

**Input**: Design documents from `/specs/025-gradients-panel/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests. This ensures SolidJS-specific patterns (microtask flushing, testInRoot, etc.) are followed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. This feature follows the established pattern from BitmapsPanel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Domain Infrastructure)

**Purpose**: Create directory structure and foundational domain utilities

- [x] T001 Create directory structure: `src/domain/gradients/` and `src/domain/gradients/__tests__/`
- [x] T002 Create directory structure: `src/components/GradientsPanel/` and `src/components/GradientsPanel/__tests__/`
- [x] T003 Extend history types: Add gradient operation types to `src/types/history.ts`
- [ ] T004 **Commit**: Stage and commit Phase 1 setup changes

---

## Phase 2: Foundational (Store Extensions + Domain Utilities)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Store Extensions

- [ ] T005 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T006 [P] Write tests for getGradients() in `src/stores/__tests__/documentStore.gradients.spec.ts`
- [ ] T007 [P] Write tests for addGradient() in `src/stores/__tests__/documentStore.gradients.spec.ts`
- [ ] T008 [P] Write tests for updateGradientName() in `src/stores/__tests__/documentStore.gradients.spec.ts`
- [ ] T009 [P] Write tests for updateGradientStops() in `src/stores/__tests__/documentStore.gradients.spec.ts`
- [ ] T010 [P] Write tests for deleteGradient() in `src/stores/__tests__/documentStore.gradients.spec.ts`
- [ ] T011 Implement getGradients() in `src/stores/documentStore.ts`
- [ ] T012 Implement addGradient() in `src/stores/documentStore.ts`
- [ ] T013 Implement updateGradientName() in `src/stores/documentStore.ts`
- [ ] T014 Implement updateGradientStops() in `src/stores/documentStore.ts`
- [ ] T015 Implement deleteGradient() with reference clearing in `src/stores/documentStore.ts`
- [ ] T016 Implement restoreGradientReference() for undo support in `src/stores/documentStore.ts`

### Domain Utilities - Validation

- [ ] T017 [P] Write tests for validateGradientName() in `src/domain/gradients/__tests__/validation.spec.ts`
- [ ] T018 [P] Implement validateGradientName() in `src/domain/gradients/validation.ts`

### Domain Utilities - Formatting

- [ ] T019 [P] Write tests for truncateGradientName() and formatStopCount() in `src/domain/gradients/__tests__/formatting.spec.ts`
- [ ] T020 [P] Implement truncateGradientName() and formatStopCount() in `src/domain/gradients/formatting.ts`

### Domain Utilities - Stop Calculations

- [ ] T021 [P] Write tests for normalizePosition(), sortStops() in `src/domain/gradients/__tests__/stopCalculations.spec.ts`
- [ ] T022 [P] Write tests for interpolateColor(), getColorAtPosition() in `src/domain/gradients/__tests__/stopCalculations.spec.ts`
- [ ] T023 Implement normalizePosition(), sortStops() in `src/domain/gradients/stopCalculations.ts`
- [ ] T024 Implement interpolateColor(), getColorAtPosition() in `src/domain/gradients/stopCalculations.ts`

### Domain Utilities - Usage Tracking

- [ ] T025 [P] Write tests for findGradientUsages() in `src/domain/gradients/__tests__/usage.spec.ts`
- [ ] T026 [P] Implement GRADIENT_ATTRIBUTES constant and findGradientUsages() in `src/domain/gradients/usage.ts`

### Domain Utilities - History Operations

- [ ] T027 [P] Write tests for all history operation factories in `src/domain/gradients/__tests__/historyOperations.spec.ts`
- [ ] T028 Implement createAddGradientOperation() in `src/domain/gradients/historyOperations.ts`
- [ ] T029 Implement createEditGradientNameOperation() in `src/domain/gradients/historyOperations.ts`
- [ ] T030 Implement createEditGradientStopsOperation() in `src/domain/gradients/historyOperations.ts`
- [ ] T031 Implement createDeleteGradientOperation() in `src/domain/gradients/historyOperations.ts`

### Barrel Export

- [ ] T032 Create barrel export in `src/domain/gradients/index.ts`
- [ ] T033 **Commit**: Stage and commit Phase 2 foundational changes

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Gradient Resources (Priority: P1) 🎯 MVP

**Goal**: Display all defined gradients in a dedicated sidebar panel with names and visual previews

**Independent Test**: Load a uidesc file with gradient definitions and verify all gradients appear in the panel with their names and visual previews

**Requirements**: FR-001, FR-002, FR-003, FR-004

### Tests for User Story 1

- [ ] T034 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T035 [P] [US1] Write tests for GradientPreview in `src/components/GradientsPanel/__tests__/GradientPreview.spec.tsx`
- [ ] T036 [P] [US1] Write tests for EmptyState in `src/components/GradientsPanel/__tests__/EmptyState.spec.tsx`
- [ ] T037 [P] [US1] Write tests for GradientsPanel displaying list in `src/components/GradientsPanel/__tests__/GradientsPanel.spec.tsx`

### Implementation for User Story 1

- [ ] T038 [P] [US1] Add design tokens for gradients in `src/styles/tokens.css`
- [ ] T039 [P] [US1] Create GradientPreview component in `src/components/GradientsPanel/GradientPreview.tsx`
- [ ] T040 [P] [US1] Create GradientPreview.module.css in `src/components/GradientsPanel/GradientPreview.module.css`
- [ ] T041 [P] [US1] Create EmptyState component in `src/components/GradientsPanel/EmptyState.tsx`
- [ ] T042 [P] [US1] Create EmptyState.module.css in `src/components/GradientsPanel/EmptyState.module.css`
- [ ] T043 [US1] Create GradientsPanel component with CollapsibleSection in `src/components/GradientsPanel/GradientsPanel.tsx`
- [ ] T044 [US1] Create GradientsPanel.module.css in `src/components/GradientsPanel/GradientsPanel.module.css`
- [ ] T045 [US1] Create barrel export in `src/components/GradientsPanel/index.ts`
- [ ] T046 [US1] Wire GradientsPanel to App.tsx left sidebar
- [ ] T047 [US1] **Commit**: Stage and commit User Story 1 changes

**Checkpoint**: User Story 1 complete - can view gradients with previews

---

## Phase 4: User Story 2 - Add New Gradient (Priority: P2)

**Goal**: Add new gradients with auto-generated unique names and default 2-stop gradient

**Independent Test**: Click the Add button, verify a new gradient is created with a unique name and default 2-stop gradient

**Requirements**: FR-005, FR-006, FR-007, FR-022 (add undo)

### Tests for User Story 2

- [ ] T048 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T049 [P] [US2] Write tests for AddGradientButton in `src/components/GradientsPanel/__tests__/AddGradientButton.spec.tsx`
- [ ] T050 [P] [US2] Write tests for add gradient with undo in GradientsPanel tests

### Implementation for User Story 2

- [ ] T051 [P] [US2] Create AddGradientButton component in `src/components/GradientsPanel/AddGradientButton.tsx`
- [ ] T052 [P] [US2] Create AddGradientButton.module.css in `src/components/GradientsPanel/AddGradientButton.module.css`
- [ ] T053 [US2] Integrate AddGradientButton into GradientsPanel header
- [ ] T054 [US2] Implement add gradient handler with history operation in GradientsPanel
- [ ] T055 [US2] Update barrel export in `src/components/GradientsPanel/index.ts`
- [ ] T056 [US2] **Commit**: Stage and commit User Story 2 changes

**Checkpoint**: User Story 2 complete - can add new gradients

---

## Phase 5: User Story 3 - Edit Gradient Name and Stops (Priority: P2)

**Goal**: Edit gradient names and color stops with visual editor

**Independent Test**: Double-click a gradient name to rename it; expand a gradient and modify color stops via the visual editor

**Requirements**: FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-022 (edit undo), FR-023

### Tests for User Story 3

- [ ] T057 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T058 [P] [US3] Write tests for GradientItem rename functionality in `src/components/GradientsPanel/__tests__/GradientItem.spec.tsx`
- [ ] T059 [P] [US3] Write tests for GradientItem expand/collapse in `src/components/GradientsPanel/__tests__/GradientItem.spec.tsx`
- [ ] T060 [P] [US3] Write tests for GradientStopEditor drag position in `src/components/GradientsPanel/__tests__/GradientStopEditor.spec.tsx`
- [ ] T061 [P] [US3] Write tests for GradientStopEditor color picker in `src/components/GradientsPanel/__tests__/GradientStopEditor.spec.tsx`

### Implementation for User Story 3

- [ ] T062 [P] [US3] Create GradientItem component with name display and preview in `src/components/GradientsPanel/GradientItem.tsx`
- [ ] T063 [P] [US3] Create GradientItem.module.css in `src/components/GradientsPanel/GradientItem.module.css`
- [ ] T064 [US3] Add inline rename (double-click) with validation to GradientItem
- [ ] T065 [US3] Add expand/collapse functionality to GradientItem
- [ ] T066 [US3] Create GradientStopEditor component with gradient bar in `src/components/GradientsPanel/GradientStopEditor.tsx`
- [ ] T067 [US3] Create GradientStopEditor.module.css in `src/components/GradientsPanel/GradientStopEditor.module.css`
- [ ] T068 [US3] Implement stop handle drag for position change in GradientStopEditor
- [ ] T069 [US3] Implement stop click for color picker in GradientStopEditor
- [ ] T070 [US3] Integrate GradientStopEditor into expanded GradientItem
- [ ] T071 [US3] Wire rename and stop edit handlers with history operations in GradientsPanel
- [ ] T072 [US3] Update barrel export in `src/components/GradientsPanel/index.ts`
- [ ] T073 [US3] **Commit**: Stage and commit User Story 3 changes

**Checkpoint**: User Story 3 complete - can rename gradients and edit stops

---

## Phase 6: User Story 4 - Add and Remove Color Stops (Priority: P2)

**Goal**: Add and remove color stops from gradients with interpolated colors

**Independent Test**: Click on the gradient bar to add a new stop; drag a stop off the bar to remove it

**Requirements**: FR-014, FR-015, FR-016, FR-022 (stop add/remove undo)

### Tests for User Story 4

- [ ] T074 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T075 [P] [US4] Write tests for add stop on bar click in `src/components/GradientsPanel/__tests__/GradientStopEditor.spec.tsx`
- [ ] T076 [P] [US4] Write tests for remove stop by drag-off in `src/components/GradientsPanel/__tests__/GradientStopEditor.spec.tsx`
- [ ] T077 [P] [US4] Write tests for minimum 2 stops enforcement in `src/components/GradientsPanel/__tests__/GradientStopEditor.spec.tsx`

### Implementation for User Story 4

- [ ] T078 [US4] Implement click-to-add stop with interpolated color in GradientStopEditor
- [ ] T079 [US4] Implement drag-off-to-remove stop in GradientStopEditor
- [ ] T080 [US4] Implement minimum 2 stops enforcement in GradientStopEditor
- [ ] T081 [US4] Wire add/remove stop changes with history operations
- [ ] T082 [US4] **Commit**: Stage and commit User Story 4 changes

**Checkpoint**: User Story 4 complete - can add and remove color stops

---

## Phase 7: User Story 5 - Delete Gradient (Priority: P3)

**Goal**: Delete gradients with confirmation dialog for used gradients

**Independent Test**: Delete an unused gradient immediately; delete a used gradient after confirming the warning dialog

**Requirements**: FR-017, FR-018, FR-019, FR-022 (delete undo)

### Tests for User Story 5

- [ ] T083 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T084 [P] [US5] Write tests for delete button hover visibility in `src/components/GradientsPanel/__tests__/GradientItem.spec.tsx`
- [ ] T085 [P] [US5] Write tests for delete confirmation dialog in `src/components/GradientsPanel/__tests__/GradientsPanel.spec.tsx`
- [ ] T086 [P] [US5] Write tests for delete with reference clearing in `src/components/GradientsPanel/__tests__/GradientsPanel.spec.tsx`

### Implementation for User Story 5

- [ ] T087 [US5] Add delete button to GradientItem (visible on hover)
- [ ] T088 [US5] Implement confirmation dialog for used gradients in GradientsPanel
- [ ] T089 [US5] Wire delete handler with history operation and reference clearing
- [ ] T090 [US5] **Commit**: Stage and commit User Story 5 changes

**Checkpoint**: User Story 5 complete - can delete gradients

---

## Phase 8: User Story 6 - View Gradient Usage (Priority: P3)

**Goal**: Display usage count badge and popover listing referencing views

**Independent Test**: Click the usage badge on a gradient to see a popover listing all views that reference it

**Requirements**: FR-020, FR-021

### Tests for User Story 6

- [ ] T091 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T092 [P] [US6] Write tests for usage badge display in `src/components/GradientsPanel/__tests__/GradientItem.spec.tsx`
- [ ] T093 [P] [US6] Write tests for usage popover in `src/components/GradientsPanel/__tests__/GradientItem.spec.tsx`

### Implementation for User Story 6

- [ ] T094 [US6] Add usage badge to GradientItem
- [ ] T095 [US6] Implement usage popover with view list in GradientItem
- [ ] T096 [US6] Style usage badge and popover in GradientItem.module.css
- [ ] T097 [US6] **Commit**: Stage and commit User Story 6 changes

**Checkpoint**: User Story 6 complete - can view gradient usage

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, documentation updates, and success criteria verification

- [ ] T098 [P] Run all tests and verify 80%+ coverage for business logic
- [ ] T099 [P] Update CLAUDE.md with GradientsPanel utilities and patterns
- [ ] T100 [P] Add keyboard accessibility (Enter/Escape for rename, focus management)
- [ ] T101 Run quickstart.md validation scenarios
- [ ] T102 Verify SC-001: Measure panel load time is <1 second after file load
- [ ] T103 Verify SC-002: Measure add/rename/delete operations complete in <5 seconds each
- [ ] T104 **Commit**: Stage and commit Polish phase changes

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

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (MVP)
- **User Story 2 (Phase 4)**: Depends on Foundational
- **User Story 3 (Phase 5)**: Depends on Foundational
- **User Story 4 (Phase 6)**: Depends on User Story 3 (extends GradientStopEditor)
- **User Story 5 (Phase 7)**: Depends on Foundational
- **User Story 6 (Phase 8)**: Depends on Foundational
- **Polish (Phase 9)**: Depends on all user stories
- **Quality Gates (Final-1)**: Depends on Polish
- **Git Verification (Final)**: Depends on Quality Gates

### User Story Dependencies

- **US1 (View)**: Foundation only - MVP baseline
- **US2 (Add)**: Foundation only - can start parallel to US1
- **US3 (Edit)**: Foundation only - can start parallel to US1, US2
- **US4 (Add/Remove Stops)**: Depends on US3 (GradientStopEditor)
- **US5 (Delete)**: Foundation only - can start parallel to US1, US2, US3
- **US6 (Usage)**: Foundation only - can start parallel to US1, US2, US3, US5

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Components before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 2 (Foundational)** - Maximum parallelism:
- T006-T010: All store tests in parallel
- T017, T019, T21-T22, T25, T27: All domain tests in parallel
- T18, T20, T23-T24, T26: Domain implementations (after respective tests)

**User Stories** - Can run in parallel after Foundation:
- US1, US2, US3, US5, US6: All independent of each other
- US4: Must wait for US3 (GradientStopEditor)

---

## Parallel Example: Phase 2 Domain Tests

```bash
# Launch all domain tests together:
Task: "Write tests for validateGradientName() in src/domain/gradients/__tests__/validation.spec.ts"
Task: "Write tests for truncateGradientName() and formatStopCount() in src/domain/gradients/__tests__/formatting.spec.ts"
Task: "Write tests for normalizePosition(), sortStops() in src/domain/gradients/__tests__/stopCalculations.spec.ts"
Task: "Write tests for findGradientUsages() in src/domain/gradients/__tests__/usage.spec.ts"
Task: "Write tests for all history operation factories in src/domain/gradients/__tests__/historyOperations.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (View gradients)
4. **STOP and VALIDATE**: Panel shows gradients with previews
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (View) → MVP - can see gradients
3. Add US2 (Add) → Can create new gradients
4. Add US3 (Edit) → Can rename and edit stops
5. Add US4 (Add/Remove Stops) → Full stop editing
6. Add US5 (Delete) → Can clean up gradients
7. Add US6 (Usage) → Can see impact of changes
8. Each story adds value without breaking previous stories

---

## Task Summary

| Phase | Tasks | Parallel Opportunities |
|-------|-------|----------------------|
| Phase 1: Setup | 4 | 0 |
| Phase 2: Foundational | 29 | 16 |
| Phase 3: US1 (View) | 14 | 7 |
| Phase 4: US2 (Add) | 9 | 4 |
| Phase 5: US3 (Edit) | 17 | 8 |
| Phase 6: US4 (Stops) | 9 | 4 |
| Phase 7: US5 (Delete) | 8 | 4 |
| Phase 8: US6 (Usage) | 7 | 3 |
| Phase 9: Polish | 7 | 3 |
| Quality Gates | 4 | 0 |
| Git Verification | 3 | 0 |
| **TOTAL** | **111** | **49** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
