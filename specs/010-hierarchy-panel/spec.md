# Feature Specification: Hierarchy Panel

**Feature Branch**: `010-hierarchy-panel`  
**Created**: 2026-01-06  
**Status**: Draft  
**Input**: User description: "Hierarchy Panel: Tree view in left sidebar showing all views in the loaded uidesc template with expand/collapse, selection sync with canvas, and view icons by class type"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Template Hierarchy (Priority: P1)

As a user with a loaded uidesc template, I want to see a tree view in the left sidebar showing all views in hierarchical order so that I can understand the structure of my UI and navigate to specific views.

**Why this priority**: This is the core purpose of the hierarchy panel. Without it, users cannot navigate complex nested UIs where views overlap or are difficult to click on the canvas.

**Independent Test**: Can be fully tested by loading a uidesc file with nested views and verifying the tree displays all views with correct parent-child relationships.

**Acceptance Scenarios**:

1. **Given** a uidesc template is loaded with nested views, **When** I look at the left sidebar, **Then** I see a tree view showing all views with proper indentation reflecting parent-child hierarchy
2. **Given** a uidesc template with multiple nested containers, **When** I examine the tree, **Then** each view displays its class name as the label
3. **Given** no template is loaded, **When** I look at the left sidebar, **Then** I see an empty state message indicating no template is loaded

---

### User Story 2 - Expand and Collapse Containers (Priority: P1)

As a user working with complex templates, I want to expand and collapse container nodes in the tree so that I can focus on specific sections of the hierarchy without visual clutter.

**Why this priority**: Essential for usability with real-world templates that often have 50+ views. Without collapse, the tree becomes unusable.

**Independent Test**: Can be tested by loading a template with nested containers, clicking expand/collapse toggles, and verifying children visibility changes.

**Acceptance Scenarios**:

1. **Given** a container view with children in the tree, **When** I click the collapse toggle, **Then** its children are hidden from view
2. **Given** a collapsed container in the tree, **When** I click the expand toggle, **Then** its children become visible
3. **Given** a view with no children, **When** I look at its tree node, **Then** no expand/collapse toggle is displayed
4. **Given** a deeply nested hierarchy, **When** I collapse a parent container, **Then** all descendants (children, grandchildren, etc.) are hidden

---

### User Story 3 - Selection Sync: Tree to Canvas (Priority: P1)

As a user navigating the hierarchy panel, I want to click on a view in the tree to select it on the canvas so that I can quickly locate and select views that are hard to click directly on the canvas.

**Why this priority**: Core functionality that makes the hierarchy panel useful. Without selection sync, the panel is just a static list.

**Independent Test**: Can be tested by clicking a view in the tree and verifying it becomes selected on the canvas with visual indicators (border, handles).

**Acceptance Scenarios**:

1. **Given** a view in the tree, **When** I click on it, **Then** the view is selected on the canvas (shows selection border and resize handles)
2. **Given** a view is already selected, **When** I click a different view in the tree, **Then** the previous selection is cleared and the new view is selected
3. **Given** a view in the tree, **When** I Shift+click on it, **Then** it is added to the current selection (multi-select behavior)
4. **Given** multiple views selected, **When** I Shift+click on an already-selected view in the tree, **Then** it is removed from the selection

---

### User Story 4 - Selection Sync: Canvas to Tree (Priority: P1)

As a user selecting views on the canvas, I want the tree to reflect my selection so that I can see where the selected view sits in the hierarchy.

**Why this priority**: Bidirectional sync is essential for the panel to be useful. Users need to understand context when selecting on canvas.

**Independent Test**: Can be tested by clicking a view on the canvas and verifying the corresponding tree node shows selected state and is visible (parents expanded).

**Acceptance Scenarios**:

1. **Given** a view selected on the canvas, **When** I look at the tree, **Then** the corresponding tree node shows a selected visual state
2. **Given** a view is selected that is inside a collapsed container, **When** the selection happens, **Then** ancestor containers auto-expand to reveal the selected view
3. **Given** multiple views selected on canvas (via marquee or Shift+click), **When** I look at the tree, **Then** all corresponding tree nodes show selected state
4. **Given** selection is cleared on canvas (Escape or click empty), **When** I look at the tree, **Then** no tree nodes show selected state

