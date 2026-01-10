# Feature Specification: Canvas Rulers

**Feature Branch**: `032-rulers`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "Add horizontal and vertical rulers to the canvas editor that provide visual coordinate context and professional editing capabilities"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Coordinate Reference (Priority: P1)

As an audio plugin developer, I want to see horizontal and vertical rulers along the canvas edges so that I can understand the coordinate positions of UI elements without mentally calculating offsets.

**Why this priority**: This is the fundamental value proposition of rulers - providing visual coordinate context. Without rulers, users must guess positions or rely solely on the properties panel. This enables all other ruler-based functionality.

**Independent Test**: Can be fully tested by loading any template and verifying rulers display with readable tick marks and numbers. Delivers immediate value for positioning reference.

**Acceptance Scenarios**:

1. **Given** a template is loaded, **When** the canvas displays, **Then** a horizontal ruler appears along the top edge and a vertical ruler appears along the left edge
2. **Given** rulers are visible, **When** viewing the rulers, **Then** numbered tick marks show coordinate positions in pixels starting from 0
3. **Given** rulers are visible, **When** the template bounds are 600x400 pixels, **Then** the horizontal ruler shows marks from 0 to at least 600 and vertical ruler shows marks from 0 to at least 400

---

### User Story 2 - Zoom-Aware Scaling (Priority: P1)

As an audio plugin developer, I want the rulers to scale appropriately when I zoom in or out so that the coordinate reference remains accurate and readable at any zoom level.

**Why this priority**: Zoom is a core canvas interaction (already implemented). Rulers must remain useful across all zoom levels to provide value. Without zoom awareness, rulers would show wrong coordinates or become unreadable.

**Independent Test**: Can be fully tested by zooming in/out and verifying ruler numbers update correctly and tick spacing adjusts for readability.

**Acceptance Scenarios**:

1. **Given** rulers are visible at 100% zoom, **When** I zoom in to 200%, **Then** the ruler tick spacing doubles visually but the coordinate numbers remain accurate
2. **Given** rulers are visible at 100% zoom, **When** I zoom out to 50%, **Then** the ruler tick spacing halves visually and tick density adjusts for readability
3. **Given** rulers are visible at any zoom level, **When** a view is positioned at canvas coordinate (150, 75), **Then** the rulers accurately indicate those coordinates regardless of zoom

---

### User Story 3 - Pan-Aware Origin (Priority: P1)

As an audio plugin developer, I want the rulers to reflect the current pan offset so that I can always identify the canvas origin and understand where I am within the template.

**Why this priority**: Pan is another core canvas interaction. When the canvas is panned, the rulers must show where the viewport is relative to the template origin (0,0). This is essential for spatial awareness.

**Independent Test**: Can be fully tested by panning the canvas and verifying ruler numbers shift appropriately and an origin indicator remains visible.

**Acceptance Scenarios**:

1. **Given** the canvas is at pan offset (0, 0), **When** viewing the rulers, **Then** both rulers show 0 at the intersection corner (canvas origin)
2. **Given** the canvas is panned so origin is off-screen, **When** viewing the rulers, **Then** the rulers show the correct coordinates for the visible area (e.g., horizontal starts at -100 if panned right by 100)
3. **Given** the canvas is panned, **When** viewing the ruler intersection corner, **Then** a visual origin marker indicates the current pan offset values

---

### User Story 4 - Major and Minor Tick Marks (Priority: P2)

As an audio plugin developer, I want rulers to show major tick marks with numbers at significant intervals and minor ticks in between so that I can quickly estimate positions without visual clutter.

**Why this priority**: Readability and usability enhancement. Major/minor tick hierarchy reduces cognitive load and matches professional design tool conventions. Not blocking for basic functionality but significantly improves user experience.

**Independent Test**: Can be fully tested by examining ruler rendering and verifying tick mark hierarchy is visible with appropriate number labeling.

**Acceptance Scenarios**:

1. **Given** rulers are visible at 100% zoom, **When** examining tick marks, **Then** major ticks appear every 100 pixels with visible numbers
2. **Given** rulers are visible at 100% zoom, **When** examining tick marks, **Then** minor ticks appear between major ticks at appropriate intervals (e.g., every 10px)
3. **Given** rulers are visible at very high zoom (400%+), **When** examining tick marks, **Then** additional tick detail becomes visible (e.g., every 10px becomes numbered)
4. **Given** rulers are visible at very low zoom (25%), **When** examining tick marks, **Then** tick density reduces to maintain readability (e.g., major ticks every 200px)

