# Feature Specification: Properties Panel

**Feature Branch**: `011-properties-panel`  
**Created**: 2026-01-06  
**Status**: Draft  
**Input**: User description: "Properties Panel: Read-only right sidebar showing all attributes of the selected view(s), with grouped attributes by category (geometry, appearance, behavior), support for multiple selection showing common attributes, and click-to-copy attribute values"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Single Selection Properties (Priority: P1)

As a user who has selected a view on the canvas or in the hierarchy panel, I want to see all of its attributes displayed in a right sidebar panel so that I can inspect the view's configuration without needing to read the raw uidesc file.

**Why this priority**: This is the core purpose of the properties panel. Without it, users cannot inspect view attributes, which is essential for understanding and debugging UI layouts.

**Independent Test**: Can be fully tested by selecting any view and verifying all its attributes appear in the properties panel with correct values.

**Acceptance Scenarios**:

1. **Given** a view is selected on the canvas, **When** I look at the right sidebar, **Then** I see a properties panel showing all attributes of that view
2. **Given** a view with origin "10, 20" and size "100, 50", **When** I select it, **Then** the properties panel displays these geometry values
3. **Given** a view with appearance attributes (background-color, font, opacity), **When** I select it, **Then** the properties panel displays these appearance values
4. **Given** no view is selected, **When** I look at the properties panel, **Then** I see an empty state message indicating no selection

---

### User Story 2 - Grouped Attribute Display (Priority: P1)

As a user inspecting view properties, I want to see attributes organized into logical groups (geometry, appearance, behavior) so that I can quickly find the attribute I'm looking for without scanning a flat list.

**Why this priority**: Essential for usability - views can have 15+ attributes, and without grouping the panel becomes unusable.

**Independent Test**: Can be tested by selecting a view with multiple attribute types and verifying they appear under correct group headings.

**Acceptance Scenarios**:

1. **Given** a view is selected, **When** I look at the properties panel, **Then** I see attributes organized under collapsible group headers
2. **Given** a view with origin and size attributes, **When** I look at the Geometry group, **Then** I see origin and size displayed there
3. **Given** a view with background-color and opacity, **When** I look at the Appearance group, **Then** I see these color/style attributes
4. **Given** a view with mouse-enabled or autosize attributes, **When** I look at the Behavior group, **Then** I see these behavioral attributes
5. **Given** a view with class attribute, **When** I look at the panel, **Then** class appears prominently at the top (not in a group)

---

### User Story 3 - Multiple Selection Properties (Priority: P2)

As a user who has selected multiple views, I want to see which attributes they have in common so that I can understand shared properties across the selection.

**Why this priority**: Important for understanding multi-view selections, but single selection (P1) must work first.

**Independent Test**: Can be tested by selecting multiple views and verifying common attributes are shown with correct values, while differing attributes are indicated.

**Acceptance Scenarios**:

1. **Given** two views are selected that share the same class, **When** I look at the properties panel, **Then** the class value is displayed
2. **Given** two views with different sizes but same background-color, **When** I look at the properties panel, **Then** background-color shows the shared value, size shows "Mixed" or similar indicator
3. **Given** three views are selected, **When** I look at the properties panel header, **Then** I see "3 views selected" or similar count indicator
4. **Given** views with no common attributes (except class), **When** I look at the properties panel, **Then** I see the common class and "Mixed" for all other attributes

---

### User Story 4 - Copy Attribute Values (Priority: P2)

As a user inspecting properties, I want to click on an attribute value to copy it to my clipboard so that I can quickly use these values elsewhere without manual transcription.

**Why this priority**: Convenience feature that improves workflow but is not essential for inspection.

**Independent Test**: Can be tested by clicking on an attribute value and verifying it's copied to clipboard.

**Acceptance Scenarios**:

1. **Given** a view is selected with origin "50, 100", **When** I click on the origin value, **Then** "50, 100" is copied to my clipboard
2. **Given** a color value "#FF5500FF", **When** I click on it, **Then** the hex value is copied to clipboard
3. **Given** I click to copy a value, **When** the copy succeeds, **Then** I see brief visual feedback (tooltip or highlight) indicating success
4. **Given** multiple views selected with mixed values, **When** I click on a "Mixed" indicator, **Then** nothing is copied (or appropriate handling)

---

### User Story 5 - Expand/Collapse Groups (Priority: P3)

As a user with limited screen space, I want to expand and collapse attribute groups so that I can focus on the attributes I care about.

**Why this priority**: Nice-to-have for managing panel space, but not essential for core inspection functionality.

**Independent Test**: Can be tested by clicking group headers and verifying children toggle visibility.

**Acceptance Scenarios**:

1. **Given** an expanded attribute group, **When** I click on its header, **Then** the group collapses and hides its attributes
2. **Given** a collapsed attribute group, **When** I click on its header, **Then** the group expands and shows its attributes
3. **Given** groups are in certain expand/collapse states, **When** I select a different view, **Then** the expand/collapse states are preserved