---

### User Story 5 - View Icons by Class Type (Priority: P2)

As a user scanning the hierarchy, I want to see icons next to each view that indicate their class type so that I can quickly identify containers, controls, and display elements.

**Why this priority**: Visual enhancement that improves usability but not strictly required for core functionality.

**Independent Test**: Can be tested by loading a template with various view classes and verifying each displays an appropriate category icon.

**Acceptance Scenarios**:

1. **Given** a CViewContainer in the tree, **When** I look at its node, **Then** I see a container icon (folder-like)
2. **Given** a CTextButton or CKnob in the tree, **When** I look at its node, **Then** I see a control icon (interactive element indicator)
3. **Given** a CTextLabel in the tree, **When** I look at its node, **Then** I see a display icon (static content indicator)
4. **Given** an unknown/custom view class, **When** I look at its node, **Then** I see a generic custom icon

---

### User Story 6 - Scroll to Selection (Priority: P2)

As a user selecting views on a canvas with many views, I want the tree to scroll to show the selected item so that I don't have to manually scroll to find it.

**Why this priority**: Usability enhancement for large templates. Core sync works without it, but UX suffers.

**Independent Test**: Can be tested by loading a large template, scrolling tree to top, selecting a view at the bottom of hierarchy on canvas, and verifying tree scrolls to show it.

**Acceptance Scenarios**:

1. **Given** a view is selected on canvas that is outside the visible tree scroll area, **When** the selection happens, **Then** the tree scrolls to bring the selected node into view
2. **Given** a view is selected that is already visible in tree, **When** the selection happens, **Then** the tree does not scroll unnecessarily

---

### Edge Cases

- What happens when a template has no views (empty root container)? Display the root with no children.
- What happens when a view has an empty or missing class attribute? Display "Unknown" as the label with the custom icon.
- What happens when the hierarchy is extremely deep (20+ levels)? Tree handles indentation gracefully, possibly with maximum indent cap.
- What happens when a template has 500+ views? Tree renders efficiently without lag (virtualization may be needed in future, but initial implementation should handle typical sizes).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a tree view in the left sidebar when a uidesc template is loaded
- **FR-002**: System MUST show each view as a tree node with its class name as the label
- **FR-003**: System MUST display views in hierarchical structure reflecting parent-child relationships from the uidesc
- **FR-004**: System MUST show expand/collapse toggles on container views that have children
- **FR-005**: System MUST hide children of collapsed nodes and show children of expanded nodes
- **FR-006**: System MUST select the corresponding canvas view when a tree node is clicked
- **FR-007**: System MUST support Shift+click for adding/removing views from multi-selection in the tree
- **FR-008**: System MUST show selected visual state on tree nodes when their corresponding views are selected on canvas
- **FR-009**: System MUST auto-expand ancestor containers when a nested view is selected on canvas
- **FR-010**: System MUST display category icons (container, control, display, custom) next to each view based on its class
- **FR-011**: System MUST scroll the tree to show the selected node when selection changes from canvas
- **FR-012**: System MUST show an empty state message when no template is loaded
- **FR-013**: System MUST default all containers to expanded state when a template is first loaded

### Key Entities

- **TreeNode**: Represents a view in the hierarchy with id, label (class name), category, children array, and expanded state
- **HierarchyPanel**: Container component managing the tree display, expand/collapse state, and selection interaction

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can locate any view in the hierarchy within 5 seconds regardless of nesting depth
- **SC-002**: Selection sync between tree and canvas is instantaneous (under 100ms perceived latency)
- **SC-003**: Tree correctly displays 100% of views from loaded uidesc template with accurate hierarchy
- **SC-004**: 100% of container views with children show expand/collapse toggle
- **SC-005**: All four view categories (container, control, display, custom) are visually distinguishable via icons

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
- [ ] **Git Status Check**: Run `git status` to verify all changes are committed
- [ ] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [ ] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [ ] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns
