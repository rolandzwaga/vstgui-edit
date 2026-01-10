# Feature Specification: JSON Save Format Option

**Feature Branch**: `030-json-save-format`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "The current save button only allows to save the uidesc config as XML. I also want the option to save as JSON. I want the button to be some type of dropdown where I can choose the option by clicking on a chevron, and then click the label part of the button to execute it. The rest of the file save logic should be the same as the XML version, only in this case we simply serialize a pretty printed version of the configuration to JSON and save it."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save Document in Selected Format (Priority: P1)

As a user, I want to click the main part of the Save button to save my document using the currently selected format (defaulting to the format the file was originally loaded in), so that I can quickly save without extra steps.

**Why this priority**: This is the primary interaction and maintains backward compatibility with the existing save behavior. Users should be able to save with a single click, just as before.

**Independent Test**: Can be fully tested by loading a JSON file, making changes, and clicking the Save button - the file should save in JSON format.

**Acceptance Scenarios**:

1. **Given** a document was loaded from a JSON file, **When** the user clicks the main Save button area, **Then** the document is saved as pretty-printed JSON.
2. **Given** a document was loaded from an XML file, **When** the user clicks the main Save button area, **Then** the document is saved as XML (existing behavior).
3. **Given** a new document (no original file), **When** the user clicks the main Save button area, **Then** the document is saved in the last selected format persisted from previous sessions (first-time default: JSON).

---

### User Story 2 - Select Save Format from Dropdown (Priority: P1)

As a user, I want to click a chevron/dropdown button to see available save format options (JSON, XML) and select my preferred format, so that I can set the default format before saving with the main button.

**Why this priority**: This is the core new functionality that enables format selection. Without this, users cannot switch between JSON and XML formats.

**Independent Test**: Can be fully tested by clicking the chevron, verifying the dropdown appears with JSON and XML options, selecting a format, and verifying the main button will use that format on next save.

**Acceptance Scenarios**:

1. **Given** the Save button is visible, **When** the user clicks the chevron/dropdown area, **Then** a dropdown menu appears showing "JSON" and "XML" format options.
2. **Given** the dropdown is open, **When** the user clicks "JSON", **Then** JSON becomes the selected format, the dropdown closes, and no save is triggered.
3. **Given** the dropdown is open, **When** the user clicks "XML", **Then** XML becomes the selected format, the dropdown closes, and no save is triggered.
4. **Given** the dropdown is open, **When** the user clicks outside the dropdown or presses Escape, **Then** the dropdown closes without changing the format.
5. **Given** the user selected JSON from the dropdown, **When** the user clicks the main Save button, **Then** the document is saved as JSON.

---

### User Story 3 - Visual Indication of Current Format (Priority: P2)

As a user, I want to see which format is currently selected in the button label, so that I know what format will be used when I click the main Save button.

**Why this priority**: Enhances usability by providing clear feedback, but the feature works without it.

**Independent Test**: Can be tested by selecting different formats and verifying the button label updates accordingly.

**Acceptance Scenarios**:

1. **Given** JSON format is selected, **When** viewing the Save button, **Then** the button displays "Save (JSON)" in the main button area.
2. **Given** XML format is selected, **When** viewing the Save button, **Then** the button displays "Save (XML)" in the main button area.
3. **Given** the user selects a different format from the dropdown, **When** the dropdown closes, **Then** the button label immediately updates to reflect the new format.

---

### User Story 4 - Keyboard Navigation (Priority: P3)

As a user, I want to use keyboard navigation within the format dropdown, so that I can efficiently select formats without using the mouse.

**Why this priority**: Improves accessibility but is not critical for core functionality.

**Independent Test**: Can be tested by opening dropdown with keyboard, navigating with arrow keys, and selecting with Enter.

**Acceptance Scenarios**:

1. **Given** the dropdown is open, **When** the user presses ArrowDown/ArrowUp, **Then** the highlighted option changes.
2. **Given** an option is highlighted, **When** the user presses Enter, **Then** that format is selected and the dropdown closes (no save triggered).
3. **Given** the dropdown is open, **When** the user presses Escape, **Then** the dropdown closes without changing the format.

---

### User Story 5 - Format Change Confirmation (Priority: P2)

As a user, I want to be warned when I select a different format than the file was originally saved in, so that I don't accidentally change formats without realizing.

