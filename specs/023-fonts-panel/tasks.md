# Tasks: Fonts Panel

**Input**: Design documents from `/specs/023-fonts-panel/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Following Constitution Principle I (Test-First Development), all implementation tasks include corresponding tests written FIRST.

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` patterns are followed (microtask flushing, testInRoot, etc.).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Domain Layer)

**Purpose**: Create foundational domain logic for fonts (validation, formatting, usage tracking, history operations)

- [ ] T001 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T002 [P] Create font validation tests in `src/domain/fonts/__tests__/validation.spec.ts`
- [ ] T003 [P] Create font formatting tests in `src/domain/fonts/__tests__/formatting.spec.ts`
- [ ] T004 [P] Create font usage tracking tests in `src/domain/fonts/__tests__/usage.spec.ts`
- [ ] T005 [P] Create font history operations tests in `src/domain/fonts/__tests__/historyOperations.spec.ts`
- [ ] T006 [P] Implement font validation in `src/domain/fonts/validation.ts`
- [ ] T007 [P] Implement font formatting in `src/domain/fonts/formatting.ts`
- [ ] T008 [P] Implement font usage tracking in `src/domain/fonts/usage.ts`
- [ ] T009 [P] Implement font history operations in `src/domain/fonts/historyOperations.ts`
- [ ] T010 Create barrel export in `src/domain/fonts/index.ts`
- [ ] T011 **Commit**: Stage and commit Phase 1 changes with message "feat(023): add font domain layer"

---

## Phase 2: Foundational (Store Extensions)

**Purpose**: Extend documentStore with font CRUD operations - BLOCKS all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T012 Create tests for font store operations in `src/stores/__tests__/documentStore.fonts.spec.ts`
- [ ] T013 Extend `src/stores/documentStore.ts` with `getFonts()`, `addFont()`, `updateFontName()`, `updateFontProperty()`, `deleteFont()` functions
- [ ] T014 Add `RemovedFontReference` type to store or types file
- [ ] T015 Run all tests to verify store extensions work correctly
- [ ] T016 **Commit**: Stage and commit Phase 2 changes with message "feat(023): extend documentStore with font operations"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Fonts List (Priority: P1) 🎯 MVP

**Goal**: Display all defined fonts in a dedicated Fonts panel with name, properties, and sample preview

**Independent Test**: Load a uidesc file with fonts and verify all fonts appear in the panel with name, size, style indicators (B/I), and sample text preview

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T017 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T018 [P] [US1] Create FontsPanel component tests in `src/components/FontsPanel/__tests__/FontsPanel.spec.tsx`
- [ ] T019 [P] [US1] Create FontItem component tests in `src/components/FontsPanel/__tests__/FontItem.spec.tsx`
- [ ] T020 [P] [US1] Create FontPreview component tests in `src/components/FontsPanel/__tests__/FontPreview.spec.tsx`
- [ ] T021 [P] [US1] Create EmptyState component tests in `src/components/FontsPanel/__tests__/EmptyState.spec.tsx`

### Implementation for User Story 1

- [ ] T022 [P] [US1] Create FontPreview component in `src/components/FontsPanel/FontPreview.tsx` with CSS module
- [ ] T023 [P] [US1] Create EmptyState component in `src/components/FontsPanel/EmptyState.tsx` with CSS module
- [ ] T024 [US1] Create FontItem component in `src/components/FontsPanel/FontItem.tsx` with CSS module (display mode only)
- [ ] T025 [US1] Create FontsPanel component in `src/components/FontsPanel/FontsPanel.tsx` with CSS module
- [ ] T026 [US1] Create barrel export in `src/components/FontsPanel/index.ts`
- [ ] T027 [US1] Run tests to verify US1 implementation
- [ ] T028 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(023): implement fonts panel display (US1)"

**Checkpoint**: User Story 1 should be fully functional - fonts list displays with previews

---

## Phase 4: User Story 2 - Add New Font (Priority: P1)

**Goal**: Allow users to add new fonts with required properties (font-name, size) and optional properties

**Independent Test**: Click "Add Font", enter name and properties, verify font appears in panel and uidesc JSON

### Tests for User Story 2

