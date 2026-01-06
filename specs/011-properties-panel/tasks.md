# Tasks: Properties Panel

**Input**: Design documents from `/specs/011-properties-panel/`  
**Prerequisites**: plan.md, spec.md, data-model.md, research.md

**Tests**: Tests REQUIRED per project constitution (Principle I: Test-First Development)

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and store infrastructure shared by all user stories

- [ ] T001 Create types file `src/types/properties.ts` with AttributeGroupId, AttributeEntry, AttributeGroup, GroupedAttributes types from data-model.md
- [ ] T002 [P] Create propertiesStore `src/stores/propertiesStore.ts` for group expand/collapse state with expandedGroups Set
- [ ] T003 [P] Create propertiesStore tests `src/stores/__tests__/propertiesStore.spec.ts`
- [ ] T004 **Commit**: Stage and commit Phase 1 changes with descriptive message

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain logic that MUST be complete before ANY user story UI can be implemented

**⚠️ CRITICAL**: No UI work can begin until this phase is complete

- [ ] T005 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T006 [P] Create groupAttributes function `src/domain/properties/groupAttributes.ts` with ATTRIBUTE_GROUP_MAP and groupAttributes()
- [ ] T007 [P] Create groupAttributes tests `src/domain/properties/__tests__/groupAttributes.spec.ts` (test categorization of all attribute types)
- [ ] T008 [P] Create mergeSelections function `src/domain/properties/mergeSelections.ts` for multi-selection attribute merging
- [ ] T009 [P] Create mergeSelections tests `src/domain/properties/__tests__/mergeSelections.spec.ts` (test shared/mixed value detection)
- [ ] T010 Create barrel export `src/domain/properties/index.ts`
- [ ] T011 **Commit**: Stage and commit Phase 2 changes with descriptive message

**Checkpoint**: Domain logic ready - UI implementation can now begin

---

## Phase 3: User Story 1 - View Single Selection Properties (Priority: P1) 🎯 MVP

**Goal**: Display all attributes of a single selected view in the right sidebar panel

**Independent Test**: Select any view on canvas, verify all its attributes appear in properties panel with correct values

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T012 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T013 [P] [US1] Create EmptyState component tests `src/components/PropertiesPanel/__tests__/EmptyState.spec.tsx`
- [ ] T014 [P] [US1] Create SelectionHeader component tests `src/components/PropertiesPanel/__tests__/SelectionHeader.spec.tsx`
- [ ] T015 [P] [US1] Create AttributeRow component tests `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`
- [ ] T016 [P] [US1] Create AttributeGroup component tests `src/components/PropertiesPanel/__tests__/AttributeGroup.spec.tsx`
- [ ] T017 [P] [US1] Create PropertiesPanel component tests `src/components/PropertiesPanel/__tests__/PropertiesPanel.spec.tsx` (single selection scenarios)

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create EmptyState component `src/components/PropertiesPanel/EmptyState.tsx` and `EmptyState.module.css`
- [ ] T019 [P] [US1] Create SelectionHeader component `src/components/PropertiesPanel/SelectionHeader.tsx` and `SelectionHeader.module.css` (displays class name)
- [ ] T020 [P] [US1] Create AttributeRow component `src/components/PropertiesPanel/AttributeRow.tsx` and `AttributeRow.module.css` (displays name: value)
- [ ] T021 [US1] Create AttributeGroup component `src/components/PropertiesPanel/AttributeGroup.tsx` and `AttributeGroup.module.css` (collapsible group with header)
- [ ] T022 [US1] Create PropertiesPanel container `src/components/PropertiesPanel/PropertiesPanel.tsx` and `PropertiesPanel.module.css`
- [ ] T023 [US1] Create barrel export `src/components/PropertiesPanel/index.ts`
- [ ] T024 [US1] Integrate PropertiesPanel into App.tsx right sidebar (280px width per plan.md)
- [ ] T025 [US1] Run all tests and verify passing
- [ ] T026 [US1] **Commit**: Stage and commit User Story 1 changes with descriptive message

**Checkpoint**: Single selection properties display works. Can select a view and see all its attributes grouped by category.

---

## Phase 4: User Story 2 - Grouped Attribute Display (Priority: P1)

**Goal**: Organize attributes into logical groups (Geometry, Appearance, Text, Behavior, Other)

