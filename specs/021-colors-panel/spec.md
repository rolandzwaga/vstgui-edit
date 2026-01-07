# Feature Specification: Colors Panel

**Feature Branch**: `021-colors-panel`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: Phase 6 Resource Management - Colors panel for viewing, adding, editing, and deleting color definitions in uidesc files

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Colors List (Priority: P1)

As a UI designer, I want to see all defined colors in my uidesc file displayed in a dedicated panel, so that I can quickly review and understand the color palette used in my project.

**Why this priority**: This is the foundational feature - users must be able to see colors before they can manage them. Without this, no other color operations are possible.

**Independent Test**: Can be fully tested by loading a uidesc file with colors and verifying all colors appear in the panel with correct names, hex values, and preview swatches.

**Acceptance Scenarios**:

1. **Given** a uidesc file with colors defined, **When** the file is loaded, **Then** all colors appear in the Colors panel with name, hex value, and color swatch preview
2. **Given** a uidesc file with no colors defined, **When** the file is loaded, **Then** the Colors panel shows an empty state with guidance to add colors
3. **Given** a color with alpha channel (#RRGGBBAA), **When** viewing the swatch, **Then** the swatch displays the color with transparency (checkerboard pattern visible through transparent areas)

---

### User Story 2 - Add New Color (Priority: P1)

As a UI designer, I want to add new colors to my project's color palette, so that I can define reusable colors for my UI elements.

**Why this priority**: Adding colors is essential for building a color palette. Without this, users cannot create new colors for their designs.

**Independent Test**: Can be tested by clicking "Add Color", entering name and hex value, and verifying the color appears in both the panel and the uidesc JSON.

**Acceptance Scenarios**:

1. **Given** the Colors panel is visible, **When** user clicks "Add Color" button, **Then** a new color entry appears with editable name and hex value fields
2. **Given** user enters a valid color name and hex value, **When** user confirms (Enter or blur), **Then** the color is added to the uidesc colors object
3. **Given** user enters a duplicate color name, **When** user tries to confirm, **Then** validation error is shown and the color is not added
4. **Given** user enters an invalid hex value (e.g., "xyz"), **When** user tries to confirm, **Then** validation error is shown with guidance on valid formats

---

### User Story 3 - Edit Existing Color (Priority: P1)

As a UI designer, I want to modify existing colors, so that I can refine my color palette without recreating colors.

**Why this priority**: Editing is a core CRUD operation needed for any resource management. Users frequently need to tweak colors during design iteration.

**Independent Test**: Can be tested by clicking on a color, changing its value, and verifying the change persists in the uidesc JSON and updates the swatch preview live.

**Acceptance Scenarios**:

1. **Given** a color exists in the panel, **When** user double-clicks on the color name, **Then** the name becomes editable inline
2. **Given** a color exists in the panel, **When** user double-clicks on the hex value, **Then** the hex value becomes editable inline with live swatch preview
3. **Given** user edits a color name to a duplicate, **When** user tries to confirm, **Then** validation error is shown and name reverts
4. **Given** user is editing a color, **When** user presses Escape, **Then** edits are cancelled and original values restored

---

### User Story 4 - Delete Color (Priority: P2)

As a UI designer, I want to delete colors I no longer need, so that I can keep my color palette clean and organized.

**Why this priority**: While important, deletion is less frequent than viewing/adding/editing. Users typically build up colors before pruning.

**Independent Test**: Can be tested by selecting a color, clicking delete, and verifying the color is removed from both the panel and the uidesc JSON.

**Acceptance Scenarios**:

1. **Given** a color exists that is not used by any view, **When** user clicks delete, **Then** the color is removed immediately
2. **Given** a color is used by one or more views, **When** user clicks delete, **Then** a confirmation dialog shows which views use the color
3. **Given** the confirmation dialog is shown, **When** user confirms deletion, **Then** the color is removed (views retain the color name reference but it becomes "orphaned")
4. **Given** the confirmation dialog is shown, **When** user cancels, **Then** the color is not deleted

---

### User Story 5 - View Color Usage (Priority: P2)

As a UI designer, I want to see which views use a specific color, so that I can understand the impact of changing or deleting a color.

**Why this priority**: Usage tracking helps users make informed decisions about color changes. Not critical for basic functionality but valuable for larger projects.

**Independent Test**: Can be tested by clicking on a color's usage indicator and verifying all views that reference that color are listed.

**Acceptance Scenarios**:

1. **Given** a color is used by views, **When** user hovers over the color entry, **Then** a usage count badge is displayed
2. **Given** a color is used by views, **When** user clicks the usage badge, **Then** a popover shows the list of view names/types using this color
3. **Given** a color is not used by any view, **When** viewing the color entry, **Then** no usage badge is shown (or shows "0 uses")

---

### User Story 6 - Undo/Redo Color Operations (Priority: P2)

As a UI designer, I want to undo and redo color changes, so that I can experiment freely without fear of losing my work.

**Why this priority**: Undo/redo is expected in any editor but builds on existing undo infrastructure. Not blocking for MVP.

**Independent Test**: Can be tested by adding/editing/deleting a color, pressing Ctrl+Z to undo, and verifying the color state reverts.

**Acceptance Scenarios**:

1. **Given** user adds a color, **When** user presses Ctrl+Z, **Then** the color is removed (undo add)
2. **Given** user edits a color, **When** user presses Ctrl+Z, **Then** the color reverts to its previous value (undo edit)
3. **Given** user deletes a color, **When** user presses Ctrl+Z, **Then** the color reappears (undo delete)
4. **Given** user has undone an operation, **When** user presses Ctrl+Shift+Z, **Then** the operation is redone

---

### Edge Cases

- **Invalid hex format**: User enters "red" instead of "#ff0000" - show validation error with supported formats
- **Missing hash prefix**: User enters "ff0000" instead of "#ff0000" - auto-correct by prepending "#" or show helpful error
- **3-char shorthand**: User enters "#f00" - accept and expand internally to "#ff0000" or store as-is (VSTGUI supports this)
- **Alpha channel handling**: User enters "#ff000080" (50% transparent red) - display swatch with transparency
- **Empty color name**: User tries to save color without a name - show validation error
- **Special characters in name**: User enters "Background Color" with space - allow (VSTGUI supports this)
- **Very long color names**: User enters extremely long name - no storage limit, truncate display at ~30 characters with full name in tooltip
- **Case sensitivity**: Color **names** are case-sensitive ("Background" ≠ "background"). Color **hex values** are case-insensitive ("#FF0000" = "#ff0000") - normalize to lowercase on save
- **Predefined colors**: Handle `~ BlackCColor` format - display with read-only indicator (lock icon or muted styling), prevent editing/deletion. Show predefined colors in a separate section or with distinct visual treatment

## Requirements *(mandatory)*

### Functional Requirements

#### Display & Panel

- **FR-001**: System MUST display a "Colors" panel/section in the sidebar resource area
- **FR-002**: System MUST list all colors from the uidesc `colors` object with name and hex value
- **FR-003**: System MUST display a color swatch preview next to each color entry
- **FR-004**: System MUST support displaying colors with alpha channel (show transparency in swatch)

#### Add Color

- **FR-005**: System MUST provide an "Add Color" button/action to create new colors
- **FR-006**: System MUST validate that color names are unique (case-sensitive)
- **FR-007**: System MUST validate hex color format (#RGB, #RRGGBB, or #RRGGBBAA)
- **FR-008**: System MUST add new colors to the uidesc JSON structure immediately upon valid input

#### Edit Color

- **FR-009**: System MUST allow inline editing of color names
- **FR-010**: System MUST allow inline editing of color hex values
- **FR-011**: System MUST update the color swatch preview live while editing hex value
- **FR-012**: System MUST validate edits before applying (unique name, valid hex format)

#### Delete Color

- **FR-013**: System MUST allow deletion of colors via context menu or delete button
- **FR-014**: System MUST show usage warning before deleting a color that is referenced by views
- **FR-015**: System MUST allow force-deletion even if color is in use (with confirmation)

#### Usage Tracking

- **FR-016**: System MUST track which views reference each color by scanning view attributes
- **FR-017**: System MUST display usage count for each color in the panel
- **FR-018**: System MUST show list of referencing views on demand (click/hover)

#### Undo/Redo

- **FR-019**: System MUST integrate color add/edit/delete operations with existing undo/redo system
- **FR-020**: System MUST support undo/redo for: add color, edit name, edit value, delete color

#### Format Support

- **FR-021**: System MUST support #RGB shorthand format (expand to #RRGGBB internally if needed)
- **FR-022**: System MUST support #RRGGBB format (standard 6-digit hex)
- **FR-023**: System MUST support #RRGGBBAA format (8-digit hex with alpha)
- **FR-024**: System MUST preserve the original format used in the uidesc file when possible
- **FR-025**: System MUST display predefined colors (~ prefix) with read-only indicator and prevent modification

### Key Entities

- **Color**: A named color definition with properties: name (string, unique), value (hex string #RGB/#RRGGBB/#RRGGBBAA)
- **Color Reference**: An attribute on a view that references a color by name (e.g., `font-color`, `back-color`, `frame-color`)
- **Colors Object**: The `colors` section in the uidesc JSON containing all color definitions

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All colors from a loaded uidesc file are displayed in the Colors panel within 100ms of file load
- **SC-002**: Adding a new color updates both the UI and the uidesc JSON atomically (no partial states)
- **SC-003**: Color swatch preview updates within 50ms while typing a hex value (live feedback)
- **SC-004**: Usage tracking correctly identifies all views referencing a color (100% accuracy)
- **SC-005**: All color operations (add/edit/delete) are undoable/redoable using existing keyboard shortcuts
- **SC-006**: Invalid hex values are rejected with clear error messages specifying valid formats

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
| FR-018 | ⬜ PENDING | [Test or file that verifies this] |
| FR-019 | ⬜ PENDING | [Test or file that verifies this] |
| FR-020 | ⬜ PENDING | [Test or file that verifies this] |
| FR-021 | ⬜ PENDING | [Test or file that verifies this] |
| FR-022 | ⬜ PENDING | [Test or file that verifies this] |
| FR-023 | ⬜ PENDING | [Test or file that verifies this] |
| FR-024 | ⬜ PENDING | [Test or file that verifies this] |
| FR-025 | ⬜ PENDING | [Test or file that verifies this] |
| SC-001 | ⬜ PENDING | [Measurement or test result] |
| SC-002 | ⬜ PENDING | [Measurement or test result] |
| SC-003 | ⬜ PENDING | [Measurement or test result] |
| SC-004 | ⬜ PENDING | [Measurement or test result] |
| SC-005 | ⬜ PENDING | [Measurement or test result] |
| SC-006 | ⬜ PENDING | [Measurement or test result] |

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
