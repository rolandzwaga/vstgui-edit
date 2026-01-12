# Feature Specification: Create New uidesc File

**Feature Branch**: `041-create-new-uidesc`
**Created**: 2026-01-12
**Status**: Draft
**Input**: User description: "Create New uidesc File functionality - Add a Create New button to the upload zone that opens a modal dialog for configuring initial width, height, and container class, then creates a new uidesc document and navigates to the editor."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Basic uidesc Document (Priority: P1)

A plugin developer wants to start building a new audio plugin UI from scratch. They visit the VSTGUI-Edit home page and click "Create New" instead of uploading an existing file. A dialog appears where they enter the initial dimensions (e.g., 800x600) and confirm with the default CViewContainer class. The system creates a minimal uidesc document structure and navigates them to the editor with an empty canvas ready for design work.

**Why this priority**: This is the core functionality. Without the ability to create a new document with basic settings, the feature has no value. This covers the primary use case for new plugin development.

**Independent Test**: Can be fully tested by clicking "Create New", entering dimensions, and confirming. User sees an empty editor canvas with the specified template size. Delivers immediate value for starting new projects.

**Acceptance Scenarios**:

1. **Given** user is on the home page with the upload zone visible, **When** they click the "Create New" button, **Then** a modal dialog opens requesting document configuration.

2. **Given** the Create New dialog is open, **When** user enters width=800, height=600 and clicks "Create", **Then** a new uidesc document is created with a template of size "800, 600" and class CViewContainer.

3. **Given** a new document has been created, **When** the creation completes, **Then** the user is navigated to the editor view showing the template bounds on an empty canvas.

4. **Given** the Create New dialog is open, **When** user presses Enter after filling in valid dimensions, **Then** the document is created (same as clicking Create).

---

### User Story 2 - Select Container Class (Priority: P2)

An advanced plugin developer wants to use a specialized container class for their new UI, such as CScrollView for scrollable content or CRowColumnView for auto-layout. When creating a new document, they select their desired container class from a dropdown instead of using the default CViewContainer.

**Why this priority**: Different container types enable different UI patterns. This extends the basic functionality to support advanced use cases without blocking the core workflow.

**Independent Test**: Can be tested by opening Create New dialog, selecting CScrollView from dropdown, creating the document, and verifying the template uses CScrollView class.

**Acceptance Scenarios**:

1. **Given** the Create New dialog is open, **When** user clicks the container class dropdown, **Then** they see all available container classes: CViewContainer (default), CScrollView, CRowColumnView, CSplitView, CLayeredViewContainer, UIViewSwitchContainer, CShadowViewContainer.

2. **Given** user has selected CScrollView as the container class, **When** they create the document, **Then** the template root view has class="CScrollView".

3. **Given** the Create New dialog is open, **When** user does not interact with the container dropdown, **Then** CViewContainer remains selected as the default.

---

### User Story 3 - Cancel and Close Dialog (Priority: P2)

A user opens the Create New dialog by mistake, or decides they want to upload an existing file instead. They need to be able to close the dialog and return to the upload zone without creating a document.

**Why this priority**: Essential UX requirement - users must be able to back out of any action. Prevents frustration from accidental clicks.

**Independent Test**: Can be tested by opening dialog, clicking Cancel or pressing Escape, and verifying dialog closes without document creation.

**Acceptance Scenarios**:

1. **Given** the Create New dialog is open, **When** user clicks the Cancel button, **Then** the dialog closes and the upload zone remains visible.

2. **Given** the Create New dialog is open, **When** user presses the Escape key, **Then** the dialog closes without creating a document.

3. **Given** the Create New dialog is open, **When** user clicks on the backdrop (outside the dialog), **Then** the dialog closes without creating a document.

---

### User Story 4 - Input Validation Feedback (Priority: P3)

A user accidentally enters invalid dimensions (e.g., negative numbers, zero, or non-numeric values). The system shows clear error messages and prevents document creation until valid values are entered.

**Why this priority**: Validation prevents runtime errors and provides a polished UX. However, most users will enter valid dimensions on the first try, making this lower priority than core functionality.

**Independent Test**: Can be tested by entering invalid values (0, -100, "abc") and verifying appropriate error messages appear and Create button is disabled.

**Acceptance Scenarios**:

1. **Given** user enters width=0 in the Create New dialog, **When** they attempt to create, **Then** an error message appears indicating width must be greater than 0.

2. **Given** user enters height=-100 in the Create New dialog, **When** they attempt to create, **Then** an error message appears indicating height must be a positive number.

3. **Given** user clears the width field entirely, **When** they attempt to create, **Then** an error message appears indicating width is required.

4. **Given** dimension errors are displayed, **When** user corrects the values to valid numbers, **Then** the error messages clear and creation becomes possible.

---

### Edge Cases

