# Feature Specification: Keyboard Shortcuts System

**Feature Branch**: `038-keyboard-shortcuts`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Create a centralized keyboard shortcut system with shortcuts reference panel, shortcut categories, discovery, conflict detection, and integration with preferences"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Shortcuts Reference Panel (Priority: P1)

As a user, I want to quickly access a searchable list of all keyboard shortcuts so that I can discover available commands and learn how to work more efficiently.

**Why this priority**: Discoverability is the core value of this feature. Without the ability to access and view shortcuts, no other functionality matters.

**Independent Test**: Can be fully tested by pressing `?` or `Ctrl+/` and verifying the shortcuts panel opens with a searchable list organized by category.

**Acceptance Scenarios**:

1. **Given** the editor is open with a document loaded, **When** user presses `?` key, **Then** the Keyboard Shortcuts panel opens as a modal dialog.
2. **Given** the editor is open with a document loaded, **When** user presses `Ctrl+/`, **Then** the Keyboard Shortcuts panel opens as a modal dialog.
3. **Given** the Keyboard Shortcuts panel is open, **When** user presses Escape or clicks outside the panel, **Then** the panel closes.
4. **Given** the Keyboard Shortcuts panel is open, **When** user clicks the close button (X), **Then** the panel closes.
5. **Given** no document is loaded (upload screen), **When** user presses `?` or `Ctrl+/`, **Then** nothing happens (shortcuts panel only available when editor is active).

---

### User Story 2 - Search Shortcuts (Priority: P1)

As a user, I want to search for shortcuts by keyword so that I can quickly find the command I need without scrolling through all categories.

**Why this priority**: With 30+ shortcuts across multiple categories, search is essential for efficient discovery. This complements the categorized view.

**Independent Test**: Can be fully tested by opening the shortcuts panel, typing a search term (e.g., "zoom"), and verifying only matching shortcuts are displayed.

**Acceptance Scenarios**:

1. **Given** the Keyboard Shortcuts panel is open, **When** viewing the panel, **Then** a search input field is visible at the top and auto-focused.
2. **Given** the Keyboard Shortcuts panel is open, **When** user types "zoom" in the search field, **Then** only shortcuts containing "zoom" in their description or keys are displayed.
3. **Given** the Keyboard Shortcuts panel is open, **When** user types "ctrl+z", **Then** shortcuts with matching key combinations are displayed (case-insensitive).
4. **Given** search results are displayed, **When** user clears the search field, **Then** all shortcuts are displayed again grouped by category.
5. **Given** the search yields no results, **When** viewing the panel, **Then** a "No shortcuts found" message is displayed.

---

### User Story 3 - View Shortcuts by Category (Priority: P1)

As a user, I want to view shortcuts organized by functional category so that I can browse related commands together and understand the overall command structure.

**Why this priority**: Categorization provides logical grouping that helps users understand what commands are available in each area of the application.

**Independent Test**: Can be fully tested by opening the shortcuts panel without searching and verifying shortcuts are grouped under clear category headings.

**Acceptance Scenarios**:

1. **Given** the Keyboard Shortcuts panel is open with no search query, **When** viewing the shortcuts list, **Then** shortcuts are displayed grouped by category (Canvas Navigation, Selection, Editing, Clipboard, Alignment, View Management, Grouping, Find/Replace, File, General).
2. **Given** the Keyboard Shortcuts panel is open, **When** viewing a category, **Then** the category name is displayed as a header above its shortcuts.
3. **Given** the Keyboard Shortcuts panel is open, **When** viewing any shortcut, **Then** the shortcut displays both the key combination and a description of the action.

---

### User Story 4 - Access Shortcuts from Preferences (Priority: P2)

As a user, I want to access the keyboard shortcuts reference from the Preferences panel so that I can view shortcuts alongside other editor settings.

**Why this priority**: The existing Preferences panel already has a basic shortcuts section. This story ensures consistency between the standalone panel and the preferences section.

**Independent Test**: Can be fully tested by opening Preferences, navigating to the Keyboard Shortcuts section, and verifying the same shortcut data is displayed (potentially as a link to the full panel or inline).

**Acceptance Scenarios**:

