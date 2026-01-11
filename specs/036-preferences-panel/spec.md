# Feature Specification: Preferences Panel

**Feature Branch**: `036-preferences-panel`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "A preferences panel/dialog that consolidates all editor settings into a unified UI. Currently, various settings are scattered across localStorage with no central management interface."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Preferences Panel (Priority: P1)

As a user, I want to open a preferences panel from the toolbar so that I can view and modify all editor settings in one centralized location.

**Why this priority**: This is the foundational interaction that enables all other features. Without the ability to open the panel, no settings can be configured.

**Independent Test**: Can be fully tested by clicking a preferences button in the toolbar and verifying the panel opens with organized settings sections, delivering immediate discoverability of available settings.

**Acceptance Scenarios**:

1. **Given** the editor is open with a document loaded, **When** user clicks the preferences button in the toolbar, **Then** a modal dialog opens displaying the preferences panel with organized sections.
2. **Given** the preferences panel is open, **When** user clicks outside the panel or presses Escape, **Then** the panel closes.
3. **Given** the preferences panel is open, **When** user clicks the close button (X), **Then** the panel closes.
4. **Given** no document is loaded, **When** user is on the upload screen, **Then** the preferences button is not visible (preferences only accessible when editor is active).

---

### User Story 2 - Configure Grid Settings (Priority: P1)

As a user, I want to configure grid size, style, and default visibility from the preferences panel so that the grid behaves according to my workflow preferences.

**Why this priority**: Grid settings are frequently adjusted and directly impact daily workflow. Persisting these settings saves time on every session.

**Independent Test**: Can be fully tested by opening preferences, changing grid size/style/visibility, closing and reopening the editor, and verifying settings persist.

**Acceptance Scenarios**:

1. **Given** the preferences panel is open on the Grid section, **When** user selects a grid size from the available presets (5, 8, 10, 12, 16, 20), **Then** the grid size is updated immediately in the canvas and persisted.
2. **Given** the preferences panel is open on the Grid section, **When** user selects a grid style (lines, dots, or crosshairs), **Then** the grid style is updated immediately in the canvas and persisted.
3. **Given** the preferences panel is open on the Grid section, **When** user toggles the "Grid visible by default" option, **Then** the setting is persisted and applied on the next session.
4. **Given** the user has previously set grid preferences, **When** the user loads a new document, **Then** the grid displays with the saved size, style, and visibility settings.

---

### User Story 3 - Configure Snap Settings (Priority: P1)

As a user, I want to configure snap-to-grid behavior and threshold so that my views align precisely according to my design requirements.

**Why this priority**: Snap settings work in tandem with grid settings and are essential for precision alignment workflows.

**Independent Test**: Can be fully tested by modifying snap enabled state and threshold, then dragging views to verify snapping behavior matches preferences.

**Acceptance Scenarios**:

1. **Given** the preferences panel is open on the Snap section, **When** user toggles "Snap to grid enabled by default", **Then** the setting is persisted and applied on the next session.
2. **Given** the preferences panel is open on the Snap section, **When** user adjusts the snap threshold slider (1-20 pixels), **Then** the value is updated immediately and persisted.
3. **Given** the user has set snap threshold to 15 pixels, **When** dragging a view within 15 pixels of a grid line, **Then** the view snaps to the grid line.

---

### User Story 4 - Configure Smart Guides Settings (Priority: P2)

As a user, I want to configure whether smart guides are enabled by default so that alignment aids match my preferred workflow.

**Why this priority**: Smart guides enhance alignment precision but some users prefer manual control. Persisting this preference reduces repetitive toggling.

**Independent Test**: Can be fully tested by toggling smart guides default setting, reloading, and verifying smart guides state matches preference.

**Acceptance Scenarios**:

1. **Given** the preferences panel is open on the Smart Guides section, **When** user toggles "Smart guides enabled by default", **Then** the setting is persisted.
2. **Given** the user has disabled smart guides by default, **When** loading a new document, **Then** smart guides are initially disabled.

---

### User Story 5 - Configure Custom Guides Settings (Priority: P2)

As a user, I want to configure whether snap-to-guides is enabled by default so that custom guide behavior matches my workflow.

**Why this priority**: Custom guides snap behavior complements the smart guides settings and provides consistent guide-related configuration.

**Independent Test**: Can be fully tested by toggling snap-to-guides default, reloading, and verifying custom guides snap state.

**Acceptance Scenarios**:

1. **Given** the preferences panel is open on the Guides section, **When** user toggles "Snap to custom guides enabled by default", **Then** the setting is persisted.
2. **Given** the user has enabled snap-to-guides by default, **When** loading a new document and dragging a view near a custom guide, **Then** the view snaps to the guide.

---

### User Story 6 - View Keyboard Shortcuts Reference (Priority: P2)

As a user, I want to view a comprehensive list of all keyboard shortcuts organized by category so that I can learn and reference available shortcuts without leaving the editor.

**Why this priority**: Discoverability of keyboard shortcuts improves productivity. A read-only reference is lower risk than editable settings.

**Independent Test**: Can be fully tested by opening the Keyboard Shortcuts section and verifying all shortcuts are listed with correct key combinations and descriptions.