- [ ] T029 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T030 [P] [US2] Create AddFontButton component tests in `src/components/FontsPanel/__tests__/AddFontButton.spec.tsx`
- [ ] T031 [P] [US2] Create FontsPanel add tests in `src/components/FontsPanel/__tests__/FontsPanel.add.spec.tsx`

### Implementation for User Story 2

- [ ] T032 [US2] Create AddFontButton component in `src/components/FontsPanel/AddFontButton.tsx` with CSS module
- [ ] T033 [US2] Add `handleAddFont` to FontsPanel with unique name generation
- [ ] T034 [US2] Integrate AddFontButton with FontsPanel
- [ ] T035 [US2] Run tests to verify US2 implementation
- [ ] T036 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(023): implement add font functionality (US2)"

**Checkpoint**: User Story 2 complete - users can add new fonts

---

## Phase 5: User Story 3 - Edit Existing Font (Priority: P1)

**Goal**: Allow inline editing of font properties with live preview and validation

**Independent Test**: Click on a font, change properties, verify changes persist and preview updates live

### Tests for User Story 3

- [ ] T037 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T038 [P] [US3] Create FontItem edit tests in `src/components/FontsPanel/__tests__/FontItem.edit.spec.tsx`
- [ ] T039 [P] [US3] Create FontItem validation tests in `src/components/FontsPanel/__tests__/FontItem.validation.spec.tsx`

### Implementation for User Story 3

- [ ] T040 [US3] Add inline editing state to FontItem (editingProperty signal)
- [ ] T041 [US3] Implement name editing with validation (unique, non-empty)
- [ ] T042 [US3] Implement font-name editing
- [ ] T043 [US3] Implement size editing with validation (positive number, warn if >72pt per edge case)
- [ ] T044 [US3] Implement boolean property toggles (bold, italic, underline, strike-through)
- [ ] T045 [US3] Implement alternative-font-names editing
- [ ] T046 [US3] Add live preview update during editing (include visual warning if system font not found)
- [ ] T047 [US3] Add Escape key to cancel editing
- [ ] T048 [US3] Run tests to verify US3 implementation
- [ ] T049 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(023): implement font editing (US3)"

**Checkpoint**: User Story 3 complete - users can edit all font properties

---

## Phase 6: User Story 4 - Delete Font (Priority: P2)

**Goal**: Allow deletion of fonts with usage warning and confirmation for fonts in use

**Independent Test**: Select a font, click delete, verify font is removed (with confirmation if in use)

### Tests for User Story 4

- [ ] T050 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T051 [P] [US4] Create FontItem delete tests in `src/components/FontsPanel/__tests__/FontItem.delete.spec.tsx`

### Implementation for User Story 4

- [ ] T052 [US4] Add delete button to FontItem (visible on hover)
- [ ] T053 [US4] Implement delete confirmation dialog for fonts in use
- [ ] T054 [US4] Implement `handleDeleteRequest` and `performDelete` in FontsPanel
- [ ] T055 [US4] Run tests to verify US4 implementation
- [ ] T056 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(023): implement font deletion (US4)"

**Checkpoint**: User Story 4 complete - users can delete fonts

---

## Phase 7: User Story 5 - View Font Usage (Priority: P2)

**Goal**: Display which views use each font via usage badge and popover

**Independent Test**: Click on font usage indicator, verify list of views using that font appears

### Tests for User Story 5

- [ ] T057 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T058 [P] [US5] Create FontItem usage tests in `src/components/FontsPanel/__tests__/FontItem.usage.spec.tsx`

### Implementation for User Story 5

- [ ] T059 [US5] Add usage count badge to FontItem
- [ ] T060 [US5] Implement usage popover in FontsPanel
- [ ] T061 [US5] Wire up `onUsageClick` handler
- [ ] T062 [US5] Run tests to verify US5 implementation
- [ ] T063 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(023): implement font usage tracking (US5)"

**Checkpoint**: User Story 5 complete - users can see which views use each font

---

## Phase 8: User Story 6 - Undo/Redo Font Operations (Priority: P2)

**Goal**: Integrate all font operations with existing undo/redo system

**Independent Test**: Add/edit/delete font, press Ctrl+Z to undo, verify font state reverts

### Tests for User Story 6

- [ ] T064 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T065 [P] [US6] Create FontsPanel history tests in `src/components/FontsPanel/__tests__/FontsPanel.history.spec.tsx`

### Implementation for User Story 6

