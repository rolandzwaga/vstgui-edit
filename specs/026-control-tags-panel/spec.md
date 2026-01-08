# Feature Specification: Control Tags Panel

**Feature Branch**: `026-control-tags-panel`  
**Created**: 2026-01-08  
**Status**: Draft  
**Input**: User description: "Add a Control Tags Panel to manage control-tag resources, following the pattern established by Colors, Fonts, Bitmaps, and Gradients panels. Control tags have a name and numeric tag ID. Users should be able to view, add, edit, and delete control tags with usage tracking."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Control Tag Resources (Priority: P1)

As a plugin developer, I want to see all defined control tags in a dedicated sidebar panel so that I can understand what tags are available and their assigned IDs in the current uidesc document.

**Why this priority**: Users must see existing control tags before they can add, edit, or delete them. This is the foundational capability for managing parameter mappings.

**Independent Test**: Load a uidesc file with control-tag definitions and verify all tags appear in the panel with their names and numeric IDs.

**Acceptance Scenarios**:

1. **Given** a uidesc file with 5 control-tag definitions, **When** the file is loaded, **Then** all 5 tags appear in the Control Tags Panel with name and numeric ID
2. **Given** a uidesc file with no control-tags defined, **When** the file is loaded, **Then** an empty state message is displayed with instructions to add a control tag
3. **Given** a control tag named "Volume" with ID "0", **When** displayed in the panel, **Then** both the name "Volume" and ID "0" are clearly visible

---

### User Story 2 - Add New Control Tag (Priority: P2)

As a plugin developer, I want to add new control tags so that I can map UI controls to plugin parameters.

**Why this priority**: After viewing, adding is the next most important capability to build the control tag library needed for plugin development.

**Independent Test**: Click the Add button, verify a new control tag is created with a unique name and auto-assigned tag ID.

**Acceptance Scenarios**:

1. **Given** the Control Tags Panel is visible, **When** I click the Add button, **Then** a new control tag is created with a unique auto-generated name ("New Tag", "New Tag 2", etc.)
2. **Given** existing tags with IDs 0, 1, 3, **When** I add a new tag, **Then** it is auto-assigned the next available ID (2 in this case, filling the gap)
3. **Given** I add a control tag, **When** I press Ctrl+Z, **Then** the tag is removed (undo works)

---

### User Story 3 - Edit Control Tag (Priority: P2)

As a plugin developer, I want to edit control tag names and IDs so that I can correct mistakes or reorganize my parameter mappings.

**Why this priority**: Editing is essential for maintaining accurate parameter mappings - closely tied to adding functionality.

**Independent Test**: Double-click a control tag name to rename it; edit the tag ID to change the numeric value.

**Acceptance Scenarios**:

1. **Given** a control tag in the panel, **When** I double-click the name, **Then** an inline text editor appears for renaming
2. **Given** I rename a tag to an existing name, **When** I try to save, **Then** a validation error is shown and the change is rejected
3. **Given** a control tag in the panel, **When** I click on the ID field, **Then** I can edit the numeric ID value
4. **Given** I change a tag ID to an ID already used by another tag, **When** I try to save, **Then** a validation error is shown and the change is rejected
5. **Given** I enter a non-numeric ID value, **When** I try to save, **Then** a validation error is shown requiring a valid integer
6. **Given** I modify a control tag, **When** I press Ctrl+Z, **Then** the change is undone

---

### User Story 4 - Delete Control Tag (Priority: P3)

As a plugin developer, I want to delete unused control tags so that I can keep my parameter mappings clean.

**Why this priority**: Deletion is less frequent than viewing/editing but still essential for resource management.

**Independent Test**: Delete an unused control tag immediately; delete a used control tag after confirming the warning dialog.

**Acceptance Scenarios**:

1. **Given** a control tag not used by any view, **When** I click the delete button, **Then** the tag is immediately removed
2. **Given** a control tag used by 2 views, **When** I click the delete button, **Then** a confirmation dialog shows the usage count
3. **Given** I confirm deletion of a used control tag, **When** the deletion completes, **Then** the control-tag attribute is cleared from all referencing views
4. **Given** I delete a control tag, **When** I press Ctrl+Z, **Then** the tag and all its references are restored

---

### User Story 5 - View Control Tag Usage (Priority: P3)

As a plugin developer, I want to see which views use a particular control tag so that I can understand the impact of changes.

**Why this priority**: Usage tracking helps prevent accidental breakage but is not needed for basic tag management.

**Independent Test**: Click the usage badge on a control tag to see a popover listing all views that reference it.

**Acceptance Scenarios**:

