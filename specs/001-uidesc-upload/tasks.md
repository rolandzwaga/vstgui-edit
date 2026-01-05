# Tasks: Uidesc File Upload

**Input**: Design documents from `/specs/001-uidesc-upload/`
**Prerequisites**: plan.md, spec.md

**Tests**: REQUIRED per constitution (Test-First Development - NON-NEGOTIABLE)

**Organization**: Tasks grouped by user story for independent implementation and testing.

**Scope**: This feature reads and stores raw file contents only. Parsing (XML/JSON) deferred to future spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, test fixtures, and design tokens

- [x] T001 Create directory structure: `src/stores/`, `src/components/UploadZone/`, `src/types/`, `src/styles/`
- [x] T002 [P] Create test fixtures directory `src/__tests__/fixtures/` with sample uidesc files
- [x] T003 [P] Create sample XML fixture `src/__tests__/fixtures/sample.uidesc` (XML format)
- [x] T004 [P] Create sample JSON fixture `src/__tests__/fixtures/sample-json.uidesc` (JSON format)
- [x] T005 [P] Create empty fixture `src/__tests__/fixtures/empty.uidesc`
- [x] T006 [P] Create design tokens in `src/styles/tokens.css`
- [x] T007 Create Vitest configuration in `vitest.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and store that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Types (T008)

- [x] T008 Create types in `src/types/index.ts`
  - UploadState: 'idle' | 'dragging' | 'loading' | 'error' | 'success'
  - UploadError: { type: 'invalid-extension' | 'empty-file'; message: string }
  - DocumentMetadata: { filename: string; fileSize: number; loadedAt: Date }
  - DocumentStoreState: { content: string | null; metadata: DocumentMetadata | null; uploadState: UploadState; error: UploadError | null }

### Document Store (T009-T011)

- [x] T009 Write store tests in `src/stores/__tests__/documentStore.spec.ts`
  - Test: initial state is idle with null content
  - Test: loadFile() reads file and stores raw string content
  - Test: loadFile() sets metadata (filename, fileSize, loadedAt)
  - Test: loadFile() transitions through loading → success states
  - Test: loadFile() with empty file sets error state
  - Test: reset() clears content and returns to idle
  - Test: setDragging() updates uploadState
- [x] T010 Implement document store in `src/stores/documentStore.ts`
  - Use createSignal for uploadState and error
  - Use createStore for content and metadata
  - loadFile(file: File): Promise<void> - reads file via FileReader
  - reset(): void - clears state
  - setDragging(isDragging: boolean): void
- [x] T011 Verify store tests pass

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Upload via Drag and Drop (Priority: P1) 🎯 MVP

**Goal**: User can drag a `.uidesc` file onto the upload zone, see visual feedback, and have raw contents stored

**Independent Test**: Drag any `.uidesc` file onto upload zone, verify raw file contents are stored in store

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T012 [US1] Write UploadZone drag-drop tests in `src/components/UploadZone/__tests__/UploadZone.spec.tsx`
  - Test: zone renders with correct ARIA attributes
  - Test: dragenter shows visual feedback (dragging state)
  - Test: dragleave removes visual feedback
  - Test: drop with valid .uidesc file triggers store update
  - Test: drop shows success state after valid file
  - Test: loading state UI displays while file is being read

### Implementation for User Story 1

- [x] T013 [P] [US1] Create UploadZone styles in `src/components/UploadZone/UploadZone.module.css`
  - idle, dragging, loading, success states
  - drop zone visual styling
- [x] T014 [US1] Implement UploadZone component in `src/components/UploadZone/UploadZone.tsx`
  - ondragenter, ondragover, ondragleave, ondrop handlers
  - Visual feedback for drag states
  - Loading state UI (spinner/indicator) while reading
  - Integration with documentStore.loadFile()
  - Show filename on success
- [x] T015 [US1] Verify UploadZone drag-drop tests pass

**Checkpoint**: User Story 1 fully functional - drag and drop works independently

---

## Phase 4: User Story 2 - Upload via File Selector (Priority: P1)

**Goal**: User can click a button to open file picker, select a `.uidesc` file, and have raw contents stored

**Independent Test**: Click upload button, select `.uidesc` file, verify raw file contents are stored

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T016 [US2] Write file selector tests in `src/components/UploadZone/__tests__/UploadZone.spec.tsx`
  - Test: upload button renders and is focusable
  - Test: clicking button triggers file input
  - Test: file input has accept=".uidesc" filter
  - Test: selecting valid file triggers store update
  - Test: canceling file dialog leaves state unchanged

### Implementation for User Story 2

- [x] T017 [US2] Add hidden file input and button to `src/components/UploadZone/UploadZone.tsx`
  - Hidden `<input type="file" accept=".uidesc">`
  - Visible button that clicks the hidden input
  - onchange handler to process selected file
- [x] T018 [US2] Update styles for button in `src/components/UploadZone/UploadZone.module.css`
- [x] T019 [US2] Verify file selector tests pass

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - Handle Invalid Files (Priority: P2)

**Goal**: User receives clear error messages when uploading invalid files, can dismiss and retry

**Independent Test**: Attempt to upload non-uidesc files or empty files, verify appropriate error messages displayed

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T020 [US3] Write error handling tests in `src/components/UploadZone/__tests__/UploadZone.spec.tsx`
  - Test: wrong extension shows "invalid-extension" error
  - Test: empty file shows "empty-file" error
  - Test: multiple files dropped - only first valid file processed
  - Test: error message has role="alert" for accessibility
  - Test: dismissing error returns to idle state

### Implementation for User Story 3

- [x] T021 [US3] Add error display UI to `src/components/UploadZone/UploadZone.tsx`
  - Error message with appropriate styling
  - Dismiss button to clear error
  - role="alert" for screen reader announcement
- [x] T022 [US3] Add error styles to `src/components/UploadZone/UploadZone.module.css`
- [x] T023 [US3] Verify error handling tests pass

**Checkpoint**: All user stories independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Integration and quality checks

- [x] T024 Update `src/App.tsx` to render UploadZone component
- [x] T025 Run `npx biome check --write .` and fix any issues
- [x] T026 Run `npx tsc --noEmit` and fix any type errors
- [x] T027 Run `npm test` and verify all tests pass
- [x] T028 Manual testing: verify all acceptance scenarios from spec.md
- [x] T029 Update CLAUDE.md with new utilities and patterns

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on Foundational (can parallel with US1)
- **User Story 3 (Phase 5)**: Depends on Foundational (can parallel with US1/US2)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (Drag-Drop)**: Independent after Foundational
- **US2 (File Selector)**: Independent after Foundational - shares UploadZone component with US1
- **US3 (Error Handling)**: Independent after Foundational - extends UploadZone with error UI

### Within Each Phase

- Tests MUST be written and FAIL before implementation (Constitution Principle I)
- Types before implementation
- Implementation before verification
- All tests must pass before moving to next phase

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T002, T003, T004, T005, T006 can all run in parallel
```