**Why this priority**: Prevents accidental format changes which could cause compatibility issues, but the feature works without it.

**Independent Test**: Can be tested by loading a JSON file, opening the dropdown, selecting XML, and verifying a modal dialog appears.

**Acceptance Scenarios**:

1. **Given** a document loaded from a JSON file, **When** the user selects "XML" from the dropdown, **Then** a modal dialog appears with the message: "This file was originally saved as JSON. Saving as XML may affect compatibility with other tools. Are you sure you want to change the format?"
2. **Given** the format change confirmation dialog is open, **When** the user clicks "Change Format", **Then** the format is changed to the selected format and the dialog closes.
3. **Given** the format change confirmation dialog is open, **When** the user clicks "Cancel" or presses Escape, **Then** the format remains unchanged and the dialog closes.
4. **Given** a document loaded from a JSON file with JSON currently selected, **When** the user selects "JSON" from the dropdown, **Then** no confirmation dialog appears (same format).
5. **Given** the user previously confirmed a format change to a different format, **When** the user selects the original format again, **Then** no confirmation dialog appears (returning to original format does not require confirmation).

---

### Edge Cases

- What happens when the document has no changes (isDirty is false)? The button remains disabled as before.
- What happens when a save is already in progress? The button shows a saving indicator and additional clicks are ignored.
- What happens when File System Access API is not available? Falls back to download behavior (existing logic).
- What happens when the dropdown is open and the user clicks the main button area? The dropdown closes and save is triggered.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a split button with two clickable areas: a main "Save" action area and a dropdown chevron area.
- **FR-002**: System MUST display a dropdown menu when the chevron area is clicked, showing "JSON" and "XML" format options (selecting sets the default format without triggering save).
- **FR-003**: System MUST save the document as pretty-printed JSON (2-space indentation) when JSON format is selected.
- **FR-004**: System MUST save the document as XML when XML format is selected (using existing serialization logic).
- **FR-005**: System MUST default to the original file format when a file is loaded (JSON files default to JSON, XML files default to XML).
- **FR-006**: System MUST persist the selected format preference to localStorage and restore it on application reload (cross-session memory).
- **FR-007**: System MUST close the dropdown when clicking outside, pressing Escape, or selecting an option.
- **FR-008**: System MUST use the same file save logic (File System Access API with fallback to download) regardless of format.
- **FR-009**: System MUST disable the entire split button when no changes are pending (isDirty is false) or during save.
- **FR-010**: System MUST support keyboard shortcut Ctrl+S to save in the currently selected format.
- **FR-011**: System MUST use the existing `serializeToJson` function for JSON output (already produces pretty-printed output).
- **FR-012**: System MUST provide appropriate ARIA labels for accessibility (split button pattern).
- **FR-013**: System MUST show a visual separator between the main button area and the chevron area.
- **FR-014**: System MUST position the dropdown below the button, with flip behavior if space is insufficient.
- **FR-015**: System MUST display a modal confirmation dialog with "Change Format" and "Cancel" buttons when the user selects a format different from the file's original format, warning that the save format will change.
- **FR-016**: System MUST close the format change confirmation dialog and cancel the format change when Escape key is pressed.
- **FR-017**: System MUST focus trap within the modal dialog when open, preventing interaction with background elements.

### Key Entities

- **SaveFormat**: Represents the file format for saving - either 'json' or 'xml'. Stored in component state, defaults to document's original format.
- **SplitButton**: A compound button component with a primary action area and a secondary dropdown trigger. Used for actions with multiple variants.
- **FormatChangeDialog**: A modal confirmation dialog displayed when the user attempts to change the save format from the file's original format. Contains warning message and "Change Format" / "Cancel" buttons.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can change save format and save within 3 clicks (open dropdown + select format + click Save).
- **SC-002**: Users can save a document in the default format with a single click on the main button area.
- **SC-003**: The JSON output is human-readable with 2-space indentation (matching existing serializeToJson behavior).
- **SC-004**: Keyboard-only users can access all save format options using standard navigation patterns.
- **SC-005**: The split button component follows established accessibility patterns (ARIA attributes, focus management).

## Clarifications

### Session 2026-01-10

- Q: What should happen when the user selects a format from the dropdown? -> A: Select format only (sets default), require separate click to save
- Q: Should the currently selected format be shown in the button label? -> A: Yes, show format in label (e.g., "Save (JSON)" or "Save as JSON")
- Q: What should happen when a new document is created (not loaded from file) - which format should be the default? -> A: Remember and use the last format the user selected in any session
- Q: How should format selection interact with an already-loaded file's format? -> A: Warn user when changing format from original, require confirmation
- Q: What confirmation dialog style for format change warning? -> A: Modal dialog with "Change Format" and "Cancel" buttons

## Assumptions

- The existing `serializeToJson` function in `src/domain/serializer/jsonSerializer.ts` already produces pretty-printed JSON with 2-space indentation, so no changes to serialization logic are needed.
- The existing `serializeToXml` function handles XML serialization correctly.
- The existing file service functions (`downloadDocument`, `saveToFileHandle`, `showSaveFilePicker`) work with any string content and can be reused.
- The `documentStore.originalFormat` property correctly stores the format of the loaded file.
- The `@floating-ui/dom` package (already installed) will be used for dropdown positioning, consistent with other dropdowns in the application.

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | ✅ MET | SaveButton.spec.tsx: "renders main button and chevron dropdown trigger" |
| FR-002 | ✅ MET | SaveButton.spec.tsx: "opens dropdown when chevron is clicked", "shows JSON and XML format options" |
| FR-003 | ✅ MET | SaveButton.integration.spec.tsx: "saves as JSON when JSON format is selected" |
| FR-004 | ✅ MET | SaveButton.integration.spec.tsx: "saves as XML when XML format is selected" |
| FR-005 | ✅ MET | saveFormatStore.spec.ts: "initializeFormat uses originalFormat when provided" |
| FR-006 | ✅ MET | formatPreference.spec.ts: "setFormatPreference stores value in localStorage" |
| FR-007 | ✅ MET | SaveButton.spec.tsx: "closes dropdown when Escape is pressed", "closes dropdown when clicking outside" |
| FR-008 | ✅ MET | SaveButton.tsx:66-77 uses existing saveToFileHandle/downloadDocument |
| FR-009 | ✅ MET | SaveButton.spec.tsx: "disables save button when document is not dirty" |
| FR-010 | ✅ MET | SaveButton.spec.tsx: "triggers save on Ctrl+S keyboard shortcut" |
| FR-011 | ✅ MET | SaveButton.tsx:70 uses serializeToJson for JSON output |
| FR-012 | ✅ MET | SaveButton.tsx: aria-haspopup, aria-expanded, role="menu", role="menuitem" |
| FR-013 | ✅ MET | SaveButton.module.css: .separator class with border styling |
| FR-014 | ✅ MET | SaveButton.tsx uses @floating-ui/dom computePosition with flip middleware |
| FR-015 | ✅ MET | FormatChangeDialog.spec.tsx: "renders dialog with warning message" |
| FR-016 | ✅ MET | FormatChangeDialog.spec.tsx: "calls onCancel when Escape key is pressed" |
| FR-017 | ✅ MET | FormatChangeDialog.tsx implements focus trap with Tab key handling |
| SC-001 | ✅ MET | UI flow: chevron click → select format → click Save = 3 clicks |
| SC-002 | ✅ MET | SaveButton.integration.spec.tsx: "clicking main button triggers save" |
| SC-003 | ✅ MET | serializeToJson already uses 2-space indentation (existing behavior) |
| SC-004 | ✅ MET | SaveButton.spec.tsx: keyboard navigation tests for dropdown |
| SC-005 | ✅ MET | SaveButton.tsx: ARIA attributes for split button pattern |

**CRITICAL**: Any NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [x] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with MET status
- [x] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [x] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [x] **Quality Gate - CSS**: Run `npm run lint:css` - MUST pass with zero errors/warnings
- [x] **Quality Gate - Code**: Run `npm run check` - MUST pass with zero errors/warnings
- [x] **Quality Gate - Types**: Run `npm run typecheck` - MUST pass with zero errors/warnings
- [x] **Git Status Check**: Run `git status` to verify all changes are committed
- [x] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [x] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [x] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**CRITICAL**: The feature is NOT complete until:
1. All quality gates pass (lint:css, check, typecheck) with zero errors/warnings
2. All work is committed to the feature branch
3. The compliance table shows all requirements MET