**Acceptance Scenarios**:

1. **Given** the preferences panel is open on the Keyboard Shortcuts section, **When** viewing the section, **Then** all keyboard shortcuts are displayed organized by category (Canvas, Selection, Editing, Alignment, View Management).
2. **Given** the keyboard shortcuts reference is displayed, **When** reading a shortcut entry, **Then** the entry shows the key combination and a brief description of the action.
3. **Given** the keyboard shortcuts reference is displayed, **Then** the list is read-only and cannot be modified.

---

### User Story 7 - Configure Theme Preference (Priority: P3)

As a user, I want to select a theme preference (Light/Dark/System) so that the editor appearance matches my system or personal preference.

**Why this priority**: Visual theming is a nice-to-have feature that can be stubbed initially and fully implemented later. Core functionality takes precedence.

**Independent Test**: Can be fully tested by selecting each theme option and verifying the selection persists (actual theme application can be stubbed).

**Acceptance Scenarios**:

1. **Given** the preferences panel is open on the Theme section, **When** user selects Light, Dark, or System, **Then** the selection is persisted.
2. **Given** the theme is set to System, **When** the system preference changes, **Then** the editor theme follows the system preference (future implementation - initially stubbed).

---

### User Story 8 - Reset All Preferences (Priority: P2)

As a user, I want to reset all preferences to factory defaults with a single action so that I can recover from unwanted configuration states.

**Why this priority**: Provides a safety net for users who want to start fresh, important for troubleshooting and onboarding.

**Independent Test**: Can be fully tested by modifying multiple settings, clicking reset, and verifying all settings return to defaults.

**Acceptance Scenarios**:

1. **Given** the preferences panel is open, **When** user clicks "Reset to Defaults" button, **Then** a confirmation dialog appears asking to confirm the reset.
2. **Given** the confirmation dialog is shown, **When** user confirms, **Then** all preferences are cleared from storage and reset to factory defaults.
3. **Given** the confirmation dialog is shown, **When** user cancels, **Then** no changes are made and the dialog closes.
4. **Given** preferences have been reset, **When** viewing any settings section, **Then** all values show their default states.

---

### Edge Cases

- What happens when localStorage is unavailable (private browsing mode)? Settings function in-memory but do not persist across sessions. User is not shown an error.
- What happens when stored preferences contain invalid values or corrupted JSON? The entire preferences object is silently reset to factory defaults with a console.warn for debugging. No user-facing error is displayed.
- What happens when the user resizes the browser while preferences panel is open? The panel remains centered and scrollable if content exceeds viewport.
- What happens when preferences panel is opened with no document loaded? The panel is only accessible when a document is loaded; preferences button is not shown on upload screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a preferences button in the main toolbar that opens the preferences panel when clicked.
- **FR-002**: System MUST display the preferences panel as a modal dialog with a close button (X) and support closing via Escape key.
- **FR-003**: System MUST organize settings into distinct sections (Grid, Snap, Smart Guides, Custom Guides, Theme, Keyboard Shortcuts) using sidebar navigation with a vertical section list on the left and content panel on the right.
- **FR-004**: System MUST persist all preference changes to localStorage immediately upon change.
- **FR-005**: System MUST load saved preferences from localStorage on editor initialization.
- **FR-006**: System MUST provide grid size selection with presets: 5, 8, 10, 12, 16, 20 pixels.
- **FR-007**: System MUST provide grid style selection: lines, dots, crosshairs.
- **FR-008**: System MUST provide a toggle for grid default visibility.
- **FR-009**: System MUST provide a toggle for snap-to-grid default enabled state.
- **FR-010**: System MUST provide a snap threshold slider with range 1-20 pixels.
- **FR-011**: System MUST provide a toggle for smart guides default enabled state.
- **FR-012**: System MUST provide a toggle for snap-to-custom-guides default enabled state.
- **FR-013**: System MUST provide a theme selector with options: Light, Dark, System (can be stubbed initially).
- **FR-014**: System MUST display a read-only keyboard shortcuts reference organized by category.
- **FR-015**: System MUST provide a "Reset to Defaults" button that clears all preferences after user confirmation.
- **FR-016**: System MUST gracefully handle localStorage unavailability by functioning in-memory without errors.
- **FR-017**: System MUST apply settings changes immediately to the active editor session (live preview).
- **FR-018**: System MUST consolidate existing localStorage keys under a unified preferences namespace.
- **FR-019**: System MUST silently reset to factory defaults when stored preferences JSON is corrupted or fails schema validation, logging a console.warn for debugging purposes.

### Key Entities

