# Feature Specification: Custom Guides

**Feature Branch**: `033-custom-guides`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "Custom guides that can be created by dragging from rulers. This builds on the 032-rulers feature that was just completed."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Guide by Dragging from Ruler (Priority: P1)

As an audio plugin developer, I want to drag from the horizontal or vertical ruler to create a guide line on the canvas so that I can establish precise alignment references for positioning UI elements.

**Why this priority**: This is the fundamental value proposition of custom guides - the ability to create persistent alignment references. Without this capability, users cannot create any guides. This enables all other guide functionality.

**Independent Test**: Can be fully tested by dragging from a ruler and verifying a guide line appears and persists on the canvas. Delivers immediate value for layout alignment.

**Acceptance Scenarios**:

1. **Given** a template is loaded and rulers are visible, **When** I press and drag from the horizontal ruler downward onto the canvas, **Then** a horizontal guide line appears and follows my cursor position
2. **Given** a template is loaded and rulers are visible, **When** I press and drag from the vertical ruler rightward onto the canvas, **Then** a vertical guide line appears and follows my cursor position
3. **Given** I am dragging a guide from a ruler, **When** I release the mouse button over the canvas, **Then** the guide is created at that position and persists on the canvas
4. **Given** I am dragging a guide from a ruler, **When** I release the mouse button outside the canvas viewport, **Then** the guide is not created (drag is cancelled)
5. **Given** I am dragging a guide from a ruler, **When** I press Escape, **Then** the drag is cancelled and no guide is created

---

### User Story 2 - Snap to Guides During Move/Resize (Priority: P1)

As an audio plugin developer, I want views to snap to my custom guides during move and resize operations so that I can quickly align elements to my established reference lines.

**Why this priority**: Snapping is the primary reason users create guides. Without snap functionality, guides are merely visual references with limited utility. This makes guides actionable and significantly improves productivity.

**Independent Test**: Can be fully tested by creating a guide, then dragging a view near it and verifying it snaps to the guide position.

**Acceptance Scenarios**:

1. **Given** a horizontal guide exists at Y=100 and guide snapping is enabled, **When** I drag a view's top edge near Y=100 (within snap threshold), **Then** the view snaps so its top edge aligns with the guide
2. **Given** a vertical guide exists at X=200 and guide snapping is enabled, **When** I resize a view's right edge near X=200 (within snap threshold), **Then** the edge snaps to align with the guide
3. **Given** guide snapping is disabled, **When** I drag a view near a guide, **Then** no snapping occurs and the view moves freely
4. **Given** both grid snapping and guide snapping are enabled, **When** I drag a view, **Then** the view can snap to whichever reference (grid or guide) is closest within threshold

---

### User Story 3 - Visual Guide Display (Priority: P1)

As an audio plugin developer, I want to see my custom guides rendered as distinct lines on the canvas so that I can visually reference them while positioning elements.

**Why this priority**: Guides must be visible to be useful. This is a core requirement that enables visual reference during layout work.

**Independent Test**: Can be fully tested by creating guides and verifying they render with appropriate visual style that distinguishes them from other canvas elements.

**Acceptance Scenarios**:

1. **Given** a horizontal guide exists at Y=150, **When** viewing the canvas, **Then** a horizontal line spans the full canvas width at Y=150
2. **Given** a vertical guide exists at X=300, **When** viewing the canvas, **Then** a vertical line spans the full canvas height at X=300
3. **Given** guides exist, **When** panning the canvas, **Then** guides remain fixed at their canvas coordinates (move with pan)
4. **Given** guides exist, **When** zooming the canvas, **Then** guides scale appropriately with the canvas content

---

### User Story 4 - Toggle Guide Visibility (Priority: P2)

As an audio plugin developer, I want to show or hide all guides so that I can temporarily clear visual clutter when needed while preserving my guide positions for later use.

**Why this priority**: Visibility toggle is an important usability feature but not essential for core guide functionality. Users can work with always-visible guides, but hiding them temporarily improves workflow flexibility.

**Independent Test**: Can be fully tested by creating guides, toggling visibility off, verifying guides disappear visually, then toggling back on.

**Acceptance Scenarios**:

1. **Given** guides exist and are visible, **When** I toggle guide visibility off (Ctrl+;), **Then** all guides disappear from the canvas but are not deleted
2. **Given** guides are hidden, **When** I toggle guide visibility on (Ctrl+;), **Then** all guides reappear at their original positions
3. **Given** guides are hidden, **When** I drag a view near where a guide would be, **Then** no snapping to guides occurs (hidden guides do not snap)
4. **Given** guides are hidden, **When** I drag from a ruler, **Then** I can still create new guides (which appear immediately)

---

### User Story 5 - Delete Individual Guide (Priority: P2)

As an audio plugin developer, I want to delete individual guides so that I can remove guides that are no longer needed without affecting other guides.

**Why this priority**: Guide management is important for maintaining a clean workspace. Without deletion, users accumulate unwanted guides that clutter the canvas.

**Independent Test**: Can be fully tested by creating a guide, selecting and deleting it, and verifying it is removed.

**Acceptance Scenarios**:

1. **Given** a guide exists, **When** I double-click on the guide line, **Then** the guide is deleted
2. **Given** a guide exists, **When** I drag the guide back onto its source ruler (horizontal guide to top ruler, vertical guide to left ruler), **Then** the guide is deleted
3. **Given** multiple guides exist, **When** I delete one guide, **Then** only that guide is removed and others remain

---

### User Story 6 - Precise Guide Positioning (Priority: P2)

As an audio plugin developer, I want to position a guide at an exact coordinate using numeric input so that I can create precisely placed alignment references without relying on visual drag accuracy.

**Why this priority**: Precise positioning enables professional-grade layouts where guides must be at exact pixel positions. This complements drag-to-create for users who need exactness.

**Independent Test**: Can be fully tested by entering a numeric position and verifying a guide is created at exactly that coordinate.

**Acceptance Scenarios**:

1. **Given** I right-click on a ruler, **When** the context menu appears, **Then** I see an option to "Add Guide at Position..."
2. **Given** I select "Add Guide at Position...", **When** a dialog appears, **Then** I can enter a numeric pixel value
3. **Given** I enter position 250 in the dialog, **When** I confirm, **Then** a guide is created at exactly that coordinate
4. **Given** I right-click on an existing guide, **When** the context menu appears, **Then** I see the current position and can enter a new position to move the guide

---

### User Story 7 - Drag to Reposition Guide (Priority: P3)

As an audio plugin developer, I want to drag existing guides to new positions so that I can adjust my alignment references without deleting and recreating them.

**Why this priority**: Repositioning is a convenience feature. Users can achieve the same result by deleting and recreating guides, but direct repositioning is more efficient.

**Independent Test**: Can be fully tested by dragging an existing guide to a new position and verifying it moves.

**Acceptance Scenarios**:

1. **Given** a horizontal guide exists at Y=100, **When** I click and drag the guide line, **Then** the guide moves vertically following my cursor
2. **Given** I am dragging a guide, **When** I release the mouse, **Then** the guide stays at the new position
3. **Given** I am dragging a guide, **When** I press Escape, **Then** the guide returns to its original position
4. **Given** snap-to-grid is enabled, **When** I drag a guide, **Then** the guide can snap to grid positions during repositioning

---

### User Story 8 - Clear All Guides (Priority: P3)

As an audio plugin developer, I want to remove all guides at once so that I can quickly start fresh when my current guides are no longer relevant.

**Why this priority**: Bulk deletion is a convenience feature for starting fresh. Lower priority since individual deletion is available.

**Independent Test**: Can be fully tested by creating multiple guides and using clear all to remove them.

**Acceptance Scenarios**:

1. **Given** multiple guides exist, **When** I select "Clear All Guides" from the View menu or context menu, **Then** all guides are removed
2. **Given** I have cleared all guides, **When** I view the canvas, **Then** no guides are visible and I can create new ones

---

### Edge Cases

- What happens when dragging a guide from ruler while canvas is panned/zoomed? The guide position should be calculated correctly in canvas coordinates, accounting for pan offset and zoom level.
- What happens when a guide position is outside the visible viewport? The guide should still exist and render when panned into view.
- How do guides behave when the template is unloaded? Guides should be cleared when no template is loaded, as they have no context without canvas content.
- What happens when trying to create a guide at a position where one already exists? The new guide replaces the existing one at that exact position (no duplicate guides at same position).
- What is the maximum number of guides? The system supports up to 50 simultaneous guides without performance degradation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create horizontal guides by dragging from the horizontal ruler onto the canvas
- **FR-002**: System MUST allow users to create vertical guides by dragging from the vertical ruler onto the canvas
- **FR-003**: System MUST show a visual preview of the guide during the drag operation before release
- **FR-004**: System MUST persist created guides until explicitly deleted or template is unloaded
- **FR-005**: System MUST render guides as lines spanning the full canvas dimension (width for horizontal, height for vertical)
- **FR-006**: Guides MUST be visually distinct from other canvas elements (smart guides, grid, selection)
- **FR-007**: Guides MUST remain at fixed canvas coordinates when panning (move with canvas content)
- **FR-008**: Guides MUST scale appropriately when zooming (position and line rendering adjust with zoom)
- **FR-009**: System MUST support snapping view edges to guides during move operations when guide snapping is enabled
- **FR-010**: System MUST support snapping view edges to guides during resize operations when guide snapping is enabled
- **FR-011**: System MUST provide a toggle to enable/disable guide snapping independently of grid snapping
- **FR-012**: System MUST provide a toggle to show/hide all guides (Ctrl+;)
- **FR-013**: Hidden guides MUST NOT participate in snapping
- **FR-014**: System MUST allow deletion of individual guides by double-clicking the guide line
- **FR-015**: System MUST allow deletion of individual guides by dragging them back to their source ruler
- **FR-016**: System MUST allow precise guide creation via numeric input from ruler context menu
- **FR-017**: System MUST allow repositioning existing guides by dragging them to new positions
- **FR-018**: System MUST support cancelling guide operations with Escape key
- **FR-019**: System MUST clear all guides when the template is unloaded
- **FR-020**: System MUST prevent duplicate guides at the exact same position (same orientation and coordinate)
- **FR-021**: System MUST provide a "Clear All Guides" action to remove all guides at once
- **FR-022**: System MUST support undo/redo for all guide operations (create, delete, reposition, clear all) via the history system (Ctrl+Z/Ctrl+Y)

### Key Entities

- **CustomGuide**: A user-created alignment reference line. Has orientation (horizontal/vertical), position (canvas coordinate), and unique identifier. Distinguished from SmartGuides which are ephemeral and calculated during drag operations.
- **GuidesState**: The collection of all custom guides with visibility state. Contains list of guides, visibility toggle, and snap-enabled toggle.
- **GuideCreateDrag**: Transient state during guide creation from ruler. Tracks source ruler, current position, and whether drag is valid (over canvas).
- **GuideRepositionDrag**: Transient state during guide repositioning. Tracks original position for Escape cancellation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a guide by dragging from ruler in under 2 seconds
- **SC-002**: Guide snapping activates within 16ms (single frame) when a view edge enters snap threshold
- **SC-003**: Guides render without visual artifacts or flickering during pan/zoom operations
- **SC-004**: System supports at least 50 simultaneous guides without performance degradation
- **SC-005**: 100% of guide-related unit tests pass covering all functional requirements
- **SC-006**: Guide positions remain accurate to single-pixel precision at all zoom levels (10%-500%)
- **SC-007**: Guide creation, deletion, and repositioning provide immediate visual feedback

---

## Clarifications

### Session 2026-01-10

- Q: What visual style should guides use to be distinct from smart guides and grid? → A: Dashed cyan lines (#00BFFF, 1px, 4px dash pattern)
- Q: Should guide operations (create, delete, reposition, clear all) be undoable via Ctrl+Z/Ctrl+Y? → A: Full undo/redo support for all guide operations
- Q: Should guides persist to localStorage to survive browser refresh? → A: No persistence - guides are ephemeral and lost on page refresh
- Q: How should guides remain visible when overlapping content that matches their color? → A: Dashed line pattern (alternating color and transparent) for universal visibility
- Q: How should guide line thickness behave when the canvas is zoomed? → A: Constant screen-space thickness (always 1px regardless of zoom level)
- Q: What is the hit testing tolerance for guide interactions (double-click delete, drag to reposition)? → A: 4 pixels either side of the 1px guide line (total 9px hit zone)
- Q: When both grid and guide are within snap threshold at equal distances, which takes precedence? → A: Guide takes precedence over grid (guides are explicit user-created references)

## Assumptions

- Guide line thickness is 1px in screen-space (constant regardless of zoom level) to maintain precision and consistent visibility at all zoom levels
- Guide color is cyan (#00BFFF) with dashed line pattern (alternating color and transparent) for universal visibility on any background
- Guide snap threshold uses the same default as grid snap (from DEFAULT_SNAP_THRESHOLD) for consistency
- Guides are stored in memory only - they are ephemeral editor-only artifacts not persisted to uidesc file or localStorage (lost on page refresh)
- The Ctrl+; shortcut follows common design tool conventions for guide visibility toggle
- Context menu for precise positioning uses native browser context menu styling
- Guide lines render above template content but below selection overlays in the z-order
- When both grid and guide are within snap threshold, the closer reference takes precedence; at equal distances, guides take precedence over grid
- Guide hit testing uses a 4px tolerance either side of the 1px line (total 9px click zone) for double-click delete and drag-to-reposition interactions

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
  ALL requirements MUST show MET status for completion.
-->

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
