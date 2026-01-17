# Feature Specification: Project Storage

**Feature Branch**: `043-project-storage`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "Add persistent project storage using IndexedDB, allowing users to save their work (uidesc files, bitmaps, editor state, and settings) and return to it later without losing progress."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Project from Imported File (Priority: P1)

A user drags a `.uidesc` file into the application. Instead of working on an ephemeral session that disappears when they close the browser, they are prompted to name their project. Once named, the uidesc content and editor state are persisted to IndexedDB, allowing the user to close the browser and return later to continue their work exactly where they left off.

**Why this priority**: This is the core value proposition - persistent work sessions. Without this, users lose all progress when closing the browser, making the editor impractical for real projects.

**Independent Test**: Can be fully tested by dragging a uidesc file, entering a project name, making edits, closing/reopening the browser, and verifying the project appears in the project list with all state restored.

**Acceptance Scenarios**:

1. **Given** the application is open with no document loaded, **When** a user drags a valid `.uidesc` file into the drop zone, **Then** a dialog appears prompting for a project name (pre-filled with the filename without extension).

2. **Given** the project name dialog is shown, **When** the user enters a valid name and confirms, **Then** a new project is created in IndexedDB with the uidesc content, the editor opens with the document, and the project is marked as clean (not dirty).

3. **Given** the project name dialog is shown, **When** the user clicks Cancel or presses Escape, **Then** the dialog closes, no project is created, and the application returns to the idle state.

4. **Given** a project is open with unsaved changes, **When** the user closes the browser tab, **Then** all changes have been auto-saved to IndexedDB (if auto-save is enabled) or a warning is shown (if auto-save is disabled).

---

### User Story 2 - Open Existing Project (Priority: P1)

A returning user wants to continue working on a project they created in a previous session. They click "Open Project" to see a list of their saved projects, sorted by last modified date, and can select one to resume editing.

**Why this priority**: Equally critical as project creation - without the ability to open saved projects, persistence has no value.

**Independent Test**: Can be tested by creating a project, closing the browser, reopening, clicking "Open Project", and verifying the project appears with correct metadata (name, thumbnail, last modified date).

**Acceptance Scenarios**:

1. **Given** the application is open with no document loaded, **When** the user clicks "Open Project", **Then** a modal overlay appears showing all saved projects sorted by last modified date (most recent first).

2. **Given** the project list modal is open with projects available, **When** the user clicks on a project, **Then** the modal closes, the project loads, and editor state (pan, zoom, expanded nodes, active template) is restored.

3. **Given** the project list modal is open, **When** the user presses Escape or clicks outside the modal, **Then** the modal closes without loading any project.

4. **Given** no projects exist in IndexedDB, **When** the user clicks "Open Project", **Then** the modal shows an empty state message suggesting they create a new project or import a file.

---

### User Story 3 - Auto-Save (Priority: P1)

As a user makes changes to their project, the application automatically saves to IndexedDB after a brief debounce period, ensuring work is never lost due to browser crashes or accidental tab closure.

**Why this priority**: Auto-save is essential for a reliable editing experience. Without it, users risk losing work between manual saves.

**Independent Test**: Can be tested by opening a project, making a change (e.g., moving a view), waiting for the debounce period, checking IndexedDB directly to confirm the change was persisted.

**Acceptance Scenarios**:

1. **Given** a project is open with auto-save enabled (default), **When** the user makes a change, **Then** after a 2-second debounce period with no further changes, the project is saved to IndexedDB automatically.

2. **Given** auto-save is in progress, **When** a visual indicator shows the save status, **Then** the indicator displays "Saving..." during save and "Saved at [time]" after completion.

3. **Given** a project is open with auto-save disabled, **When** the user makes a change, **Then** the document is marked as dirty but no automatic save occurs; a dirty indicator is shown.

4. **Given** multiple rapid changes are made, **When** the debounce timer resets on each change, **Then** only one save operation occurs 2 seconds after the last change.

---

### User Story 4 - Create New Empty Project (Priority: P2)

A user wants to start a fresh project without importing an existing file. They click "New Project", provide a name, and the application creates an empty project with default settings.

**Why this priority**: Supports the complete project creation workflow. Lower priority than file import because most users start with existing uidesc files.

**Independent Test**: Can be tested by clicking "New Project" on the start screen, entering a name, and verifying an empty project is created with the default template.

**Acceptance Scenarios**:

1. **Given** the application is open with no document loaded, **When** the user clicks "Create New" and then provides a project name, **Then** a new project is created with an empty uidesc document and default settings.

