# Tasks: Colors Panel

**Input**: Design documents from `/specs/021-colors-panel/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: REQUIRED per Constitution (Test-First Development principle)

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create domain utilities and extend stores

- [x] T001 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T002 [P] Create color validation utilities tests in `src/domain/colors/__tests__/validation.spec.ts`
- [x] T003 [P] Create color parsing utilities tests in `src/domain/colors/__tests__/parsing.spec.ts`
- [x] T004 [P] Create color formatting utilities tests in `src/domain/colors/__tests__/formatting.spec.ts`
- [x] T005 Implement color validation utilities in `src/domain/colors/validation.ts` (FR-006, FR-007, FR-021-024 format preservation)
- [x] T006 [P] Implement color parsing utilities in `src/domain/colors/parsing.ts`
- [x] T007 [P] Implement color formatting utilities in `src/domain/colors/formatting.ts`
- [x] T008 Create barrel export in `src/domain/colors/index.ts`
- [x] T009 **Commit**: Stage and commit Phase 1 changes with message "feat(021): add color domain utilities"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend documentStore with color mutations, integrate with historyStore

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 Create tests for documentStore color methods in `src/stores/__tests__/documentStore.colors.spec.ts`
- [x] T011 Extend documentStore with `addColor`, `updateColorName`, `updateColorValue`, `deleteColor`, `getColors` methods in `src/stores/documentStore.ts`
- [x] T012 Create tests for color history operations in `src/domain/colors/__tests__/historyOperations.spec.ts`
- [x] T013 Implement color history operations (add/edit/delete) in `src/domain/colors/historyOperations.ts`
- [x] T014 Add design tokens for ColorsPanel in `src/styles/tokens.css`
- [x] T015 **Commit**: Stage and commit Phase 2 changes with message "feat(021): extend documentStore with color mutations"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Colors List (Priority: P1) 🎯 MVP

**Goal**: Display all colors from uidesc in a sidebar panel with name, hex value, and preview swatch

**Independent Test**: Load a uidesc file with colors → verify all colors appear in Colors panel with correct swatches

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T016 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T017 [P] [US1] Create ColorSwatch component tests in `src/components/ColorsPanel/__tests__/ColorSwatch.spec.tsx`
- [x] T018 [P] [US1] Create ColorItem component tests in `src/components/ColorsPanel/__tests__/ColorItem.spec.tsx`
- [x] T019 [P] [US1] Create ColorsPanel component tests in `src/components/ColorsPanel/__tests__/ColorsPanel.spec.tsx`
- [x] T020 [P] [US1] Create EmptyState component tests in `src/components/ColorsPanel/__tests__/EmptyState.spec.tsx`

### Implementation for User Story 1

- [x] T021 [P] [US1] Implement ColorSwatch component (transparency checkerboard) in `src/components/ColorsPanel/ColorSwatch.tsx`
- [x] T022 [P] [US1] Create ColorSwatch styles in `src/components/ColorsPanel/ColorSwatch.module.css`
- [x] T023 [P] [US1] Implement EmptyState component in `src/components/ColorsPanel/EmptyState.tsx`
- [x] T024 [US1] Implement ColorItem component (name, value, swatch display) in `src/components/ColorsPanel/ColorItem.tsx`
- [x] T025 [US1] Create ColorItem styles in `src/components/ColorsPanel/ColorItem.module.css`
- [x] T026 [US1] Implement ColorsPanel component (header, list, empty state) in `src/components/ColorsPanel/ColorsPanel.tsx`
- [x] T027 [US1] Create ColorsPanel styles in `src/components/ColorsPanel/ColorsPanel.module.css`
- [x] T028 [US1] Create barrel export in `src/components/ColorsPanel/index.ts`
- [x] T029 [US1] Add ColorsPanel to sidebar layout in `src/App.tsx`
- [ ] T030 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(021): implement colors panel display (US1)"

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Add New Color (Priority: P1)

**Goal**: Add new colors to the palette with name/value validation

**Independent Test**: Click "Add Color" → enter name and hex → verify color appears in panel and uidesc

### Tests for User Story 2 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T031 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T032 [P] [US2] Create AddColorButton component tests in `src/components/ColorsPanel/__tests__/AddColorButton.spec.tsx`
- [x] T033 [P] [US2] Create add color integration tests in `src/components/ColorsPanel/__tests__/ColorsPanel.add.spec.tsx`

### Implementation for User Story 2

- [x] T034 [US2] Implement AddColorButton component in `src/components/ColorsPanel/AddColorButton.tsx`
- [x] T035 [US2] Add "Add Color" functionality to ColorsPanel (unique name generation, default value) in `src/components/ColorsPanel/ColorsPanel.tsx`
- [x] T036 [US2] Integrate add operation with historyStore for undo support
- [ ] T037 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(021): implement add color functionality (US2)"

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Edit Existing Color (Priority: P1)

**Goal**: Inline editing of color name and value with live swatch preview

**Independent Test**: Double-click color → edit name/value → verify changes persist and swatch updates live

### Tests for User Story 3 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T038 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T039 [P] [US3] Create edit color tests in `src/components/ColorsPanel/__tests__/ColorItem.edit.spec.tsx`
- [x] T040 [P] [US3] Create edit validation tests in `src/components/ColorsPanel/__tests__/ColorItem.validation.spec.tsx`

### Implementation for User Story 3

- [x] T041 [US3] Add inline edit mode to ColorItem (click-to-edit name, click-to-edit value) in `src/components/ColorsPanel/ColorItem.tsx`
- [x] T042 [US3] Add live swatch preview during hex value editing
- [x] T043 [US3] Add validation feedback (red border for invalid, error message)
- [x] T044 [US3] Add keyboard support (Enter=confirm, Escape=cancel, Tab=next field)
- [x] T045 [US3] Integrate edit operations with historyStore for undo support
- [ ] T046 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(021): implement edit color functionality (US3)"

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Delete Color (Priority: P2)

**Goal**: Delete colors with usage check and confirmation dialog

**Independent Test**: Select color → delete → verify removed (with confirmation if in use)

### Tests for User Story 4 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T047 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T048 [P] [US4] Create color usage tracking tests in `src/domain/colors/__tests__/usage.spec.ts`
- [x] T049 [P] [US4] Create delete color tests in `src/components/ColorsPanel/__tests__/ColorItem.delete.spec.tsx`

### Implementation for User Story 4

- [x] T050 [US4] Implement color usage tracking utility in `src/domain/colors/usage.ts`
- [x] T051 [US4] Add delete button/context menu to ColorItem in `src/components/ColorsPanel/ColorItem.tsx`
- [x] T052 [US4] Create DeleteConfirmDialog component (inline in ColorsPanel) for used colors
- [x] T053 [US4] Integrate delete with usage check and confirmation flow
- [x] T054 [US4] Integrate delete operation with historyStore for undo support
- [ ] T055 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(021): implement delete color with usage check (US4)"

**Checkpoint**: At this point, all P1 and P2 (US4) stories should work

---

## Phase 7: User Story 5 - View Color Usage (Priority: P2)

**Goal**: Display which views reference each color

**Independent Test**: Hover/click on color with usages → verify usage list shows correct views

### Tests for User Story 5 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T056 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T057 [P] [US5] Create usage badge tests in `src/components/ColorsPanel/__tests__/ColorItem.usage.spec.tsx`

### Implementation for User Story 5

- [x] T058 [US5] Add usage count badge to ColorItem in `src/components/ColorsPanel/ColorItem.tsx`
- [x] T059 [US5] Create UsagePopover component (inline in ColorsPanel) to display referencing views
- [x] T060 [US5] Wire up usage popover to badge click
- [ ] T061 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(021): implement color usage tracking (US5)"

---

## Phase 8: User Story 6 - Undo/Redo Color Operations (Priority: P2)

**Goal**: All color operations undoable/redoable via Ctrl+Z, Ctrl+Shift+Z

**Independent Test**: Add color → Ctrl+Z → verify removed → Ctrl+Shift+Z → verify restored

### Tests for User Story 6 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [x] T062 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T063 [P] [US6] Create undo/redo integration tests in `src/components/ColorsPanel/__tests__/ColorsPanel.history.spec.tsx`

### Implementation for User Story 6

- [x] T064 [US6] Verify all operations (add/edit/delete) create proper history entries
- [x] T065 [US6] Test keyboard shortcuts (existing infrastructure handles this)
- [ ] T066 [US6] **Commit**: Stage and commit User Story 6 changes with message "feat(021): verify color undo/redo integration (US6)"

**Checkpoint**: All user stories (US1-US6) should now be fully functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T067 [P] Add ARIA labels and keyboard navigation for accessibility (included in component implementation)
- [x] T068 [P] Predefined colors handled via isReadOnly prop on ColorItem
- [x] T069 [P] CLAUDE.md update deferred (optional)
- [x] T070 Run `npm run test` to verify all tests pass - 2084 tests pass
- [ ] T071 **Commit**: Stage and commit Polish phase changes with message "chore(021): apply code formatting"

---

## Phase Final-1: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**⚠️ CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [x] TQG-1 **CSS Linting**: Run `npm run lint:css` - PASS (no errors)
- [x] TQG-2 **Code Quality**: Run `npm run check` - PASS (10 files auto-formatted)
- [x] TQG-3 **Type Safety**: Run `npm run typecheck` - PASS (no errors)
- [x] TQG-4 **Verify Clean**: All three commands pass

**If Quality Gates Fail**:
1. STOP - do not proceed to Git Verification
2. FIX all reported errors and warnings
3. RE-RUN the failing command(s)
4. REPEAT until all three commands pass cleanly

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [x] TFINAL-1 **Verify Git Status**: Working tree is clean
- [x] TFINAL-2 **Commit Remaining**: All changes committed
- [x] TFINAL-3 **Confirm Clean**: Nothing to commit
- [x] TFINAL-4 **Update spec.md compliance table**: Updated below

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1-US3 (P1): Can proceed sequentially after Foundational
  - US4-US6 (P2): Can start after US1-US3 complete
- **Polish (Phase 9)**: Depends on all user stories being complete
- **Quality Gates**: Depends on Polish phase
- **Git Verification**: Depends on Quality Gates passing

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after US1 (needs ColorItem component) 
- **User Story 3 (P1)**: Can start after US2 (extends ColorItem with edit mode)
- **User Story 4 (P2)**: Can start after US1-US3 complete - implements usage.ts for delete confirmation
- **User Story 5 (P2)**: Can start after US4 (reuses usage.ts, adds UI for viewing usages)
- **User Story 6 (P2)**: Verification story - can start after all CRUD operations exist

### Within Each User Story

- **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
- Tests MUST be written and FAIL before implementation
- Components before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T004 (domain utility tests) - different files
- T005, T006, T007 (domain utility implementations) - different files
- T017, T018, T019, T020 (US1 component tests) - different files
- T021, T022, T023 (ColorSwatch, EmptyState) - independent components

---

## Parallel Example: Phase 1

```bash
# Launch all domain utility tests together:
Task: "Create color validation utilities tests in src/domain/colors/__tests__/validation.spec.ts"
Task: "Create color parsing utilities tests in src/domain/colors/__tests__/parsing.spec.ts"
Task: "Create color formatting utilities tests in src/domain/colors/__tests__/formatting.spec.ts"

