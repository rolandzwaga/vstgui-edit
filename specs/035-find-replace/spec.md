# Feature Specification: Find/Replace

**Feature Branch**: `035-find-replace`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Add Find/Replace functionality for searching and replacing view attributes in the VSTGUI-Edit visual editor"

## Clarifications

### Session 2026-01-11

- Q: Where does the Find panel appear on screen? → A: Floating panel at top-right of editor (VS Code style)
- Q: How does partial match work for class name search? → A: Substring/contains match ("Knob" matches "CKnob", "CAnimKnob", "KnobBase")
- Q: How does result list selection and keyboard navigation work? → A: Click selects in both list and canvas; Arrow keys navigate list, Enter selects on canvas
- Q: What is the debounce duration for real-time search? → A: 150ms (balanced responsiveness and efficiency)
- Q: Can users replace class names or only attribute values? → A: Attribute values only (colors, fonts, sizes, origins - class names are read-only)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Views by Class Name (Priority: P1)

As a plugin developer working with a complex UI containing dozens of knobs, sliders, and buttons, I want to quickly find all views of a specific type so I can select them for batch operations or verify their placement.

**Why this priority**: This is the most fundamental search capability. Audio plugin UIs often contain many instances of the same control type (e.g., 20+ CKnob controls for different parameters). Finding them quickly is essential for efficient editing.

**Independent Test**: Can be fully tested by loading a uidesc file, pressing Ctrl+F, typing "CKnob", and verifying matching views are listed and can be selected.

**Acceptance Scenarios**:

1. **Given** a document is loaded with multiple view types, **When** I press Ctrl+F, **Then** a Find panel opens with a search input field focused.
2. **Given** the Find panel is open, **When** I type "CKnob" in the search field, **Then** all views with class="CKnob" appear in the results list.
3. **Given** search results are displayed, **When** I click a result, **Then** that view is selected on the canvas and the canvas pans to show it.
4. **Given** search results are displayed, **When** I press Enter or click "Find Next", **Then** the next matching view is selected.
5. **Given** I am on the last search result, **When** I press "Find Next", **Then** the selection wraps to the first result.

---

### User Story 2 - Navigate Search Results (Priority: P1)

As a developer reviewing my UI layout, I want to step through search results one by one so I can verify each matching view's position and properties without losing my place.

**Why this priority**: Navigation is essential for search utility. Without it, users would need to manually click each result, defeating the purpose of search.

**Independent Test**: Can be fully tested by searching for any term, then using Find Next/Find Previous to cycle through results while verifying selection changes.

**Acceptance Scenarios**:

1. **Given** multiple search results exist, **When** I click "Find Next" or press F3, **Then** the next result is selected and highlighted.
2. **Given** multiple search results exist, **When** I click "Find Previous" or press Shift+F3, **Then** the previous result is selected and highlighted.
3. **Given** search results exist, **When** navigating results, **Then** the result count indicator shows "N of M" (e.g., "3 of 12").
4. **Given** a view is selected via search, **When** the canvas view does not contain that view, **Then** the canvas automatically pans to center the selected view.

---

### User Story 3 - Search by Attribute Values (Priority: P2)

As a developer standardizing my UI appearance, I want to find all views using a specific color, font, or size so I can verify consistency or identify views that need updating.

**Why this priority**: Attribute search enables powerful workflows like "find all views with background-color=#FF0000" to standardize colors. This builds on basic class search.

**Independent Test**: Can be fully tested by searching for an attribute value (e.g., "size:100, 50") and verifying only views with that exact attribute value appear.

**Acceptance Scenarios**:

1. **Given** the Find panel is open, **When** I type "background-color:#FF5500FF", **Then** all views with that exact background color appear in results.
2. **Given** the Find panel is open, **When** I type "origin:10, 20", **Then** views with origin="10, 20" appear in results.
3. **Given** the Find panel is open, **When** I type "font:MyFont", **Then** views referencing that font appear in results.
4. **Given** an attribute search, **When** results are displayed, **Then** the matching attribute and value are shown in the result context.

---

### User Story 4 - Filter by View Category (Priority: P2)

As a developer organizing my layout, I want to filter search results by view category (container, control, display) so I can focus on specific types of UI elements.

**Why this priority**: Category filtering reduces noise when searching large documents. A user looking for controls does not want to see containers in results.

**Independent Test**: Can be fully tested by enabling the "Controls only" filter and verifying only control-type views appear in search results.

**Acceptance Scenarios**:

1. **Given** the Find panel is open, **When** I enable the "Containers" filter, **Then** only container views (CViewContainer, CScrollView, etc.) appear in results.
2. **Given** the Find panel is open, **When** I enable the "Controls" filter, **Then** only control views (CKnob, CSlider, CTextButton, etc.) appear in results.
3. **Given** the Find panel is open, **When** I enable multiple category filters, **Then** views matching any enabled category appear.
4. **Given** no category filters are enabled, **When** I search, **Then** all view categories are included in results.

---

### User Story 5 - Replace Attribute Values (Priority: P3)