- [ ] T066 [US6] Integrate `pushOperation` with add font action
- [ ] T067 [US6] Integrate `pushOperation` with edit font actions (name, properties)
- [ ] T068 [US6] Integrate `pushOperation` with delete font action (including reference cleanup)
- [ ] T069 [US6] Run tests to verify US6 implementation
- [ ] T070 [US6] **Commit**: Stage and commit User Story 6 changes with message "feat(023): integrate font operations with undo/redo (US6)"

**Checkpoint**: All user stories complete - full undo/redo support

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, cleanup, and documentation

- [ ] T071 [P] Verify all CSS follows design token patterns
- [ ] T072 [P] Add ARIA labels and keyboard navigation to FontsPanel
- [ ] T073 Update CLAUDE.md with new FontsPanel utilities documentation
- [ ] T074 Run full test suite to verify all tests pass
- [ ] T075 **Performance Verification (SC-001)**: Verify fonts panel renders within 100ms by manual testing with console.time or React DevTools equivalent
- [ ] T076 **Performance Verification (SC-003)**: Verify font preview updates within 50ms during editing by manual testing
- [ ] T077 **Commit**: Stage and commit Polish phase changes with message "docs(023): update documentation and polish"

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

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Phase 2 completion
  - US1-US3 (P1) should complete before US4-US6 (P2)
  - Within priority, stories can proceed sequentially
- **Polish (Phase 9)**: Depends on all user stories being complete
- **Quality Gates (Final-1)**: Depends on Polish
- **Git Verification (Final)**: Depends on Quality Gates

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - MVP
- **User Story 2 (P1)**: No dependencies - adds to US1
- **User Story 3 (P1)**: Builds on US1 FontItem component
- **User Story 4 (P2)**: Uses domain layer from Phase 1
- **User Story 5 (P2)**: Uses usage tracking from Phase 1
- **User Story 6 (P2)**: Uses history operations from Phase 1

### Within Each User Story

- **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
- Tests MUST be written and FAIL before implementation
- Component tests before component implementation
- Run tests after implementation to verify

### Parallel Opportunities

- All Phase 1 domain layer tasks marked [P] can run in parallel
- Test files within a story marked [P] can run in parallel
- Implementation tasks for different components marked [P] can run in parallel

---

## Parallel Example: Phase 1 Domain Layer

```bash
# Launch all domain tests in parallel:
Task: "Create font validation tests in src/domain/fonts/__tests__/validation.spec.ts"
Task: "Create font formatting tests in src/domain/fonts/__tests__/formatting.spec.ts"
Task: "Create font usage tracking tests in src/domain/fonts/__tests__/usage.spec.ts"
Task: "Create font history operations tests in src/domain/fonts/__tests__/historyOperations.spec.ts"

# Then launch all implementations in parallel:
Task: "Implement font validation in src/domain/fonts/validation.ts"
Task: "Implement font formatting in src/domain/fonts/formatting.ts"
Task: "Implement font usage tracking in src/domain/fonts/usage.ts"
Task: "Implement font history operations in src/domain/fonts/historyOperations.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Domain Layer
2. Complete Phase 2: Store Extensions (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (View Fonts List)
4. Complete Phase 4: User Story 2 (Add Font)
5. Complete Phase 5: User Story 3 (Edit Font)
6. **STOP and VALIDATE**: Test basic CRUD independently
7. Deploy/demo if ready - core functionality complete

### Full Implementation

1. Complete MVP (US1-US3)
2. Add User Story 4: Delete Font
3. Add User Story 5: Usage Tracking
4. Add User Story 6: Undo/Redo Integration
5. Polish and verify all quality gates

---

## Task Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1 | 11 | Domain layer (validation, formatting, usage, history) |
| Phase 2 | 5 | Store extensions |
| Phase 3 (US1) | 12 | View fonts list |
| Phase 4 (US2) | 8 | Add font |
| Phase 5 (US3) | 13 | Edit font |
| Phase 6 (US4) | 7 | Delete font |
| Phase 7 (US5) | 7 | Usage tracking |
| Phase 8 (US6) | 7 | Undo/redo |
| Phase 9 | 7 | Polish (incl. performance verification) |
| Final-1 | 4 | Quality gates |
| Final | 3 | Git verification |
| **Total** | **84** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