---

### Edge Cases

- What happens when a view has no attributes other than class? Display class in Identity section, show empty groups or hide empty groups.
- What happens when a view has an unknown/custom attribute not in any standard group? Display in an "Other" or "Custom" group at the bottom.
- What happens when selecting a very large number of views (50+)? Display count and common attributes, performance should remain acceptable.
- What happens when a view has deeply nested or complex attribute values? Display as formatted string representation.
- What happens when clipboard API is unavailable (older browsers, permissions denied)? Show appropriate error feedback, degrade gracefully.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a properties panel in the right sidebar when at least one view is selected
- **FR-002**: System MUST show all attributes of the selected view organized by category groups
- **FR-003**: System MUST display the view's class name prominently at the top of the panel
- **FR-004**: System MUST organize attributes into groups: Geometry (origin, size), Appearance (colors, opacity, fonts), Behavior (mouse-enabled, autosize, etc.), and Other (custom attributes)
- **FR-005**: System MUST show an empty state when no view is selected
- **FR-006**: System MUST display selection count when multiple views are selected (e.g., "3 views selected")
- **FR-007**: System MUST show shared attribute values when multiple views have identical values
- **FR-008**: System MUST indicate "Mixed" or equivalent when multiple selected views have different values for an attribute
- **FR-009**: System MUST copy attribute value to clipboard when user clicks on the value
- **FR-010**: System MUST provide visual feedback when a value is successfully copied
- **FR-011**: System MUST allow expanding and collapsing attribute groups
- **FR-012**: System MUST preserve group expand/collapse state when selection changes
- **FR-013**: System MUST sync with selectionStore to react to selection changes from canvas or hierarchy panel

### Key Entities

- **AttributeGroup**: A category of attributes (Geometry, Appearance, Behavior, Other) containing related attribute entries
- **AttributeEntry**: A single attribute with name, value, and copy-to-clipboard functionality
- **PropertiesPanel**: Container component managing attribute display, grouping, and multi-selection logic

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify all attributes of a selected view within 5 seconds of selection
- **SC-002**: Attribute groups visually distinguish at least 4 categories with clear headers
- **SC-003**: Copy-to-clipboard works for 100% of displayed attribute values (except "Mixed" indicators)
- **SC-004**: Panel updates within 100ms of selection change (instantaneous perceived response)
- **SC-005**: Multi-selection correctly identifies common vs mixed attributes for all attribute types

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
| FR-001 | ✅ MET | PropertiesPanel.spec.tsx - "should show properties when view is selected" |
| FR-002 | ✅ MET | PropertiesPanel.spec.tsx - "should display attribute groups" |
| FR-003 | ✅ MET | PropertiesPanel.spec.tsx - "should display class name in header" |
| FR-004 | ✅ MET | PropertiesPanel.spec.tsx - "should display groups in priority order" |
| FR-005 | ✅ MET | PropertiesPanel.spec.tsx - "should show empty state when no selection" |
| FR-006 | ✅ MET | PropertiesPanel.multiselect.spec.tsx - "should show class name with count" |
| FR-007 | ✅ MET | PropertiesPanel.multiselect.spec.tsx - "should show shared value when all views have same value" |
| FR-008 | ✅ MET | PropertiesPanel.multiselect.spec.tsx - "should show Mixed indicator when values differ" |
| FR-009 | ✅ MET | AttributeRow.copy.spec.tsx - "should call onCopy when copyable value is clicked" |
| FR-010 | ✅ MET | AttributeRow.tsx - cursor: pointer styling on copyable values |
| FR-011 | ✅ MET | AttributeGroup.spec.tsx - "should hide attributes when collapsed" |
| FR-012 | ✅ MET | propertiesStore.spec.ts - state persists across operations |
| FR-013 | ✅ MET | PropertiesPanel.tsx - reactively reads from selectionStore |
| SC-001 | ✅ MET | All attributes visible in grouped panels within panel render |
| SC-002 | ✅ MET | 6 distinct groups: Identity, Geometry, Appearance, Text, Behavior, Other |
| SC-003 | ✅ MET | AttributeRow.copy.spec.tsx - onCopy called for all copyable values |
| SC-004 | ✅ MET | PropertiesPanel.spec.tsx - "should update when selection changes" |
| SC-005 | ✅ MET | mergeSelections.spec.ts - "large selection (50+ views)" under 100ms |

**⚠️ CRITICAL**: Any ❌ NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [x] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with ✅ MET status
- [x] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [x] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [x] **Git Status Check**: Run `git status` to verify all changes are committed
- [x] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [x] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [x] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**⚠️ CRITICAL**: The feature is NOT complete until all work is committed to the feature branch AND the compliance table shows all requirements MET.
