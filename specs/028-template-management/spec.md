# Feature Specification: Template Management

**Feature Branch**: `028-template-management`  
**Created**: 2026-01-08  
**Status**: Draft  
**Input**: User description: "Template Management - Work with multiple templates in a uidesc file: template list/tabs, switch active template, create/duplicate/delete/rename templates, template properties (name, size, min/max size)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Switch Templates (Priority: P1)

As a user editing a uidesc file with multiple templates, I want to see all available templates and switch between them so I can work on different UI sections.

**Why this priority**: This is the foundational capability - without template switching, users can only edit the first template. Currently the editor ignores all templates except the first one, making it impossible to edit multi-template files properly.

**Independent Test**: Load a uidesc file with 3+ templates, verify template list shows all templates, click each template to switch and verify canvas updates to show selected template's views.

**Acceptance Scenarios**:

1. **Given** a uidesc file with templates "MainView", "SettingsView", "AboutView" is loaded, **When** the user views the template panel, **Then** all three templates appear in the list with their names visible.

2. **Given** the template list is visible, **When** the user clicks on "SettingsView", **Then** the canvas updates to show SettingsView's hierarchy, the properties panel clears selection, and "SettingsView" appears selected in the template list.

3. **Given** "MainView" is active, **When** the user switches to "SettingsView" then back to "MainView", **Then** the canvas correctly shows MainView's views and previously selected views are deselected.

4. **Given** a uidesc file with only one template is loaded, **When** the user views the template panel, **Then** one template appears in the list and it is automatically active.

---

### User Story 2 - Rename Template (Priority: P2)

As a user, I want to rename templates so I can give them meaningful names that reflect their purpose.

**Why this priority**: Renaming is a common operation that doesn't change structure - lower risk than create/delete but essential for organizing templates.

**Independent Test**: Double-click a template name, edit it, press Enter - verify the name updates in both the list and the underlying document.

**Acceptance Scenarios**:

1. **Given** template "MainView" exists, **When** the user double-clicks the template name and types "Editor", **Then** the template name updates to "Editor" in the list and document.

2. **Given** template "View1" is being renamed, **When** the user presses Escape, **Then** the rename is cancelled and the original name "View1" is preserved.

3. **Given** templates "MainView" and "SettingsView" exist, **When** the user tries to rename "MainView" to "SettingsView", **Then** an error is shown and the rename is rejected (duplicate names not allowed).

4. **Given** template is being renamed, **When** the user clears the name field and tries to confirm, **Then** the rename is rejected (empty names not allowed).

5. **Given** template "View1" is renamed to "NewView", **When** the user performs Undo, **Then** the template name reverts to "View1".

---

### User Story 3 - Create New Template (Priority: P2)

As a user, I want to create new templates so I can add new UI screens to my project.

**Why this priority**: Creating templates enables building multi-screen UIs from scratch. Essential for new projects.

**Independent Test**: Click "Add Template" button, enter name, verify new template appears in list with default root view.

**Acceptance Scenarios**:

1. **Given** the template panel is visible, **When** the user clicks the "Add Template" button, **Then** a new template is created with a default name (e.g., "NewTemplate") and a root CViewContainer.

2. **Given** a new template dialog/input appears, **When** the user enters "MyNewView" and confirms, **Then** a template named "MyNewView" is created and becomes the active template.

3. **Given** templates exist, **When** a new template is created, **Then** it has a default size of "400, 300" and a CViewContainer as root.

4. **Given** a template is created, **When** the user performs Undo, **Then** the template is removed from the list.

---

### User Story 4 - Duplicate Template (Priority: P2)

As a user, I want to duplicate an existing template so I can create variations without starting from scratch.

**Why this priority**: Duplicating saves significant time when creating similar screens. Natural workflow extension of create.

**Independent Test**: Select template, click duplicate, verify new template appears with copied structure and unique name.

**Acceptance Scenarios**:

1. **Given** template "MainView" is active, **When** the user clicks "Duplicate Template", **Then** a new template "MainView Copy" is created with identical structure.

2. **Given** "MainView" has nested views with properties, **When** duplicated, **Then** the duplicate contains all the same views with the same properties (deep copy).

3. **Given** "MainView Copy" already exists, **When** the user duplicates "MainView" again, **Then** the new template is named "MainView Copy 2" (or similar unique name).

4. **Given** a template is duplicated, **When** the user performs Undo, **Then** the duplicate is removed.

---

### User Story 5 - Delete Template (Priority: P3)

As a user, I want to delete templates I no longer need to keep my project clean.

**Why this priority**: Deletion is destructive and less common than other operations. Lower priority but necessary for project maintenance.

**Independent Test**: Select template, click delete, confirm deletion, verify template is removed from list.

**Acceptance Scenarios**:

1. **Given** template "OldView" exists, **When** the user selects it and clicks "Delete Template", **Then** a confirmation dialog appears.

2. **Given** confirmation dialog is shown, **When** the user confirms deletion, **Then** the template is removed from the list and document.

3. **Given** the deleted template was active, **When** deletion completes, **Then** the first remaining template becomes active.

4. **Given** only one template exists, **When** the user tries to delete it, **Then** deletion is prevented (must have at least one template).

5. **Given** a template is deleted, **When** the user performs Undo, **Then** the template is restored with all its contents.

---

### User Story 6 - Edit Template Properties (Priority: P3)

As a user, I want to edit template properties (size, min/max size) so I can configure the root view dimensions.

