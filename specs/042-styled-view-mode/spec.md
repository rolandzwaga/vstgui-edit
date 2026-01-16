# Feature Specification: Styled View Mode

**Feature Branch**: `042-styled-view-mode`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "Add a Styled view mode to the canvas that renders views with their actual visual properties (background-color, frame-color, frame-width) from the uidesc file, as opposed to the current Wireframe mode. This helps users preview color schemes. Toggle via toolbar eye icon button and P shortcut. In Styled mode: resolve color references (~ ColorName) from document colors, fall back to wireframe for views without colors, hide view labels, use white 50% opacity for selection/hover overlays, show template background if defined. Child views naturally obscure parent backgrounds. Persist preference in preferencesStore."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toggle Between View Modes (Priority: P1)

As a plugin developer, I want to toggle between Wireframe and Styled view modes so I can either see structural layout or preview how my color scheme will look in the final plugin.

**Why this priority**: This is the core feature - without the ability to toggle modes, the entire feature has no value. Users need to switch modes to benefit from the styled preview.

**Independent Test**: Can be fully tested by clicking the view mode toggle button and verifying the canvas renders differently. Delivers immediate value by showing colors.

**Acceptance Scenarios**:

1. **Given** a uidesc document is loaded and canvas is in Wireframe mode, **When** user clicks the view mode toggle button in the toolbar, **Then** canvas switches to Styled mode and button shows active state
2. **Given** canvas is in Styled mode, **When** user clicks the toggle button again, **Then** canvas returns to Wireframe mode and button shows inactive state
3. **Given** a uidesc document is loaded, **When** user presses the P keyboard shortcut, **Then** canvas toggles between Wireframe and Styled modes
4. **Given** canvas is in Styled mode, **When** user loads a different document, **Then** the view mode preference is preserved

---

### User Story 2 - Render Views with Document Colors (Priority: P1)

As a plugin developer, I want views with defined background-color and frame-color properties to display their actual colors in Styled mode so I can preview my color scheme accurately.

**Why this priority**: This is tied with P1 as it defines the core visual behavior of Styled mode. Without color rendering, the styled mode has no visual difference from wireframe.

**Independent Test**: Can be fully tested by loading a uidesc with defined colors and verifying views render with those colors in Styled mode.

**Acceptance Scenarios**:

1. **Given** a view has a `background-color` attribute with a hex value (e.g., "#2d2d2dff"), **When** canvas is in Styled mode, **Then** view rectangle fills with that color
2. **Given** a view has a `background-color` referencing a document color (e.g., "background"), **When** canvas is in Styled mode, **Then** view fills with the resolved color from the document's colors map
3. **Given** a view has a `background-color` referencing a predefined color (e.g., "~ BlackCColor"), **When** canvas is in Styled mode, **Then** view fills with the predefined color value (#000000FF)
4. **Given** a view has a `frame-color` attribute, **When** canvas is in Styled mode, **Then** view rectangle stroke uses that color
5. **Given** a view has a `frame-width` attribute, **When** canvas is in Styled mode, **Then** view rectangle stroke width matches that value

---

### User Story 3 - Fallback for Views Without Colors (Priority: P2)

As a plugin developer, I want views that don't have defined colors to still be visible in Styled mode so I can see the complete layout even when some views lack color definitions.

**Why this priority**: Important for usability but secondary to the core color rendering. Users need to see all views even if not all are styled.

**Independent Test**: Can be tested by loading a uidesc with mixed styled and unstyled views and verifying all views are visible.

**Acceptance Scenarios**:

1. **Given** a view has no `background-color` attribute, **When** canvas is in Styled mode, **Then** view renders in wireframe style (category-colored outline only)
2. **Given** a view references a non-existent document color, **When** canvas is in Styled mode, **Then** view falls back to wireframe style
3. **Given** a view has `transparent="true"`, **When** canvas is in Styled mode, **Then** view renders without fill, allowing background views to show through
4. **Given** a view has no `background-color` but has a `frame-width` attribute, **When** canvas is in Styled mode, **Then** view renders in wireframe style using the specified frame-width

---

### User Story 4 - Selection and Hover Overlays in Styled Mode (Priority: P2)

As a plugin developer, I want to clearly see which views are selected or hovered in Styled mode so I can interact with views while previewing colors.

**Why this priority**: Important for usability during editing in styled mode, but the mode can function without custom overlays initially.

**Independent Test**: Can be tested by selecting/hovering views in Styled mode and verifying overlay visibility.

**Acceptance Scenarios**:

1. **Given** a view with a dark background is selected in Styled mode, **When** looking at the canvas, **Then** selection overlay displays with white color at 50% opacity
2. **Given** a view with a light background is selected in Styled mode, **When** looking at the canvas, **Then** selection overlay displays with dark color at 50% opacity (adaptive based on luminance)
3. **Given** a view is hovered (not selected) in Styled mode, **When** looking at the canvas, **Then** hover highlight uses adaptive color at 50% opacity (white on dark, dark on light)
4. **Given** multiple views with different background colors are selected in Styled mode, **When** looking at the canvas, **Then** each selected view shows the appropriate adaptive overlay color

---

### User Story 5 - Template Background in Styled Mode (Priority: P3)

As a plugin developer, I want to see the template's background color in Styled mode so I get an accurate preview of the overall plugin appearance.

**Why this priority**: Enhances the preview accuracy but is not essential for basic styled rendering.

**Independent Test**: Can be tested by loading a template with a background-color and verifying it appears in Styled mode.

**Acceptance Scenarios**:

1. **Given** a template root view has a `background-color` attribute, **When** canvas is in Styled mode, **Then** the template background fills with that color
2. **Given** a template has no `background-color`, **When** canvas is in Styled mode, **Then** template background remains the standard canvas background

---

### User Story 6 - Label Visibility in Styled Mode (Priority: P3)

As a plugin developer, I want view labels hidden in Styled mode so the preview looks clean and closer to the actual plugin appearance.

**Why this priority**: Cosmetic improvement that enhances preview quality but doesn't affect core functionality.

**Independent Test**: Can be tested by checking that view ID labels are hidden in Styled mode and visible in Wireframe mode.

**Acceptance Scenarios**:

1. **Given** canvas is in Styled mode, **When** looking at views, **Then** view class/ID labels are not displayed
2. **Given** canvas is in Wireframe mode, **When** looking at views, **Then** view labels display as they currently do

---

### User Story 7 - View Layering in Styled Mode (Priority: P3)

As a plugin developer, I want child views to naturally obscure their parent's background in Styled mode so the preview accurately represents z-order rendering.

**Why this priority**: Natural behavior that follows from proper SVG rendering order. Important for accurate preview but should work automatically.

**Independent Test**: Can be tested by verifying child view backgrounds cover parent backgrounds.

**Acceptance Scenarios**:

1. **Given** a container has a blue background and a child has a red background, **When** canvas is in Styled mode, **Then** the child's red background covers the portion of the parent's blue background
2. **Given** nested containers with different colors, **When** canvas is in Styled mode, **Then** each view's background renders in correct z-order (children on top)

---

### Edge Cases

- What happens when a color reference exists in the view but the colors section is missing from the document? Falls back to wireframe style for that view.
- How does system handle circular color references (ColorA references ColorB which references ColorA)? Treats as unresolved and falls back to wireframe.
- What happens when frame-width is "0" or negative? If frame-width is explicitly "0" or negative, treat as no frame (no stroke rendered). If frame-width is not specified, default to 1px.
- How does system handle views with opacity attribute? Apply opacity to the entire view group in styled mode.
- What happens when background-color is an empty string? Treat as undefined, fall back to wireframe.

## Clarifications

### Session 2026-01-17

- Q: How should selection/hover overlays ensure visibility against any background color? → A: Use adaptive overlay that inverts based on background luminance (white on dark, dark on light)
- Q: For wireframe fallback views, should frame-width from uidesc be applied or use standard wireframe border? → A: Apply frame-width from uidesc even for wireframe fallback views (if defined)
- Q: How should the toolbar button visually differentiate between Wireframe and Styled modes? → A: Single eye icon with active/inactive styling (filled vs outlined, or highlighted background)
- Q: What luminance threshold value should determine if a background is "light" or "dark"? → A: Use 0.5 (50% luminance) as the threshold - backgrounds with luminance ≥ 0.5 are "light" (use dark overlay), backgrounds < 0.5 are "dark" (use white overlay)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a view mode toggle with two states: "Wireframe" (current behavior) and "Styled" (new color preview mode)
- **FR-002**: System MUST render a toolbar button with a single eye icon that uses active/inactive styling (highlighted background when Styled mode is active) to toggle between view modes
- **FR-003**: System MUST support the P keyboard shortcut to toggle between view modes
- **FR-004**: System MUST register the P shortcut in the keyboard shortcuts registry under View Management category
- **FR-005**: System MUST persist the view mode preference in preferencesStore using the existing preferences pattern
- **FR-006**: System MUST resolve document color references (e.g., "background" -> lookup in document.colors["background"])
- **FR-007**: System MUST resolve predefined color references (e.g., "~ BlackCColor" -> #000000FF) using existing predefinedColors utilities
- **FR-008**: System MUST render views with their `background-color` attribute value as fill color in Styled mode
- **FR-009**: System MUST render views with their `frame-color` attribute value as stroke color in Styled mode
- **FR-010**: System MUST render views with their `frame-width` attribute value as stroke width in Styled mode (default 1px if not specified)
- **FR-011**: System MUST fall back to wireframe style for views that have no resolvable background-color, while still applying frame-width if defined in the uidesc
- **FR-012**: System MUST hide view labels (class names/IDs) in Styled mode
- **FR-013**: System MUST render selection overlays with adaptive color at 50% opacity in Styled mode (white on dark backgrounds, dark on light backgrounds based on luminance calculation)
- **FR-014**: System MUST render hover overlays with adaptive color at 50% opacity in Styled mode (white on dark backgrounds, dark on light backgrounds based on luminance calculation)
- **FR-015**: System MUST render template root background color in Styled mode when defined
- **FR-016**: System MUST maintain natural z-order rendering where child views obscure parent backgrounds
- **FR-017**: System MUST apply view opacity attribute to styled view rendering when present
- **FR-018**: System MUST treat transparent="true" views as having no fill in Styled mode
- **FR-019**: System MUST initialize view mode from preferencesStore on document load
- **FR-020**: System MUST show button active state and appropriate tooltip indicating current mode
- **FR-021**: System MUST calculate background luminance using standard formula (0.299*R + 0.587*G + 0.114*B) with 0.5 threshold to determine overlay color

### Key Entities

- **ViewMode**: Enum type with values "wireframe" | "styled" representing the two canvas rendering modes
- **ResolvedColor**: Result of color resolution containing the final hex value or null if unresolvable
- **StyledViewProps**: Extended RenderableView properties including resolved backgroundColor, frameColor, frameWidth for styled rendering

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can toggle view mode within 1 click or keypress (toolbar button or P shortcut)
- **SC-002**: Color preview matches actual uidesc color values with 100% accuracy for valid hex and resolvable references
- **SC-003**: Views without colors remain visible in Styled mode (no views disappear)
- **SC-004**: View mode preference persists across page reloads with 100% reliability
- **SC-005**: Selection/hover feedback remains clearly visible in Styled mode against any background color
- **SC-006**: Template background displays correctly when defined, enhancing preview accuracy
- **SC-007**: 95% of users can understand which mode they're in by looking at the toolbar button state
- **SC-008**: Mode toggle response time is under 100ms (instant visual feedback)

---

## Assumptions

1. **Color format support**: The system will support hex colors (#RRGGBBAA, #RRGGBB, #RGB) and named references. Gradient backgrounds are out of scope for this feature.
2. **Performance**: Document color maps are typically small (<100 colors), so lookup performance is not a concern.
3. **Browser support**: CSS opacity and SVG fill/stroke are universally supported in modern browsers.
4. **Existing infrastructure**: The preferencesStore pattern and shortcuts registry already exist and follow established patterns.
5. **Default mode**: Wireframe mode is the default, matching current behavior for existing users.

## Existing Functionality for Re-use

The following existing functionality can be leveraged:

1. **`src/domain/colorPicker/predefinedColors.ts`**: `getPredefinedColorHex()` resolves "~ ColorName" format to hex values. Use this for predefined color resolution.

2. **`src/domain/colorPicker/colorConversion.ts`**: `parseHexToRgba()` and `isValidHex()` can validate and parse hex color strings.

3. **`src/stores/preferencesStore.ts`**: Follow the existing pattern for adding new preferences (see `setThemeModePreference`, `setGridSizePreference`). Add canvas preferences section.

4. **`src/domain/preferences/types.ts`**: Add `CanvasPreferences` interface and `ViewMode` type following existing patterns.

5. **`src/domain/shortcuts/registry.ts`**: Add the P shortcut to `SHORTCUT_REGISTRY` under viewManagement category, following the existing pattern.

6. **`src/components/GridToolbar/GridToolbar.tsx`**: Follow the toggle button pattern (classList with active state, aria-pressed).

7. **`src/components/Canvas/ViewRectangle.tsx`**: This component needs modification to support styled rendering based on view mode.

8. **`src/components/Canvas/SelectionOverlay.tsx`**: This component needs conditional styling for the white 50% overlay in styled mode.

9. **`src/types/uidesc.ts`**: `ColorsDefinition` type defines the document colors map structure.

10. **`src/stores/documentStore.ts`**: Provides access to `document` which contains the `colors` map for resolution.

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
  ALL requirements MUST show check mark MET status for completion.
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
