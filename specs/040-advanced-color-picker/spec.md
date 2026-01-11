# Feature Specification: Advanced Color Picker

**Feature Branch**: `040-advanced-color-picker`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Create an advanced Color Picker component with gradient picker, hue slider, alpha slider, multiple input formats (HEX/RGB/HSL), color swatches, eyedropper tool, and two usage modes (inline and popup)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Color Selection (Priority: P1)

As a plugin developer editing view properties, I want to visually select colors using a gradient picker and sliders so that I can quickly find the exact color I need without memorizing hex codes.

**Why this priority**: This is the core value proposition of an advanced color picker. Without visual selection, users might as well use the existing text input. The gradient picker (saturation-brightness) combined with a hue slider provides the most intuitive color selection experience.

**Independent Test**: Can be fully tested by opening the color picker, dragging on the gradient area and hue slider, and verifying the selected color is applied to the view property.

**Acceptance Scenarios**:

1. **Given** the color picker is open, **When** I drag on the saturation-brightness gradient area, **Then** the color updates in real-time showing the selected saturation and brightness at the current hue
2. **Given** the color picker is open, **When** I drag on the hue slider, **Then** the gradient area updates to reflect the new hue and the selected color changes accordingly
3. **Given** the color picker is open with a color selected, **When** I release my mouse after dragging, **Then** the color is committed and can be undone as a single operation
4. **Given** I am editing a view's background-color property, **When** I select a new color visually, **Then** the canvas preview updates immediately to show the color

---

### User Story 2 - Alpha/Opacity Control (Priority: P1)

As a plugin developer, I want to adjust the alpha/opacity of colors so that I can create semi-transparent UI elements for layered effects.

**Why this priority**: VSTGUI fully supports 8-digit RGBA hex colors, and transparency is essential for modern UI design. This is a core feature that complements visual color selection.

**Independent Test**: Can be fully tested by opening the color picker, adjusting the alpha slider, and verifying the resulting 8-digit hex code has the correct alpha value.

**Acceptance Scenarios**:

1. **Given** the color picker is open, **When** I drag the alpha slider, **Then** the selected color's alpha value changes and the hex code updates to reflect the new opacity
2. **Given** the color picker is open, **When** I view the alpha slider track, **Then** I see a checkerboard pattern indicating transparency
3. **Given** I select a fully opaque color (FF alpha), **When** I reduce alpha to 50%, **Then** the resulting hex shows #RRGGBB80

---

### User Story 3 - HEX Input with Format Support (Priority: P1)

As a plugin developer who knows the exact color code I want, I need to type HEX values directly and have them validated against VSTGUI's supported formats.

**Why this priority**: Direct input is essential for precision work and for users who copy/paste color codes from design tools. This must support all VSTGUI color formats.

**Independent Test**: Can be fully tested by typing various hex formats into the input field and verifying they are accepted and normalized correctly.

**Acceptance Scenarios**:

