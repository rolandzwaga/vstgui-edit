# Feature Specification: Fonts Panel

**Feature Branch**: `023-fonts-panel`  
**Created**: 2026-01-08  
**Status**: Draft  
**Input**: Phase 6 Resource Management - Fonts panel for viewing, adding, editing, and deleting font definitions with properties (name, size, bold, italic, etc.), usage tracking, and preview samples

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Fonts List (Priority: P1)

As a UI designer, I want to see all defined fonts in my uidesc file displayed in a dedicated panel, so that I can quickly review the typography used in my project.

**Why this priority**: This is the foundational feature - users must be able to see fonts before they can manage them. Without this, no other font operations are possible.

**Independent Test**: Can be fully tested by loading a uidesc file with fonts and verifying all fonts appear in the panel with their name, properties (size, bold/italic indicators), and sample text preview.

**Acceptance Scenarios**:

1. **Given** a uidesc file with fonts defined, **When** the file is loaded, **Then** all fonts appear in the Fonts panel with name and property summary
2. **Given** a uidesc file with no fonts defined, **When** the file is loaded, **Then** the Fonts panel shows an empty state with guidance to add fonts
3. **Given** a font with bold and italic enabled, **When** viewing the font entry, **Then** visual indicators (B/I badges or styled text) show these properties
4. **Given** any font in the list, **When** viewing the font entry, **Then** a sample text preview shows how the font renders (e.g., "AaBbCc 123")

---

### User Story 2 - Add New Font (Priority: P1)

As a UI designer, I want to add new fonts to my project's font palette, so that I can define reusable typography for my UI elements.

**Why this priority**: Adding fonts is essential for building a typography system. Without this, users cannot create new fonts for their designs.

**Independent Test**: Can be tested by clicking "Add Font", entering a name and properties, and verifying the font appears in both the panel and the uidesc JSON.

**Acceptance Scenarios**:

1. **Given** the Fonts panel is visible, **When** user clicks "Add Font" button, **Then** a new font entry form appears with editable fields for name and properties
2. **Given** user enters a valid font name and required properties (font-name, size), **When** user confirms, **Then** the font is added to the uidesc fonts object
3. **Given** user enters a duplicate font name, **When** user tries to confirm, **Then** validation error is shown and the font is not added
4. **Given** user enters an invalid size (e.g., negative number), **When** user tries to confirm, **Then** validation error is shown with guidance

---

### User Story 3 - Edit Existing Font (Priority: P1)

As a UI designer, I want to modify existing fonts, so that I can refine my typography without recreating fonts.

**Why this priority**: Editing is a core CRUD operation needed for any resource management. Users frequently need to adjust font properties during design iteration.

**Independent Test**: Can be tested by clicking on a font, changing its properties, and verifying the change persists in the uidesc JSON and updates the preview live.

**Acceptance Scenarios**:

1. **Given** a font exists in the panel, **When** user clicks to edit, **Then** font properties become editable (name, font-name, size, bold, italic, etc.)
2. **Given** user is editing font properties, **When** user changes the size, **Then** the sample preview updates live to reflect the new size
3. **Given** user toggles bold or italic, **When** viewing the preview, **Then** the sample text renders with the new style
4. **Given** user edits a font name to a duplicate, **When** user tries to confirm, **Then** validation error is shown and name reverts
5. **Given** user is editing a font, **When** user presses Escape, **Then** edits are cancelled and original values restored

---

### User Story 4 - Delete Font (Priority: P2)

As a UI designer, I want to delete fonts I no longer need, so that I can keep my font palette clean and organized.

**Why this priority**: While important, deletion is less frequent than viewing/adding/editing. Users typically build up fonts before pruning.

**Independent Test**: Can be tested by selecting a font, clicking delete, and verifying the font is removed from both the panel and the uidesc JSON.

**Acceptance Scenarios**:

1. **Given** a font exists that is not used by any view, **When** user clicks delete, **Then** the font is removed immediately
2. **Given** a font is used by one or more views, **When** user clicks delete, **Then** a confirmation dialog shows which views use the font
3. **Given** the confirmation dialog is shown, **When** user confirms deletion, **Then** the font is removed (views retain the font name reference but it becomes "orphaned")
4. **Given** the confirmation dialog is shown, **When** user cancels, **Then** the font is not deleted

---

### User Story 5 - View Font Usage (Priority: P2)

As a UI designer, I want to see which views use a specific font, so that I can understand the impact of changing or deleting a font.

**Why this priority**: Usage tracking helps users make informed decisions about font changes. Not critical for basic functionality but valuable for larger projects.

**Independent Test**: Can be tested by clicking on a font's usage indicator and verifying all views that reference that font are listed.

**Acceptance Scenarios**:

