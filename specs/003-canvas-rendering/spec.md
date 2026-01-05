# Feature Specification: Canvas Rendering

**Feature Branch**: `003-canvas-rendering`
**Created**: 2026-01-05
**Status**: Draft
**Input**: Display parsed uidesc views as rectangles on a 2D canvas. Canvas component with coordinate system matching uidesc (origin top-left, pixels). Render all views from documentStore.document as rectangles using origin and size attributes. Handle nested view hierarchy (children drawn on top of parents). Display view class name as label on each rectangle. Show template bounds as a distinct border. Basic color coding by view category (containers, controls, displays).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Template Layout (Priority: P1)

As a plugin developer, I want to see my uidesc template rendered visually so that I can understand the layout of UI elements at a glance.

**Why this priority**: This is the core value proposition - without visual rendering, there is no visual editor. Everything else depends on being able to see the views.

**Independent Test**: Can be fully tested by loading a uidesc file and verifying that all views appear as rectangles with correct positions and sizes.

**Acceptance Scenarios**:

1. **Given** a parsed uidesc document with a template, **When** the canvas renders, **Then** the template root view appears as a rectangle with the correct size
2. **Given** a template with a root view at origin "0, 0" with size "400, 300", **When** rendered, **Then** the view rectangle spans from (0,0) to (400,300) in canvas coordinates
3. **Given** a view with origin "50, 100" and size "200, 80", **When** rendered, **Then** the rectangle appears at position (50,100) with dimensions 200x80 pixels

---

### User Story 2 - View Hierarchy Display (Priority: P1)

As a plugin developer, I want nested child views to render correctly on top of their parents so that I can see the complete view hierarchy.

**Why this priority**: Most uidesc files have nested view hierarchies. Without proper hierarchy rendering, the canvas would be unusable for real-world files.

**Independent Test**: Can be tested by loading a uidesc with nested containers and verifying children appear inside and on top of parents.

**Acceptance Scenarios**:

1. **Given** a parent container with two child views, **When** rendered, **Then** both children appear visually on top of the parent
2. **Given** a child view with origin "10, 10" inside a parent at origin "50, 50", **When** rendered, **Then** the child appears at absolute position (60, 60) on the canvas
3. **Given** overlapping sibling views, **When** rendered, **Then** views declared later in the hierarchy appear on top of earlier siblings

---

### User Story 3 - View Identification (Priority: P2)

As a plugin developer, I want each view rectangle to display its class name so that I can identify what type of control each element represents.

**Why this priority**: Labels help users understand the UI structure without needing to inspect properties. Important but not blocking core rendering.

**Independent Test**: Can be tested by rendering views and verifying class labels are visible and legible on each rectangle.

**Acceptance Scenarios**:

1. **Given** a CTextButton view, **When** rendered, **Then** the rectangle displays "CTextButton" as a label
2. **Given** a very small view (under 60px wide), **When** rendered, **Then** the label is truncated or hidden to avoid overflow
3. **Given** multiple views of different classes, **When** rendered, **Then** each displays its respective class name

---

### User Story 4 - View Category Coloring (Priority: P2)

As a plugin developer, I want views colored by category (containers, controls, displays) so that I can quickly distinguish between different element types.

**Why this priority**: Color coding improves usability by providing visual categorization, but the editor is functional without it.

**Independent Test**: Can be tested by rendering views of different categories and verifying distinct fill/border colors.

**Acceptance Scenarios**:

1. **Given** a CViewContainer (container category), **When** rendered, **Then** it has a distinct color scheme (e.g., blue tint)
2. **Given** a CSlider (control category), **When** rendered, **Then** it has a different color scheme (e.g., green tint)
3. **Given** a CTextLabel (display category), **When** rendered, **Then** it has a third color scheme (e.g., purple tint)
4. **Given** a custom view class (e.g., CMyCustomKnob), **When** rendered, **Then** it has a neutral gray color scheme and displays "[Custom]" indicator with the class name
5. **Given** views from all four categories, **When** rendered together, **Then** users can visually distinguish categories at a glance

---

### User Story 5 - Template Bounds Indicator (Priority: P3)

As a plugin developer, I want to see a distinct border around the template bounds so that I understand the overall canvas area.

**Why this priority**: Helpful for understanding boundaries, but not critical for basic functionality.

**Independent Test**: Can be tested by loading a template and verifying a distinct border appears around the template's root size.

**Acceptance Scenarios**:

1. **Given** a template with root size "800, 600", **When** rendered, **Then** a distinct border outlines the 800x600 area
2. **Given** the template bounds border, **When** compared to regular views, **Then** it has a distinctly different visual style (thicker line, different color)