2. **Given** the user is creating a new project, **When** they confirm the name, **Then** the project appears in the project list and the editor opens with the new document.

---

### User Story 5 - Export Project to Filesystem (Priority: P2)

A user wants to export their work to the local filesystem, either as a JSON/XML file (for use in their audio plugin build) or as a ZIP archive containing the uidesc and all associated bitmaps.

**Why this priority**: Export is critical for actually using the edited uidesc in audio plugins, but users can work for extended periods before needing to export.

**Independent Test**: Can be tested by opening a project, clicking Export, selecting a format (JSON/XML/ZIP), and verifying the downloaded file contains correct content.

**Acceptance Scenarios**:

1. **Given** a project is open, **When** the user clicks "Export" and selects JSON format, **Then** a `.uidesc` file in JSON format is downloaded with the current document content.

2. **Given** a project is open, **When** the user clicks "Export" and selects XML format, **Then** a `.uidesc` file in XML format is downloaded with the current document content.

3. **Given** a project is open with associated bitmaps, **When** the user clicks "Export" and selects ZIP format, **Then** a `.zip` file is downloaded containing the uidesc file and all referenced bitmaps.

4. **Given** a project is open with no bitmaps, **When** the user selects ZIP export, **Then** the option is still available but the ZIP contains only the uidesc file.

---

### User Story 6 - Rename Project (Priority: P2)

A user wants to change the name of an existing project to better reflect its contents or purpose.

**Why this priority**: Project management capability that improves organization but is not essential for core editing workflow.

**Independent Test**: Can be tested by opening the project list, right-clicking a project, selecting "Rename", entering a new name, and verifying the name is updated.

**Acceptance Scenarios**:

1. **Given** the project list modal is open, **When** the user right-clicks a project and selects "Rename", **Then** an inline edit field appears with the current name selected.

2. **Given** the rename field is active, **When** the user enters a new valid name and presses Enter, **Then** the project name is updated in IndexedDB and the list refreshes.

3. **Given** the rename field is active, **When** the user presses Escape, **Then** the rename is cancelled and the original name is preserved.

---

### User Story 7 - Delete Project (Priority: P2)

A user wants to remove a project they no longer need, freeing up storage space in IndexedDB.

**Why this priority**: Housekeeping feature for managing storage. Lower priority because projects can accumulate without immediate problems.

**Independent Test**: Can be tested by opening the project list, selecting delete on a project, confirming the deletion, and verifying the project no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** the project list modal is open, **When** the user right-clicks a project and selects "Delete", **Then** a confirmation dialog appears warning that this action cannot be undone.

2. **Given** the delete confirmation dialog is shown, **When** the user confirms deletion, **Then** the project and all associated bitmaps are removed from IndexedDB, and the list refreshes.

3. **Given** the delete confirmation dialog is shown, **When** the user cancels, **Then** the project is not deleted and the dialog closes.

---

### User Story 8 - Duplicate Project (Priority: P3)

A user wants to create a copy of an existing project to experiment with changes without affecting the original.

**Why this priority**: Convenience feature for experimentation. Users can manually export and re-import as a workaround.

**Independent Test**: Can be tested by right-clicking a project, selecting "Save As...", entering a new name, and verifying both the original and copy exist independently.

**Acceptance Scenarios**:

1. **Given** a project is open, **When** the user selects "Save As..." from the project menu, **Then** a dialog prompts for a new project name.

2. **Given** the Save As dialog is shown, **When** the user enters a new name and confirms, **Then** a new project is created with a copy of all data (uidesc, bitmaps, settings), and the new project becomes the active project.

---

### User Story 9 - Bitmap Management (Priority: P2)

A user needs to add bitmap images to their project for use as button backgrounds, knob skins, or other visual elements. The bitmaps are stored within the project so they persist across sessions.

**Why this priority**: Bitmaps are essential for realistic uidesc editing. Storing them avoids the need to re-upload every session.

**Independent Test**: Can be tested by adding a bitmap via the bitmaps panel, closing/reopening the project, and verifying the bitmap is still available and displays correctly.

**Acceptance Scenarios**:

1. **Given** a project is open, **When** the user adds a bitmap through the existing bitmap picker, **Then** the bitmap blob is stored in the bitmaps IndexedDB store, linked to the current project.

2. **Given** a project has stored bitmaps, **When** the project is opened, **Then** all bitmaps are available for use in view attributes without needing to re-upload.

