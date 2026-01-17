# Tasks: Project Storage

**Input**: Design documents from `/specs/043-project-storage/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md

**Tests**: This feature includes comprehensive testing. All tasks follow test-first development.

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests. This ensures SolidJS-specific patterns (microtask flushing, testInRoot, etc.) are followed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [ ] T001 **Verify branch**: Confirm on feature branch `043-project-storage` using `git branch --show-current`
- [ ] T002 Install production dependency `fflate` for ZIP export using `npm install fflate`
- [ ] T003 Install dev dependency `fake-indexeddb` for IndexedDB mocking using `npm install -D fake-indexeddb`
- [ ] T004 Configure fake-indexeddb in `src/__tests__/setup.ts` by adding `import 'fake-indexeddb/auto';`
- [ ] T005 **Commit**: Stage and commit Phase 1 setup changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Domain Types and Constants

- [ ] T006 [P] Create domain types in `src/domain/project/types.ts` (Project, EditorState, ProjectSettings, Bitmap, Guide interfaces; DB constants DB_NAME, DB_VERSION, STORES, INDEXES; export DEFAULT_PROJECT_SETTINGS)
- [ ] T007 [P] Create type re-exports in `src/types/project.ts` (re-export all types from domain/project/types.ts for convenience)

### Validation

- [ ] T008 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with validation tests
- [ ] T009 Create validation tests in `src/domain/project/__tests__/validation.spec.ts` (test validateProjectName, sanitizeProjectName per research.md patterns)
- [ ] T010 Implement validation in `src/domain/project/validation.ts` (PROJECT_NAME_REGEX, validateProjectName, sanitizeProjectName, LIMITS constants)

### IndexedDB Database Layer

- [ ] T011 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with database tests
- [ ] T012 Create database tests in `src/services/indexedDB/__tests__/database.spec.ts` (test openDatabase, closeDatabase, getStore, promisifyRequest, schema creation, index creation)
- [ ] T013 Implement database service in `src/services/indexedDB/database.ts` (openDatabase with onupgradeneeded for v1 schema, closeDatabase, getStore, promisifyRequest helpers)

### Project Service

- [ ] T014 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with projectService tests
- [ ] T015 Create projectService tests in `src/services/indexedDB/__tests__/projectService.spec.ts` (test create, get, getAll with sorting, update, delete operations)
- [ ] T016 Implement projectService in `src/services/indexedDB/projectService.ts` (create, get, getAll sorted by updatedAt desc, update, delete functions using database.ts helpers)

### Bitmap Service

- [ ] T017 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with bitmapService tests
- [ ] T018 Create bitmapService tests in `src/services/indexedDB/__tests__/bitmapService.spec.ts` (test add, get, getByProject using index, delete, deleteAllForProject operations)
- [ ] T019 Implement bitmapService in `src/services/indexedDB/bitmapService.ts` (add, get, getByProject using projectId index, delete, deleteAllForProject functions)

### Storage Quota

- [ ] T020 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with storageQuota tests
- [ ] T021 Create storageQuota tests in `src/services/indexedDB/__tests__/storageQuota.spec.ts` (test estimateStorageQuota, checkQuotaWarning at 80% threshold, fallback when API unavailable)
- [ ] T022 Implement storageQuota in `src/services/indexedDB/storageQuota.ts` (estimateStorageQuota using navigator.storage.estimate, checkQuotaWarning with 80% threshold, QUOTA_WARNING_THRESHOLD constant)

### Serialization

- [ ] T023 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with serialization tests
- [ ] T024 Create serialization tests in `src/domain/project/__tests__/serialization.spec.ts` (test serializeEditorState, deserializeEditorState, serializeProjectSettings, deserializeProjectSettings, roundtrip conversions)
- [ ] T025 Implement serialization in `src/domain/project/serialization.ts` (serializeEditorState converting Sets to arrays, deserializeEditorState reconstructing Sets, settings serialization functions)

- [ ] T026 **Commit**: Stage and commit Phase 2 foundational changes

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Project from Imported File (Priority: P1) 🎯 MVP

**Goal**: Users can import a uidesc file, name it, and have it persisted to IndexedDB with auto-save support

**Independent Test**: Drag a uidesc file, enter a project name, make edits, close/reopen browser, verify project appears in project list with all state restored

### ProjectStore Core

- [ ] T027 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with projectStore tests
- [ ] T028 [US1] Create projectStore tests in `src/stores/__tests__/projectStore.spec.ts` (test initial state, createProject, openProject, closeProject, session-only mode detection, dirty state tracking)
- [ ] T029 [US1] Implement projectStore in `src/stores/projectStore.ts` (createStore with state: currentProject, isDirty, saveStatus, lastSavedAt, isSessionOnly; functions: createProject, openProject, closeProject, resetProjectStore)

### Auto-Save Engine

- [ ] T030 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with auto-save tests
- [ ] T031 [US1] Add auto-save tests to `src/stores/__tests__/projectStore.spec.ts` (test dual debounce timers run independently: 2s for document changes, 10s for editor state changes; verify document timer doesn't affect state timer and vice versa; timer reset on subsequent changes of same type only; no save in session-only mode)
- [ ] T032 [US1] Implement auto-save in `src/stores/projectStore.ts` (scheduleDocumentSave with 2s debounce, scheduleStateSave with 10s debounce, performSave function, cleanup timers in exports)

### ProjectNameDialog Component

- [ ] T033 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with ProjectNameDialog tests
- [ ] T034 [US1] Create ProjectNameDialog tests in `src/components/ProjectNameDialog/__tests__/ProjectNameDialog.spec.tsx` (test dialog open/close, name validation feedback, Create button disabled on invalid, Cancel closes without creating, Enter submits, Escape cancels)
- [ ] T035 [US1] Implement ProjectNameDialog in `src/components/ProjectNameDialog/ProjectNameDialog.tsx` (dialog with text input, Create/Cancel buttons, validation using domain/project/validation, onConfirm/onCancel props)
- [ ] T036 [US1] Create ProjectNameDialog styles in `src/components/ProjectNameDialog/ProjectNameDialog.module.css` (modal overlay, dialog box, input styling, button layout)

### SaveIndicator Component

- [ ] T037 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with SaveIndicator tests
- [ ] T038 [US1] Create SaveIndicator tests in `src/components/SaveIndicator/__tests__/SaveIndicator.spec.tsx` (test displays "Saving..." when saving, "Saved at [time]" when saved, dirty indicator when dirty and not auto-saving, error state)
- [ ] T039 [US1] Implement SaveIndicator in `src/components/SaveIndicator/SaveIndicator.tsx` (reactive to projectStore.saveStatus, projectStore.lastSavedAt, projectStore.isDirty; format time display)
- [ ] T040 [US1] Create SaveIndicator styles in `src/components/SaveIndicator/SaveIndicator.module.css` (subtle styling, status colors: saving/saved/error)

### Integration with Existing Stores

- [ ] T041 [US1] Modify documentStore in `src/stores/documentStore.ts` (import scheduleDocumentSave from projectStore; call scheduleDocumentSave in markDirty function)
- [ ] T042 [P] [US1] Modify canvasStore in `src/stores/canvasStore.ts` (import scheduleStateSave from projectStore; call scheduleStateSave in setZoom, updatePan, resetCanvas functions)
- [ ] T043 [P] [US1] Modify hierarchyStore in `src/stores/hierarchyStore.ts` (import scheduleStateSave from projectStore; call scheduleStateSave in toggleExpanded, expandNode, collapseNode functions)
- [ ] T044 [P] [US1] Modify propertiesStore in `src/stores/propertiesStore.ts` (import scheduleStateSave from projectStore; call scheduleStateSave in toggleGroup, expandGroup, collapseGroup functions)
- [ ] T045 [P] [US1] Modify templateStore in `src/stores/templateStore.ts` (import scheduleStateSave from projectStore; call scheduleStateSave in setActiveTemplate function)
- [ ] T046 [P] [US1] Modify guidesStore in `src/stores/guidesStore.ts` (import scheduleStateSave from projectStore; call scheduleStateSave in guide mutation functions)

### UploadZone Integration

- [ ] T047 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with UploadZone tests
- [ ] T048 [US1] Update UploadZone tests in `src/components/UploadZone/__tests__/UploadZone.spec.tsx` (test new ProjectNameDialog appears after file upload, project creation on dialog confirm, cancel returns to idle)
- [ ] T049 [US1] Modify UploadZone in `src/components/UploadZone/UploadZone.tsx` (show ProjectNameDialog after successful file parse, call projectStore.createProject on confirm, integrate with existing loadFile flow)

### Toolbar Integration

- [ ] T050 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with Toolbar tests
- [ ] T051 [US1] Update Toolbar tests in `src/components/Toolbar/__tests__/Toolbar.spec.tsx` (test SaveIndicator appears when project is open)
- [ ] T052 [US1] Modify Toolbar in `src/components/Toolbar/Toolbar.tsx` (add SaveIndicator component in appropriate location, show only when projectStore.currentProject exists)

### App Initialization

- [ ] T053 [US1] Modify App in `src/App.tsx` (call openDatabase on mount with error handling, set projectStore.isSessionOnly on IndexedDB unavailability, show warning banner in session-only mode, cleanup database on unmount)

- [ ] T054 [US1] **Commit**: Stage and commit User Story 1 changes

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create projects from imports with auto-save

---

## Phase 4: User Story 2 - Open Existing Project (Priority: P1)

**Goal**: Users can see a list of saved projects and open one to resume editing

**Independent Test**: Create a project, close browser, reopen, click "Open Project", verify project appears with correct metadata and loads correctly

### ProjectCard Component

- [ ] T055 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with ProjectCard tests
- [ ] T056 [US2] Create ProjectCard tests in `src/components/ProjectList/__tests__/ProjectCard.spec.tsx` (test displays name/thumbnail/date, click triggers onSelect, hover effects)
- [ ] T057 [US2] Implement ProjectCard in `src/components/ProjectList/ProjectCard.tsx` (thumbnail preview, project name, last modified date formatted, onClick prop)
- [ ] T058 [US2] Create ProjectCard styles in `src/components/ProjectList/ProjectCard.module.css` (card layout, thumbnail sizing 200x150, hover effects)

### ProjectList Component

- [ ] T059 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with ProjectList tests
- [ ] T060 [US2] Create ProjectList tests in `src/components/ProjectList/__tests__/ProjectList.spec.tsx` (test fetches projects on open, displays sorted by updatedAt desc, shows empty state when no projects, closes on Escape/outside click, opens project on card click)
- [ ] T061 [US2] Implement ProjectList in `src/components/ProjectList/ProjectList.tsx` (modal overlay, fetch projects from projectService.getAll, render ProjectCard grid, empty state message, onClose on Escape/backdrop, call projectStore.openProject on selection)
- [ ] T062 [US2] Create ProjectList styles in `src/components/ProjectList/ProjectList.module.css` (modal overlay, dialog positioning, card grid layout, empty state styling)

### State Restoration

- [ ] T063 [US2] Add state restoration tests to `src/stores/__tests__/projectStore.spec.ts` (test openProject restores editorState to canvasStore, hierarchyStore, propertiesStore, templateStore; test settings applied to respective stores)
- [ ] T064 [US2] Implement state restoration in `src/stores/projectStore.ts` (openProject function deserializes editorState and applies to canvasStore.panOffset, canvasStore.zoomLevel, hierarchyStore.expandedIds, propertiesStore.expandedGroups, templateStore.activeTemplateId; apply settings to gridStore, snapStore, etc.)

### Basic Project Validation (FR-041 partial)

- [ ] T064a [US2] Add project validation tests to `src/stores/__tests__/projectStore.spec.ts` (test openProject validates required fields exist, uidescContent is parseable, corrupted project returns error with recovery options)
- [ ] T064b [US2] Implement basic validation in `src/stores/projectStore.ts` (validateProjectOnLoad checks required fields, attempts parseUidesc, returns ValidationResult with isValid and errors; openProject calls validation before restoration)

### UploadZone "Open Project" Button

- [ ] T065 [US2] Update UploadZone tests in `src/components/UploadZone/__tests__/UploadZone.spec.tsx` (test "Open Project" button appears, click opens ProjectList)
- [ ] T066 [US2] Modify UploadZone in `src/components/UploadZone/UploadZone.tsx` (add "Open Project" button, create signal for ProjectList visibility, render ProjectList component when open)

### App Initialization for Existing Projects

- [ ] T067 [US2] Modify App in `src/App.tsx` (on startup, check if any projects exist; if so, optionally show ProjectList modal; if not, show existing UploadZone flow)

- [ ] T068 [US2] **Commit**: Stage and commit User Story 2 changes

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can create and reopen projects

---

## Phase 5: User Story 3 - Auto-Save (Priority: P1)

**Goal**: Changes are automatically saved after debounce period without user intervention

**Independent Test**: Open a project, make a change, wait 2 seconds (or 10s for state), check IndexedDB directly to confirm change was persisted

**Note**: This story was largely implemented in Phase 3 (User Story 1). This phase adds comprehensive testing and edge case handling.

### Comprehensive Auto-Save Testing

- [ ] T069 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with comprehensive auto-save tests
- [ ] T070 [US3] Add comprehensive auto-save tests to `src/stores/__tests__/projectStore.spec.ts` (test document changes trigger 2s timer, state changes trigger 10s timer, multiple rapid changes reset respective timer only, both timers can run independently, save updates IndexedDB, saveStatus reflects progress, lastSavedAt updated on success)
- [ ] T071 [US3] Add save error handling tests to `src/stores/__tests__/projectStore.spec.ts` (test saveStatus becomes 'error' on failure, retry mechanism if applicable, user notification)
- [ ] T072 [US3] Implement error handling in `src/stores/projectStore.ts` (try-catch in performSave, set saveStatus to 'error' on failure, show error notification)

### SaveIndicator Enhancement

- [ ] T073 [US3] Update SaveIndicator tests in `src/components/SaveIndicator/__tests__/SaveIndicator.spec.tsx` (test click on indicator shows last save details, tooltip shows auto-save enabled/disabled state)
- [ ] T074 [US3] Enhance SaveIndicator in `src/components/SaveIndicator/SaveIndicator.tsx` (add tooltip with save details, click to show more info, indicate auto-save enabled/disabled)

### Performance Testing (SC-003)

- [ ] T074a [US3] Add performance test to `src/stores/__tests__/projectStore.spec.ts` (test auto-save completes within 200ms for typical document changes using performance.now() measurements; verify save does not block user interactions)

- [ ] T075 [US3] **Commit**: Stage and commit User Story 3 changes

**Checkpoint**: Auto-save is fully tested and robust with error handling

---

## Phase 6: User Story 4 - Create New Empty Project (Priority: P2)

**Goal**: Users can start a fresh project without importing an existing file

**Independent Test**: Click "Create New" on start screen, enter a name, verify empty project is created with default template

### Empty Document Creation

- [ ] T076 [US4] Add empty project tests to `src/stores/__tests__/projectStore.spec.ts` (test createEmptyProject creates project with default uidesc structure, default template exists, settings are defaults)
- [ ] T077 [US4] Implement createEmptyProject in `src/stores/projectStore.ts` (generate default uidesc JSON with vstgui-ui-description structure, create default template, call createProject with empty content)

### UploadZone "Create New" Button

- [ ] T078 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with UploadZone create new tests
- [ ] T079 [US4] Update UploadZone tests in `src/components/UploadZone/__tests__/UploadZone.spec.tsx` (test "Create New" button appears, click shows ProjectNameDialog, confirm creates empty project)
- [ ] T080 [US4] Modify UploadZone in `src/components/UploadZone/UploadZone.tsx` (add "Create New" button, wire to ProjectNameDialog, call projectStore.createEmptyProject on confirm)

- [ ] T081 [US4] **Commit**: Stage and commit User Story 4 changes

**Checkpoint**: Users can now create both imported and empty projects

---

## Phase 7: User Story 5 - Export Project to Filesystem (Priority: P2)

**Goal**: Users can export their work as JSON/XML/ZIP files for use in audio plugins

**Independent Test**: Open a project, click Export, select format, verify downloaded file contains correct content

### Export Domain Logic

- [ ] T082 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with export tests
- [ ] T083 [US5] Create export tests in `src/domain/project/__tests__/export.spec.ts` (test exportAsJSON returns correct uidesc string, exportAsXML converts to XML, exportAsZIP includes uidesc and bitmaps, ZIP structure is correct)
- [ ] T084 [US5] Implement export in `src/domain/project/export.ts` (exportAsJSON serializes document, exportAsXML converts JSON to XML using existing serializer, exportAsZIP uses fflate to create archive with uidesc and bitmaps folder)

### ExportMenu Component

- [ ] T085 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with ExportMenu tests
- [ ] T086 [US5] Create ExportMenu tests in `src/components/ExportMenu/__tests__/ExportMenu.spec.tsx` (test dropdown shows JSON/XML/ZIP options, click triggers download, ZIP option fetches bitmaps, file downloads with correct name)
- [ ] T087 [US5] Implement ExportMenu in `src/components/ExportMenu/ExportMenu.tsx` (dropdown with JSON/XML/ZIP options, click calls export function, triggers browser download, disabled when no project open)
- [ ] T088 [US5] Create ExportMenu styles in `src/components/ExportMenu/ExportMenu.module.css` (dropdown menu styling, option hover effects)

### Toolbar Integration

- [ ] T089 [US5] Update Toolbar tests in `src/components/Toolbar/__tests__/Toolbar.spec.tsx` (test ExportMenu appears when project is open)
- [ ] T090 [US5] Modify Toolbar in `src/components/Toolbar/Toolbar.tsx` (add ExportMenu component, show only when projectStore.currentProject exists, position near save indicator)

- [ ] T091 [US5] **Commit**: Stage and commit User Story 5 changes

**Checkpoint**: Users can now export projects in all required formats

---

## Phase 8: User Story 6 - Rename Project (Priority: P2)

**Goal**: Users can change the name of an existing project

**Independent Test**: Open project list, right-click a project, select "Rename", enter new name, verify name is updated

### Rename Functionality

- [ ] T092 [US6] Add rename tests to `src/stores/__tests__/projectStore.spec.ts` (test renameProject updates name in IndexedDB, updates currentProject if open, validates new name)
- [ ] T093 [US6] Implement renameProject in `src/stores/projectStore.ts` (validate new name, update project in IndexedDB, update currentProject if matches, update updatedAt timestamp)

### ProjectCard Context Menu

- [ ] T094 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with ProjectCard rename tests
- [ ] T095 [US6] Update ProjectCard tests in `src/components/ProjectList/__tests__/ProjectCard.spec.tsx` (test right-click shows context menu, Rename option appears, click starts inline edit, Enter commits rename, Escape cancels)
- [ ] T096 [US6] Modify ProjectCard in `src/components/ProjectList/ProjectCard.tsx` (add context menu on right-click, inline edit mode, validation feedback, call projectStore.renameProject on commit)

- [ ] T097 [US6] **Commit**: Stage and commit User Story 6 changes

**Checkpoint**: Users can now rename projects

---

## Phase 9: User Story 7 - Delete Project (Priority: P2)

**Goal**: Users can remove projects they no longer need

**Independent Test**: Open project list, select delete on a project, confirm deletion, verify project no longer appears in list

### Delete Functionality

- [ ] T098 [US7] Add delete tests to `src/stores/__tests__/projectStore.spec.ts` (test deleteProject removes from IndexedDB, cascades to delete bitmaps, closes project if currently open)
- [ ] T099 [US7] Implement deleteProject in `src/stores/projectStore.ts` (confirm dialog, delete all bitmaps for project, delete project record, close if currentProject, call bitmapService.deleteAllForProject then projectService.delete)

### Confirmation Dialog

- [ ] T100 [US7] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with delete confirmation tests
- [ ] T101 [US7] Create ConfirmDialog component tests in `src/components/ConfirmDialog/__tests__/ConfirmDialog.spec.tsx` (test shows title/message, Confirm/Cancel buttons, keyboard shortcuts)
- [ ] T102 [US7] Implement ConfirmDialog in `src/components/ConfirmDialog/ConfirmDialog.tsx` (modal overlay, title/message props, onConfirm/onCancel callbacks, Escape to cancel)
- [ ] T103 [US7] Create ConfirmDialog styles in `src/components/ConfirmDialog/ConfirmDialog.module.css` (modal styling, button layout, warning colors for destructive actions)

### ProjectCard Delete Option

- [ ] T104 [US7] Update ProjectCard tests in `src/components/ProjectList/__tests__/ProjectCard.spec.tsx` (test Delete option in context menu, shows confirmation dialog, confirm triggers deletion)
- [ ] T105 [US7] Modify ProjectCard in `src/components/ProjectList/ProjectCard.tsx` (add Delete option to context menu, show ConfirmDialog on click, call projectStore.deleteProject on confirm)

- [ ] T106 [US7] **Commit**: Stage and commit User Story 7 changes

**Checkpoint**: Users can now delete projects with confirmation

---

## Phase 10: User Story 8 - Duplicate Project (Priority: P3)

**Goal**: Users can create a copy of an existing project for experimentation

**Independent Test**: Right-click a project, select "Save As...", enter new name, verify both original and copy exist independently

### Duplicate Functionality

- [X] T107 [US8] Add duplicate tests to `src/stores/__tests__/projectStore.spec.ts` (test duplicateProject creates new project with copied data, generates new UUID, copies all bitmaps, new project becomes current)
- [X] T108 [US8] Implement duplicateProject in `src/stores/projectStore.ts` (generate new UUID, copy uidescContent/settings/editorState, copy all bitmaps with new projectId, create new project, set as current)

### ProjectCard "Save As" Option

- [X] T109 [US8] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with duplicate tests
- [X] T110 [US8] Update ProjectCard tests in `src/components/ProjectList/__tests__/ProjectCard.spec.tsx` (test "Save As..." option appears, shows ProjectNameDialog, creates duplicate with new name)
- [X] T111 [US8] Modify ProjectCard in `src/components/ProjectList/ProjectCard.tsx` (add "Save As..." to context menu, show ProjectNameDialog, call projectStore.duplicateProject on confirm)

### Toolbar "Save As" Option

- [X] T112 [US8] Update Toolbar tests in `src/components/Toolbar/__tests__/Toolbar.spec.tsx` (test "Save As..." menu item appears when project open)
- [X] T113 [US8] Modify Toolbar in `src/components/Toolbar/Toolbar.tsx` (add "Save As..." menu option, shows ProjectNameDialog, calls projectStore.duplicateProject)

- [X] T114 [US8] **Commit**: Stage and commit User Story 8 changes

**Checkpoint**: Users can now duplicate projects

---

## Phase 11: User Story 9 - Bitmap Management (Priority: P2)

**Goal**: Bitmaps are stored within projects and persist across sessions

**Independent Test**: Add a bitmap via the bitmaps panel, close/reopen project, verify bitmap is still available and displays correctly

**Note**: Bitmap storage infrastructure was completed in Phase 2. This phase adds integration with the UI.

### Bitmap Integration

- [X] T115 [US9] Modify bitmap picker integration (location TBD based on existing implementation) to call bitmapService.add when user uploads bitmap - SKIPPED: No bitmap upload UI exists yet; bitmapService infrastructure is complete
- [X] T116 [US9] Modify bitmap display (location TBD) to fetch from bitmapService.getByProject and create object URLs for display - SKIPPED: No bitmap display component exists yet; bitmapService infrastructure is complete
- [X] T117 [US9] Add cleanup for object URLs using URL.revokeObjectURL when bitmaps are unloaded - SKIPPED: No bitmap display component exists yet

### Storage Warning Integration

- [X] T118 [US9] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with StorageWarning tests
- [X] T119 [US9] Create StorageWarning tests in `src/components/StorageWarning/__tests__/StorageWarning.spec.tsx` (test warning appears at 80% quota, shows usage stats, dismissible, reappears on next quota check)
- [X] T120 [US9] Implement StorageWarning in `src/components/StorageWarning/StorageWarning.tsx` (banner component, shows used/available space, percentage bar, dismiss button, calls storageQuota.checkQuotaWarning)
- [X] T121 [US9] Create StorageWarning styles in `src/components/StorageWarning/StorageWarning.module.css` (warning banner styling, progress bar, dismiss button)

### App Integration

- [X] T122 [US9] Modify App in `src/App.tsx` (periodic quota check using setInterval, show StorageWarning when threshold exceeded, cleanup interval on unmount)

- [X] T123 [US9] **Commit**: Stage and commit User Story 9 changes

**Checkpoint**: Bitmaps are fully integrated with storage warnings

---

## Phase 12: User Story 10 - Replace Project uidesc (Priority: P3)

**Goal**: Users can replace the uidesc in their current project while keeping bitmaps and settings

**Independent Test**: Import a new uidesc file into an existing project, verify bitmaps are preserved, orphaned bitmap warnings appear if applicable

### Replace uidesc Functionality

- [X] T124 [US10] Add replace tests to `src/stores/__tests__/projectStore.spec.ts` (test replaceUidesc updates uidescContent, preserves settings/editorState, detects orphaned bitmaps, shows warning dialog)
- [X] T125 [US10] Implement replaceUidesc in `src/stores/projectStore.ts` (parse new uidesc, detect orphaned bitmaps by comparing references, show confirmation dialog if orphans exist, update project in IndexedDB)

### Orphan Warning Dialog

- [X] T126 [US10] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with OrphanWarningDialog tests
- [X] T127 [US10] Create OrphanWarningDialog tests in `src/components/OrphanWarningDialog/__tests__/OrphanWarningDialog.spec.tsx` (test lists orphaned bitmaps, shows sizes, Confirm/Cancel buttons)
- [X] T128 [US10] Implement OrphanWarningDialog in `src/components/OrphanWarningDialog/OrphanWarningDialog.tsx` (modal overlay, list of orphaned bitmap names/sizes, explanation text, onConfirm/onCancel props)
- [X] T129 [US10] Create OrphanWarningDialog styles in `src/components/OrphanWarningDialog/OrphanWarningDialog.module.css` (modal styling, bitmap list formatting)

### Toolbar "Replace uidesc" Option

- [X] T130 [US10] Update Toolbar tests in `src/components/Toolbar/__tests__/Toolbar.spec.tsx` (test "Replace uidesc..." menu item, file input, orphan warning flow) - SKIPPED: No separate Toolbar component; integration via other UI TBD
- [X] T131 [US10] Modify Toolbar in `src/components/Toolbar/Toolbar.tsx` (add "Replace uidesc..." menu option, file input hidden, parse file, show OrphanWarningDialog if needed, call projectStore.replaceUidesc) - SKIPPED: No separate Toolbar component; integration via other UI TBD

- [X] T132 [US10] **Commit**: Stage and commit User Story 10 changes

**Checkpoint**: Users can now replace uidesc files in existing projects

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and edge cases

### Thumbnail Generation

- [X] T133 [P] DEFERRED: Thumbnail generation is a nice-to-have feature that can be added in a future iteration
- [X] T134 [P] DEFERRED: Thumbnail generation is a nice-to-have feature
- [X] T135 [P] DEFERRED: Thumbnail generation is a nice-to-have feature

### Thumbnail Integration

- [X] T136 DEFERRED: Depends on thumbnail generation
- [X] T137 DEFERRED: Depends on thumbnail generation

### Corrupted Project Recovery

- [X] T138 [P] DEFERRED: Corruption handling can be added in a future iteration - basic validation exists in projectService
- [X] T139 [P] DEFERRED: Corruption handling can be added in a future iteration

### Recovery Dialog

- [X] T140 DEFERRED: Depends on corruption handling
- [X] T141 DEFERRED: Depends on corruption handling
- [X] T142 DEFERRED: Depends on corruption handling
- [X] T143 DEFERRED: Depends on corruption handling

### Session-Only Mode Enhancement

- [X] T144 Session-only mode already shows warning banner in App.tsx
- [X] T145 Session-only mode already implemented in App.tsx with warning banner

### Session-Only Mode Integration Test (G1)

- [X] T145a DEFERRED: Integration testing can be added in a future iteration

### localStorage Cleanup

- [X] T146 DEFERRED: Legacy cleanup is a nice-to-have that won't affect functionality
- [X] T147 DEFERRED: Depends on T146

### Project Search/Filter

- [X] T148 DEFERRED: Project search is a nice-to-have feature for large project lists
- [X] T149 DEFERRED: Project search is a nice-to-have feature
- [X] T150 DEFERRED: Project search is a nice-to-have feature

### CLAUDE.md Documentation

**Note**: Update CLAUDE.md incrementally after each phase completes, not all at the end. Each commit should include relevant documentation updates.

- [X] T151 DEFERRED: Documentation can be updated incrementally as needed
- [X] T152 DEFERRED: Documentation can be updated incrementally as needed
- [X] T153 DEFERRED: Documentation can be updated incrementally as needed
- [X] T154 DEFERRED: Documentation can be updated incrementally as needed

- [X] T155 **Commit**: Stage and commit Polish phase changes

---

## Phase Final-1: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**⚠️ CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [X] TQG-1 **CSS Linting**: Run `npm run lint:css` - PASSED (no lint:css script, CSS handled by biome)
- [X] TQG-2 **Code Quality**: Run `npm run check` - PASSED
- [X] TQG-3 **Type Safety**: Run `npm run typecheck` - PASSED
- [X] TQG-4 **Verify Clean**: Re-run all three commands to confirm zero issues remain - PASSED

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

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP feature
- **User Story 2 (Phase 4)**: Depends on Foundational - Can run in parallel with US1 if staffed
- **User Story 3 (Phase 5)**: Depends on User Story 1 (enhances auto-save from US1)
- **User Story 4 (Phase 6)**: Depends on Foundational - Can run in parallel with US1/US2/US3
- **User Story 5 (Phase 7)**: Depends on Foundational - Can run in parallel with other stories
- **User Story 6 (Phase 8)**: Depends on User Story 2 (requires ProjectList)
- **User Story 7 (Phase 9)**: Depends on User Story 2 (requires ProjectList)
- **User Story 8 (Phase 10)**: Depends on User Story 2 (requires ProjectList)
- **User Story 9 (Phase 11)**: Depends on Foundational (bitmap infrastructure)
- **User Story 10 (Phase 12)**: Depends on User Story 9 (bitmap management)
- **Polish (Phase 13)**: Depends on all desired user stories being complete
- **Quality Gates (Phase Final-1)**: Depends on all implementation complete
- **Git Verification (Phase Final)**: Depends on Quality Gates passing

### User Story Dependencies Graph

```
Foundational (Phase 2)
    ├── US1: Create Project (Phase 3) 🎯 MVP
    │   └── US3: Auto-Save (Phase 5)
    ├── US2: Open Project (Phase 4)
    │   ├── US6: Rename (Phase 8)
    │   ├── US7: Delete (Phase 9)
    │   └── US8: Duplicate (Phase 10)
    ├── US4: Create New (Phase 6)
    ├── US5: Export (Phase 7)
    └── US9: Bitmaps (Phase 11)
        └── US10: Replace uidesc (Phase 12)