**Independent Test**: Select a view with multiple attribute types, verify they appear under correct group headings

> **NOTE**: This story enhances US1 - the grouping logic from Phase 2 is now visually verified

### Tests for User Story 2 ⚠️

- [ ] T027 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T028 [P] [US2] Add grouping display tests to `src/components/PropertiesPanel/__tests__/PropertiesPanel.spec.tsx` (verify group headers, attribute placement)

### Implementation for User Story 2

- [ ] T029 [US2] Enhance AttributeGroup styling for visual distinction between categories in `AttributeGroup.module.css`
- [ ] T030 [US2] Add group header icons or visual indicators per category (optional enhancement)
- [ ] T031 [US2] Verify Identity group (class) displays at top, not collapsible
- [ ] T032 [US2] Verify empty groups are hidden (no empty sections shown)
- [ ] T033 [US2] Run all tests and verify passing
- [ ] T034 [US2] **Commit**: Stage and commit User Story 2 changes with descriptive message

**Checkpoint**: Attributes are visually organized into clear category groups.

---

## Phase 5: User Story 3 - Multiple Selection Properties (Priority: P2)

**Goal**: Display common attributes and "Mixed" indicators for multi-selection

**Independent Test**: Select multiple views, verify shared values shown and differing values show "Mixed"

### Tests for User Story 3 ⚠️

- [ ] T035 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T036 [P] [US3] Create multi-selection tests `src/components/PropertiesPanel/__tests__/PropertiesPanel.multiselect.spec.tsx`

### Implementation for User Story 3

- [ ] T037 [US3] Update PropertiesPanel to handle multiple selectedIds from selectionStore
- [ ] T038 [US3] Update SelectionHeader to show selection count ("3 views selected" or "CTextButton (3)")
- [ ] T039 [US3] Update AttributeRow to display "Mixed" indicator with distinct styling
- [ ] T040 [US3] Ensure "Mixed" values are not copyable (isCopyable: false)
- [ ] T041 [US3] Run all tests and verify passing
- [ ] T042 [US3] **Commit**: Stage and commit User Story 3 changes with descriptive message

**Checkpoint**: Multi-selection shows shared values and "Mixed" for differing values.

---

## Phase 6: User Story 4 - Copy Attribute Values (Priority: P2)

**Goal**: Click on attribute value to copy to clipboard with visual feedback

**Independent Test**: Click on an attribute value, verify it copies to clipboard and shows feedback

### Tests for User Story 4 ⚠️

- [ ] T043 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T044 [P] [US4] Create copy functionality tests `src/components/PropertiesPanel/__tests__/AttributeRow.copy.spec.tsx`

### Implementation for User Story 4

- [ ] T045 [US4] Add click handler to AttributeRow value for clipboard copy via `navigator.clipboard.writeText()`
- [ ] T046 [US4] Add visual feedback (brief highlight or tooltip) on successful copy (1.5 second duration)
- [ ] T047 [US4] Add cursor: pointer styling on copyable values
- [ ] T048 [US4] Handle Clipboard API failure gracefully (show error, don't break UI)
- [ ] T049 [US4] Ensure "Mixed" and empty values are not copyable (no click handler)
- [ ] T050 [US4] Run all tests and verify passing
- [ ] T051 [US4] **Commit**: Stage and commit User Story 4 changes with descriptive message

**Checkpoint**: Click-to-copy works for all attribute values with visual feedback.

---

## Phase 7: User Story 5 - Expand/Collapse Groups (Priority: P3)

**Goal**: Toggle group visibility to manage panel space

**Independent Test**: Click group header, verify group collapses/expands and state persists across selection changes

### Tests for User Story 5 ⚠️

- [ ] T052 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T053 [P] [US5] Add expand/collapse tests to `src/components/PropertiesPanel/__tests__/AttributeGroup.spec.tsx`

### Implementation for User Story 5

- [ ] T054 [US5] Add chevron icon to AttributeGroup header (down = expanded, right = collapsed)
- [ ] T055 [US5] Wire AttributeGroup to propertiesStore for expand/collapse state
- [ ] T056 [US5] Ensure expand/collapse state persists when selection changes
- [ ] T057 [US5] Default all groups to expanded on initial load
- [ ] T058 [US5] Run all tests and verify passing
- [ ] T059 [US5] **Commit**: Stage and commit User Story 5 changes with descriptive message

**Checkpoint**: Groups can be expanded/collapsed and state persists.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, accessibility, and documentation

- [ ] T060 Add ARIA labels to AttributeGroup headers for accessibility
- [ ] T061 Add keyboard navigation support (Tab to navigate, Enter to toggle groups)
- [ ] T062 [P] Update CLAUDE.md with PropertiesPanel store and domain utility documentation
- [ ] T063 Run full test suite and verify all tests pass
- [ ] T064 Run `npx biome check --write .` for linting/formatting
- [ ] T065 Run `npx tsc --noEmit` for type checking
- [ ] T066 **Commit**: Stage and commit Polish phase changes with descriptive message

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] T067 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] T068 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with an appropriate message
- [ ] T069 **Confirm Clean**: Verify working tree is clean (nothing to commit)
- [ ] T070 **Update Compliance Table**: Fill out requirement compliance table in spec.md with evidence

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority but US2 enhances US1's display
  - US3 (multi-select) can run in parallel with US2 after US1
  - US4 (copy) can run in parallel with US3 after US1
  - US5 (expand/collapse) depends only on US1
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 only - MVP
- **User Story 2 (P1)**: Depends on US1 (enhances grouping display)
- **User Story 3 (P2)**: Depends on US1 (adds multi-selection)
- **User Story 4 (P2)**: Depends on US1 (adds copy functionality)
- **User Story 5 (P3)**: Depends on US1 (adds expand/collapse)