---

### Edge Cases

- What happens when a view has no `origin` attribute? Default to (0, 0)
- What happens when a view has no `size` attribute? Default to a minimum visible size (e.g., 20x20)
- How does the system handle a template with no children? Render only the root container bounds
- What happens when child views extend beyond parent bounds? Render them fully (no clipping in this phase)
- How are negative origin values handled? Render at the specified negative position (view will extend left/above canvas origin)
- What happens when no document is loaded or document has no templates? Show empty canvas with centered "No template loaded" message
- How are unknown/custom view class names handled? Render with "Custom" category styling (neutral gray) and display class name with "[Custom]" indicator

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a 2D canvas component that displays uidesc views
- **FR-002**: System MUST use a coordinate system with origin at top-left, measured in pixels, matching uidesc conventions
- **FR-003**: System MUST render each view as a rectangle using the view's `origin` (x, y) and `size` (width, height) attributes
- **FR-004**: System MUST render child views on top of parent views (correct z-order)
- **FR-005**: System MUST calculate absolute positions for nested views by adding parent origin to child origin
- **FR-006**: System MUST display the view's `class` attribute as a label on each rectangle
- **FR-007**: System MUST apply distinct visual styles to views based on category:
  - **Containers**: CView, CViewContainer, CLayeredViewContainer, CRowColumnView, CScrollView, CSplitView, CShadowViewContainer, UIViewSwitchContainer
  - **Controls**: CControl, CTextEdit, CSearchTextEdit, CTextButton, COnOffButton, CCheckBox, CSegmentButton, CKickButton, CRockerSwitch, CVerticalSwitch, CHorizontalSwitch, CMovieButton, CKnob, CAnimKnob, CSlider, CXYPad, COptionMenu
  - **Displays**: CTextLabel, CMultiLineTextLabel, CParamDisplay, CVuMeter, CGradientView, CMovieBitmap, CAutoAnimation, CAnimationSplashScreen, CStringListControl
  - **Custom**: Any view class not in the above lists (unknown/custom classes) - styled with neutral gray and "[Custom]" label indicator
- **FR-008**: System MUST render a distinct border around the template root bounds
- **FR-009**: System MUST read view data from `documentStore.document.templates`
- **FR-010**: System MUST render the first template when a document is loaded (default template selection)
- **FR-011**: System MUST handle views with missing `origin` by defaulting to "0, 0"
- **FR-012**: System MUST handle views with missing `size` by using a default minimum size of 20x20 pixels
- **FR-013**: System MUST parse point values in "x, y" format and size values in "width, height" format
- **FR-014**: System MUST update rendering automatically when documentStore.document changes (reactive)
- **FR-015**: System MUST display an empty canvas with centered "No template loaded" message when no document is loaded or document contains no templates

### Key Entities

- **Canvas**: The rendering surface that displays the visual representation of the uidesc template
- **ViewRectangle**: A visual representation of a uidesc view, with position, size, label, and category color
- **ViewCategory**: Classification of views into containers, controls, displays, or custom (unknown) for visual styling
- **Template**: A named view hierarchy from the uidesc file, starting with a root view and containing nested children

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can see all views from a loaded uidesc file displayed as rectangles within 1 second of file load
- **SC-002**: View positions and sizes match the uidesc specification with pixel-perfect accuracy
- **SC-003**: 100% of view rectangles display their class name visibly (or indicate truncation for small views)
- **SC-004**: Users can distinguish between containers, controls, displays, and custom views by color at a glance
- **SC-005**: Nested view hierarchies render with correct parent-child positioning for any nesting depth
- **SC-006**: Template bounds are clearly visible and distinguishable from regular view borders

## Assumptions

- The canvas will be displayed in a fixed viewport size initially (pan/zoom is out of scope for this feature)
- Only one template is displayed at a time
- Views are non-interactive in this phase (no selection, hover, or click behavior)
- The canvas background will be a neutral color that contrasts with all category colors
- Label text will use a default system font appropriate for the platform
- Views will not be clipped to parent bounds in this phase

## Out of Scope

- Pan and zoom navigation (Phase 1 continuation)
- Grid overlay (separate feature)
- Selection and interaction (Phase 2)
- Hover states and tooltips (Phase 2)
- Property inspection (Phase 2)
- View editing (Phase 3+)

---

## Implementation Completion Checklist

### Final Verification

- [ ] **Git Status Check**: Run `git status` to verify all changes are committed
- [ ] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [ ] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [ ] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**CRITICAL**: The feature is NOT complete until all work is committed to the feature branch.