3. **Given** a project is approaching IndexedDB storage limits, **When** the user tries to add a bitmap, **Then** a warning is displayed showing current storage usage and remaining capacity.

---

### User Story 10 - Replace Project uidesc (Priority: P3)

A user has a new version of their uidesc file from an external source and wants to replace the uidesc in their current project while keeping their bitmaps and settings.

**Why this priority**: Advanced workflow for users iterating on uidesc externally. Most users edit entirely within the app.

**Independent Test**: Can be tested by importing a new uidesc file into an existing project and verifying bitmaps are preserved but orphaned bitmap warnings appear if applicable.

**Acceptance Scenarios**:

1. **Given** a project is open, **When** the user selects "Replace uidesc..." from the project menu and selects a new file, **Then** the project's uidesc content is replaced with the new file content.

2. **Given** the new uidesc references different bitmaps than the old one, **When** the replacement is confirmed, **Then** a warning dialog lists bitmaps that will become orphaned (stored but unreferenced).

3. **Given** the orphan warning is shown, **When** the user confirms, **Then** the replacement proceeds and orphaned bitmaps remain in storage (can be manually deleted later).

---

### Edge Cases

- What happens when IndexedDB is unavailable (private browsing, disabled)? A warning is shown at startup and the app falls back to session-only mode with full editing functionality in memory; all features work normally but nothing persists after tab close.

- What happens when IndexedDB storage quota is exceeded? A clear error message is shown with options to delete old projects or reduce bitmap sizes.

- What happens when the user opens a project that was corrupted? The app shows a recovery dialog offering to restore from the last known good state or delete the project.

- What happens when two browser tabs have the same project open? The app detects concurrent access and shows a warning; the most recent save wins.

- What happens when project name contains invalid characters? Names are validated to allow alphanumeric, spaces, hyphens, and underscores only; invalid characters are stripped or rejected.

## Clarifications

### Session 2026-01-17

- Q: When a user adds a bitmap to their project, should bitmaps be shared across multiple projects or should each project store its own copy? → A: Each project stores its own copy of bitmaps; no sharing between projects

- Q: Can two projects have the same name, or must project names be unique? → A: Duplicate names are allowed; projects are uniquely identified by UUID internally

- Q: When upgrading from the current system (which uses localStorage for preferences) to project-specific settings in IndexedDB, what should happen to existing localStorage preferences? → A: Discard all existing localStorage preferences; users start fresh with factory defaults

- Q: Should auto-save trigger on all state changes (pan, zoom, selection) or only on uidesc document changes? → A: Auto-save triggers on uidesc document changes only (view edits, property changes); editor state (pan/zoom/expanded nodes) saves separately on a slower interval (10 seconds)

- Q: When IndexedDB is unavailable (e.g., private browsing mode), should the application provide full editing functionality in memory or a limited/read-only mode? → A: Full editing functionality in memory; all features work normally but nothing persists after tab close

## Requirements *(mandatory)*

### Functional Requirements

#### Project Lifecycle

- **FR-001**: System MUST create a new project in IndexedDB when a user imports a uidesc file and confirms the project name.

- **FR-002**: System MUST create a new project in IndexedDB when a user creates a new empty document and confirms the project name.

- **FR-003**: System MUST prompt for a project name before creating any project; the dialog MUST include a text input, "Create" button, and "Cancel" button.

- **FR-004**: System MUST abort project creation and return to idle state when the user cancels the name prompt.

- **FR-005**: System MUST store one project per uidesc document (1:1 relationship).

- **FR-006**: System MUST support renaming projects through a rename action in the project list. Duplicate project names are allowed; projects are uniquely identified by UUID.

- **FR-007**: System MUST support deleting projects with a confirmation dialog. The confirmation dialog MUST display: "Delete '[project name]'? This action cannot be undone. All project data including bitmaps will be permanently deleted." with "Delete" (destructive) and "Cancel" buttons.

- **FR-008**: System MUST support duplicating projects via "Save As..." functionality.

#### Storage Structure

- **FR-009**: System MUST use IndexedDB for all persistent storage with two object stores: "projects" and "bitmaps".

- **FR-010**: Projects store MUST contain: `id` (uuid), `name`, `createdAt`, `updatedAt`, `uidescContent` (string), `uidescFormat` ('json' | 'xml'), `editorState`, `settings`, `thumbnailDataUrl`.