1. **Given** the Preferences panel is open, **When** user clicks the Keyboard Shortcuts section, **Then** the keyboard shortcuts reference is displayed.
2. **Given** the Preferences Keyboard Shortcuts section is displayed, **When** viewing the content, **Then** the shortcuts are organized by category matching the standalone panel.
3. **Given** the Preferences Keyboard Shortcuts section is displayed, **When** user wants to search, **Then** a button or link opens the full standalone shortcuts panel with search.

---

### User Story 5 - Detect Shortcut Conflicts (Priority: P3)

As a developer extending the application, I want the system to detect overlapping keyboard shortcut definitions so that I can identify and resolve conflicts during development.

**Why this priority**: Conflict detection is a development-time concern that helps maintain shortcut integrity. It's lower priority than end-user discovery features.

**Independent Test**: Can be fully tested by reviewing the console output at startup where any detected conflicts are logged as warnings.

**Acceptance Scenarios**:

1. **Given** the application starts, **When** the shortcut registry initializes, **Then** any duplicate key combinations are detected and logged to the console as warnings.
2. **Given** two shortcuts have the same key combination, **When** viewing the Keyboard Shortcuts panel, **Then** conflicting shortcuts are visually marked (e.g., warning indicator).
3. **Given** the shortcut registry is queried programmatically, **When** checking for conflicts, **Then** a list of conflicting shortcut pairs is returned.

---

### Edge Cases

- What happens when user presses `?` while typing in an input field? The panel should not open; keyboard shortcuts are ignored when focus is in text inputs/textareas.
- What happens when user presses `?` while a modal is already open (e.g., Preferences)? The shortcuts panel should not open; another modal takes precedence.
- How does search handle special characters like `+` or `Ctrl`? Search is literal text matching; "Ctrl+Z" matches shortcuts containing that exact text (case-insensitive).
- What happens if the same shortcut appears in multiple contexts (e.g., Escape for cancel and clear selection)? The shortcut is listed once with combined description noting multiple uses.
- How does the system handle platform differences (Ctrl vs Cmd)? Display shows "Ctrl/Cmd" or platform-specific key based on user's OS.

## Requirements *(mandatory)*

### Functional Requirements

**Shortcuts Panel**
- **FR-001**: System MUST provide a Keyboard Shortcuts panel accessible via `?` key when no input is focused.
- **FR-002**: System MUST provide a Keyboard Shortcuts panel accessible via `Ctrl+/` (or `Cmd+/` on Mac).
- **FR-003**: Shortcuts panel MUST display as a modal dialog that can be closed via Escape, clicking outside, or close button.
- **FR-004**: Shortcuts panel MUST include a search input field that filters shortcuts in real-time.
- **FR-005**: Shortcuts panel MUST display shortcuts organized by functional category when not searching.
- **FR-006**: Shortcuts panel MUST be accessible only when a document is loaded (editor is active).

**Search Functionality**
- **FR-007**: Search MUST filter shortcuts by matching against key combination text (case-insensitive).
- **FR-008**: Search MUST filter shortcuts by matching against action description text (case-insensitive).
- **FR-009**: Search MUST update results in real-time as user types (no debounce needed for small dataset).
- **FR-010**: System MUST display "No shortcuts found" message when search yields no results.
- **FR-011**: Search field MUST be auto-focused when panel opens.

**Shortcut Display**
- **FR-012**: Each shortcut entry MUST display the key combination in a keyboard-key styled format.
- **FR-013**: Each shortcut entry MUST display the action description.
- **FR-014**: Category headers MUST be displayed when viewing all shortcuts (no search query).
- **FR-015**: System MUST hide category headers when search is active and display flat filtered results.

**Shortcut Categories**
- **FR-016**: System MUST organize shortcuts into the following categories: Canvas Navigation, Selection, Editing, Clipboard, Alignment, View Management, Grouping, Find/Replace, File, General.
- **FR-017**: Each category MUST be collapsible/expandable to reduce visual clutter.
- **FR-017a**: All categories MUST be expanded by default when the panel opens (better discoverability for first-time users).

