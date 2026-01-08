# Tasks: Save & Export

**Input**: Design documents from `/specs/029-save-export/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/

**Tests**: Test-First approach per constitution (Gate I). Tests written before implementation.

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

---

## Phase 1: Setup

**Purpose**: Create serializer module structure and types

- [x] T001 Create serializer directory structure at src/domain/serializer/
- [x] T002 [P] Create types file at src/domain/serializer/types.ts with SaveFormat, JsonSerializeOptions, SaveValidationResult
- [x] T003 [P] Create index.ts public API barrel file at src/domain/serializer/index.ts
- [x] T004 **Commit**: Stage and commit Phase 1 changes with message "feat(029): setup serializer module structure"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding with tests
- [x] T006 [P] Write tests for JSON serialization in src/domain/serializer/__tests__/jsonSerializer.spec.ts (FR-008, FR-010, FR-015)
- [x] T007 [P] Implement serializeToJson() in src/domain/serializer/jsonSerializer.ts (FR-008, FR-010, FR-015)
- [x] T008 [P] Write tests for XML serialization in src/domain/serializer/__tests__/xmlSerializer.spec.ts (FR-009, FR-016)
- [x] T009 [P] Implement serializeToXml() in src/domain/serializer/xmlSerializer.ts (FR-009, FR-016)
- [x] T010 Add dirty state fields to DocumentStoreState interface in src/stores/documentStore.ts (isDirty, originalFormat, fileHandle, lastSavedAt) (FR-003, FR-011)
- [x] T011 Implement markDirty() and markClean() functions in src/stores/documentStore.ts (FR-003, FR-005)
- [x] T012 Update loadFile() in src/stores/documentStore.ts to set originalFormat and clear isDirty (FR-011)
- [x] T013 Update reset() in src/stores/documentStore.ts to clear dirty state fields (FR-003)
- [ ] T014 **Commit**: Stage and commit Phase 2 changes with message "feat(029): add serialization and dirty state foundation"

**Checkpoint**: Foundation ready - JSON/XML serialization works, dirty state tracking infrastructure in place

---

## Phase 3: User Story 1 - Save Current Document (Priority: P1) 🎯 MVP

**Goal**: Users can save changes to the current file via Ctrl+S or toolbar button

**Independent Test**: Load a uidesc file, make a change, press Ctrl+S, verify file is saved and dirty indicator clears

### Tests for User Story 1

- [ ] T015 [US1] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before writing tests
- [ ] T016 [P] [US1] Write tests for fileService in src/services/__tests__/fileService.spec.ts (FR-001, FR-002)
- [ ] T017 [P] [US1] Write tests for SaveButton component in src/components/Toolbar/__tests__/SaveButton.spec.tsx (FR-001, FR-002)
- [ ] T017b [P] [US1] Write tests for beforeunload warning behavior in src/App.spec.tsx or dedicated test file (FR-012, SC-005)

### Implementation for User Story 1

- [ ] T018 [US1] Create fileService with hasFileSystemAccess(), saveDocument(), downloadDocument() in src/services/fileService.ts (FR-001, FR-002)
- [ ] T019a [US1] Add markDirty() calls to view mutation functions in src/stores/documentStore.ts (updateViewOrigin, updateViewSize, updateViewAttribute, removeView, removeViews, addView, restoreView, duplicateView) (FR-003)
- [ ] T019b [US1] Add markDirty() calls to hierarchy mutation functions in src/stores/documentStore.ts (reparentView, reorderView, createGroupContainer, ungroupContainer) (FR-003)
- [ ] T019c [US1] Add markDirty() calls to resource mutation functions in src/stores/documentStore.ts (colors, fonts, bitmaps, gradients, variables, control-tags, templates) (FR-003)
- [ ] T020 [P] [US1] Create SaveButton.module.css in src/components/Toolbar/SaveButton.module.css
- [ ] T021 [US1] Implement SaveButton component with Ctrl+S handler in src/components/Toolbar/SaveButton.tsx (FR-001, FR-002)
- [ ] T022 [US1] Add beforeunload warning effect reacting to isDirty state in src/App.tsx (FR-012, SC-005)
- [ ] T023 [US1] Integrate SaveButton into existing Toolbar component
- [ ] T024 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(029): implement save functionality (US1)"

**Checkpoint**: Save to current file works via Ctrl+S and toolbar button

---

## Phase 4: User Story 2 - Dirty State Indicator (Priority: P1) 🎯 MVP

**Goal**: Users see asterisk (*) before filename in toolbar when unsaved changes exist

**Independent Test**: Load file, verify no asterisk, make change, verify asterisk appears, save, verify asterisk clears

### Tests for User Story 2

- [ ] T025 [US2] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before writing tests
- [ ] T026 [P] [US2] Write tests for FilenameDisplay component in src/components/Toolbar/__tests__/FilenameDisplay.spec.tsx (FR-004, SC-002)

### Implementation for User Story 2

- [ ] T027 [P] [US2] Create FilenameDisplay.module.css in src/components/Toolbar/FilenameDisplay.module.css
- [ ] T028 [US2] Implement FilenameDisplay component showing `* filename.uidesc` when dirty in src/components/Toolbar/FilenameDisplay.tsx (FR-004)
- [ ] T029 [US2] Integrate FilenameDisplay into Toolbar component (FR-004)
- [ ] T030 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(029): implement dirty state indicator (US2)"

**Checkpoint**: Dirty indicator shows/hides correctly based on document state

---

## Phase 5: User Story 3 - Save As / Download (Priority: P2)

**Goal**: Users can save document to a new file via Ctrl+Shift+S

**Independent Test**: Load file, make changes, press Ctrl+Shift+S, verify file picker appears and file downloads

### Tests for User Story 3

- [ ] T031 [US3] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before writing tests
- [ ] T032 [P] [US3] Write tests for saveAsDocument in src/services/__tests__/fileService.spec.ts (extend existing) (FR-006, FR-007)

### Implementation for User Story 3

- [ ] T033 [US3] Implement saveAsDocument() with showSaveFilePicker in src/services/fileService.ts (FR-006, FR-007)
- [ ] T034 [US3] Add Ctrl+Shift+S keyboard handler to SaveButton in src/components/Toolbar/SaveButton.tsx (FR-006)
- [ ] T035 [US3] Update filename display after successful Save As in src/stores/documentStore.ts (FR-007)
- [ ] T036 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(029): implement Save As functionality (US3)"

**Checkpoint**: Save As creates new file with specified name

---

## Phase 6: User Story 4 - Export Format Selection (Priority: P2)

**Goal**: Users can export document as JSON (pretty/minified) or XML format

**Independent Test**: Load JSON file, export as XML, verify valid XML. Load XML file, export as JSON, verify valid JSON.

### Tests for User Story 4

- [ ] T037 [US4] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before writing tests
- [ ] T038 [P] [US4] Write round-trip tests (JSON→XML→JSON, XML→JSON→XML) in src/domain/serializer/__tests__/roundtrip.spec.ts (SC-003, SC-004)

### Implementation for User Story 4

- [ ] T039 [US4] Update serializeToJson to support pretty/minified options in src/domain/serializer/jsonSerializer.ts (FR-010)
- [ ] T040 [P] [US4] Create ExportDialog component for format selection (placeholder - will be styled by frontend agent) (FR-008, FR-009)
- [ ] T041 [US4] Wire export dialog to serialization and download in src/services/fileService.ts (FR-008, FR-009)
- [ ] T042 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(029): implement export format selection (US4)"

**Checkpoint**: Export to JSON/XML works with format options

---

## Phase 7: User Story 5 - Pre-Save Validation (Priority: P3)

**Goal**: Editor validates document before save, errors block until "Save Anyway" clicked

**Independent Test**: Create invalid state, attempt save, verify error modal appears with "Save Anyway" option

### Tests for User Story 5

- [ ] T043 [US5] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before writing tests
- [ ] T044 [P] [US5] Write tests for validation module in src/domain/serializer/__tests__/validation.spec.ts (FR-013)
- [ ] T045 [P] [US5] Write tests for ValidationModal in src/components/Modals/__tests__/ValidationModal.spec.tsx (FR-014)

### Implementation for User Story 5

- [ ] T046 [US5] Implement validateDocument() reusing AJV validator in src/domain/serializer/validation.ts (FR-013)
- [ ] T047 [P] [US5] Create ValidationModal.module.css in src/components/Modals/ValidationModal.module.css
- [ ] T048 [US5] Implement ValidationModal with errors list and "Save Anyway" button in src/components/Modals/ValidationModal.tsx (FR-014)
- [ ] T049 [US5] Integrate validation into save flow (call before save, show modal if errors) in src/services/fileService.ts (FR-013, FR-014)
- [ ] T050 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(029): implement pre-save validation (US5)"

**Checkpoint**: Validation errors block save until user confirms

---

## Phase 8: Edge Cases & Error Handling

**Purpose**: Handle save failures, browser fallback, edge cases

### Tests for Edge Cases

- [ ] T051 **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before writing tests
- [ ] T052 [P] Write tests for SaveErrorModal in src/components/Modals/__tests__/SaveErrorModal.spec.tsx
- [ ] T053 [P] Write tests for BrowserFallbackModal in src/components/Modals/__tests__/BrowserFallbackModal.spec.tsx

### Implementation for Edge Cases

- [ ] T054 [P] Create SaveErrorModal.module.css in src/components/Modals/SaveErrorModal.module.css
- [ ] T055 Implement SaveErrorModal with retry/cancel options in src/components/Modals/SaveErrorModal.tsx (FR-017)
- [ ] T056 [P] Create BrowserFallbackModal.module.css in src/components/Modals/BrowserFallbackModal.module.css
- [ ] T057 Implement BrowserFallbackModal explaining download fallback in src/components/Modals/BrowserFallbackModal.tsx (FR-018)
- [ ] T058 Integrate error/fallback modals into save flow in src/services/fileService.ts
- [ ] T059 **Commit**: Stage and commit Edge Cases changes with message "feat(029): implement save error handling and browser fallback"

**Checkpoint**: All error cases handled with appropriate modals

---

## Phase 9: Polish & Integration

**Purpose**: Final integration, cleanup, documentation

- [ ] T060 [P] Update serializer index.ts to export all public APIs in src/domain/serializer/index.ts
- [ ] T061 Verify format preservation on Save (JSON stays JSON, XML stays XML) per FR-011
- [ ] T062 Run performance test: save < 1 second for 1MB file (SC-001)
- [ ] T063 Run dirty indicator timing test: update < 100ms (SC-002)
- [ ] T064 Update CLAUDE.md with new serializer module patterns
- [ ] T065 **Commit**: Stage and commit Polish phase changes with message "feat(029): polish and documentation updates"

---

## Phase Final-1: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**⚠️ CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings.

- [ ] TQG-1 **CSS Linting**: Run `npm run lint:css` - Fix ALL errors and warnings
- [ ] TQG-2 **Code Quality**: Run `npm run check` - Fix ALL errors and warnings
- [ ] TQG-3 **Type Safety**: Run `npm run typecheck` - Fix ALL errors and warnings
- [ ] TQG-4 **Tests**: Run `npm test -- --run` - All tests must pass
- [ ] TQG-5 **Verify Clean**: Re-run all commands to confirm zero issues remain

**If Quality Gates Fail**: STOP, FIX, RE-RUN until all pass.

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL-1 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL-2 **Commit Remaining**: If any changes exist, stage and commit
- [ ] TFINAL-3 **Confirm Clean**: Verify working tree is clean

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on Foundational (can parallel with US1)
- **User Stories 3-5**: Depend on Foundational (can parallel after US1+US2 core done)
- **Edge Cases (Phase 8)**: Depends on US1 save flow
- **Polish (Phase 9)**: Depends on all stories complete

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|-----------|-------------------|
| US1 (Save) | Foundational | US2 |
| US2 (Dirty Indicator) | Foundational | US1 |
| US3 (Save As) | US1 | US4 |
| US4 (Export) | Foundational | US3 |
| US5 (Validation) | US1 | - |

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
- T006 + T008 (JSON tests + XML tests)
- T007 + T009 (JSON impl + XML impl)

**Within US1**:
- T016 + T017 (fileService tests + SaveButton tests)
- T020 (CSS can parallel with any)

**Within US2**:
- T026 + T027 (tests + CSS)

**Cross-Story Parallelism**:
- US1 and US2 can proceed in parallel after Foundational
- US3 and US4 can proceed in parallel after US1 core

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Save)
4. Complete Phase 4: User Story 2 (Dirty Indicator)
5. **STOP and VALIDATE**: Test save + dirty indicator work together
6. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Serialization works
2. US1 + US2 → Basic save workflow (MVP!)
3. US3 → Save As capability
4. US4 → Export format options
5. US5 → Validation safety net
6. Edge Cases → Production-ready error handling

---

## Task Summary

| Phase | Tasks | Parallelizable |
|-------|-------|----------------|
| Setup | 4 | 2 |
| Foundational | 10 | 4 |
| US1 (Save) | 13 | 5 |
| US2 (Dirty) | 6 | 3 |
| US3 (Save As) | 6 | 1 |
| US4 (Export) | 6 | 2 |
| US5 (Validation) | 8 | 3 |
| Edge Cases | 9 | 4 |
| Polish | 6 | 1 |
| Quality Gates | 5 | 0 |
| Git Verification | 3 | 0 |
| **Total** | **76** | **25** |

---

## Notes

- [P] tasks can run in parallel with other [P] tasks in same phase
- Tests written FIRST per constitution Test-First gate
- Each commit at end of phase enables incremental progress
- MVP = US1 + US2 (save + dirty indicator)
- Pre-existing type errors in uidesc.d.ts are known and should not block
- FR-xxx references added to tasks for requirement traceability
- T019 split into T019a/T019b/T019c for manageable scope (view, hierarchy, resource mutations)
- T017b added for explicit beforeunload test coverage (SC-005)