- **FR-011**: Editor state MUST include: `panOffset`, `zoomLevel`, `expandedHierarchyNodes`, `expandedPropertyGroups`, `selectedTemplateId`. Note: Custom guides are stored in `ProjectSettings.customGuides`, not in EditorState, because guides are a document annotation rather than transient view state.

- **FR-012**: Project settings MUST include: `grid`, `snap`, `smartGuides`, `customGuides`, `theme`, `autoSave`.

- **FR-013**: Bitmaps store MUST contain: `id` (uuid), `projectId`, `name`, `blob` (Blob), `mimeType`, `width`, `height`, `size`, `addedAt`. Each project stores its own copy of bitmaps; bitmaps are never shared between projects.

- **FR-014**: System MUST NOT persist view selection (selectedIds) or undo history to IndexedDB.

- **FR-015**: System MUST remove all localStorage usage for settings; all settings become project-specific. Existing localStorage preferences are discarded on upgrade; users start fresh with factory defaults.

#### Project List

- **FR-016**: System MUST display a project list modal when the user clicks "Open Project".

- **FR-017**: Project list MUST show projects sorted by `updatedAt` descending (most recent first).

- **FR-018**: Each project entry MUST display: name, thumbnail preview, last modified date.

- **FR-019**: Project list MUST support searching/filtering projects by name. *(Priority: P3 - deferred to polish phase; not required for MVP)*

- **FR-020**: Project list modal MUST close when clicking outside, pressing Escape, or selecting a project.

#### Save and Export

- **FR-021**: "Save" action MUST write to IndexedDB (persisting current state).

- **FR-022**: "Export" action MUST write to filesystem with format selection (JSON, XML, or ZIP).

- **FR-023**: ZIP export MUST include the uidesc file and all project bitmaps.

- **FR-024**: System MUST generate a small thumbnail (base64 data URL) of the first template for project list preview. If the document has zero templates, generate a placeholder thumbnail showing "No Template" text on a neutral background.

#### Auto-Save

- **FR-025**: System MUST support optional auto-save, enabled by default. New projects are created with `settings.autoSave.enabled = true` from `DEFAULT_PROJECT_SETTINGS`.

- **FR-026**: Auto-save MUST use a 2-second debounce interval for uidesc document changes (view edits, property changes). Editor state (pan, zoom, expanded nodes, property groups, active template) MUST save separately on a 10-second debounce interval.

- **FR-027**: System MUST display a visual indicator showing save status (saving/saved) and last saved time.

- **FR-028**: System MUST mark documents as "dirty" when unsaved changes exist (for non-auto-save users).

- **FR-029**: Auto-save MUST maintain two separate debounce timers: one for uidesc document changes (2 seconds) and one for editor state changes (10 seconds). Changes to either trigger only their respective timer.

#### Bitmap Management

- **FR-030**: System MUST store uploaded bitmaps as Blobs in the bitmaps IndexedDB store.

- **FR-031**: Bitmaps MUST be referenced by name matching the uidesc bitmap references.

- **FR-032**: System MUST warn users when approaching IndexedDB storage limits (at 80% capacity). Capacity is calculated as `usage / quota` from `navigator.storage.estimate()`. Warning triggers when this ratio exceeds 0.8. System MUST check quota after each bitmap upload and periodically every 30 seconds while a project is open.

- **FR-033**: When replacing a project's uidesc, system MUST warn about bitmaps that will become orphaned. A bitmap is considered orphaned if its `name` exists in the bitmaps store for this project but does not appear in any `bitmap` attribute reference within the new uidesc content. Detection algorithm: parse new uidesc, extract all bitmap references from view attributes, compare against stored bitmap names, report any stored names not found in references.

#### File Replacement

- **FR-034**: System MUST support replacing the uidesc content of an existing project with a new file from filesystem.

- **FR-035**: File replacement MUST preserve all existing project settings and non-orphaned bitmaps.

#### Startup Flow

- **FR-036**: System MUST display the existing drag-to-start flow for new users.

- **FR-037**: System MUST add an "Open Project" button to the start screen alongside existing options.

- **FR-038**: System MUST support both file import and project opening from the same start screen.

#### Error Handling

- **FR-039**: System MUST detect IndexedDB unavailability and display a warning about session-only mode. In session-only mode, full editing functionality works in memory but nothing persists after tab close.

- **FR-040**: System MUST handle storage quota exceeded with clear error messages and recovery options.

- **FR-041**: System MUST validate project data on load and offer recovery for corrupted projects. Basic validation (required fields, parseable uidesc) MUST occur in the open project flow (US2); full recovery UI is deferred to polish phase.

