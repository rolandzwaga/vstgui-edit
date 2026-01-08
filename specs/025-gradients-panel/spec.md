# Feature Specification: Gradients Panel

**Feature Branch**: `025-gradients-panel`  
**Created**: 2026-01-08  
**Status**: Draft  
**Input**: User description: "Add a Gradients Panel to manage gradient resources, following the pattern established by Colors, Fonts, and Bitmaps panels"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Gradient Resources (Priority: P1)

As a UI designer, I want to see all defined gradients in a dedicated sidebar panel so that I can understand what gradients are available in the current uidesc document.

**Why this priority**: Users must see existing gradients before they can add, edit, or delete them. This is the foundational capability.

**Independent Test**: Load a uidesc file with gradient definitions and verify all gradients appear in the panel with their names and visual previews.

**Acceptance Scenarios**:

1. **Given** a uidesc file with 5 gradient definitions, **When** the file is loaded, **Then** all 5 gradients appear in the Gradients Panel with name and color preview
2. **Given** a uidesc file with no gradients defined, **When** the file is loaded, **Then** an empty state message is displayed with instructions to add a gradient
3. **Given** a gradient with 3 color stops, **When** displayed in the panel, **Then** the preview shows a smooth linear gradient from left to right with all stops visible

---

### User Story 2 - Add New Gradient (Priority: P2)

As a UI designer, I want to add new gradients so that I can create custom gradient resources for my UI elements.

**Why this priority**: After viewing, adding is the next most important capability to build a gradient library.

**Independent Test**: Click the Add button, verify a new gradient is created with a unique name and default 2-stop gradient (black to white).

**Acceptance Scenarios**:

1. **Given** the Gradients Panel is visible, **When** I click the Add button, **Then** a new gradient is created with a unique auto-generated name ("New Gradient", "New Gradient 2", etc.)
2. **Given** a new gradient is added, **When** it appears in the list, **Then** it has a default 2-stop gradient (start: black at 0.0, end: white at 1.0)
3. **Given** I add a gradient, **When** I press Ctrl+Z, **Then** the gradient is removed (undo works)

---

### User Story 3 - Edit Gradient Name and Stops (Priority: P2)

As a UI designer, I want to edit gradient names and color stops so that I can customize gradients for my design needs.

**Why this priority**: Editing is essential for making gradients useful - closely tied to adding functionality.

**Independent Test**: Double-click a gradient name to rename it; expand a gradient and modify color stops via the visual editor.

**Acceptance Scenarios**:

1. **Given** a gradient in the panel, **When** I double-click the name, **Then** an inline text editor appears for renaming
2. **Given** I rename a gradient to an existing name, **When** I try to save, **Then** a validation error is shown and the change is rejected
3. **Given** I click a gradient item, **When** it expands, **Then** I see a visual gradient bar with draggable color stops
4. **Given** a gradient is expanded, **When** I drag a color stop, **Then** its position updates in real-time and the preview reflects the change
5. **Given** a gradient is expanded, **When** I click on a color stop, **Then** I can change its color via a color picker
6. **Given** I modify a gradient, **When** I press Ctrl+Z, **Then** the change is undone

---

### User Story 4 - Add and Remove Color Stops (Priority: P2)

As a UI designer, I want to add and remove color stops from a gradient so that I can create complex multi-stop gradients.

**Why this priority**: Multi-stop gradients are a key differentiator from simple two-color gradients.

**Independent Test**: Click on the gradient bar to add a new stop; drag a stop off the bar or use delete button to remove it.

**Acceptance Scenarios**:

1. **Given** a gradient is expanded, **When** I click on an empty area of the gradient bar, **Then** a new color stop is added at that position with an interpolated color
2. **Given** a gradient with 4 stops, **When** I drag a stop downward off the gradient bar, **Then** the stop is removed (if more than 2 stops remain)
3. **Given** a gradient with only 2 stops, **When** I try to remove a stop, **Then** the removal is prevented (minimum 2 stops required)
4. **Given** a gradient with 10 stops, **When** I try to add another stop, **Then** the addition is allowed (no maximum limit)

---

### User Story 5 - Delete Gradient (Priority: P3)

As a UI designer, I want to delete unused gradients so that I can keep my resource library clean.

**Why this priority**: Deletion is less frequent than viewing/editing but still essential for resource management.

**Independent Test**: Delete an unused gradient immediately; delete a used gradient after confirming the warning dialog.

**Acceptance Scenarios**:

1. **Given** a gradient not used by any view, **When** I click the delete button, **Then** the gradient is immediately removed
2. **Given** a gradient used by 2 views, **When** I click the delete button, **Then** a confirmation dialog shows the usage count
3. **Given** I confirm deletion of a used gradient, **When** the deletion completes, **Then** the gradient attribute is cleared from all referencing views
4. **Given** I delete a gradient, **When** I press Ctrl+Z, **Then** the gradient and all its references are restored

---

### User Story 6 - View Gradient Usage (Priority: P3)

As a UI designer, I want to see which views use a particular gradient so that I can understand the impact of changes.