As a developer refactoring my UI, I want to replace a specific attribute value across multiple matching views so I can efficiently update colors, sizes, or other properties in bulk.

**Why this priority**: Replace is a powerful but more advanced feature. Users must first be comfortable with Find before needing Replace. Also higher risk of unintended changes.

**Independent Test**: Can be fully tested by finding views with a specific color, entering a replacement color, clicking "Replace All", and verifying all matching views are updated with undo support.

**Acceptance Scenarios**:

1. **Given** the Find panel is open, **When** I press Ctrl+Shift+F or click "Replace" tab, **Then** the panel expands to show replace controls.
2. **Given** Replace mode is active with "background-color:#FF0000" as search and "#00FF00" as replacement, **When** I click "Replace", **Then** the currently selected view's background-color changes to #00FF00.
3. **Given** Replace mode with valid search/replace values, **When** I click "Replace All", **Then** all matching views are updated in a single operation.
4. **Given** a Replace or Replace All operation completed, **When** I press Ctrl+Z, **Then** all replaced values revert to their original state.
5. **Given** Replace mode is active, **When** I hover over "Replace All", **Then** a tooltip shows the count of views that will be affected.

---

### User Story 6 - Filter by Parent Container (Priority: P3)

As a developer working on a specific section of my UI, I want to search only within a particular container so I can focus on views in that area without seeing results from other parts of the layout.

**Why this priority**: Parent filtering is useful for complex UIs but requires the user to first understand the hierarchy. Less commonly needed than other filters.

**Independent Test**: Can be fully tested by selecting a container, enabling "Search within selected", then searching and verifying only descendants appear.

**Acceptance Scenarios**:

1. **Given** a container view is selected, **When** I enable "Search within selection" option, **Then** search only matches views that are descendants of the selected container.
2. **Given** "Search within selection" is enabled with no selection, **When** I search, **Then** all views are searched (filter has no effect).
3. **Given** "Search within selection" is enabled, **When** I select a different container, **Then** the search scope updates to the newly selected container's descendants.

---

### Edge Cases

- What happens when search finds no results? Display "No matches found" message with suggestions (e.g., "Try searching by class name like 'CKnob'").
- What happens when the document has no views? Display "No views in document" and disable search.
- What happens when Replace would create invalid attribute values? Show validation error and prevent the replace operation.
- How does search handle special characters? Support escaping special characters with backslash (e.g., searching for literal ":" requires "\:", so "font\:name" searches for text containing "font:name" rather than attribute "font" with value "name").
- What happens when replacing values on locked views? Skip locked views and show count of skipped views in the result message.
- What happens when the user closes the Find panel during Replace All? Cancel the operation and undo any partially completed replacements.

## Requirements *(mandatory)*

### Functional Requirements

**Search Panel**
- **FR-001**: System MUST provide a Find panel accessible via Ctrl+F keyboard shortcut.
- **FR-002**: System MUST provide a Find and Replace panel accessible via Ctrl+Shift+F keyboard shortcut.
- **FR-003**: Find panel MUST include a text input field for search queries.
- **FR-004**: Find panel MUST display search results in a scrollable list.
- **FR-005**: Each result item MUST show the view's class name, ID path, and relevant attribute context.
- **FR-006**: Find panel MUST display total result count (e.g., "12 results").
- **FR-034**: Find panel MUST be a floating panel positioned at the top-right of the editor viewport (VS Code style), not blocking canvas interaction.

**Search Capabilities**
- **FR-007**: System MUST support searching by view class name using substring/contains matching (e.g., "Knob" matches "CKnob", "CAnimKnob", "KnobBase").
- **FR-008**: System MUST support searching by attribute values using "attribute:value" syntax.
- **FR-009**: System MUST support filtering results by view category (container, control, display, custom).
- **FR-010**: System MUST support case-insensitive search by default.
- **FR-011**: System MUST update search results in real-time as the user types with 150ms debounce.

**Navigation**
- **FR-012**: Users MUST be able to navigate to the next result via "Find Next" button or F3 key.
- **FR-013**: Users MUST be able to navigate to the previous result via "Find Previous" button or Shift+F3 key.
- **FR-014**: System MUST automatically select the navigated-to view on the canvas.
- **FR-015**: System MUST pan the canvas to center the selected result in the viewport if it is not already visible.
- **FR-016**: System MUST show current position in results (e.g., "3 of 12").
- **FR-017**: Navigation MUST wrap from last result to first and vice versa.
- **FR-035**: Clicking a result MUST select it in both the result list and on the canvas simultaneously.
- **FR-036**: Arrow Up/Down keys MUST navigate through the result list when the list has focus.
- **FR-037**: Pressing Enter in the result list MUST select the highlighted result on the canvas.

**Result Highlighting**
- **FR-018**: System MUST visually highlight all matching views on the canvas while Find panel is open.
- **FR-019**: System MUST distinguish between the current result (selected) and other matches.
- **FR-020**: Highlight styling MUST not interfere with normal selection appearance.

