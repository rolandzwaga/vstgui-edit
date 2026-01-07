# Feature Specification: Smart Guides

**Feature Branch**: `015-smart-guides`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "Implement smart guides for view alignment - show visual guide lines when dragging views near sibling edges, centers, or parent centers, with optional spacing guides for equal distribution"

## Clarifications

### Session 2026-01-07

- Q: Which keyboard shortcut should toggle smart guides? → A: `S` key (mnemonic: "Smart guides")

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edge Alignment Guides (Priority: P1)

As a user, I want to see visual guide lines when I drag a view near the edge of a sibling view so I can align elements precisely without guessing.

**Why this priority**: Edge alignment is the most common alignment operation - users frequently want views to share the same left, right, top, or bottom edge. This is the core smart guide functionality.

**Independent Test**: Can be fully tested by dragging a view near a sibling's edge (within threshold) and verifying a guide line appears connecting the aligned edges.

**Acceptance Scenarios**:

1. **Given** I am dragging a view, **When** its left edge comes within 5 pixels of another view's left or right edge, **Then** a vertical guide line appears showing the alignment
2. **Given** I am dragging a view, **When** its top edge comes within 5 pixels of another view's top or bottom edge, **Then** a horizontal guide line appears showing the alignment
3. **Given** a guide line is visible, **When** I drag the view away from alignment (beyond threshold), **Then** the guide line disappears
4. **Given** multiple alignment opportunities exist, **When** I drag a view, **Then** all matching guide lines are displayed simultaneously

---

### User Story 2 - Center Alignment Guides (Priority: P1)

As a user, I want to see guide lines when a view's center aligns with another view's center so I can center elements relative to each other.

**Why this priority**: Center alignment is equally common as edge alignment - users frequently want to center elements vertically or horizontally relative to siblings.

**Independent Test**: Can be tested by dragging a view until its center aligns with a sibling's center and verifying a guide line appears.

**Acceptance Scenarios**:

1. **Given** I am dragging a view, **When** its horizontal center comes within 5 pixels of another view's horizontal center, **Then** a vertical guide line appears through both centers
2. **Given** I am dragging a view, **When** its vertical center comes within 5 pixels of another view's vertical center, **Then** a horizontal guide line appears through both centers
3. **Given** I am dragging a view, **When** its center aligns with both the horizontal and vertical center of a sibling, **Then** both guide lines appear forming a crosshair

---

### User Story 3 - Parent Center Guides (Priority: P2)

As a user, I want to see guide lines when I center a view within its parent container so I can position elements at the container's center.

**Why this priority**: Important for layout composition but less frequent than sibling alignment. Many UIs have centered headers, titles, or focal elements.

**Independent Test**: Can be tested by dragging a view to the center of its parent and verifying guide lines appear at the parent's center axes.

**Acceptance Scenarios**:

1. **Given** I am dragging a view within a container, **When** its horizontal center comes within 5 pixels of the parent's horizontal center, **Then** a vertical guide line appears at the parent's center
2. **Given** I am dragging a view within a container, **When** its vertical center comes within 5 pixels of the parent's vertical center, **Then** a horizontal guide line appears at the parent's center
3. **Given** the view is a child of the root template, **When** I drag it to the template center, **Then** parent center guides appear at the template's center

---

### User Story 4 - Spacing Guides (Priority: P3)

As a user, I want to see guide lines and distance labels when I position a view with equal spacing between other views so I can create evenly distributed layouts.

**Why this priority**: Advanced layout feature - useful for professional work but not essential for basic alignment. Edge and center guides cover most needs.

**Independent Test**: Can be tested by positioning a view between two others and verifying spacing guides appear when distances are equal.

**Acceptance Scenarios**:

1. **Given** three views A, B, C in a row, **When** I drag B such that distance A-B equals distance B-C (within 5 pixels), **Then** spacing guides appear showing the equal distances
2. **Given** spacing guides are visible, **When** they are displayed, **Then** distance labels show the pixel values
3. **Given** I am dragging a view, **When** its spacing from one neighbor matches the spacing between two other adjacent views, **Then** a guide indicates the matched spacing

---

### User Story 5 - Guide Appearance and Visibility (Priority: P2)

As a user, I want smart guides to have a distinct visual appearance that doesn't interfere with my work and I want to toggle them on/off.

**Why this priority**: Essential for usability - guides must be visible but not distracting, and users need control over their visibility.