**Phase 2 (Foundational)**:
```
T008 (types) first
T009-T011 sequential (store TDD cycle)
```

**User Stories** (after Foundational):
```
US1, US2, US3 can all start in parallel if team capacity allows
Within each story: tests → implementation → verification
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (Drag-Drop)
4. **STOP and VALIDATE**: Test drag-drop independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Drag-Drop) → Test → Deploy (MVP!)
3. Add US2 (File Selector) → Test → Deploy
4. Add US3 (Error Handling) → Test → Deploy
5. Each story adds value without breaking previous

### Single Developer Strategy (Recommended)

1. Complete Phases 1-2 (Setup + Foundational)
2. Complete US1 fully (P1 priority)
3. Complete US2 fully (P1 priority)
4. Complete US3 fully (P2 priority)
5. Polish phase

---

## Summary

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Setup | 7 | 5 |
| Foundational | 4 | 0 |
| US1 (Drag-Drop) | 4 | 1 |
| US2 (File Selector) | 4 | 0 |
| US3 (Error Handling) | 4 | 0 |
| Polish | 6 | 0 |
| **Total** | **29** | **6** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- Verify tests fail before implementing (Red-Green-Refactor)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Run quality checks (T025-T027) before marking feature complete
- **Parsing deferred**: This spec stores raw file content only; XML/JSON parsing is a separate future spec