### Within Each User Story

- **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
- Tests MUST be written and FAIL before implementation
- Components in isolation before integration
- Core functionality before polish

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002 and T003 can run in parallel (different files)

**Phase 2 (Foundational)**:
- T006, T007, T008, T009 can all run in parallel (different files)

**Phase 3-7 (User Stories)**:
- Test tasks within a story can run in parallel (T013-T017)
- Component implementations with no dependencies can run in parallel (T018-T020)
- US3, US4, US5 can run in parallel after US1 completes

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch all domain logic tasks together:
Task: "Create groupAttributes function src/domain/properties/groupAttributes.ts"
Task: "Create groupAttributes tests src/domain/properties/__tests__/groupAttributes.spec.ts"
Task: "Create mergeSelections function src/domain/properties/mergeSelections.ts"
Task: "Create mergeSelections tests src/domain/properties/__tests__/mergeSelections.spec.ts"
```

## Parallel Example: User Story 1 Tests

```bash
# Launch all US1 test tasks together:
Task: "Create EmptyState component tests src/components/PropertiesPanel/__tests__/EmptyState.spec.tsx"
Task: "Create SelectionHeader component tests src/components/PropertiesPanel/__tests__/SelectionHeader.spec.tsx"
Task: "Create AttributeRow component tests src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx"
Task: "Create AttributeGroup component tests src/components/PropertiesPanel/__tests__/AttributeGroup.spec.tsx"
Task: "Create PropertiesPanel component tests src/components/PropertiesPanel/__tests__/PropertiesPanel.spec.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types, store)
2. Complete Phase 2: Foundational (domain logic)
3. Complete Phase 3: User Story 1 (single selection display)
4. **STOP and VALIDATE**: Test US1 independently
5. Demo/review if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → MVP: View single selection properties
3. Add User Story 2 → Enhanced: Clear grouped display
4. Add User Story 3 → Multi-selection support
5. Add User Story 4 → Copy-to-clipboard
6. Add User Story 5 → Expand/collapse groups
7. Polish → Accessibility and cleanup

### Task Count Summary

| Phase | Task Count |
|-------|------------|
| Phase 1: Setup | 4 tasks |
| Phase 2: Foundational | 7 tasks |
| Phase 3: User Story 1 | 15 tasks |
| Phase 4: User Story 2 | 8 tasks |
| Phase 5: User Story 3 | 8 tasks |
| Phase 6: User Story 4 | 9 tasks |
| Phase 7: User Story 5 | 8 tasks |
| Phase 8: Polish | 7 tasks |
| Phase Final: Git Verification | 4 tasks |
| **Total** | **70 tasks** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests (SolidJS-specific patterns)
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- **IMPORTANT**: Always complete "Phase Final: Git Verification" before marking feature complete