### Key Entities

- **Project**: Represents a complete editing session including uidesc content, editor state, settings, and thumbnail. Identified by UUID, named by user. Contains all data needed to restore an editing session. Has 0-to-many relationship with Bitmaps.

- **Bitmap**: Represents an image asset stored as a Blob. Linked to exactly one Project via `projectId`. Referenced by `name` which matches the uidesc bitmap reference. Stores metadata for display (dimensions, size, type).

- **EditorState**: Embedded within Project. Captures the visual state of the editor including canvas position (pan/zoom), expanded hierarchy nodes, expanded property panel groups, and active template. Allows complete restoration of user's view.

- **ProjectSettings**: Embedded within Project. Contains all configurable preferences that apply to the project including grid settings, snap settings, smart guides, custom guides, theme preference, and auto-save setting.

## Re-usable Functionality

The following existing functionality can be re-used for this feature:

### documentStore (`src/stores/documentStore.ts`)
- `loadFile()` - Current file parsing logic can be adapted; instead of storing in memory only, extend to trigger project creation
- `createNewDocument()` - Already handles empty document creation; extend to trigger project creation flow
- `markDirty()` / `markClean()` - Already tracks document dirty state; integrate with auto-save trigger
- The document structure (`VSTGUIUIDescription`) is already defined and can be serialized to IndexedDB

### canvasStore (`src/stores/canvasStore.ts`)
- `panOffset` and `zoomLevel` signals can be serialized to EditorState
- `fitToView()` and zoom/pan functions can restore state from EditorState

### hierarchyStore (`src/stores/hierarchyStore.ts`)
- `expandedIds` signal can be serialized to EditorState.expandedHierarchyNodes
- `expandAll()` can restore state from EditorState

### propertiesStore (`src/stores/propertiesStore.ts`)
- `expandedGroups` signal can be serialized to EditorState.expandedPropertyGroups

### templateStore (`src/stores/templateStore.ts`)
- `activeTemplateId` can be serialized to EditorState.selectedTemplateId
- `setActiveTemplate()` can restore state from EditorState

### preferencesStore / preferences domain (`src/stores/preferencesStore.ts`, `src/domain/preferences/`)
- `UserPreferences` structure can be adapted for ProjectSettings
- Validation schema patterns can be reused for project settings validation
- The preferences types provide a model for settings structure

### UploadZone (`src/components/UploadZone/UploadZone.tsx`)
- Drag-and-drop handling can be extended to trigger project creation flow
- File input handling already parses uidesc files
- Can add "Open Project" button alongside existing buttons

### Export functionality (current save button)
- Serialize functions for JSON/XML export can be reused for Export feature
- Current file download logic becomes the Export implementation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can close the browser and reopen to find all their projects intact with 100% data integrity (uidesc content, editor state, settings, bitmaps).

- **SC-002**: Project load time is under 500ms for projects with up to 50 bitmaps and 10MB total size. Load time is measured from `projectStore.openProject()` call to when all editor state is restored and the canvas is ready for interaction (document parsed, stores hydrated, first render complete).

- **SC-003**: Auto-save completes within 200ms for typical document changes, not blocking user interactions.

- **SC-004**: Users can successfully import, edit, close, and reopen a project within 5 minutes on first use (intuitive workflow).

- **SC-005**: Project list displays thumbnail previews that accurately represent the project content.

- **SC-006**: Storage warnings appear before users hit quota limits, giving them time to manage storage.

- **SC-007**: Export produces valid uidesc files that can be loaded by VSTGUI runtime without errors.

- **SC-008**: ZIP export includes all referenced bitmaps with correct relative paths.

---

## Assumptions

The following assumptions were made based on reasonable defaults and standard practices:

1. **IndexedDB Database Name**: Will use `vstgui-edit-projects` as the database name with version 1 for initial schema.

2. **UUID Generation**: Will use `crypto.randomUUID()` for project and bitmap IDs (widely supported in modern browsers).

3. **Thumbnail Size**: Project thumbnails will be 200x150 pixels, generated as PNG data URLs for consistency.

4. **Auto-save Debounce**: 2 seconds is chosen as a balance between responsiveness and avoiding excessive writes.

5. **Storage Warning Threshold**: 80% of estimated quota triggers warnings; this leaves buffer for additional saves.

6. **Bitmap Size Limit**: Individual bitmaps are limited to 10MB to prevent single-file quota issues.

