# Tasks: Create New uidesc File

**Input**: Design documents from `/specs/041-create-new-uidesc/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are included based on spec requirements for validation coverage.

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## User Story Summary

| ID | Title | Priority | Independent Test |
|----|-------|----------|-----------------|
| US1 | Create Basic uidesc Document | P1 | Click "Create New", enter dimensions, confirm - see empty editor with specified size |
| US2 | Select Container Class | P2 | Select CScrollView from dropdown, create - verify template uses CScrollView class |
| US3 | Cancel and Close Dialog | P2 | Open dialog, click Cancel/Escape/backdrop - dialog closes, no document created |
| US4 | Input Validation Feedback | P3 | Enter invalid values (0, -100, "abc") - see error messages, Create disabled |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create type definitions and project structure for the feature

- [ ] T001 Create type definitions in `src/types/createNew.ts` with ContainerClass type, CONTAINER_CLASSES array, NewDocumentConfig interface, DimensionValidationResult interface, DEFAULT_CONFIG, and DIMENSION_CONSTRAINTS
- [ ] T002 Create barrel export in `src/domain/createNew/index.ts` (empty initially, will export validation and factory)
- [ ] T003 **Commit**: Stage and commit Phase 1 changes with message "feat(041): add createNew types and domain structure"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain logic that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational Phase

- [ ] T004 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T005 [P] Create validation tests in `src/domain/createNew/__tests__/validation.spec.ts`:
  - validateDimension with valid values returns { valid: true, value: number }
  - validateDimension with empty string returns { valid: false, error: "Width is required" } (or "Height is required")
  - validateDimension with negative numbers returns { valid: false, error: "Must be at least 1" }
  - validateDimension with zero returns { valid: false, error: "Must be at least 1" }
  - validateDimension with values exceeding 10000 returns { valid: false, error: "Must be at most 10000" }
  - validateDimension with decimal values rounds to nearest integer
  - validateDimension with non-numeric returns { valid: false, error: "Must be a number" }
  - validateDimensions validates both width and height
  - areDimensionsValid returns true only when both valid
- [ ] T006 [P] Create document factory tests in `src/domain/createNew/__tests__/documentFactory.spec.ts`:
  - createDocument returns valid VSTGUIUIDescription structure
  - createDocument uses config.width and config.height in size attribute
  - createDocument uses config.containerClass in class attribute
  - createDocument sets version "1"
  - createDocument sets template name to "view"
  - createDocument sets origin to "0, 0"
  - createDocument sets background-color to "~ BlackCColor"

### Implementation for Foundational Phase

- [ ] T007 [P] Implement validation in `src/domain/createNew/validation.ts`:
  - validateDimension(value: string, fieldName: 'Width' | 'Height'): DimensionValidationResult
  - validateDimensions(width: string, height: string): { width, height }
  - areDimensionsValid(results): boolean
- [ ] T008 [P] Implement document factory in `src/domain/createNew/documentFactory.ts`:
  - createDocument(config: NewDocumentConfig): VSTGUIUIDescription
  - Export DEFAULT_TEMPLATE_NAME, DEFAULT_ORIGIN, DEFAULT_BACKGROUND_COLOR constants
- [ ] T009 Update barrel export in `src/domain/createNew/index.ts` to export validation and factory functions
- [ ] T010 **Commit**: Stage and commit Phase 2 changes with message "feat(041): implement validation and document factory"

**Checkpoint**: Foundational domain logic complete - user story implementation can now begin

---

## Phase 3: User Story 1 - Create Basic uidesc Document (Priority: P1)

**Goal**: Users can click "Create New", enter dimensions, and get an empty editor with a new document

**Independent Test**: Click "Create New" button, enter width=800 height=600, click "Create" - user sees editor with empty canvas at specified size

### Tests for User Story 1

- [ ] T011 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T012 [P] [US1] Create documentStore extension tests in `src/stores/__tests__/documentStore.spec.ts` (add to existing file):
  - createNewDocument sets document with correct structure
  - createNewDocument sets parseState to 'valid'
  - createNewDocument sets detectedFormat and originalFormat to 'json'
  - createNewDocument sets isDirty to false
  - createNewDocument clears fileHandle, lastSavedAt, metadata
  - createNewDocument resets canvas store (pan, zoom)
  - createNewDocument calls selectFirstTemplate
  - createNewDocument calls applyDefaultStatesOnDocumentLoad
- [ ] T013 [P] [US1] Create CreateNewDialog component tests in `src/components/CreateNewDialog/__tests__/CreateNewDialog.spec.tsx`:
  - Dialog renders when isOpen=true
  - Dialog does not render when isOpen=false
  - Width input shows default value "400"
  - Height input shows default value "300"
  - Create button calls onCreate with parsed config when valid
  - Enter key triggers create action
  - Form resets to defaults when dialog reopens
  - Width input receives focus when dialog opens

### Implementation for User Story 1

- [ ] T014 [US1] Extend documentStore in `src/stores/documentStore.ts`:
  - Add import for createDocument from domain/createNew/documentFactory
  - Add import for NewDocumentConfig type
  - Implement createNewDocument(config: NewDocumentConfig): void function
  - Export createNewDocument from store
- [ ] T015 [P] [US1] Create dialog styles in `src/components/CreateNewDialog/CreateNewDialog.module.css`:
  - .backdrop - fixed fullscreen overlay with semi-transparent background
  - .dialog - centered white card with padding, max-width 400px
  - .header - flex row with title and close button
  - .title - dialog heading text
  - .closeButton - X button with hover state
  - .body - form fields container with gap
  - .field - label + input wrapper
  - .label - field label text
  - .input - text input styles using tokens
  - .inputError - red border for invalid inputs
  - .error - red error message text
  - .select - dropdown select styles
  - .footer - button row with gap, right-aligned
  - .cancelButton - secondary button style
  - .createButton - primary button style
- [ ] T016 [US1] Create CreateNewDialog component in `src/components/CreateNewDialog/CreateNewDialog.tsx`:
  - Props: isOpen, onClose, onCreate (per CreateNewDialogProps interface)
  - Local signals for width, height values (strings)
  - Local signals for widthError, heightError (string | null)
  - createEffect to reset form when props.isOpen becomes true
  - handleCreate function that validates and calls props.onCreate
  - handleKeyDown for Escape (close) and Enter (create)
  - Width input with label, default 400, onInput clears error
  - Height input with label, default 300, onInput clears error
  - Create and Cancel buttons in footer
  - Auto-focus width input via ref callback with setTimeout
- [ ] T017 [US1] Create barrel export in `src/components/CreateNewDialog/index.ts`
- [ ] T018 [P] [US1] Create UploadZone integration tests in `src/components/UploadZone/__tests__/UploadZone.spec.tsx` (add to existing file):
  - "Create New" button is visible in idle state
  - Clicking "Create New" opens CreateNewDialog
  - onCreate handler calls createNewDocument with config
  - onCreate handler closes dialog after creation
- [ ] T019 [US1] Integrate CreateNewDialog into UploadZone in `src/components/UploadZone/UploadZone.tsx`:
  - Import CreateNewDialog component
  - Import createNewDocument from stores/documentStore
  - Add createSignal for isCreateDialogOpen
  - Add "Create New" button in buttonGroup after "Browse files"
  - Add handleCreateNew to open dialog
  - Add handleCreate callback that calls createNewDocument then closes dialog
  - Render CreateNewDialog with isOpen, onClose, onCreate props
- [ ] T020 [US1] Add button styles to `src/components/UploadZone/UploadZone.module.css`:
  - .buttonGroup - flex row with gap for button arrangement
  - .buttonSecondary - secondary button variant for "Create New"
- [ ] T021 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(041): implement Create New dialog and document creation"

**Checkpoint**: User Story 1 complete - users can create new documents with default container class

---

## Phase 4: User Story 2 - Select Container Class (Priority: P2)

**Goal**: Users can choose a specialized container class (CScrollView, CRowColumnView, etc.) instead of default CViewContainer

**Independent Test**: Open Create New dialog, select CScrollView from dropdown, create document - verify template has class="CScrollView"

### Tests for User Story 2

- [ ] T022 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T023 [P] [US2] Add container class tests to `src/components/CreateNewDialog/__tests__/CreateNewDialog.spec.tsx`:
  - Container class dropdown shows all 7 classes (CViewContainer, CScrollView, CRowColumnView, CSplitView, CLayeredViewContainer, UIViewSwitchContainer, CShadowViewContainer)
  - CViewContainer is selected by default
  - Selecting different class updates selection
  - onCreate receives selected containerClass in config
  - Container class dropdown resets to CViewContainer on dialog reopen

### Implementation for User Story 2

- [ ] T024 [US2] Add container class dropdown to CreateNewDialog in `src/components/CreateNewDialog/CreateNewDialog.tsx`:
  - Add createSignal for containerClass with DEFAULT_CONFIG.containerClass initial value
  - Add select element with CONTAINER_CLASSES options using For component
  - Add containerClass to reset logic in createEffect
  - Include containerClass in onCreate config
- [ ] T025 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(041): add container class selection to Create New dialog"

**Checkpoint**: User Story 2 complete - users can select any container class

---

## Phase 5: User Story 3 - Cancel and Close Dialog (Priority: P2)

**Goal**: Users can close the dialog without creating a document via Cancel button, Escape key, or backdrop click

**Independent Test**: Open dialog, press Escape - dialog closes without creating document

### Tests for User Story 3

- [ ] T026 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T027 [P] [US3] Add dialog close tests to `src/components/CreateNewDialog/__tests__/CreateNewDialog.spec.tsx`:
  - Cancel button calls onClose
  - Escape key calls onClose
  - Backdrop click calls onClose
  - Clicking inside dialog does not trigger onClose
  - Close button (X) calls onClose

### Implementation for User Story 3

- [ ] T028 [US3] Verify/complete close functionality in CreateNewDialog in `src/components/CreateNewDialog/CreateNewDialog.tsx`:
  - Ensure handleBackdropClick checks e.target === e.currentTarget
  - Ensure Cancel button has onClick={props.onClose}
  - Ensure X close button has onClick={props.onClose}
  - Ensure Escape key in handleKeyDown calls props.onClose
- [ ] T029 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(041): complete dialog close handling"

**Checkpoint**: User Story 3 complete - all dialog dismiss methods work

---

## Phase 6: User Story 4 - Input Validation Feedback (Priority: P3)

**Goal**: Users see clear error messages when entering invalid dimensions and cannot create until corrected

**Independent Test**: Enter width=0, see "must be at least 1" error, Create button action shows errors

### Tests for User Story 4

- [ ] T030 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T031 [P] [US4] Add validation UI tests to `src/components/CreateNewDialog/__tests__/CreateNewDialog.spec.tsx`:
  - Width error displayed for empty value
  - Width error displayed for zero
  - Width error displayed for negative number
  - Width error displayed for value > 10000
  - Height error displayed for invalid values
  - Error clears when user types in field
  - Create not called when validation fails
  - Input has error styling (inputError class) when error present
  - Decimal values are accepted and rounded

### Implementation for User Story 4

- [ ] T032 [US4] Complete validation UI in CreateNewDialog in `src/components/CreateNewDialog/CreateNewDialog.tsx`:
  - Ensure handleCreate validates before calling onCreate
  - Ensure widthError/heightError signals update from validation results
  - Ensure input onInput handlers clear respective errors
  - Ensure input className includes inputError when error present
  - Add Show blocks for error messages with data-testid attributes
  - Ensure both errors can display simultaneously
- [ ] T033 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(041): complete input validation feedback"

**Checkpoint**: User Story 4 complete - full validation feedback working

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T034 [P] Add accessibility attributes to CreateNewDialog in `src/components/CreateNewDialog/CreateNewDialog.tsx`:
  - role="dialog" on dialog container
  - aria-modal="true" on dialog container
  - aria-labelledby referencing title id
  - aria-label="Close" on close button
  - for/id association on all form labels and inputs
  - Focus trap: Tab key cycles within dialog (width → height → class → Cancel → Create → width)
  - Add test to verify Tab does not escape dialog while open (FR-014)
- [ ] T035 [P] Manual validation of complete user flow:
  - Click "Create New" button on home page - dialog opens
  - Enter width=800, height=600, select CScrollView - inputs accepted
  - Click "Create" - navigates to editor with 800x600 canvas
  - Repeat: open dialog, enter invalid width (0), click Create - see error message
  - Repeat: open dialog, press Escape - dialog closes without creating document
- [ ] T036 **Commit**: Stage and commit Polish phase changes with message "feat(041): add accessibility and final polish"

---

## Phase 8: Quality Gates (MANDATORY)

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
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on User Story 1 (dialog must exist)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (dialog must exist)
- **User Story 4 (Phase 6)**: Depends on User Story 1 (dialog must exist)
- **Polish (Phase 7)**: Depends on all user stories complete
- **Quality Gates (Phase 8)**: Depends on Polish
- **Git Verification (Final)**: Depends on Quality Gates passing

### User Story Dependencies

- **User Story 1 (P1)**: Core functionality - must complete first
- **User Story 2 (P2)**: Adds dropdown to existing dialog - depends on US1
- **User Story 3 (P2)**: Verifies close behavior - depends on US1
- **User Story 4 (P3)**: Adds validation feedback - depends on US1

### Within Each Phase

- Tests MUST be written and FAIL before implementation
- Models/types before services/domain
- Domain before stores
- Stores before components
- Component logic before styling polish

### Parallel Opportunities

**Phase 2 (Foundational)**:
```
T005 (validation tests) || T006 (factory tests)
T007 (validation impl)  || T008 (factory impl)
```

**Phase 3 (User Story 1)**:
```
T012 (store tests) || T013 (dialog tests)
T015 (CSS)        || T018 (UploadZone tests)
```

**Phase 4, 5, 6**: User Stories 2, 3, 4 must run sequentially after US1 (all modify CreateNewDialog.tsx)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types)
2. Complete Phase 2: Foundational (validation, factory)
3. Complete Phase 3: User Story 1 (core dialog, default CViewContainer)
4. **STOP and VALIDATE**: Test creating a new document works
5. User can now create new documents with default settings

### Incremental Delivery

1. Setup + Foundational -> Core domain ready
2. Add User Story 1 -> MVP - Create with defaults works
3. Add User Story 2 -> Container class selection works
4. Add User Story 3 -> All close methods work
5. Add User Story 4 -> Full validation feedback
6. Polish -> Accessibility, final verification

---

## Files Summary

### New Files (10)

| File | Purpose |
|------|---------|
| `src/types/createNew.ts` | Type definitions |
| `src/domain/createNew/index.ts` | Barrel export |
| `src/domain/createNew/validation.ts` | Dimension validation |
| `src/domain/createNew/documentFactory.ts` | Document creation |
| `src/domain/createNew/__tests__/validation.spec.ts` | Validation tests |
| `src/domain/createNew/__tests__/documentFactory.spec.ts` | Factory tests |
| `src/components/CreateNewDialog/index.ts` | Component barrel |
| `src/components/CreateNewDialog/CreateNewDialog.tsx` | Dialog component |
| `src/components/CreateNewDialog/CreateNewDialog.module.css` | Dialog styles |
| `src/components/CreateNewDialog/__tests__/CreateNewDialog.spec.tsx` | Component tests |

### Modified Files (4)

| File | Changes |
|------|---------|
| `src/stores/documentStore.ts` | Add createNewDocument function |
| `src/stores/__tests__/documentStore.spec.ts` | Add createNewDocument tests |
| `src/components/UploadZone/UploadZone.tsx` | Add Create New button, dialog integration |
| `src/components/UploadZone/UploadZone.module.css` | Add buttonGroup, buttonSecondary styles |

---

## Notes

- All imports must be static (no dynamic imports)
- Use SolidJS primitives only (createSignal, createEffect, Show, For)
- CSS Modules for all styling (.module.css)
- Follow existing dialog patterns (AddControlTagDialog, FormatChangeDialog)
- Maximum dimensions: 10000x10000 pixels
- Default dimensions: 400x300 pixels
- Default container: CViewContainer
- Template name: "view"
- Document marked not dirty after creation