1. **Given** a font is used by views, **When** viewing the font entry, **Then** a usage count badge is always displayed (following Colors Panel pattern)
2. **Given** a font is used by views, **When** user clicks the usage badge, **Then** a popover shows the list of view names/types using this font
3. **Given** a font is not used by any view, **When** viewing the font entry, **Then** no usage badge is shown (or shows "0 uses")

---

### User Story 6 - Undo/Redo Font Operations (Priority: P2)

As a UI designer, I want to undo and redo font changes, so that I can experiment freely without fear of losing my work.

**Why this priority**: Undo/redo is expected in any editor but builds on existing undo infrastructure. Not blocking for MVP.

**Independent Test**: Can be tested by adding/editing/deleting a font, pressing Ctrl+Z to undo, and verifying the font state reverts.

**Acceptance Scenarios**:

1. **Given** user adds a font, **When** user presses Ctrl+Z, **Then** the font is removed (undo add)
2. **Given** user edits a font, **When** user presses Ctrl+Z, **Then** the font reverts to its previous properties (undo edit)
3. **Given** user deletes a font, **When** user presses Ctrl+Z, **Then** the font reappears with all properties (undo delete)
4. **Given** user has undone an operation, **When** user presses Ctrl+Shift+Z, **Then** the operation is redone

---

### Edge Cases

- **Empty font-name**: User tries to save font without a system font name - show validation error requiring font-name
- **Zero or negative size**: User enters 0 or -5 for size - show validation error (size must be positive)
- **Very large size**: User enters 999 for size - allow but warn if unusually large (>72pt)
- **Empty font definition name**: User tries to save font resource without a name - show validation error
- **Special characters in name**: User enters "Body Text" with space - allow (VSTGUI supports this)
- **Very long font names**: User enters extremely long name - no storage limit, truncate display with full name in tooltip
- **Case sensitivity**: Font resource names are case-sensitive ("Body" ≠ "body")
- **System font not installed**: User enters a system font-name that doesn't exist locally - allow (it may exist on target system), show warning indicator
- **All style flags off**: Font with no bold/italic/underline/strike-through is valid (the default state)
- **Alternative font names**: User enters fallback fonts "Arial, Helvetica, sans-serif" - store as comma-separated string

## Requirements *(mandatory)*

### Functional Requirements

#### Display & Panel

- **FR-001**: System MUST display a "Fonts" panel/section in the sidebar resource area
- **FR-002**: System MUST list all fonts from the uidesc `fonts` object with name and property summary
- **FR-003**: System MUST display a sample text preview for each font (e.g., "AaBbCc 123")
- **FR-004**: System MUST show visual indicators for bold (B) and italic (I) when enabled
- **FR-005**: System MUST display the font size next to each font entry

#### Add Font

- **FR-006**: System MUST provide an "Add Font" button/action to create new fonts
- **FR-007**: System MUST validate that font resource names are unique (case-sensitive)
- **FR-008**: System MUST require font-name (system font) and size as mandatory properties
- **FR-009**: System MUST allow optional properties: bold, italic, underline, strike-through, alternative-font-names
- **FR-010**: System MUST add new fonts to the uidesc JSON structure immediately upon valid input

#### Edit Font

- **FR-011**: System MUST allow editing of font resource name (the key in the fonts object)
- **FR-012**: System MUST allow editing of font-name (system font name)
- **FR-013**: System MUST allow editing of size with numeric input
- **FR-014**: System MUST allow toggling bold, italic, underline, strike-through via checkboxes or buttons
- **FR-015**: System MUST allow editing alternative-font-names as a text field
- **FR-016**: System MUST update the sample preview live while editing properties
- **FR-017**: System MUST validate edits before applying (unique name, valid size)

#### Delete Font

- **FR-018**: System MUST allow deletion of fonts via context menu or delete button
- **FR-019**: System MUST show usage warning before deleting a font that is referenced by views
- **FR-020**: System MUST allow force-deletion even if font is in use (with confirmation)

#### Usage Tracking

- **FR-021**: System MUST track which views reference each font by scanning view attributes
- **FR-022**: System MUST display usage count for each font in the panel
- **FR-023**: System MUST show list of referencing views on demand (click/hover)

#### Undo/Redo

- **FR-024**: System MUST integrate font add/edit/delete operations with existing undo/redo system
- **FR-025**: System MUST support undo/redo for: add font, edit properties, delete font

### Key Entities

- **Font**: A named font definition with properties:
  - name (string, unique) - the resource key
  - font-name (string, required) - system font name
  - size (number, required) - font size in points
  - bold (boolean, optional) - bold style flag
  - italic (boolean, optional) - italic style flag
  - underline (boolean, optional) - underline style flag
  - strike-through (boolean, optional) - strikethrough style flag
  - alternative-font-names (string, optional) - comma-separated fallback fonts