---

### User Story 5 - Cursor Position Indicator (Priority: P2)

As an audio plugin developer, I want to see my cursor position highlighted on the rulers when hovering over the canvas so that I can know the exact pixel coordinates under my cursor.

**Why this priority**: Precision editing enhancement. Knowing exact cursor position helps with precise placement. This builds on basic ruler functionality and adds interactivity.

**Independent Test**: Can be fully tested by moving the cursor over the canvas and verifying position indicators move in sync on both rulers.

**Acceptance Scenarios**:

1. **Given** the cursor is over the canvas at position (250, 180), **When** viewing the rulers, **Then** a position indicator appears on the horizontal ruler at 250 and on the vertical ruler at 180
2. **Given** the cursor is moving over the canvas, **When** the cursor moves, **Then** the position indicators on both rulers update in real-time to follow the cursor
3. **Given** the cursor leaves the canvas area, **When** hovering outside the canvas, **Then** the position indicators disappear from the rulers

---

### User Story 6 - Template Bounds Indicator (Priority: P2)

As an audio plugin developer, I want to see the template extent highlighted on the rulers so that I can understand the total template size at a glance.

**Why this priority**: Spatial context enhancement. When zoomed in or panned, knowing the full template extent helps with orientation. Complements the origin indicator.

**Independent Test**: Can be fully tested by loading a template and verifying template extent is visually marked on both rulers.

**Acceptance Scenarios**:

1. **Given** a template of size 800x600 is loaded, **When** viewing the rulers, **Then** the horizontal ruler shows a visual indicator from 0 to 800 and the vertical ruler shows 0 to 600
2. **Given** the canvas is panned so only part of the template is visible, **When** viewing the rulers, **Then** the template bounds indicators extend beyond the visible ruler area appropriately
3. **Given** the template bounds indicator is visible, **When** examining its appearance, **Then** it is visually distinct from regular tick marks (e.g., different color or shading)

---

### User Story 7 - Grid Alignment Markers (Priority: P3)

As an audio plugin developer, I want the ruler tick marks to align with the current grid settings so that the rulers reinforce the grid I'm snapping to.

**Why this priority**: Integration enhancement. Grid alignment on rulers helps users understand the snap grid visually on rulers. Lower priority because basic rulers provide value without grid integration.

**Independent Test**: Can be fully tested by enabling the grid, changing grid size, and verifying ruler ticks align to grid intervals.

**Acceptance Scenarios**:

1. **Given** the grid is set to 16px intervals, **When** viewing the rulers, **Then** tick marks align to 16px boundaries (0, 16, 32, 48...)
2. **Given** the grid size is changed from 10px to 20px, **When** viewing the rulers, **Then** the tick marks update to align with the new 20px grid
3. **Given** the grid is disabled, **When** viewing the rulers, **Then** tick marks show standard intervals (not tied to grid) for general reference

---

### Edge Cases

- What happens when the template is smaller than the viewport? The rulers should still show the full template extent and continue beyond to show negative coordinates if panned.
- What happens at extreme zoom levels (10% or 500%)? Tick density should adapt to remain readable - fewer ticks at low zoom, more detail at high zoom.
- What happens when pan offset results in negative coordinates visible? Rulers should correctly display negative numbers.
- How do rulers behave when no template is loaded? Rulers should not appear when the canvas shows the empty state.
- What happens when the viewport is resized? Rulers should adjust to fill the new viewport dimensions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a horizontal ruler along the top edge of the canvas viewport when a template is loaded
- **FR-002**: System MUST display a vertical ruler along the left edge of the canvas viewport when a template is loaded
- **FR-003**: Rulers MUST show numbered tick marks indicating pixel coordinates starting from the template origin (0,0)
- **FR-004**: Rulers MUST scale tick mark intervals and numbers correctly when zoom level changes (10% to 500% range)
- **FR-005**: Rulers MUST shift coordinate display to reflect current pan offset, showing accurate coordinates for the visible canvas area
- **FR-006**: Rulers MUST display major tick marks with numbers at primary intervals (e.g., every 100px at 100% zoom)
- **FR-007**: Rulers MUST display minor tick marks between major ticks without numbers
- **FR-008**: Rulers MUST show a cursor position indicator on both rulers when the cursor hovers over the canvas
- **FR-009**: Cursor position indicators MUST update in real-time as the cursor moves
- **FR-010**: Cursor position indicators MUST disappear when the cursor leaves the canvas area
- **FR-011**: Rulers MUST visually indicate the template bounds extent
- **FR-012**: Rulers MUST hide when no template is loaded (empty state)
- **FR-013**: Rulers MUST display an origin indicator showing the current pan offset at the ruler intersection
- **FR-014**: Rulers MUST adapt tick density at extreme zoom levels to maintain readability
- **FR-015**: Rulers MUST support grid-aligned tick marks when the grid is enabled, aligning to the current grid size setting
- **FR-016**: Rulers MUST occupy a fixed screen-space region (not affected by canvas zoom/pan) along the viewport edges

### Key Entities

- **Ruler**: A visual coordinate scale displayed along a canvas edge. Has orientation (horizontal/vertical), visible range, tick configuration, and responds to pan/zoom.
- **Tick Mark**: A visual indicator at a specific coordinate. Has position, size (major/minor), and optional label (number).
- **Cursor Indicator**: A highlight marker showing cursor position on a ruler. Has position and visibility state.
- **Template Bounds Indicator**: A visual highlight showing template extent on rulers. Has start and end positions.
- **Origin Indicator**: A marker at the ruler intersection showing pan offset. Displays current offset values.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can determine the pixel coordinate of any point on the canvas within 5 pixels accuracy by reading the rulers
- **SC-002**: Ruler tick marks remain readable (minimum 30 pixels between numbered ticks) across all supported zoom levels (10%-500%)
- **SC-003**: Cursor position indicator updates within 16ms (single frame) of cursor movement
- **SC-004**: Rulers render without visual artifacts or performance degradation when panning/zooming
- **SC-005**: 100% of ruler unit tests pass covering all functional requirements
- **SC-006**: Rulers correctly display coordinates for templates up to 4000x4000 pixels
- **SC-007**: Grid-aligned ticks correctly reflect all supported grid size presets (5, 8, 10, 12, 16, 20 pixels)

## Clarifications

### Session 2026-01-10

- Q: What should the exact ruler thickness and font size be? → A: 20px ruler thickness with 10px font
- Q: What base tick interval and scaling algorithm should be used? → A: Base 100px with minor every 10px. Power-of-2 scaling maintains minimum 30px screen spacing: at 50% zoom major ticks are 200px apart (100px on screen), at 25% zoom 400px apart, at 200% zoom 50px apart (100px on screen), at 400% zoom 25px apart (100px on screen). The screen spacing stays approximately constant (30-60px range) while canvas intervals scale.
- Q: What visual style for the cursor position indicator on rulers? → A: Accent-colored line spanning ruler with tooltip showing exact coordinate
- Q: What information should the origin indicator display? → A: Crosshair icon when at origin (0,0), or compact offset display when panned. Due to 20x20px space constraint, show abbreviated format: "+" icon at origin, or small numbers with tooltip for full coordinates on hover. Tooltip shows full "Pan: X: -50, Y: 120" on hover.
- Q: What visual style for the template bounds indicator on rulers? → A: Subtle shaded region from 0 to template extent

## Assumptions

- Ruler thickness is fixed at 20 pixels with 10px font size for tick labels (--font-size-xs)
- Ruler background uses a neutral color from the existing design token palette
- Tick mark colors use existing CSS design tokens; cursor indicator displays as a thin accent-colored line (1px) spanning the full ruler height/width at the cursor position with a small tooltip showing exact coordinate value (e.g., "X: 247" or "Y: 180")
- Major tick intervals use base 100px at 100% zoom with minor ticks every 10px; power-of-2 scaling ensures minimum 30px screen spacing between major ticks at all zoom levels (canvas intervals: 400px at 25% zoom, 200px at 50%, 100px at 100%, 50px at 200%, 25px at 400%)
- The ruler corner intersection area (top-left 20x20px) is reserved for the origin indicator displaying a crosshair icon at origin or abbreviated offset values when panned, with full coordinates shown in tooltip on hover
- Template bounds indicator displays as a subtle shaded region (slightly different background color) on the ruler from coordinate 0 to the template dimension (width for horizontal ruler, height for vertical), clearly delineating template extent vs. empty canvas space
- Rulers are always visible when a template is loaded (no toggle to hide rulers in this feature scope)
- Future enhancement (032-custom-guides) will add ability to drag guides from rulers - this feature establishes the ruler foundation

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