1. **Given** a control tag used by 3 views, **When** it appears in the list, **Then** a badge shows "3"
2. **Given** a control tag with a usage badge, **When** I click the badge, **Then** a popover shows the list of referencing views with their class names
3. **Given** an unused control tag, **When** it appears in the list, **Then** no usage badge is visible

---

### Edge Cases

- **Duplicate tag IDs**: When a user attempts to assign an ID already used by another tag, validation prevents the change. Each tag ID must be unique.
- **Negative tag IDs**: Negative integers are allowed as valid tag IDs (some plugin frameworks use negative values for special purposes).
- **Large tag IDs**: Tag IDs can be any valid integer. No upper limit is enforced by the editor.
- **Non-integer IDs**: Only integer values are accepted. Floating point or non-numeric values are rejected with validation error.
- **Empty tag name**: Tag names cannot be empty. Validation prevents saving an empty name.
- **Referenced tag deletion**: When deleting a tag used by views, a confirmation dialog shows affected views. Upon confirmation, the `control-tag` attribute is cleared from all referencing controls.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a "Control Tags" section in the left sidebar with a collapsible header
- **FR-002**: System MUST display all control-tag definitions from the loaded uidesc document as a scrollable list
- **FR-003**: Each control tag item MUST show the tag name and numeric ID
- **FR-004**: System MUST show an empty state message when no control tags are defined
- **FR-005**: Users MUST be able to add new control tags via an Add button in the section header
- **FR-006**: New control tags MUST be created with a unique auto-generated name ("New Tag", "New Tag 2", etc.)
- **FR-007**: New control tags MUST be auto-assigned the lowest available non-negative integer ID
- **FR-008**: Users MUST be able to rename control tags by double-clicking the name
- **FR-009**: System MUST validate that control tag names are unique and non-empty
- **FR-010**: Users MUST be able to edit the tag ID by clicking on the ID field
- **FR-011**: System MUST validate that tag IDs are unique integers
- **FR-012**: Users MUST be able to delete control tags via a delete button that appears on hover
- **FR-013**: System MUST show a confirmation dialog when deleting a control tag that is referenced by views
- **FR-014**: Deletion of a used control tag MUST clear the control-tag attribute from all referencing views
- **FR-015**: System MUST show a usage count badge on control tag items that are referenced by views
- **FR-016**: Users MUST be able to click the usage badge to see a popover listing all referencing views
- **FR-017**: All add, rename, edit ID, and delete operations MUST be undoable/redoable via Ctrl+Z/Ctrl+Y

### Key Entities

- **Control Tag Definition**: A named control tag resource with a string name and integer tag ID
- **Control Tag Reference**: A view attribute (`control-tag`) that references a tag by name (e.g., `"control-tag": "Volume"`)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All control tag definitions in a loaded uidesc file are visible in the Control Tags Panel within 1 second of file load
- **SC-002**: Users can add, rename, edit ID, and delete a control tag in under 5 seconds each
- **SC-003**: All control tag operations can be undone and redone without data loss
- **SC-004**: Usage tracking accurately identifies all views referencing each control tag

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | ⬜ PENDING | [Test or file that verifies this] |
| FR-002 | ⬜ PENDING | [Test or file that verifies this] |
| FR-003 | ⬜ PENDING | [Test or file that verifies this] |
| FR-004 | ⬜ PENDING | [Test or file that verifies this] |
| FR-005 | ⬜ PENDING | [Test or file that verifies this] |
| FR-006 | ⬜ PENDING | [Test or file that verifies this] |
| FR-007 | ⬜ PENDING | [Test or file that verifies this] |
| FR-008 | ⬜ PENDING | [Test or file that verifies this] |
| FR-009 | ⬜ PENDING | [Test or file that verifies this] |
| FR-010 | ⬜ PENDING | [Test or file that verifies this] |
| FR-011 | ⬜ PENDING | [Test or file that verifies this] |
| FR-012 | ⬜ PENDING | [Test or file that verifies this] |
| FR-013 | ⬜ PENDING | [Test or file that verifies this] |
| FR-014 | ⬜ PENDING | [Test or file that verifies this] |
| FR-015 | ⬜ PENDING | [Test or file that verifies this] |
| FR-016 | ⬜ PENDING | [Test or file that verifies this] |
| FR-017 | ⬜ PENDING | [Test or file that verifies this] |
| SC-001 | ⬜ PENDING | [Measurement or test result] |
| SC-002 | ⬜ PENDING | [Measurement or test result] |
| SC-003 | ⬜ PENDING | [Measurement or test result] |
| SC-004 | ⬜ PENDING | [Measurement or test result] |

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