7. **Project Name Validation**: Names allow alphanumeric characters, spaces, hyphens, underscores; 1-100 characters. Duplicate names are allowed since projects are uniquely identified by UUID.

8. **Concurrent Access**: Last-write-wins strategy for multiple tabs; no locking mechanism in initial implementation.

9. **ZIP Library**: Will use a lightweight ZIP library (e.g., JSZip or fflate) for export functionality.

10. **Thumbnail Generation**: Will render the first template to an off-screen canvas for thumbnail generation.

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status     | Evidence                            |
|-------------|------------|-------------------------------------|
| FR-001      | PENDING    | [Test or file that verifies this]   |
| FR-002      | PENDING    | [Test or file that verifies this]   |
| FR-003      | PENDING    | [Test or file that verifies this]   |
| FR-004      | PENDING    | [Test or file that verifies this]   |
| FR-005      | PENDING    | [Test or file that verifies this]   |
| FR-006      | PENDING    | [Test or file that verifies this]   |
| FR-007      | PENDING    | [Test or file that verifies this]   |
| FR-008      | PENDING    | [Test or file that verifies this]   |
| FR-009      | PENDING    | [Test or file that verifies this]   |
| FR-010      | PENDING    | [Test or file that verifies this]   |
| FR-011      | PENDING    | [Test or file that verifies this]   |
| FR-012      | PENDING    | [Test or file that verifies this]   |
| FR-013      | PENDING    | [Test or file that verifies this]   |
| FR-014      | PENDING    | [Test or file that verifies this]   |
| FR-015      | PENDING    | [Test or file that verifies this]   |
| FR-016      | PENDING    | [Test or file that verifies this]   |
| FR-017      | PENDING    | [Test or file that verifies this]   |
| FR-018      | PENDING    | [Test or file that verifies this]   |
| FR-019      | PENDING    | [Test or file that verifies this]   |
| FR-020      | PENDING    | [Test or file that verifies this]   |
| FR-021      | PENDING    | [Test or file that verifies this]   |
| FR-022      | PENDING    | [Test or file that verifies this]   |
| FR-023      | PENDING    | [Test or file that verifies this]   |
| FR-024      | PENDING    | [Test or file that verifies this]   |
| FR-025      | PENDING    | [Test or file that verifies this]   |
| FR-026      | PENDING    | [Test or file that verifies this]   |
| FR-027      | PENDING    | [Test or file that verifies this]   |
| FR-028      | PENDING    | [Test or file that verifies this]   |
| FR-029      | PENDING    | [Test or file that verifies this]   |
| FR-030      | PENDING    | [Test or file that verifies this]   |
| FR-031      | PENDING    | [Test or file that verifies this]   |
| FR-032      | PENDING    | [Test or file that verifies this]   |
| FR-033      | PENDING    | [Test or file that verifies this]   |
| FR-034      | PENDING    | [Test or file that verifies this]   |
| FR-035      | PENDING    | [Test or file that verifies this]   |
| FR-036      | PENDING    | [Test or file that verifies this]   |
| FR-037      | PENDING    | [Test or file that verifies this]   |
| FR-038      | PENDING    | [Test or file that verifies this]   |
| FR-039      | PENDING    | [Test or file that verifies this]   |
| FR-040      | PENDING    | [Test or file that verifies this]   |
| FR-041      | PENDING    | [Test or file that verifies this]   |
| SC-001      | PENDING    | [Measurement or test result]        |
| SC-002      | PENDING    | [Measurement or test result]        |
| SC-003      | PENDING    | [Measurement or test result]        |
| SC-004      | PENDING    | [Measurement or test result]        |
| SC-005      | PENDING    | [Measurement or test result]        |
| SC-006      | PENDING    | [Measurement or test result]        |
| SC-007      | PENDING    | [Measurement or test result]        |
| SC-008      | PENDING    | [Measurement or test result]        |

**CRITICAL**: Any NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [ ] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with MET status
- [ ] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [ ] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [ ] **Quality Gate - CSS**: Run `npm run lint:css` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Code**: Run `npm run check` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Types**: Run `npm run typecheck` - MUST pass with zero errors/warnings
- [ ] **Git Status Check**: Run `git status` to verify all changes are committed
- [ ] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [ ] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [ ] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**CRITICAL**: The feature is NOT complete until:
1. All quality gates pass (lint:css, check, typecheck) with zero errors/warnings
2. All work is committed to the feature branch
3. The compliance table shows all requirements MET