- What happens when user enters extremely large dimensions (e.g., 50000x50000)? System accepts up to a maximum of 10000x10000 pixels with error message for values exceeding this.
- What happens when user enters decimal values (e.g., 800.5)? System rounds to nearest integer.
- What happens when dialog is open and user tries to drag a file onto the page? File drag events are ignored while dialog is open (dialog takes precedence).
- What happens if user has unsaved changes in an existing document and clicks Create New? This scenario is not applicable since Create New is only shown on the home page when no document is loaded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a "Create New" button alongside the existing upload zone on the home page when no document is loaded.
- **FR-002**: System MUST open a modal dialog when user clicks the "Create New" button.
- **FR-003**: Dialog MUST contain a numeric input field for initial width with a default value of 400.
- **FR-004**: Dialog MUST contain a numeric input field for initial height with a default value of 300.
- **FR-005**: Dialog MUST contain a dropdown for selecting the root container class with CViewContainer as the default.
- **FR-006**: Dropdown MUST include all VSTGUI container classes: CViewContainer, CScrollView, CRowColumnView, CSplitView, CLayeredViewContainer, UIViewSwitchContainer, CShadowViewContainer.
- **FR-007**: System MUST validate that width and height are positive integers between 1 and 10000 (inclusive).
- **FR-008**: System MUST display inline validation errors for invalid dimension inputs.
- **FR-009**: System MUST create a valid uidesc document structure with version "1" and a single template named "view".
- **FR-010**: Created template MUST use the user-specified container class and dimensions.
- **FR-011**: Created template MUST have origin "0, 0" and background-color "~ BlackCColor" as reasonable defaults.
- **FR-012**: System MUST transition to the editor view after document creation.
- **FR-013**: Dialog MUST be closable via Cancel button, Escape key, or clicking the backdrop overlay.
- **FR-014**: Dialog MUST trap keyboard focus while open for accessibility.
- **FR-015**: System MUST mark the new document as "not dirty" immediately after creation (no unsaved changes warning initially).

### Key Entities

- **CreateNewDialogState**: Tracks dialog visibility (isOpen), width value, height value, selected container class, and validation errors.
- **NewDocumentConfig**: Represents the user's choices: width (number), height (number), containerClass (string from allowed list).
- **uidesc Document**: The complete document structure created, containing vstgui-ui-description root with version, templates section, and the single "view" template.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new uidesc document and reach the editor in under 10 seconds (including dialog interaction time).
- **SC-002**: 100% of created documents pass VSTGUI schema validation (valid document structure).
- **SC-003**: All validation error messages are visible within 100ms of invalid input.
- **SC-004**: Dialog is fully keyboard accessible (Tab navigation, Enter to confirm, Escape to cancel).
- **SC-005**: Create New button and dialog follow existing application visual styling for consistency.

---

## Re-usable Functionality

The following existing codebase functionality can be re-used for this feature:

1. **Dialog Patterns**: `AddControlTagDialog.tsx` and `FormatChangeDialog.tsx` provide established patterns for modal dialogs including:
   - Backdrop click handling
   - Escape key handling
   - Focus management
   - CSS module styling structure
   - Component props interfaces

2. **Document Store**: `documentStore.ts` already has:
   - `addTemplate()` function that creates templates with default structure
   - `setDocumentForTest()` that shows how to set a document directly
   - Pattern for marking documents as dirty/clean

3. **Validation Patterns**: `domain/controlTags/validation.ts` shows the validation function pattern returning `{ valid: boolean; error?: string }`.

4. **Number Input**: `NumberEditor.tsx` in editors provides a pattern for numeric inputs with validation.

5. **CSS Tokens**: `styles/tokens.css` contains design tokens for consistent styling.

---

## Assumptions

- Default template name "view" is appropriate (following existing `addTemplate()` behavior which uses default values).
- Background color "~ BlackCColor" provides a visible canvas boundary (consistent with existing template defaults).
- Maximum dimensions of 10000x10000 are reasonable limits (prevents performance issues while allowing large plugin UIs).
- The "Create New" button should appear below/alongside the existing upload prompt, not replace it.
- No file handle is associated with newly created documents (user must "Save As" to save to disk).

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | PENDING | [Test or file that verifies this] |
| FR-002 | PENDING | [Test or file that verifies this] |
| FR-003 | PENDING | [Test or file that verifies this] |
| FR-004 | PENDING | [Test or file that verifies this] |
| FR-005 | PENDING | [Test or file that verifies this] |
| FR-006 | PENDING | [Test or file that verifies this] |
| FR-007 | PENDING | [Test or file that verifies this] |
| FR-008 | PENDING | [Test or file that verifies this] |
| FR-009 | PENDING | [Test or file that verifies this] |
| FR-010 | PENDING | [Test or file that verifies this] |
| FR-011 | PENDING | [Test or file that verifies this] |
| FR-012 | PENDING | [Test or file that verifies this] |
| FR-013 | PENDING | [Test or file that verifies this] |
| FR-014 | PENDING | [Test or file that verifies this] |
| FR-015 | PENDING | [Test or file that verifies this] |
| SC-001 | PENDING | [Measurement or test result] |
| SC-002 | PENDING | [Measurement or test result] |
| SC-003 | PENDING | [Measurement or test result] |
| SC-004 | PENDING | [Measurement or test result] |
| SC-005 | PENDING | [Measurement or test result] |

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