**Replace Operations**
- **FR-021**: Replace panel MUST include a "Replace with" text input field.
- **FR-022**: Users MUST be able to replace the current match's attribute value via "Replace" button.
- **FR-023**: Users MUST be able to replace all matches via "Replace All" button.
- **FR-024**: System MUST validate replacement values before applying.
- **FR-025**: All replace operations MUST be undoable as a single history entry.
- **FR-026**: System MUST skip locked views during replace operations and report the count.
- **FR-038**: Replace operations MUST only modify attribute values (colors, fonts, sizes, origins); class names are read-only and cannot be replaced.

**Scope Filtering**
- **FR-027**: Users MUST be able to restrict search to descendants of selected containers.
- **FR-028**: Category filter MUST support multi-select (e.g., containers AND controls).
- **FR-029**: Filter state MUST persist during the session but reset when the Find panel is closed.

**Panel Behavior**
- **FR-030**: Pressing Escape MUST close the Find panel.
- **FR-031**: Find panel MUST not block interaction with the canvas.
- **FR-032**: Find panel MUST remember the last search query during the session.
- **FR-033**: System MUST clear search highlighting when the Find panel is closed.

### Key Entities

- **SearchQuery**: Represents a parsed search request with search type (class/attribute), search term, value (for attribute searches), filters (categories, scope).
- **SearchResult**: Represents a single match containing view ID, matched attribute name, matched value, display context (parent path).
- **SearchState**: Represents the current search session state including query, results array, current index, filters, and replace value.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find any view by class name within 3 seconds of typing.
- **SC-002**: Search results update within 200ms of typing (150ms debounce ± 50ms tolerance).
- **SC-003**: Users can navigate through 50+ results using Find Next/Previous without performance degradation.
- **SC-004**: Replace All operation on 100 views completes within 1 second.
- **SC-005**: All replace operations are fully undoable with a single Ctrl+Z.
- **SC-006**: 90% of first-time users can successfully find a view by class name without documentation.
- **SC-007**: Search highlighting is visible and distinguishable from normal selection.
- **SC-008**: Zero data loss from Replace operations (undo always restores original state).

---

## Existing Functionality for Reuse

The following existing codebase functionality can be leveraged for this feature:

1. **selectionStore** (`src/stores/selectionStore.ts`): Use `select()`, `selectAll()`, and `clearSelection()` for selecting search results on the canvas. The existing selection infrastructure handles canvas highlighting.

2. **flattenHierarchy** (`src/domain/canvas/flattenHierarchy.ts`): Use to get a flat array of all RenderableViews for searching. This already computes absolute positions and parent relationships.

3. **getViewCategory** (`src/domain/canvas/viewCategory.ts`): Use `CONTAINER_CLASSES`, `CONTROL_CLASSES`, `DISPLAY_CLASSES` sets and `getViewCategory()` function for category filtering.

4. **historyStore** (`src/stores/historyStore.ts`): Use `pushOperation()` for adding replace operations to undo/redo history. Follow the existing `HistoryOperation` pattern.

5. **lockHideStore** (`src/stores/lockHideStore.ts`): Use `isLocked()` to skip locked views during replace operations.

6. **canvasStore** (`src/stores/canvasStore.ts`): Use existing pan functions to center the canvas on selected search results.

7. **groupAttributes** (`src/domain/properties/groupAttributes.ts`): Reference `ATTRIBUTE_GROUP_MAP` for understanding which attributes exist and their groupings.

8. **CollapsibleSection** (`src/components/CollapsibleSection/`): Reuse for collapsible filter sections in the Find panel.

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
| FR-020 | PENDING | [Test or file that verifies this] |
| FR-021 | PENDING | [Test or file that verifies this] |
| FR-022 | PENDING | [Test or file that verifies this] |
| FR-023 | PENDING | [Test or file that verifies this] |
| FR-024 | PENDING | [Test or file that verifies this] |
| FR-025 | PENDING | [Test or file that verifies this] |
| FR-026 | PENDING | [Test or file that verifies this] |
| FR-027 | PENDING | [Test or file that verifies this] |
| FR-028 | PENDING | [Test or file that verifies this] |
| FR-029 | PENDING | [Test or file that verifies this] |
| FR-030 | PENDING | [Test or file that verifies this] |
| FR-031 | PENDING | [Test or file that verifies this] |
| FR-032 | PENDING | [Test or file that verifies this] |
| FR-033 | PENDING | [Test or file that verifies this] |
| FR-034 | PENDING | [Test or file that verifies this] |
| FR-035 | PENDING | [Test or file that verifies this] |
| FR-036 | PENDING | [Test or file that verifies this] |
| FR-037 | PENDING | [Test or file that verifies this] |
| FR-038 | PENDING | [Test or file that verifies this] |
| SC-001 | PENDING | [Measurement or test result] |
| SC-002 | PENDING | [Measurement or test result] |
| SC-003 | PENDING | [Measurement or test result] |
| SC-004 | PENDING | [Measurement or test result] |
| SC-005 | PENDING | [Measurement or test result] |
| SC-006 | PENDING | [Measurement or test result] |
| SC-007 | PENDING | [Measurement or test result] |
| SC-008 | PENDING | [Measurement or test result] |

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