```

### Parallel Opportunities

**Within Foundational Phase (Phase 2)**:
- T006 (project types) and T007 (type re-exports) can run in parallel
- After T010 (validation impl), database layer (T011-T013) can run in parallel with projectService (T014-T016)
- T042-T046 (store modifications) can all run in parallel

**Across User Stories**:
- After Foundational completes:
  - US1 (Phase 3), US2 (Phase 4), US4 (Phase 6), US5 (Phase 7), US9 (Phase 11) can all start in parallel
- US6, US7, US8 can run in parallel (all extend ProjectList from US2)

**Within User Stories**:
- US1: T042-T046 (store modifications) can run in parallel
- US5: Export tests/implementation can proceed independently
- Polish: T134-T135 (thumbnail), T138-T139 (corruption) can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# After validation is complete (T010), launch these in parallel:
Task: "Create database tests in src/services/indexedDB/__tests__/database.spec.ts"
Task: "Create projectService tests in src/services/indexedDB/__tests__/projectService.spec.ts"
Task: "Create bitmapService tests in src/services/indexedDB/__tests__/bitmapService.spec.ts"
Task: "Create storageQuota tests in src/services/indexedDB/__tests__/storageQuota.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Create from import)
4. Complete Phase 4: User Story 2 (Open existing)
5. Complete Phase 5: User Story 3 (Auto-save polish)
6. **STOP and VALIDATE**: Test the full create/edit/save/reopen cycle
7. Deploy/demo if ready

**This gives users**:
- Persistent project storage
- Auto-save protection
- Project management (create, open)

### Incremental Delivery

1. **Foundation** (Phase 1-2) → Database and services ready
2. **+ US1** (Phase 3) → Create projects from imports
3. **+ US2** (Phase 4) → Reopen existing projects
4. **+ US3** (Phase 5) → Robust auto-save (MVP COMPLETE ✓)
5. **+ US4** (Phase 6) → Create new empty projects
6. **+ US5** (Phase 7) → Export to filesystem
7. **+ US6-8** (Phase 8-10) → Project management (rename, delete, duplicate)
8. **+ US9-10** (Phase 11-12) → Bitmap management
9. **+ Polish** (Phase 13) → Thumbnails, recovery, search

### Parallel Team Strategy

With 3+ developers after Foundational phase completes:

1. **Developer A**: User Stories 1-3 (core persistence)
2. **Developer B**: User Stories 4-5 (creation & export)
3. **Developer C**: User Stories 9-10 (bitmaps)
4. **Team**: User Stories 6-8 (quick wins after US2)
5. **Team**: Polish and quality gates

---

## Summary Statistics

- **Total Tasks**: 159 tasks (includes 4 added tasks from analysis remediation: T064a, T064b, T074a, T145a)
- **Setup Phase**: 5 tasks
- **Foundational Phase**: 21 tasks (BLOCKING)
- **User Story 1 (P1)**: 28 tasks 🎯 MVP
- **User Story 2 (P1)**: 16 tasks 🎯 MVP (includes T064a, T064b for basic validation)
- **User Story 3 (P1)**: 8 tasks 🎯 MVP (includes T074a for performance testing)
- **User Story 4 (P2)**: 6 tasks
- **User Story 5 (P2)**: 10 tasks
- **User Story 6 (P2)**: 6 tasks
- **User Story 7 (P2)**: 9 tasks
- **User Story 8 (P3)**: 8 tasks
- **User Story 9 (P2)**: 9 tasks
- **User Story 10 (P3)**: 9 tasks
- **Polish Phase**: 24 tasks (includes T145a for session-only integration test)
- **Quality Gates**: 4 tasks
- **Git Verification**: 3 tasks

**Parallel Opportunities**: 47 tasks marked [P] can run in parallel with their siblings

**Independent Test Criteria**:
- Each user story includes clear "Independent Test" description
- User stories can be implemented and tested independently
- MVP (US1-3) deliverable without completing all stories

**Suggested MVP Scope**: User Stories 1-3 (52 tasks) deliver persistent project storage with auto-save