1. **Given** the color picker is open, **When** I type a valid 6-digit hex code (#FF5500), **Then** the visual picker updates to show that color and alpha defaults to FF
2. **Given** the color picker is open, **When** I type a valid 8-digit hex code (#FF550080), **Then** the visual picker and alpha slider update to reflect the color and opacity
3. **Given** the color picker is open, **When** I type an invalid hex code, **Then** I see a validation error and the color is not applied
4. **Given** I type a hex code without the # prefix, **When** I commit the value, **Then** the system auto-adds the # prefix

---

### User Story 4 - RGB/HSL Format Switching (Priority: P2)

As a plugin developer familiar with different color systems, I want to input colors using RGB or HSL values so that I can work in my preferred color format.

**Why this priority**: While HEX is the native VSTGUI format, many designers think in RGB or HSL. Supporting multiple input formats improves usability without affecting the underlying format stored.

**Independent Test**: Can be fully tested by switching between HEX/RGB/HSL tabs, entering values, and verifying the conversion is accurate.

**Acceptance Scenarios**:

1. **Given** the color picker is open, **When** I switch to RGB mode, **Then** I see inputs for Red (0-255), Green (0-255), Blue (0-255), and Alpha (0-255)
2. **Given** the color picker is in RGB mode, **When** I enter RGB values, **Then** the visual picker updates and the underlying HEX value is calculated correctly
3. **Given** the color picker is open, **When** I switch to HSL mode, **Then** I see inputs for Hue (0-360), Saturation (0-100%), Lightness (0-100%), and Alpha (0-100%)
4. **Given** a color is selected in any format, **When** I switch formats, **Then** the values convert accurately to the new format

---

### User Story 5 - Document Color Swatches (Priority: P2)

As a plugin developer working within a design system, I want quick access to colors already defined in my uidesc document so that I can maintain visual consistency.

**Why this priority**: The Colors Panel defines reusable colors. Surfacing these in the picker prevents duplication and encourages consistent color usage across the UI.

**Independent Test**: Can be fully tested by opening the color picker when document colors exist and clicking on a swatch to select it.

**Acceptance Scenarios**:

1. **Given** the document has defined colors, **When** I open the color picker, **Then** I see a "Document Colors" section with clickable swatches
2. **Given** I click on a document color swatch, **When** selecting it, **Then** the color name (not hex) is used as the value (e.g., "Background" instead of "#2D2D2DFF")
3. **Given** the document has no colors defined, **When** I open the color picker, **Then** the Document Colors section is hidden

---

### User Story 6 - Predefined VSTGUI Colors (Priority: P2)

As a plugin developer, I want access to VSTGUI's predefined system colors so that I can use standard colors like BlackCColor without looking up their values.

**Why this priority**: VSTGUI provides 10 built-in colors (prefixed with ~) that are commonly used. Making these easily accessible improves workflow.

**Independent Test**: Can be fully tested by opening the predefined colors section and selecting a system color.

**Acceptance Scenarios**:

1. **Given** the color picker is open, **When** I expand the predefined colors section, **Then** I see all VSTGUI system colors (BlackCColor, WhiteCColor, etc.)
2. **Given** I select a predefined color, **When** it is applied, **Then** the value is stored as the reference format (e.g., "~ BlackCColor")
3. **Given** the current value is a predefined color, **When** I open the picker, **Then** that predefined color is visually highlighted as selected

---

### User Story 7 - Color Preview Comparison (Priority: P2)

As a plugin developer making color adjustments, I want to see the old color next to the new color I'm selecting so that I can compare before committing.

**Why this priority**: Comparing old vs new prevents accidental changes and helps users make informed decisions about color modifications.

**Independent Test**: Can be fully tested by opening the picker with an existing color, making changes, and verifying both colors are visible.

**Acceptance Scenarios**:

1. **Given** I open the color picker for an existing color, **When** viewing the preview area, **Then** I see the current/old color displayed on one side
2. **Given** I am selecting a new color, **When** viewing the preview area, **Then** I see the new color displayed next to the old color for comparison
3. **Given** both colors have transparency, **When** viewing previews, **Then** both show a checkerboard pattern behind them to indicate transparency levels

---

### User Story 8 - Eyedropper Tool (Priority: P3)

As a plugin developer, I want to pick colors from anywhere on my screen so that I can match colors from reference images or other applications.

**Why this priority**: This is a power-user feature that adds significant convenience but is not essential for basic color selection. Browser API support varies.

**Independent Test**: Can be fully tested by clicking the eyedropper button and selecting a color from the screen.

**Acceptance Scenarios**:

1. **Given** the browser supports EyeDropper API, **When** I click the eyedropper button, **Then** a screen-wide color picker is activated
2. **Given** I am using the eyedropper, **When** I click on any pixel on screen, **Then** that color is captured and applied to the picker
3. **Given** the browser does not support EyeDropper API, **When** the picker renders, **Then** the eyedropper button is hidden or disabled with a tooltip explaining why
4. **Given** I activate the eyedropper, **When** I press Escape, **Then** the eyedropper is cancelled and the previous color is retained

---

### User Story 9 - Recently Used Colors (Priority: P3)

As a plugin developer working on multiple views, I want to see colors I've recently used so that I can quickly reapply them.

**Why this priority**: This is a convenience feature that improves workflow for repetitive tasks but is not essential for basic functionality.

**Independent Test**: Can be fully tested by selecting several colors, then opening the picker again and verifying recent colors are shown.

**Acceptance Scenarios**:

1. **Given** I have selected colors previously, **When** I open the color picker, **Then** I see a "Recent Colors" section with up to 10 recently used colors
2. **Given** I select a recent color, **When** clicking on it, **Then** that color is applied to the current property
3. **Given** the recent colors list is full, **When** I use a new color, **Then** the oldest recent color is removed to make room

---

### User Story 10 - Popup Mode for Properties Panel (Priority: P1)

As a plugin developer editing view properties, I want a compact color trigger that opens the full picker in a dropdown so that the Properties Panel remains uncluttered.

**Why this priority**: The Properties Panel has limited space. A compact trigger that opens a full picker on demand is essential for this context.

**Independent Test**: Can be fully tested by clicking the color trigger in the Properties Panel and verifying the dropdown opens with the full picker.

**Acceptance Scenarios**:

1. **Given** a view is selected with a color property, **When** viewing the Properties Panel, **Then** I see a compact color trigger showing a swatch and the current value
2. **Given** I click the color trigger, **When** the dropdown opens, **Then** the full color picker is displayed in a floating dropdown
3. **Given** the picker dropdown is open, **When** I click outside it or press Escape, **Then** the dropdown closes
4. **Given** I select a color in the dropdown, **When** clicking outside to close, **Then** the color is committed

---

### User Story 11 - Inline Mode for Colors Panel (Priority: P2)

As a plugin developer editing document colors, I want the color picker displayed inline within the Colors Panel so that I can see it alongside the color list.

**Why this priority**: The Colors Panel has more space and editing document colors is a focused task. Inline display is more convenient than popups for this context.

**Independent Test**: Can be fully tested by double-clicking a color in the Colors Panel and verifying the picker appears inline.

**Acceptance Scenarios**:

1. **Given** I am editing a color in the Colors Panel, **When** I activate the color value for editing, **Then** the full picker is displayed inline below the color item
2. **Given** the inline picker is shown, **When** I select a new color, **Then** the document color updates in real-time
3. **Given** the inline picker is shown, **When** I click elsewhere or press Escape, **Then** the picker collapses and the change is committed

---

### User Story 12 - Full Keyboard Navigation (Priority: P2)

As a plugin developer who prefers keyboard navigation, I want to operate the color picker entirely with the keyboard so that I can work efficiently without reaching for the mouse.

**Why this priority**: Accessibility and power-user efficiency require full keyboard support. This is important for WCAG compliance.

**Independent Test**: Can be fully tested by opening the picker with keyboard, navigating between sections, and selecting a color without mouse interaction.

**Acceptance Scenarios**:

1. **Given** the color picker is focused, **When** I use Tab, **Then** focus moves through all interactive elements in a logical order
2. **Given** focus is on the gradient area, **When** I use arrow keys, **Then** the color selection moves 1% in that direction (10% with Shift held)
3. **Given** focus is on a slider, **When** I use arrow keys, **Then** the slider value changes by 1% (10% with Shift held)
4. **Given** focus is on a swatch, **When** I press Enter or Space, **Then** that color is selected

---

### Edge Cases

- What happens when the color picker opens at the bottom of the viewport? The dropdown flips to open above the trigger using floating-ui.
- How does the system handle pasting an invalid color? Validation error is shown, and the paste is accepted but not committed until corrected.
- What happens when editing a color that references a document color that no longer exists? The picker shows the reference name with a "missing reference" indicator and allows editing to a new valid value.
- How does the gradient area handle click vs drag? Click immediately selects that position; drag continues updating until mouse release.
- What happens when converting HSL values that exceed RGB gamut? Values are clamped to valid RGB range (0-255) and a subtle indicator (warning icon or yellow border on the input field) shows the clamping occurred.
- What if localStorage is unavailable for recent colors? Recent colors feature gracefully degrades to session-only storage; if that also fails, the section simply does not appear.

## Clarifications

### Session 2026-01-11

- Q: What step size should arrow keys use for slider/gradient navigation? → A: 1% per keypress, 10% with Shift held
- Q: What format should the color picker output regardless of input mode? → A: Always 8-digit HEX (#RRGGBBAA)
- Q: What axis mapping should the saturation-brightness gradient area use? → A: X-axis = Saturation (0-100%), Y-axis = Brightness (100% top, 0% bottom) - standard HSB picker layout
- Q: What scope should recent colors persistence use? → A: Persist to localStorage across browser sessions
- Q: What happens when dismissing the popup with an invalid value? → A: Revert to previous valid value and dismiss

## Requirements *(mandatory)*

### Functional Requirements

**Core Visual Selection**
- **FR-001**: System MUST provide a saturation-brightness gradient area for visual color selection with X-axis representing Saturation (0% left to 100% right) and Y-axis representing Brightness (100% top to 0% bottom)
- **FR-002**: System MUST provide a hue slider (0-360 degrees) rendered as a rainbow gradient
- **FR-003**: System MUST provide an alpha slider (0-255 or 0-100%) with checkerboard transparency indication
- **FR-004**: System MUST update the color preview in real-time during drag operations
- **FR-005**: System MUST commit color changes as a single undo operation when the drag ends

**Input Formats**
- **FR-006**: System MUST accept HEX input in 6-digit (#RRGGBB) and 8-digit (#RRGGBBAA) formats
- **FR-007**: System MUST provide RGB input mode with fields for R, G, B (0-255 each), A (0-255)
- **FR-008**: System MUST provide HSL input mode with fields for H (0-360), S (0-100%), L (0-100%), A (0-100%). Note: Alpha is displayed as percentage in HSL mode but stored internally as 0-255
- **FR-009**: System MUST convert between color formats accurately when switching modes
- **FR-009a**: System MUST always output color values as 8-digit HEX (#RRGGBBAA) regardless of input mode used
- **FR-010**: System MUST validate all input values and display clear error messages for invalid input

**Color Swatches**
- **FR-011**: System MUST display document colors from the loaded uidesc as clickable swatches
- **FR-012**: System MUST display VSTGUI predefined colors (BlackCColor, WhiteCColor, etc.) as clickable swatches
- **FR-013**: System MUST store up to 10 recently used colors in local storage
- **FR-014**: When a document color is selected, system MUST use the color name as the value (not the resolved hex)
- **FR-015**: When a predefined color is selected, system MUST use the "~ ColorName" format as the value

**User Experience**
- **FR-016**: System MUST display old/current color alongside the new/selected color for comparison
- **FR-017**: System MUST provide an eyedropper tool when the browser's EyeDropper API is available
- **FR-018**: System MUST hide or disable the eyedropper with explanation when API is unavailable
- **FR-019**: System MUST auto-add # prefix to hex values if user omits it on commit

**Usage Modes**
- **FR-020**: System MUST provide a popup mode that uses FloatingDropdown for Properties Panel integration
- **FR-021**: System MUST provide an inline mode that renders the full picker within a container
- **FR-022**: In popup mode, clicking outside or pressing Escape MUST close the dropdown and commit changes
- **FR-022a**: If the current value is invalid when dismissing, system MUST revert to the previous valid value before closing (matching existing editor behavior)
- **FR-023**: The popup trigger MUST display a color swatch and the current value text

**Accessibility**
- **FR-024**: All interactive elements MUST be keyboard accessible with logical tab order
- **FR-025**: System MUST provide ARIA labels for all controls (sliders, swatches, inputs)
- **FR-026**: Focus indicators MUST be clearly visible meeting WCAG 2.1 AA requirements
- **FR-027**: Color contrast for text and controls MUST meet WCAG 2.1 AA (4.5:1 ratio). Specifically: input labels, tab text, error messages, and swatch borders must be tested against their backgrounds

**Integration**
- **FR-028**: System MUST integrate with the existing documentStore for document colors
- **FR-029**: System MUST work with the existing history system for undo/redo operations
- **FR-030**: System MUST replace the existing ColorPicker component while maintaining the same props interface
- **FR-031**: When the current value is a document color name that no longer exists in the document, system MUST display a "missing reference" indicator (red border on swatch) while showing the reference name

### Key Entities

- **ColorValue**: Represents a color in the picker. Attributes: hex (8-digit), red (0-255), green (0-255), blue (0-255), alpha (0-255), hue (0-360), saturation (0-100), lightness (0-100)
- **ColorFormat**: The display/input format. Values: 'hex', 'rgb', 'hsl'
- **ColorSource**: Origin of a color value. Values: 'hex-input', 'visual-picker', 'document-color', 'predefined-color', 'recent-color', 'eyedropper'
- **PickerMode**: How the picker is displayed. Values: 'popup', 'inline'

### Assumptions

- The EyeDropper API is available in Chromium-based browsers (Chrome, Edge) but not in Firefox or Safari as of 2025. The feature will gracefully degrade.
- Recent colors will be persisted to localStorage across browser sessions using a dedicated key (e.g., 'vstgui-edit:recent-colors'), surviving browser refresh and close.
- The maximum number of recent colors (10) provides a good balance between utility and UI space.
- VSTGUI predefined colors are a fixed set of 10 colors that will not change.
- HSL values that produce out-of-gamut RGB colors will be silently clamped.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select any color visually in under 5 seconds using the gradient and hue slider
- **SC-002**: Users can input exact hex codes and see them validated in under 2 seconds
- **SC-003**: Color format conversion between HEX, RGB, and HSL is mathematically accurate (round-trip conversion produces the same color)
- **SC-004**: All picker interactions (drag, click, input) provide visual feedback in under 100ms
- **SC-005**: The eyedropper tool successfully captures colors from the screen when available
- **SC-006**: Users can navigate and select colors using only keyboard controls
- **SC-007**: Test coverage for the color picker components exceeds 80%
- **SC-008**: The picker dropdown positions correctly without viewport overflow in all tested scenarios

## Reusable Existing Functionality

The following existing components and patterns can be reused:

1. **FloatingDropdown** (`src/components/common/FloatingDropdown/`): Provides portal-based dropdown positioning with floating-ui, click-outside handling, and Escape key support. Use directly for popup mode.

2. **Color validation** (`src/domain/properties/validation.ts`): The `validateColor` function validates hex codes and document color references. Can be extended for RGB/HSL validation.

3. **Design tokens** (`src/styles/tokens.css`): Use existing color variables like `--color-swatch-checkerboard-light/dark` for transparency patterns, `--color-border`, `--color-error-500` for consistent styling.

4. **Editor patterns** (`src/components/editors/`): Follow the established patterns from TextEditor, NumberEditor for input handling, commit/cancel behavior, and error display.

5. **History operations** (`src/domain/properties/historyOperations.ts`): The `createPropertyEditOperation` pattern can be used for color change undo/redo.

6. **ColorSwatch component** (`src/components/ColorsPanel/ColorSwatch.tsx`): Existing swatch component with checkerboard transparency indication. Can be reused for all swatch displays.

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

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
| FR-014 | ⬜ PENDING | [Test or file that verifies this] |
| FR-015 | ⬜ PENDING | [Test or file that verifies this] |
| FR-016 | ⬜ PENDING | [Test or file that verifies this] |
| FR-017 | ⬜ PENDING | [Test or file that verifies this] |
| FR-018 | ⬜ PENDING | [Test or file that verifies this] |
| FR-019 | ⬜ PENDING | [Test or file that verifies this] |
| FR-020 | ⬜ PENDING | [Test or file that verifies this] |
| FR-021 | ⬜ PENDING | [Test or file that verifies this] |
| FR-022 | ⬜ PENDING | [Test or file that verifies this] |
| FR-022a | ⬜ PENDING | [Test or file that verifies this] |
| FR-023 | ⬜ PENDING | [Test or file that verifies this] |
| FR-024 | ⬜ PENDING | [Test or file that verifies this] |
| FR-025 | ⬜ PENDING | [Test or file that verifies this] |
| FR-026 | ⬜ PENDING | [Test or file that verifies this] |
| FR-027 | ⬜ PENDING | [Test or file that verifies this] |
| FR-028 | ⬜ PENDING | [Test or file that verifies this] |
| FR-029 | ⬜ PENDING | [Test or file that verifies this] |
| FR-030 | ⬜ PENDING | [Test or file that verifies this] |
| FR-031 | ⬜ PENDING | [Test or file that verifies this] |
| SC-001 | ⬜ PENDING | [Measurement or test result] |
| SC-002 | ⬜ PENDING | [Measurement or test result] |
| SC-003 | ⬜ PENDING | [Measurement or test result] |
| SC-004 | ⬜ PENDING | [Measurement or test result] |
| SC-005 | ⬜ PENDING | [Measurement or test result] |
| SC-006 | ⬜ PENDING | [Measurement or test result] |
| SC-007 | ⬜ PENDING | [Measurement or test result] |
| SC-008 | ⬜ PENDING | [Measurement or test result] |

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
