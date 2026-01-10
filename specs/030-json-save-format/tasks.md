# Tasks: JSON Save Format Option

**Input**: Design documents from `/specs/030-json-save-format/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are required per plan.md (Test-First Development).

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create type definitions and project structure for the feature

- [ ] T001 Create save types file at src/types/save.ts exporting SaveFormat type re-export and SaveFormatState interface
- [ ] T002 Create domain directory structure: mkdir -p src/domain/save
- [ ] T003 **Commit**: Stage and commit Phase 1 changes with message "feat(030): add save types and domain structure"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**Note**: The format preference utilities and saveFormatStore are foundational because ALL user stories depend on them.

### Format Preference Utilities

- [ ] T004 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T005 [P] Write unit tests for formatPreference in src/domain/save/__tests__/formatPreference.spec.ts covering: getFormatPreference (valid/invalid/null), setFormatPreference, clearFormatPreference, isValidSaveFormat, localStorage unavailable handling
- [ ] T006 Implement formatPreference utilities in src/domain/save/formatPreference.ts per contracts/format-preference-api.ts

### Save Format Store

- [ ] T007 [P] Write unit tests for saveFormatStore in src/stores/__tests__/saveFormatStore.spec.ts covering: initializeFormat priority logic, openDropdown/closeDropdown, selectFormat with/without confirmation, confirmFormatChange/cancelFormatChange, resetSaveFormatStore
- [ ] T008 Implement saveFormatStore in src/stores/saveFormatStore.ts per contracts/store-api.ts and data-model.md state transitions
- [ ] T009 **Commit**: Stage and commit Phase 2 changes with message "feat(030): add format preference utilities and saveFormatStore"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Save Document in Selected Format (Priority: P1)

**Goal**: Users can click the main Save button to save documents in the currently selected format (defaulting to original file format)

**Independent Test**: Load a JSON file, make changes, click Save button - file saves as JSON. Load an XML file, make changes, click Save - file saves as XML.

### Tests for User Story 1

- [ ] T010 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T011 [P] [US1] Write component tests for SaveButton split button structure in src/components/SaveButton/__tests__/SaveButton.spec.tsx covering: renders main button and chevron, main button triggers save, button disabled when not dirty
- [ ] T012 [P] [US1] Write integration tests for save with format in src/components/SaveButton/__tests__/SaveButton.spec.tsx covering: saves as JSON when JSON selected, saves as XML when XML selected, uses original format by default

### Implementation for User Story 1

- [ ] T013 [US1] Update SaveButton component in src/components/SaveButton/SaveButton.tsx to split button structure with main action area and chevron separator (FR-001, FR-013)
- [ ] T014 [US1] Integrate saveFormatStore into SaveButton: call initializeFormat on document load, use selectedFormat for serialization (FR-005, FR-011)
- [ ] T015 [US1] Update save logic to serialize based on selectedFormat using existing serializeToJson/serializeToXml (FR-003, FR-004, FR-008)
- [ ] T016 [US1] Update SaveButton styles in src/components/SaveButton/SaveButton.module.css for split button layout (main + separator + chevron)
- [ ] T017 [US1] Ensure Ctrl+S keyboard shortcut uses selected format (FR-010)
- [ ] T018 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(030): implement split save button with format selection"

**Checkpoint**: At this point, saving with format selection should work via direct format setting

---

## Phase 4: User Story 2 - Select Save Format from Dropdown (Priority: P1)

**Goal**: Users can click the chevron to open a dropdown showing JSON and XML options, select a format, and have it apply to subsequent saves

**Independent Test**: Click chevron, verify dropdown appears with JSON/XML options, select a format, verify dropdown closes and format is updated for next save

### Tests for User Story 2

- [ ] T019 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T020 [P] [US2] Write component tests for dropdown in src/components/SaveButton/__tests__/SaveButton.spec.tsx covering: chevron click opens dropdown, dropdown shows JSON and XML options, selecting option closes dropdown, click outside closes dropdown, Escape closes dropdown, clicking main button while dropdown is open closes dropdown and triggers save
- [ ] T021 [P] [US2] Write tests for dropdown positioning in src/components/SaveButton/__tests__/SaveButton.spec.tsx: dropdown positioned below button

### Implementation for User Story 2

- [ ] T022 [US2] Add dropdown menu JSX to SaveButton with format options (JSON, XML) using @floating-ui/dom for positioning (FR-002, FR-014)
- [ ] T023 [US2] Implement dropdown open/close logic: chevron click toggles, click outside closes, Escape closes (FR-007)
- [ ] T024 [US2] Connect dropdown option selection to saveFormatStore.selectFormat (no save triggered on selection)
- [ ] T025 [US2] Add dropdown styles to src/components/SaveButton/SaveButton.module.css (.dropdown, .dropdownItem, .dropdownItemActive)
- [ ] T026 [US2] Add ARIA attributes for accessibility: aria-haspopup, aria-expanded on chevron, role="menu" on dropdown, role="menuitem" on options (FR-012)
- [ ] T027 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(030): implement format dropdown with positioning"

**Checkpoint**: Format selection via dropdown should now work

---

## Phase 5: User Story 3 - Visual Indication of Current Format (Priority: P2)

**Goal**: The Save button label shows the currently selected format (e.g., "Save (JSON)" or "Save (XML)")

**Independent Test**: Select JSON - button shows "Save (JSON)". Select XML - button shows "Save (XML)".

### Tests for User Story 3

- [ ] T028 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T029 [P] [US3] Write component tests for button label in src/components/SaveButton/__tests__/SaveButton.spec.tsx covering: displays exactly "Save (JSON)" when JSON selected (assert textContent matches pattern), displays exactly "Save (XML)" when XML selected (assert textContent matches pattern), label updates immediately on format change

### Implementation for User Story 3

- [ ] T030 [US3] Update main button text to dynamically show format: "Save (JSON)" or "Save (XML)" based on saveFormatStore.selectedFormat
- [ ] T031 [US3] Update ARIA label to include format for screen readers (FR-012)
- [ ] T032 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(030): show selected format in button label"

**Checkpoint**: Button now visually indicates selected format

---

## Phase 6: User Story 4 - Keyboard Navigation (Priority: P3)

**Goal**: Users can navigate the dropdown with keyboard (ArrowUp/Down to navigate, Enter to select, Escape to close)

**Independent Test**: Open dropdown with keyboard, press ArrowDown to move highlight, press Enter to select, verify selection applied

### Tests for User Story 4

- [ ] T033 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T034 [P] [US4] Write keyboard navigation tests in src/components/SaveButton/__tests__/SaveButton.spec.tsx covering: ArrowDown opens dropdown, ArrowUp/Down moves highlight, Enter selects highlighted option, Escape closes without selecting

### Implementation for User Story 4

- [ ] T035 [US4] Add keyboard event handlers to chevron button: ArrowDown/Space/Enter to open dropdown
- [ ] T036 [US4] Add keyboard navigation within dropdown: ArrowUp/Down to move highlight, Enter to select, Escape to close
- [ ] T037 [US4] Manage focus: move focus into dropdown when opened, return focus to chevron when closed
- [ ] T038 [US4] Add visual highlight styles for currently focused dropdown item in SaveButton.module.css
- [ ] T039 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(030): add keyboard navigation to format dropdown"

**Checkpoint**: Full keyboard accessibility for dropdown

---

## Phase 7: User Story 5 - Format Change Confirmation (Priority: P2)

**Goal**: When user selects a different format than the file's original format, show a confirmation dialog

**Independent Test**: Load JSON file, open dropdown, select XML - confirmation dialog appears. Click "Change Format" - format changes. Click "Cancel" - format unchanged.

### Tests for User Story 5

- [ ] T040 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T041 [P] [US5] Write component tests for FormatChangeDialog in src/components/SaveButton/__tests__/FormatChangeDialog.spec.tsx covering: renders when isOpen true, displays original and new format names, onConfirm called on "Change Format" click, onCancel called on "Cancel" click, Escape key calls onCancel
- [ ] T042 [P] [US5] Write integration tests in src/components/SaveButton/__tests__/SaveButton.spec.tsx: dialog appears when selecting different format than original, dialog does not appear when selecting same format

### Implementation for User Story 5

- [ ] T043 [US5] Create FormatChangeDialog component in src/components/SaveButton/FormatChangeDialog.tsx per contracts/component-props.ts
- [ ] T044 [US5] Create FormatChangeDialog styles in src/components/SaveButton/FormatChangeDialog.module.css (backdrop, dialog, header, body, footer, buttons)
- [ ] T045 [US5] Implement focus trap within dialog: focus moves to dialog on open, Tab cycles within dialog, focus returns on close (FR-017)
- [ ] T046 [US5] Add Escape key handler to close dialog and cancel change (FR-016)
- [ ] T047 [US5] Integrate FormatChangeDialog into SaveButton: render with saveFormatStore state, connect onConfirm/onCancel to store actions
- [ ] T048 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(030): add format change confirmation dialog"

**Checkpoint**: Format change confirmation flow complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [ ] T049 [P] Persist format preference to localStorage on confirmed format change (FR-006)
- [ ] T050 [P] Ensure button disabled during save operation (FR-009)
- [ ] T051 Run quickstart.md validation scenarios manually
- [ ] T052 Update CLAUDE.md with saveFormatStore documentation in Stores section
- [ ] T053 **Commit**: Stage and commit Polish phase changes with message "feat(030): polish and documentation updates"

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
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1 (P1): Must complete before others (establishes split button structure)
  - User Story 2 (P1): Depends on US1 (adds dropdown to split button)
  - User Story 3 (P2): Can parallel with US2 after US1
  - User Story 4 (P3): Depends on US2 (keyboard nav requires dropdown)
  - User Story 5 (P2): Can parallel with US2/US3/US4 after US1
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: After Foundational - establishes split button structure
- **User Story 2 (P1)**: After US1 - adds dropdown functionality
- **User Story 3 (P2)**: After US1 - can parallel with US2
- **User Story 4 (P3)**: After US2 - requires dropdown to exist
- **User Story 5 (P2)**: After US1 - can parallel with others

### Within Each User Story

- **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
- Tests MUST be written and FAIL before implementation
- Component structure before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T005 and T007 can run in parallel (different test files)
- T011 and T012 can run in parallel (both test files for US1)
- T020 and T021 can run in parallel (both US2 tests)
- T029, T034, T041, T042 involve different test focuses
- User Stories 3, 4, 5 have some parallelism after US2 completes

---

## Parallel Example: Foundational Phase

```bash
# Launch tests in parallel (after reading Testing Guide):
Task T005: "Write unit tests for formatPreference"
Task T007: "Write unit tests for saveFormatStore"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (split button + format-based save)
4. Complete Phase 4: User Story 2 (dropdown selection)
5. **STOP and VALIDATE**: Users can now select format and save
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Basic split button with save
3. Add User Story 2 -> Test independently -> Dropdown works (MVP!)
4. Add User Story 3 -> Test independently -> Visual format indication
5. Add User Story 5 -> Test independently -> Confirmation dialog
6. Add User Story 4 -> Test independently -> Full keyboard accessibility
7. Each story adds value without breaking previous stories

### Requirement Mapping

| Requirement | User Story | Task(s) |
|-------------|------------|---------|
| FR-001 | US1 | T013 |
| FR-002 | US2 | T022 |
| FR-003 | US1 | T015 |
| FR-004 | US1 | T015 |
| FR-005 | US1 | T014 |
| FR-006 | Polish | T049 |
| FR-007 | US2 | T023 |
| FR-008 | US1 | T015 |
| FR-009 | Polish | T050 |
| FR-010 | US1 | T017 |
| FR-011 | US1 | T015 |
| FR-012 | US2, US3 | T026, T031 |
| FR-013 | US1 | T013, T016 |
| FR-014 | US2 | T022 |
| FR-015 | US5 | T043 |
| FR-016 | US5 | T046 |
| FR-017 | US5 | T045 |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests (SolidJS-specific patterns)
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **IMPORTANT**: Always complete the "Phase Final: Git Verification" before marking feature complete