- **UserPreferences**: The complete set of user-configurable settings including grid, snap, guides, and theme preferences. Stored as a single JSON object in localStorage.
- **PreferencesSection**: A logical grouping of related settings within the preferences panel (e.g., Grid, Snap, Keyboard Shortcuts).
- **KeyboardShortcut**: A read-only entry containing a key combination and action description, organized by category.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can open the preferences panel and modify any setting within 3 clicks from the main editor view.
- **SC-002**: All preference changes persist correctly across browser sessions (verified by closing and reopening the browser).
- **SC-003**: The preferences panel displays all settings sections and loads within 500ms of clicking the preferences button.
- **SC-004**: Keyboard shortcuts reference includes all currently implemented shortcuts (23 shortcuts across 5 categories, updated as features are added).
- **SC-005**: Reset to Defaults restores all settings to factory values in a single action with confirmation.
- **SC-006**: 100% of existing scattered localStorage keys are consolidated under the unified preferences system.
- **SC-007**: Users can discover and reference keyboard shortcuts without leaving the editor.

## Clarifications

### Session 2026-01-11

- Q: How should users navigate between the 6 settings sections? → A: Sidebar navigation (vertical section list on left, content on right)
- Q: What should happen to old localStorage keys after migration? → A: Delete immediately after successful migration (app not in production)
- Q: What should happen if stored preferences JSON is corrupted or has invalid schema? → A: Silently reset to defaults with console.warn for debugging
- Q: Should keyboard shortcuts reference show only implemented shortcuts or all planned shortcuts? → A: Show only currently implemented shortcuts (update reference as features are added)

## Assumptions

The following assumptions were made based on the feature description and existing codebase patterns:

1. **Preferences are editor-scoped**: Preferences apply globally to the editor, not per-document.
2. **Theme is initially stubbed**: The theme selector UI will be implemented but actual theme switching can be stubbed for future implementation.
3. **No custom keyboard shortcuts**: Users cannot modify keyboard shortcuts; the reference is read-only.
4. **Single localStorage key**: All preferences will be consolidated under one localStorage key (e.g., `vstgui-edit:preferences`) rather than scattered individual keys.
5. **Migration of existing keys**: Existing localStorage keys (e.g., `vstgui-edit:alignment-toolbar`, `vstgui-edit:save-format`) will be migrated to the unified preferences object.
6. **Modal dialog pattern**: The preferences panel follows the same modal pattern as FormatChangeDialog (overlay with centered dialog).
7. **Immediate application**: Settings changes apply immediately without requiring a save button (auto-save on change).

## Technical Notes

### Existing localStorage Keys to Consolidate

Based on codebase analysis, the following existing localStorage keys should be consolidated:

| Current Key | New Location in Preferences |
|-------------|---------------------------|
| `vstgui-edit:alignment-toolbar` | `preferences.alignmentToolbar` |
| `vstgui-edit:save-format` | `preferences.saveFormat` |
| Grid settings (currently in-memory) | `preferences.grid.*` |
| Smart guides (currently in-memory) | `preferences.smartGuides.*` |
| Custom guides snap (currently in-memory) | `preferences.customGuides.*` |

**Migration Behavior**: On first load, existing keys are read, migrated to the unified preferences object, and immediately deleted. No backward compatibility period required (app not in production).

### Keyboard Shortcuts Reference Categories

The shortcuts reference should include only currently implemented shortcuts. Update this list as features are added.

**Canvas Navigation** (8 shortcuts):
- `+/=` - Zoom In
- `-` - Zoom Out
- `0` - Reset Zoom
- `F` - Fit to View
- `G` - Toggle Grid Visibility
- `Shift+G` - Toggle Snap to Grid
- `S` - Toggle Smart Guides
- `Ctrl+;` - Toggle Custom Guides Visibility

**Selection** (2 shortcuts):
- `Ctrl+A` - Select All
- `Escape` - Clear Selection / Cancel Operation

**Editing** (4 shortcuts):
- `Ctrl+Z` - Undo
- `Ctrl+Y` / `Ctrl+Shift+Z` - Redo
- `Arrow Keys` - Nudge (1px)
- `Shift+Arrow Keys` - Nudge Fast (10px)

**Alignment** (6 shortcuts):
- `Ctrl+Shift+L` - Align Left
- `Ctrl+Shift+C` - Align Center
- `Ctrl+Shift+R` - Align Right
- `Ctrl+Shift+T` - Align Top
- `Ctrl+Shift+M` - Align Middle
- `Ctrl+Shift+B` - Align Bottom

**View Management** (3 shortcuts):
- `Ctrl+L` - Lock/Unlock Selected
- `Ctrl+H` - Hide/Show Selected
- `Ctrl+Shift+H` - Show All Hidden

**Total: 23 implemented shortcuts across 5 categories**

*Note: Shortcuts for Copy/Cut/Paste, Duplicate, Delete, Grouping, Find/Replace, and Save will be added to this reference when those features are implemented.*

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
| FR-016 | PENDING | [Test or file that verifies this] |
| FR-017 | PENDING | [Test or file that verifies this] |
| FR-018 | PENDING | [Test or file that verifies this] |
| FR-019 | PENDING | [Test or file that verifies this] |
| SC-001 | PENDING | [Measurement or test result] |
| SC-002 | PENDING | [Measurement or test result] |
| SC-003 | PENDING | [Measurement or test result] |
| SC-004 | PENDING | [Measurement or test result] |
| SC-005 | PENDING | [Measurement or test result] |
| SC-006 | PENDING | [Measurement or test result] |
| SC-007 | PENDING | [Measurement or test result] |

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