**Independent Test**: Can be tested by verifying guide colors, toggling guides off, and confirming they no longer appear during drag.

**Acceptance Scenarios**:

1. **Given** smart guides are visible, **When** I look at them, **Then** they appear as colored lines (distinct from grid and selection) that extend across the canvas
2. **Given** smart guides are enabled, **When** I press the `S` key, **Then** smart guides are disabled and no longer appear during drag
3. **Given** smart guides are disabled, **When** I press the `S` key, **Then** smart guides are re-enabled

---

### Edge Cases

- What happens when a view aligns with multiple siblings simultaneously? All matching guide lines are displayed.
- What happens when dragging multiple selected views? Guides calculate based on the anchor view (the one being dragged directly).
- What happens when the view is the only child in a container? Only parent center guides are available (no sibling guides).
- What happens when smart guides are disabled? No guide lines appear regardless of alignment opportunities.
- What happens when both grid snap and smart guides suggest different positions? Grid snap takes precedence; smart guides provide visual feedback only (they do not snap).
- What happens when a view is aligned but outside the visible viewport? Guide lines still render if any portion is visible.
- What happens when dragging very fast? Guides update in real-time at 60fps.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display vertical guide lines when a dragged view's left or right edge aligns (within 5px) with any sibling view's left or right edge
- **FR-002**: System MUST display horizontal guide lines when a dragged view's top or bottom edge aligns (within 5px) with any sibling view's top or bottom edge
- **FR-003**: System MUST display vertical guide lines when a dragged view's horizontal center aligns (within 5px) with any sibling view's horizontal center
- **FR-004**: System MUST display horizontal guide lines when a dragged view's vertical center aligns (within 5px) with any sibling view's vertical center
- **FR-005**: System MUST display guide lines when a dragged view's center aligns with its parent container's center
- **FR-006**: System MUST extend guide lines across the full canvas viewport (not just between the two aligned views)
- **FR-007**: System MUST display all matching guide lines simultaneously when multiple alignments exist
- **FR-008**: System MUST hide guide lines when the alignment condition is no longer met (view moves beyond threshold)
- **FR-009**: System MUST use a visually distinct color for guide lines (different from grid, selection, and view borders)
- **FR-010**: System MUST provide a toggle to enable/disable smart guides (default: enabled)
- **FR-011**: System MUST respond to the `S` key to toggle smart guides on/off
- **FR-012**: System MUST display distance labels on spacing guides showing the pixel distance
- **FR-013**: System MUST show spacing guides when a view is positioned with equal distance between two adjacent views (within 5px tolerance)
- **FR-014**: System MUST calculate guides based on the anchor view when multiple views are selected and dragged
- **FR-015**: System MUST NOT apply snapping via smart guides (visual feedback only; grid snap handles snapping)
- **FR-016**: System MUST persist smart guides enabled/disabled state for the session (in-memory)

### Key Entities

- **SmartGuide**: Represents a single guide line - contains orientation (horizontal/vertical), position (coordinate), type (edge/center/spacing), and participating view IDs
- **GuideMatch**: Represents an alignment match - contains source edge/center, target edge/center, distance from exact alignment
- **SmartGuidesState**: Represents the current smart guides configuration - enabled flag, active guides during drag

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Guide lines appear within 16ms of a view entering alignment threshold (single frame response)
- **SC-002**: Guide lines disappear within 16ms of a view leaving alignment threshold
- **SC-003**: Users can align views edge-to-edge in a single drag operation with visual confirmation
- **SC-004**: 100% of edge and center alignments within threshold produce visible guide lines
- **SC-005**: Users can toggle smart guides visibility in under 500ms (single keypress)
- **SC-006**: Guide line rendering does not cause frame drops below 60fps during drag operations

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
| SC-001 | PENDING | [Measurement or test result] |
| SC-002 | PENDING | [Measurement or test result] |
| SC-003 | PENDING | [Measurement or test result] |
| SC-004 | PENDING | [Measurement or test result] |
| SC-005 | PENDING | [Measurement or test result] |
| SC-006 | PENDING | [Measurement or test result] |

**CRITICAL**: Any NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [ ] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with MET status
- [ ] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [ ] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [ ] **Git Status Check**: Run `git status` to verify all changes are committed
- [ ] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [ ] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [ ] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**CRITICAL**: The feature is NOT complete until all work is committed to the feature branch AND the compliance table shows all requirements MET.
