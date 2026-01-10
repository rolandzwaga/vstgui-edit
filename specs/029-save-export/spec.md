# Feature Specification: Save & Export

**Feature Branch**: `029-save-export`  
**Created**: 2026-01-08  
**Status**: Draft  
**Input**: User description: "Save and Export functionality - Save to current file (Ctrl+S), Save As to new location, Export as JSON (pretty/minified), Export as XML (legacy format), Pre-save validation, Dirty state indicator (unsaved changes)"

## Clarifications

### Session 2026-01-08

- Q: Where should the dirty indicator appear visually? → A: Asterisk (*) before filename in toolbar
- Q: What happens when Save fails? → A: Show modal dialog that blocks until dismissed
- Q: How should Save behave on browsers without File System Access API? → A: Show info message explaining download fallback, then download
- Q: Handle external file modification during editing? → A: Silently overwrite (no browser API to detect external changes)
- Q: Can user force-save despite validation errors? → A: Errors block save; user must fix or explicitly "Save Anyway"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save Current Document (Priority: P1) 🎯 MVP

As a user editing a uidesc file, I want to save my changes to the current file so that my work is persisted.

**Why this priority**: This is the most critical functionality - without save, all editing work is lost when the browser closes. This completes the basic edit-save workflow.

**Independent Test**: Load a uidesc file, make any change (e.g., move a view), press Ctrl+S, reload the file to verify changes were saved.

**Acceptance Scenarios**:

1. **Given** a document loaded from a file with unsaved changes, **When** user presses Ctrl+S, **Then** changes are saved to the original file and dirty indicator clears
2. **Given** a document with no unsaved changes, **When** user presses Ctrl+S, **Then** nothing happens (no unnecessary save operation)
3. **Given** a document loaded from a file, **When** user clicks the Save button in toolbar, **Then** changes are saved to the original file

---

### User Story 2 - Dirty State Indicator (Priority: P1) 🎯 MVP

As a user, I want to see a visual indicator when I have unsaved changes so that I don't accidentally lose my work.

**Why this priority**: Users need immediate feedback that changes exist and haven't been saved. This is essential UX for any editor.

**Independent Test**: Load a file, verify no dirty indicator, make a change, verify dirty indicator appears, save, verify indicator clears.

**Acceptance Scenarios**:

1. **Given** a freshly loaded document, **When** no changes have been made, **Then** no dirty indicator is shown
2. **Given** a document, **When** user makes any modification (move, resize, property change, resource change), **Then** dirty indicator (asterisk before filename in toolbar) appears immediately
3. **Given** a document with dirty indicator, **When** user saves successfully, **Then** dirty indicator clears
4. **Given** a document with dirty indicator, **When** user attempts to close/navigate away, **Then** browser shows unsaved changes warning

---

### User Story 3 - Save As / Download (Priority: P2)

As a user, I want to save my document to a new file so that I can create copies or save to a different location.

**Why this priority**: Enables users to create backups, work on copies, or save to a preferred location. Important for file management but not blocking basic workflow.

**Independent Test**: Load a file, make changes, use Save As, specify new filename, verify new file is created with changes.

**Acceptance Scenarios**:

1. **Given** a document (modified or not), **When** user selects "Save As" or presses Ctrl+Shift+S, **Then** file download dialog appears
2. **Given** the Save As dialog, **When** user confirms, **Then** file is downloaded with the specified name
3. **Given** a successful Save As, **When** download completes, **Then** the current working file reference updates to the new filename

---

### User Story 4 - Export Format Selection (Priority: P2)

As a user, I want to choose the export format (JSON or XML) so that I can work with different VSTGUI versions or toolchains.

**Why this priority**: XML format support is needed for legacy VSTGUI compatibility. Format options provide flexibility for different workflows.

**Independent Test**: Load a JSON file, export as XML, verify valid XML output. Load an XML file, export as JSON, verify valid JSON output.

**Acceptance Scenarios**:

1. **Given** the export dialog, **When** user selects JSON format, **Then** document is exported as valid uidesc JSON
2. **Given** the export dialog, **When** user selects XML format, **Then** document is exported as valid uidesc XML
3. **Given** JSON export options, **When** user selects "Pretty Print", **Then** output is formatted with indentation
4. **Given** JSON export options, **When** user selects "Minified", **Then** output has no unnecessary whitespace

---

### User Story 5 - Pre-Save Validation (Priority: P3)

As a user, I want the editor to validate my document before saving so that I don't save invalid or corrupted files.

**Why this priority**: Helps catch errors before they become problems. Lower priority because the editor should generally prevent invalid states, but validation provides a safety net.

**Independent Test**: Intentionally create an invalid state (if possible via direct store manipulation), attempt save, verify warning is shown.

**Acceptance Scenarios**:

1. **Given** a valid document, **When** user saves, **Then** save proceeds without warnings
2. **Given** a document with validation warnings, **When** user saves, **Then** warnings are displayed but save can proceed
3. **Given** a document with validation errors, **When** user saves, **Then** errors are displayed in modal and save is blocked until user clicks "Save Anyway" or fixes errors

---

### Edge Cases

- **Save failure** (disk full, permissions): Show blocking modal dialog with error details and retry/cancel options
- **Large files**: Performance target is < 1 second for files up to 1MB (SC-001)
- **External file modification**: Not detectable via browser APIs; editor silently overwrites on save
- **Browser refresh/close with unsaved changes**: beforeunload warning shown (FR-012)
- **Format preservation**: Original format (JSON/XML) preserved on Save (FR-011)
- **Unsupported browser (no File System Access API)**: Save shows info message explaining download fallback, then triggers download

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide Save functionality via Ctrl+S keyboard shortcut
- **FR-002**: System MUST provide Save functionality via a toolbar button
- **FR-003**: System MUST track document dirty state (modified since last save/load)
- **FR-004**: System MUST display a visual dirty indicator (asterisk before filename in toolbar) when unsaved changes exist
- **FR-005**: System MUST clear dirty state after successful save
- **FR-006**: System MUST provide Save As functionality via Ctrl+Shift+S keyboard shortcut
- **FR-007**: System MUST provide Save As functionality via menu/toolbar
- **FR-008**: System MUST support export to JSON format
- **FR-009**: System MUST support export to XML format (legacy VSTGUI compatibility)
- **FR-010**: System MUST provide JSON formatting options (pretty print with 2-space indent, minified)
- **FR-011**: System MUST preserve the original file format when using Save (JSON stays JSON, XML stays XML)
- **FR-012**: System MUST warn user before browser close/refresh if unsaved changes exist (beforeunload event)
- **FR-013**: System MUST validate document structure before save
- **FR-014**: System MUST display validation warnings/errors to user in modal dialog; errors block save until user clicks "Save Anyway" or fixes issues
- **FR-015**: System MUST generate valid uidesc JSON that can be re-loaded by the editor
- **FR-016**: System MUST generate valid uidesc XML that matches VSTGUI's expected format
- **FR-017**: System MUST show blocking modal dialog on save failure with error details and retry/cancel options
- **FR-018**: System MUST show info message on browsers without File System Access API explaining download fallback before triggering download

### Key Entities

- **DirtyState**: Boolean flag indicating unsaved modifications exist
- **SaveFormat**: Enumeration of supported formats (JSON, XML)
- **FormatOptions**: Settings for export (pretty/minified for JSON)
- **ValidationResult**: Collection of warnings and errors from pre-save validation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Save operation completes in under 1 second for typical uidesc files (< 1MB)
- **SC-002**: Dirty indicator updates within 100ms of any document modification
- **SC-003**: Exported JSON files can be successfully re-imported by the editor with zero data loss
- **SC-004**: Exported XML files can be successfully loaded by VSTGUI runtime
- **SC-005**: Browser close warning appears 100% of the time when unsaved changes exist

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

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
| FR-016 | ✅ MET | Implemented |
| FR-017 | ✅ MET | Implemented |
| FR-018 | ✅ MET | Implemented |
| SC-001 | ✅ MET | Implemented |
| SC-002 | ✅ MET | Implemented |
| SC-003 | ✅ MET | Implemented |
| SC-004 | ✅ MET | Implemented |
| SC-005 | ✅ MET | Implemented |

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