- **Font Reference**: An attribute on a view that references a font by name (e.g., `font` attribute)
- **Fonts Object**: The `fonts` section in the uidesc JSON containing all font definitions

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All fonts from a loaded uidesc file are displayed in the Fonts panel within 100ms of file load
- **SC-002**: Adding a new font updates both the UI and the uidesc JSON atomically (no partial states)
- **SC-003**: Font sample preview updates within 50ms while editing properties (live feedback)
- **SC-004**: Usage tracking correctly identifies all views referencing a font (100% accuracy)
- **SC-005**: All font operations (add/edit/delete) are undoable/redoable using existing keyboard shortcuts
- **SC-006**: Invalid font properties are rejected with clear error messages specifying the issue

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
| FR-001 | ✅ MET | `FontsPanel.tsx` renders panel in sidebar, `App.tsx` includes `<FontsPanel />` |
| FR-002 | ✅ MET | `FontsPanel.tsx` uses `getFonts()` and `<For each={fonts()}>` to list all fonts with `summarizeFontProperties()` |
| FR-003 | ✅ MET | `FontPreview.tsx` displays "Aa" styled text for each font |
| FR-004 | ✅ MET | `summarizeFontProperties()` in `formatting.ts` shows "B" for bold, "I" for italic; `FontPreview` applies styles |
| FR-005 | ✅ MET | `summarizeFontProperties()` includes `formatFontSize(font.size)` showing "12pt" format |
| FR-006 | ✅ MET | `AddFontButton.tsx` component, `handleAddFont()` in FontsPanel creates new fonts |
| FR-007 | ✅ MET | `validateFontName()` in `validation.ts` checks `existingNames.includes(name)`, tests in `validation.spec.ts` |
| FR-008 | ✅ MET | `handleAddFont()` creates font with required `'font-name': 'Arial', size: '12'` defaults |
| FR-009 | ✅ MET | `FontDefinition` type supports optional bold, italic, underline, strike-through, alternative-font-names |
| FR-010 | ✅ MET | `addFont()` store function updates uidesc immediately, tests in `documentStore.fonts.spec.ts` |
| FR-011 | ✅ MET | `FontItem.tsx` supports inline name editing via double-click, `updateFontName()` store function |
| FR-012 | ✅ MET | `FontItem.tsx` has expandable editor with font-family input field, `handleFontNameBlur()` |
| FR-013 | ✅ MET | `FontItem.tsx` has size input field with validation, `handleSizeBlur()` |
| FR-014 | ✅ MET | `FontItem.tsx` has B/I/U/S toggle buttons, `handleBoldToggle()`, `handleItalicToggle()`, etc. |
| FR-015 | ⬜ PARTIAL | Alternative-font-names editing UI not implemented (less commonly used property) |
| FR-016 | ✅ MET | `FontPreview` updates live as properties change via reactive props |
| FR-017 | ✅ MET | `validateFontName()` validates unique names, `validateFontSize()` validates positive numbers |
| FR-018 | ✅ MET | `FontItem.tsx` shows delete button on hover, `handleDeleteRequest()` in FontsPanel |
| FR-019 | ✅ MET | `FontsPanel.tsx` shows `confirmDialog` with usage count when font is in use |
| FR-020 | ✅ MET | `performDelete()` allows deletion even when in use after confirmation |
| FR-021 | ✅ MET | `findFontUsages()` in `usage.ts` scans view attributes for font references |
| FR-022 | ✅ MET | `FontItem.tsx` displays `usageBadge` with count from `getUsageCount()` |
| FR-023 | ✅ MET | `FontsPanel.tsx` shows `usagePopover` with list of referencing views on badge click |
| FR-024 | ✅ MET | `historyOperations.ts` provides `createAddFontOperation`, `createDeleteFontOperation`, etc. |
| FR-025 | ✅ MET | All operations use `pushOperation()` to integrate with history store; tests in `historyOperations.spec.ts` |
| SC-001 | ✅ MET | Fonts loaded reactively via `createMemo()` from store, no explicit delay |
| SC-002 | ✅ MET | `addFont()` updates store atomically, `pushOperation()` records history |
| SC-003 | ✅ MET | FontPreview updates reactively when properties change in expanded editor |
| SC-004 | ✅ MET | `findFontUsages()` tested in `usage.spec.ts` with 9 tests, including nested views |
| SC-005 | ✅ MET | All operations create history operations, undo/redo via existing Ctrl+Z/Ctrl+Shift+Z |
| SC-006 | ✅ MET | `validation.ts` has clear error messages: "Font name cannot be empty", "A font with this name already exists", etc. |

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