**Why this priority**: Usage tracking helps prevent accidental breakage but is not needed for basic gradient management.

**Independent Test**: Click the usage badge on a gradient to see a popover listing all views that reference it.

**Acceptance Scenarios**:

1. **Given** a gradient used by 3 views, **When** it appears in the list, **Then** a badge shows "3" 
2. **Given** a gradient with a usage badge, **When** I click the badge, **Then** a popover shows the list of referencing views with their class names
3. **Given** an unused gradient, **When** it appears in the list, **Then** no usage badge is visible

---

### Edge Cases

- **Identical stop positions**: When multiple stops have the same position value, they are displayed in array order (first in array = leftmost handle). Users can drag handles to reorder. No automatic repositioning is performed.
- **RGBA colors with alpha**: Display with transparency using CSS rgba(). Alpha channel is preserved during editing. Color picker supports alpha input.
- **Malformed gradient data**: A gradient is considered malformed if:
  - Missing required `rgba` or `start` field on any stop
  - `start` value is not a valid number between 0.0 and 1.0
  - `rgba` value is not a valid hex color format (#RRGGBB or #RRGGBBAA)
  - Array has fewer than 2 stops
  - Malformed gradients display with a warning icon and placeholder preview (gray diagonal stripes). Editing is disabled until data is corrected manually in the source file.
- **Single stop gradients**: Treated as malformed (see above). Minimum 2 stops required per VSTGUI schema.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a "Gradients" section in the left sidebar with a collapsible header
- **FR-002**: System MUST display all gradient definitions from the loaded uidesc document as a scrollable list
- **FR-003**: Each gradient item MUST show the gradient name and a horizontal linear preview bar
- **FR-004**: System MUST show an empty state message when no gradients are defined
- **FR-005**: Users MUST be able to add new gradients via an Add button in the section header
- **FR-006**: New gradients MUST be created with a unique auto-generated name ("New Gradient", "New Gradient 2", etc.)
- **FR-007**: New gradients MUST be created with a default 2-stop gradient (black at 0.0, white at 1.0)
- **FR-008**: Users MUST be able to rename gradients by double-clicking the name
- **FR-009**: System MUST validate that gradient names are unique and non-empty
- **FR-010**: Users MUST be able to click a gradient item to expand and see the color stop editor
- **FR-011**: The color stop editor MUST display a visual gradient bar with draggable stop handles
- **FR-012**: Users MUST be able to drag color stops to change their position (0.0 to 1.0)
- **FR-013**: Users MUST be able to click a color stop to edit its color via a color picker input
- **FR-014**: Users MUST be able to add color stops by clicking on empty areas of the gradient bar
- **FR-015**: Users MUST be able to remove color stops by dragging them downward off the gradient bar (drag-off gesture). No per-stop delete button is required.
- **FR-016**: System MUST enforce a minimum of 2 color stops per gradient
- **FR-017**: Users MUST be able to delete gradients via a delete button that appears on hover
- **FR-018**: System MUST show a confirmation dialog when deleting a gradient that is referenced by views
- **FR-019**: Deletion of a used gradient MUST clear the gradient attribute from all referencing views
- **FR-020**: System MUST show a usage count badge on gradient items that are referenced by views
- **FR-021**: Users MUST be able to click the usage badge to see a popover listing all referencing views
- **FR-022**: All add, rename, edit stop, and delete operations MUST be undoable/redoable via Ctrl+Z/Ctrl+Y
- **FR-023**: Color stop position values MUST be normalized to 2 decimal places (0.00 to 1.00)

### Key Entities

- **Gradient Definition**: A named gradient resource consisting of an array of 2 or more color stops
- **Gradient Color Stop**: A stop with position (0.0-1.0) and rgba color value
- **Gradient Reference**: A view attribute that references a gradient by name (e.g., `"gradient": "myGradient"`)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All gradient definitions in a loaded uidesc file are visible in the Gradients Panel within 1 second of file load
- **SC-002**: Users can add, rename, and delete a gradient in under 5 seconds each
- **SC-003**: Users can add, move, and remove color stops with immediate visual feedback (<100ms)
- **SC-004**: All gradient operations can be undone and redone without data loss
- **SC-005**: Usage tracking accurately identifies all views referencing each gradient

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
| FR-018 | ⬜ PENDING | [Test or file that verifies this] |
| FR-019 | ⬜ PENDING | [Test or file that verifies this] |
| FR-020 | ⬜ PENDING | [Test or file that verifies this] |
| FR-021 | ⬜ PENDING | [Test or file that verifies this] |
| FR-022 | ⬜ PENDING | [Test or file that verifies this] |
| FR-023 | ⬜ PENDING | [Test or file that verifies this] |
| SC-001 | ⬜ PENDING | [Measurement or test result] |
| SC-002 | ⬜ PENDING | [Measurement or test result] |
| SC-003 | ⬜ PENDING | [Measurement or test result] |
| SC-004 | ⬜ PENDING | [Measurement or test result] |
| SC-005 | ⬜ PENDING | [Measurement or test result] |

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