**Centralized Registry**
- **FR-018**: System MUST maintain a single source of truth for all keyboard shortcuts in a centralized registry.
- **FR-019**: System MUST provide a typed interface for registering shortcuts with key combination, description, category, and optional context.
- **FR-020**: System MUST support Mac-specific key display (Cmd instead of Ctrl) based on detected platform.

**Conflict Detection**
- **FR-021**: System MUST detect duplicate key combinations during registry initialization.
- **FR-022**: System MUST log detected conflicts to console as warnings during development.
- **FR-023**: System MUST visually indicate conflicting shortcuts in the shortcuts panel with a warning icon (⚠️) and tooltip explaining the conflict.

**Panel Accessibility**
- **FR-026**: Shortcuts panel MUST support keyboard navigation: Tab to move between search and shortcut list, arrow keys to navigate shortcuts.
- **FR-027**: Each shortcut entry MUST be focusable for screen reader accessibility.

**Preferences Integration**
- **FR-024**: The existing Keyboard Shortcuts section in Preferences MUST use the centralized shortcut registry.
- **FR-025**: Preferences Keyboard Shortcuts section MUST provide a button to open the full searchable shortcuts panel.

### Key Entities

- **ShortcutDefinition**: Represents a single keyboard shortcut containing keys (string), description (string), category (ShortcutCategory), and optional context (when the shortcut is active).
- **ShortcutCategory**: Enum of functional categories (canvas, selection, editing, clipboard, alignment, viewManagement, grouping, findReplace, file, general).
- **ShortcutRegistry**: Centralized collection of all shortcut definitions with methods for querying, filtering, and conflict detection.
- **ShortcutConflict**: Represents a conflict between two shortcuts sharing the same key combination, containing the conflicting definitions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can open the Keyboard Shortcuts panel within 1 second of pressing `?` or `Ctrl+/`.
- **SC-002**: Users can find any shortcut within 5 seconds by typing a search term.
- **SC-003**: All 44 implemented shortcuts are catalogued in the centralized registry with accurate descriptions.
- **SC-004**: Search results update within 100ms of typing (instant feel for small dataset).
- **SC-005**: Zero shortcut conflicts exist in the default configuration (all conflicts resolved before release).
- **SC-006**: 90% of first-time users can discover how to zoom using the shortcuts panel without documentation.
- **SC-007**: Platform-specific key display (Ctrl vs Cmd) is accurate on both Windows/Linux and macOS.

---

## Existing Functionality for Reuse

The following existing codebase functionality can be leveraged for this feature:

1. **KEYBOARD_SHORTCUTS** (`src/domain/preferences/keyboardShortcuts.ts`): The existing shortcut data structure and 23 shortcuts already defined. This will be expanded to become the centralized registry.

2. **KeyboardShortcut/ShortcutCategory types** (`src/domain/preferences/types.ts`): Existing type definitions for shortcuts that can be extended.

3. **KeyboardShortcutsSection** (`src/components/PreferencesPanel/sections/KeyboardShortcutsSection.tsx`): Existing read-only shortcuts display in Preferences that should be refactored to use the new registry.

4. **useCanvasKeyboard** (`src/hooks/canvas/useCanvasKeyboard.ts`): Central keyboard handler that processes most shortcuts. The registry can document shortcuts defined here.

5. **handleSearchShortcut** (`src/domain/search/shortcuts.ts`): Search-related shortcuts (Ctrl+F, F3, etc.) that should be added to the registry.

6. **handleAlignmentShortcut** (`src/domain/alignment/shortcuts.ts`): Alignment shortcuts (Ctrl+Shift+L/C/R/T/M/B) that should be added to the registry.

7. **PreferencesPanel modal pattern** (`src/components/PreferencesPanel/PreferencesPanel.tsx`): The existing modal dialog pattern (overlay, panel, Escape handling) can be reused for the standalone shortcuts panel.

8. **CollapsibleSection** pattern: Used elsewhere in the app for expand/collapse behavior.

---

## Assumptions

The following assumptions were made based on the feature description and existing codebase patterns:

1. **Shortcuts are read-only**: Users cannot customize or remap keyboard shortcuts; the panel is for reference only.
2. **No shortcut context filtering**: All shortcuts are shown regardless of current editor state (the panel shows all possible shortcuts, not just currently available ones).
3. **Single modal at a time**: The shortcuts panel follows the existing pattern where only one modal can be open (opening shortcuts closes Preferences, etc.).
4. **Platform detection uses navigator.platform**: Standard approach to detect macOS vs Windows/Linux for key display.
5. **Search is client-side**: With 44 shortcuts, all filtering happens in-memory without performance concerns.
6. **Category expansion state is session-only**: Expand/collapse state is not persisted to localStorage. All categories start expanded by default for better discoverability.
7. **Conflicts are development-time only**: Conflict detection aids developers but should never occur in production builds.

---

## Technical Notes

### Complete Shortcut Catalog

Based on codebase analysis, the following shortcuts should be included in the centralized registry:

**Canvas Navigation** (10 shortcuts):
- `Space+Drag` - Pan canvas
- `Middle-mouse Drag` - Pan canvas
- `Ctrl+Drag` - Pan canvas (alternative)
- `Scroll Wheel` - Zoom in/out
- `+/=` - Zoom In
- `-` - Zoom Out
- `0` - Reset Zoom (100%)
- `F` - Fit to View
- `G` - Toggle Grid Visibility
- `Shift+G` - Toggle Snap to Grid

**Selection** (3 shortcuts):
- `Click` - Select view
- `Shift+Click` - Add to selection / Toggle selection
- `Ctrl+A` / `Cmd+A` - Select All

**Editing** (6 shortcuts):
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Y` - Redo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Redo (alternative)
- `Arrow Keys` - Nudge 1px
- `Shift+Arrow Keys` - Nudge 10px
- `Delete` / `Backspace` - Delete selected views

**Clipboard** (4 shortcuts):
- `Ctrl+C` / `Cmd+C` - Copy
- `Ctrl+X` / `Cmd+X` - Cut
- `Ctrl+V` / `Cmd+V` - Paste
- `Ctrl+D` / `Cmd+D` - Duplicate

**Alignment** (6 shortcuts):
- `Ctrl+Shift+L` - Align Left
- `Ctrl+Shift+C` - Align Center
- `Ctrl+Shift+R` - Align Right
- `Ctrl+Shift+T` - Align Top
- `Ctrl+Shift+M` - Align Middle
- `Ctrl+Shift+B` - Align Bottom

**View Management** (5 shortcuts):
- `S` - Toggle Smart Guides
- `Ctrl+;` - Toggle Custom Guides Visibility
- `Ctrl+L` / `Cmd+L` - Lock/Unlock Selected
- `Ctrl+H` / `Cmd+H` - Hide/Show Selected
- `Ctrl+Shift+H` / `Cmd+Shift+H` - Show All Hidden

**Grouping** (2 shortcuts):
- `Ctrl+G` / `Cmd+G` - Group selected views
- `Ctrl+Shift+G` / `Cmd+Shift+G` - Ungroup selected container

**Find/Replace** (4 shortcuts):
- `Ctrl+F` / `Cmd+F` - Open Find panel
- `Ctrl+Shift+F` / `Cmd+Shift+F` - Open Find/Replace panel
- `F3` - Find Next
- `Shift+F3` - Find Previous

**File** (2 shortcuts):
- `Ctrl+S` / `Cmd+S` - Save (future)
- `Ctrl+,` / `Cmd+,` - Open Preferences

**General** (2 shortcuts):
- `Escape` - Cancel operation / Clear selection / Close panel
- `?` or `Ctrl+/` - Open Keyboard Shortcuts panel

**Total: 44 shortcuts across 10 categories**

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
| FR-017a | PENDING | [Test or file that verifies this] |
| FR-018 | PENDING | [Test or file that verifies this] |
| FR-019 | PENDING | [Test or file that verifies this] |
| FR-020 | PENDING | [Test or file that verifies this] |
| FR-021 | PENDING | [Test or file that verifies this] |
| FR-022 | PENDING | [Test or file that verifies this] |
| FR-023 | PENDING | [Test or file that verifies this] |
| FR-024 | PENDING | [Test or file that verifies this] |
| FR-025 | PENDING | [Test or file that verifies this] |
| FR-026 | PENDING | [Test or file that verifies this] |
| FR-027 | PENDING | [Test or file that verifies this] |
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
