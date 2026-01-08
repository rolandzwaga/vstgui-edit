# Tasks: Bitmaps Panel

**Input**: Design documents from `/specs/024-bitmaps-panel/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Tests are REQUIRED - follow TDD approach per project constitution.

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests. This ensures SolidJS-specific patterns (microtask flushing, testInRoot, etc.) are followed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Domain Layer Structure)

**Purpose**: Create domain layer structure and barrel exports

- [ ] T001 Create directory structure `src/domain/bitmaps/` with `__tests__/` subdirectory
- [ ] T002 Create barrel export `src/domain/bitmaps/index.ts` (empty, will populate)
- [ ] T003 **Commit**: Stage and commit Phase 1 setup changes

---

## Phase 2: Foundational (Domain Logic & Store Extensions)

**Purpose**: Core domain functions and store operations that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Domain Tests (TDD - Write First)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T004 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T005 [P] Write validation tests in `src/domain/bitmaps/__tests__/validation.spec.ts` (name uniqueness, non-empty)
- [ ] T006 [P] Write formatting tests in `src/domain/bitmaps/__tests__/formatting.spec.ts` (path truncation)
- [ ] T007 [P] Write usage tests in `src/domain/bitmaps/__tests__/usage.spec.ts` (find bitmap refs in views)
- [ ] T008 [P] Write thumbnail tests in `src/domain/bitmaps/__tests__/thumbnail.spec.ts` (URL generation, base64, path)
- [ ] T009 [P] Write history operations tests in `src/domain/bitmaps/__tests__/historyOperations.spec.ts`

### Domain Implementation

- [ ] T010 [P] Implement `src/domain/bitmaps/validation.ts` (isValidBitmapName, isBitmapNameUnique)
- [ ] T011 [P] Implement `src/domain/bitmaps/formatting.ts` (truncatePath, formatBitmapDisplay)
- [ ] T012 [P] Implement `src/domain/bitmaps/usage.ts` (findBitmapUsages with BITMAP_ATTRIBUTES constant)
- [ ] T013 [P] Implement `src/domain/bitmaps/thumbnail.ts` (getThumbnailUrl, isEmbeddedBitmap, normalizeBitmap)
- [ ] T014 Implement `src/domain/bitmaps/historyOperations.ts` (create*Operation functions with DI pattern)
- [ ] T015 Update barrel export `src/domain/bitmaps/index.ts` with all exports

### Store Extensions

- [ ] T016 Add BITMAP_ATTRIBUTES constant to `src/stores/documentStore.ts`
- [ ] T017 Add RemovedBitmapReference interface to `src/stores/documentStore.ts`
- [ ] T018 Add removeBitmapReferencesFromView helper function to `src/stores/documentStore.ts`
- [ ] T019 Add getBitmaps function to `src/stores/documentStore.ts`
- [ ] T020 Add addBitmap function to `src/stores/documentStore.ts`
- [ ] T021 Add updateBitmapName function to `src/stores/documentStore.ts`
- [ ] T022 Add updateBitmapProperty function to `src/stores/documentStore.ts`
- [ ] T023 Add deleteBitmap function to `src/stores/documentStore.ts`
- [ ] T024 Verify all domain tests pass with `npm test -- --testPathPattern="domain/bitmaps"`
- [ ] T025 **Commit**: Stage and commit Phase 2 foundational changes

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Bitmap Resources (Priority: P1) 🎯 MVP

**Goal**: Display all bitmap resources in a dedicated sidebar panel with names and thumbnail previews

**Independent Test**: Load a uidesc file with bitmap definitions and verify all bitmaps appear in the panel with their names and thumbnail previews

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T026 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T027 [P] [US1] Write BitmapThumbnail tests in `src/components/BitmapsPanel/__tests__/BitmapThumbnail.spec.tsx`
- [ ] T028 [P] [US1] Write BitmapsPanel display tests in `src/components/BitmapsPanel/__tests__/BitmapsPanel.spec.tsx`
- [ ] T029 [P] [US1] Write EmptyState tests in `src/components/BitmapsPanel/__tests__/EmptyState.spec.tsx`

### Implementation for User Story 1

- [ ] T030 [P] [US1] Create `src/components/BitmapsPanel/BitmapThumbnail.tsx` (async img with loading/error states)
- [ ] T031 [P] [US1] Create `src/components/BitmapsPanel/BitmapThumbnail.module.css` (48x48 max, object-fit)
- [ ] T032 [P] [US1] Create `src/components/BitmapsPanel/EmptyState.tsx` (no bitmaps message)
- [ ] T033 [P] [US1] Create `src/components/BitmapsPanel/EmptyState.module.css`
- [ ] T034 [US1] Create `src/components/BitmapsPanel/BitmapItem.tsx` (display name + thumbnail, no editing yet)
- [ ] T035 [US1] Create `src/components/BitmapsPanel/BitmapItem.module.css`
- [ ] T036 [US1] Create `src/components/BitmapsPanel/BitmapsPanel.tsx` (CollapsibleSection, list bitmaps, empty state)
- [ ] T037 [US1] Create `src/components/BitmapsPanel/BitmapsPanel.module.css`
- [ ] T038 [US1] Create `src/components/BitmapsPanel/index.ts` barrel export
- [ ] T039 [US1] Wire BitmapsPanel to sidebar in `src/App.tsx` after FontsPanel
- [ ] T040 [US1] Verify User Story 1 tests pass with `npm test -- --testPathPattern="BitmapsPanel"`
- [ ] T041 [US1] **Commit**: Stage and commit User Story 1 changes

**Checkpoint**: Bitmaps Panel displays all bitmaps with thumbnails - MVP complete

---

## Phase 4: User Story 2 - Add New Bitmap (Priority: P2)

**Goal**: Allow users to add new bitmap resources with auto-generated unique names

**Independent Test**: Click Add, enter a path, verify new bitmap appears in list and document

### Tests for User Story 2 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T042 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T043 [P] [US2] Write add bitmap tests in `src/components/BitmapsPanel/__tests__/BitmapsPanel.add.spec.tsx`

### Implementation for User Story 2

- [ ] T044 [US2] Add AddBitmapButton to BitmapsPanel header actions in `src/components/BitmapsPanel/BitmapsPanel.tsx`
- [ ] T045 [US2] Implement add bitmap handler with unique name generation ("New Bitmap", "New Bitmap 2", etc.)
- [ ] T046 [US2] Integrate history operation for add bitmap (undo support)
- [ ] T047 [US2] Verify User Story 2 tests pass
- [ ] T048 [US2] **Commit**: Stage and commit User Story 2 changes

**Checkpoint**: Users can add new bitmaps with undo support

---

## Phase 5: User Story 3 - Edit Bitmap Properties (Priority: P2)

**Goal**: Enable editing bitmap name, path, scale-factor, and nineparttiled-offsets

**Independent Test**: Select a bitmap, modify properties, verify changes in panel and document

### Tests for User Story 3 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T049 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T050 [P] [US3] Write edit tests in `src/components/BitmapsPanel/__tests__/BitmapItem.edit.spec.tsx`
- [ ] T051 [P] [US3] Write validation tests in `src/components/BitmapsPanel/__tests__/BitmapItem.validation.spec.tsx`

### Implementation for User Story 3

- [ ] T052 [US3] Add inline name editing to BitmapItem (double-click, Enter/blur to save)
- [ ] T053 [US3] Add expanded state with property inputs (path, scale-factor, nineparttiled-offsets)
- [ ] T054 [US3] Implement name validation (unique, non-empty) with error display
- [ ] T055 [US3] Integrate history operations for name and property edits (undo support)
- [ ] T056 [US3] Update `src/components/BitmapsPanel/BitmapItem.module.css` for expanded state
- [ ] T057 [US3] Verify User Story 3 tests pass
- [ ] T058 [US3] **Commit**: Stage and commit User Story 3 changes

**Checkpoint**: Users can edit all bitmap properties with undo support

---

## Phase 6: User Story 4 - Delete Bitmap (Priority: P3)

**Goal**: Allow deletion with usage warnings and reference cleanup

**Independent Test**: Delete unused bitmap (immediate), delete used bitmap (warning + cleanup)

### Tests for User Story 4 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T059 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T060 [P] [US4] Write delete tests in `src/components/BitmapsPanel/__tests__/BitmapItem.delete.spec.tsx`

### Implementation for User Story 4

- [ ] T061 [US4] Add delete button (visible on hover) to BitmapItem
- [ ] T062 [US4] Implement delete handler with usage check
- [ ] T063 [US4] Add confirmation dialog for used bitmaps (show usage count)
- [ ] T064 [US4] Implement reference cleanup on confirmed deletion
- [ ] T065 [US4] Integrate history operation for delete (undo restores bitmap + references)
- [ ] T066 [US4] Verify User Story 4 tests pass
- [ ] T067 [US4] **Commit**: Stage and commit User Story 4 changes

**Checkpoint**: Users can delete bitmaps with warnings and undo support

---

## Phase 7: User Story 5 - View Bitmap Usage (Priority: P3)

**Goal**: Show usage count badge and popover with referencing views

**Independent Test**: Click usage badge on bitmap used by 2+ views, verify popover shows correct list

### Tests for User Story 5 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T068 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T069 [P] [US5] Write usage display tests in `src/components/BitmapsPanel/__tests__/BitmapItem.usage.spec.tsx`

### Implementation for User Story 5

- [ ] T070 [US5] Add usage count badge to BitmapItem (hidden when 0)
- [ ] T071 [US5] Implement usage popover component (list views with class and attribute)
- [ ] T072 [US5] Wire popover to badge click
- [ ] T073 [US5] Verify User Story 5 tests pass
- [ ] T074 [US5] **Commit**: Stage and commit User Story 5 changes

**Checkpoint**: All user stories complete

---

## Phase 8: History Integration

**Purpose**: Ensure all operations integrate with undo/redo system

- [ ] T075 Write history integration tests in `src/components/BitmapsPanel/__tests__/BitmapsPanel.history.spec.tsx`
- [ ] T076 Initialize bitmap history operations in app startup (call initBitmapHistoryOperations)
- [ ] T077 Verify undo/redo works for add, rename, edit property, delete operations
- [ ] T078 **Commit**: Stage and commit history integration changes

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and verification

- [ ] T079 Update compliance table in `specs/024-bitmaps-panel/spec.md` with test evidence
- [ ] T080 Verify all acceptance scenarios from spec.md are covered
- [ ] T081 Run quickstart.md validation scenarios manually
- [ ] T082 Code cleanup and refactoring if needed
- [ ] T083 **Commit**: Stage and commit polish changes

---

## Phase Final-1: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**⚠️ CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [ ] TQG-1 **CSS Linting**: Run `npm run lint:css` - Fix ALL errors and warnings
- [ ] TQG-2 **Code Quality**: Run `npm run check` - Fix ALL errors and warnings  
- [ ] TQG-3 **Type Safety**: Run `npm run typecheck` - Fix ALL errors and warnings
- [ ] TQG-4 **Tests**: Run `npm test` - ALL tests must pass
- [ ] TQG-5 **Verify Clean**: Re-run all commands to confirm zero issues remain

**If Quality Gates Fail**:
1. STOP - do not proceed to Git Verification
2. FIX all reported errors and warnings
3. RE-RUN the failing command(s)
4. REPEAT until all commands pass cleanly

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
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - Can proceed in priority order (P1 → P2 → P3)
- **History Integration (Phase 8)**: Depends on all user stories
- **Polish (Phase 9)**: Depends on Phase 8
- **Quality Gates**: Depends on all implementation phases
- **Git Verification**: Depends on Quality Gates passing

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - Displays bitmaps
- **User Story 2 (P2)**: Can start after US1 - Adds bitmaps
- **User Story 3 (P2)**: Can start after US1 - Edits bitmaps
- **User Story 4 (P3)**: Can start after US1 - Deletes bitmaps (uses usage from US5 domain)
- **User Story 5 (P3)**: Can start after US1 - Shows usage

### Parallel Opportunities

- T005-T009: All domain tests can run in parallel
- T010-T013: Independent domain modules can be implemented in parallel
- T027-T029: US1 component tests can run in parallel
- T030-T033: Independent components can be created in parallel

---

## Summary

- **Total Tasks**: 83
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 22 tasks (domain + store)
- **Phase 3 (US1 - View)**: 16 tasks
- **Phase 4 (US2 - Add)**: 7 tasks
- **Phase 5 (US3 - Edit)**: 10 tasks
- **Phase 6 (US4 - Delete)**: 9 tasks
- **Phase 7 (US5 - Usage)**: 7 tasks
- **Phase 8 (History)**: 4 tasks
- **Phase 9 (Polish)**: 5 tasks
- **Quality Gates**: 5 tasks
- **Git Verification**: 3 tasks

**MVP Scope**: Complete through Phase 3 (User Story 1) for minimal viable Bitmaps Panel