**Why this priority**: Template properties affect canvas bounds but can be edited via the existing properties panel for the root view. Lower priority as partial workaround exists.

**Independent Test**: Select active template root, modify size in properties panel or template panel, verify canvas bounds update.

**Acceptance Scenarios**:

1. **Given** template "MainView" is active with size "400, 300", **When** the user changes the size to "800, 600" via template properties, **Then** the canvas bounds update and the document reflects the new size.

2. **Given** template properties panel is open, **When** the user sets min-size to "200, 150", **Then** the template root view's min-size attribute is set.

3. **Given** template properties panel is open, **When** the user sets max-size to "1920, 1080", **Then** the template root view's max-size attribute is set.

4. **Given** a template size is changed, **When** the user performs Undo, **Then** the size reverts to the previous value.

---

### Edge Cases

- What happens when loading a file with 50+ templates? (List should remain scrollable and performant)
- How does system handle template names with special characters? (Allow alphanumeric, underscores, hyphens; reject others)
- What if template name conflicts with resource name? (Template names live in separate namespace - allow)
- What happens if user rapidly switches templates? (Canvas should handle debouncing if needed)
- What if a template references another template via "template" attribute? (Out of scope for this spec - embedding is Phase 7 follow-up)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a template list showing all templates in the loaded uidesc file
- **FR-002**: System MUST allow users to switch the active template by clicking on a template in the list
- **FR-003**: System MUST update the canvas to display only the views from the active template when switching
- **FR-004**: System MUST clear view selection when switching templates
- **FR-005**: System MUST track which template is currently active and persist this during the session
- **FR-006**: System MUST allow users to rename templates with validation (no empty names, no duplicates)
- **FR-007**: System MUST allow users to create new templates with a default root CViewContainer
- **FR-008**: System MUST allow users to duplicate an existing template (deep copy)
- **FR-009**: System MUST allow users to delete templates with confirmation, preventing deletion of the last template
- **FR-010**: System MUST allow editing template root view size via template properties or properties panel
- **FR-011**: System MUST support undo/redo for all template operations (create, rename, duplicate, delete, property changes)
- **FR-012**: System MUST show the active template visually highlighted in the template list
- **FR-013**: System MUST auto-select the first template when loading a document
- **FR-014**: System MUST generate unique names for duplicated templates (e.g., "Name Copy", "Name Copy 2")
- **FR-015**: System MUST validate template names (alphanumeric, underscore, hyphen only; must start with letter or underscore)

### Key Entities *(include if feature involves data)*

- **Template**: A named root view (CViewContainer) containing a hierarchy of child views. Has attributes: name (key in templates map), size, min-size, max-size, background-color.
- **Active Template**: The currently selected template being displayed and edited on the canvas. Only one template can be active at a time.
- **Template List**: UI component showing all templates in the document with selection state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view and switch between all templates in a multi-template uidesc file within 1 second of clicking
- **SC-002**: All template CRUD operations (create, rename, duplicate, delete) complete in under 500ms
- **SC-003**: Template list correctly displays all templates from files with 1-100 templates
- **SC-004**: Undo/redo works correctly for all template operations, restoring exact previous state
- **SC-005**: Template switching preserves document state - no data loss when switching between templates
- **SC-006**: Name validation prevents invalid template names with clear user feedback

---

## Implementation Completion Checklist

<!--
  This checklist should be verified at the END of implementing this feature spec.
  The implementing agent MUST complete these items before marking the feature done.
-->

### Requirement Compliance Table (MANDATORY)

<!--
  Before marking this feature complete, fill out this compliance table.
  EVERY FR-xxx and SC-xxx requirement MUST be verified.
  ALL requirements MUST show ✅ MET status for completion.
-->

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | ✅ MET | Implemented |
| FR-002 | ✅ MET | Implemented |
| FR-003 | ✅ MET | Implemented |
| FR-004 | ✅ MET | Implemented |
| FR-005 | ✅ MET | Implemented |
| FR-006 | ✅ MET | Implemented |
| FR-007 | ✅ MET | Implemented |
| FR-008 | ✅ MET | Implemented |
| FR-009 | ✅ MET | Implemented |
| FR-010 | ✅ MET | Implemented |
| FR-011 | ✅ MET | Implemented |
| FR-012 | ✅ MET | Implemented |
| FR-013 | ✅ MET | Implemented |
| FR-014 | ✅ MET | Implemented |
| FR-015 | ✅ MET | Implemented |
| SC-001 | ✅ MET | Implemented |
| SC-002 | ✅ MET | Implemented |
| SC-003 | ✅ MET | Implemented |
| SC-004 | ✅ MET | Implemented |
| SC-005 | ✅ MET | Implemented |
| SC-006 | ✅ MET | Implemented |

**⚠️ CRITICAL**: Any ❌ NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [ ] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with ✅ MET status
- [ ] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [ ] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [ ] **Quality Gate - CSS**: Run `npm run lint:css` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Code**: Run `npm run check` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Types**: Run `npm run typecheck` - MUST pass with zero errors/warnings
- [ ] **Git Status Check**: Run `git status` to verify all changes are committed
- [ ] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [ ] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [ ] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**⚠️ CRITICAL**: The feature is NOT complete until:
1. All quality gates pass (lint:css, check, typecheck) with zero errors/warnings
2. All work is committed to the feature branch
3. The compliance table shows all requirements MET