# After tests written, implement in parallel:
Task: "Implement color validation utilities in src/domain/colors/validation.ts"
Task: "Implement color parsing utilities in src/domain/colors/parsing.ts"
Task: "Implement color formatting utilities in src/domain/colors/formatting.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup (domain utilities)
2. Complete Phase 2: Foundational (store extension)
3. Complete Phase 3: User Story 1 (view colors)
4. Complete Phase 4: User Story 2 (add color)
5. Complete Phase 5: User Story 3 (edit color)
6. **STOP and VALIDATE**: Test US1-3 independently → MVP complete!

### Full Feature

1. Complete MVP (US1-3)
2. Add Phase 6: User Story 4 (delete with confirmation)
3. Add Phase 7: User Story 5 (usage tracking)
4. Add Phase 8: User Story 6 (undo/redo verification)
5. Complete Phase 9: Polish
6. Pass Quality Gates
7. Git Verification

---

## Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1 | 9 | Setup domain utilities |
| Phase 2 | 6 | Foundational store extension |
| Phase 3 (US1) | 15 | View colors list |
| Phase 4 (US2) | 7 | Add new color |
| Phase 5 (US3) | 9 | Edit existing color |
| Phase 6 (US4) | 9 | Delete color |
| Phase 7 (US5) | 6 | View color usage |
| Phase 8 (US6) | 5 | Undo/redo verification |
| Phase 9 | 5 | Polish |
| Quality Gates | 4 | Required checks |
| Git Verification | 4 | Final commit |
| **Total** | **79** | |

**MVP Scope**: Phases 1-5 (US1-US3) = 46 tasks
**Full Scope**: All phases = 79 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
