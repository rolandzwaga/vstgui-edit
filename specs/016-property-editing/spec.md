# Feature Specification: Property Editing

**Feature Branch**: `016-property-editing`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "Enable editing of view attributes through the properties panel with type-appropriate input controls, live preview of changes, validation feedback, and multi-selection editing support"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Text Attributes (Priority: P1)

As a user editing a view's text-based attributes (title, tooltip, uidesc-label), I want to type new values in the properties panel and see the view update immediately so that I can customize text content without editing raw files.

**Why this priority**: Text editing is the most common and straightforward property edit. It provides immediate value and establishes the core editing workflow pattern.

**Independent Test**: Can be fully tested by selecting a CTextLabel, editing its "title" attribute, and verifying the label updates on canvas.

**Acceptance Scenarios**:

1. **Given** a CTextLabel is selected with title "Hello", **When** I click the title value and type "World", **Then** the title attribute shows "World" and the canvas updates
2. **Given** a view with tooltip "Info", **When** I edit the tooltip field, **Then** the new tooltip text is saved to the document
3. **Given** I'm editing a text field, **When** I press Escape, **Then** the edit is cancelled and the original value restored
4. **Given** I'm editing a text field, **When** I press Enter or click outside, **Then** the edit is committed

---

### User Story 2 - Edit Geometry Attributes (Priority: P1)

As a user adjusting view positions and sizes, I want to edit origin and size values directly in the properties panel so that I can make precise adjustments beyond what drag-and-drop allows.

**Why this priority**: Geometry editing is essential for precise layout work. Users need exact pixel control that mouse operations can't provide.

**Independent Test**: Can be tested by selecting a view, editing origin to "100, 200", and verifying the view moves to that position.

**Acceptance Scenarios**:

1. **Given** a view with origin "50, 50", **When** I change origin to "100, 75", **Then** the view moves to position (100, 75) on canvas
2. **Given** a view with size "100, 50", **When** I change size to "200, 100", **Then** the view resizes to 200x100 pixels
3. **Given** I enter an invalid value like "abc, xyz", **When** I try to commit, **Then** validation error is shown and original value preserved
4. **Given** I enter a negative size "-50, 100", **When** I try to commit, **Then** validation error is shown for invalid size

---

### User Story 3 - Edit Boolean Attributes (Priority: P1)

As a user configuring view behavior, I want to toggle boolean attributes (mouse-enabled, transparent, wants-focus) with a checkbox so that I can quickly enable/disable features.

**Why this priority**: Boolean toggles are simple, common, and establish the pattern for non-text inputs.

**Independent Test**: Can be tested by selecting a view and toggling mouse-enabled checkbox.

**Acceptance Scenarios**:

1. **Given** a view with mouse-enabled="true", **When** I click the checkbox, **Then** it toggles to "false" and the document updates
2. **Given** a view with transparent="false", **When** I check the transparent box, **Then** it sets to "true"
3. **Given** a view without a boolean attribute set, **When** I toggle it, **Then** the attribute is added with the selected value

---

### User Story 4 - Edit Numeric Attributes (Priority: P2)

As a user adjusting numeric values (opacity, wheel-inc-value, angle-start), I want number inputs with increment/decrement controls so that I can make fine adjustments.

**Why this priority**: Numeric editing is common but slightly more complex than text/boolean. Needed for controls like knobs and sliders.

**Independent Test**: Can be tested by selecting a CKnob and editing angle-start value.

**Acceptance Scenarios**:

1. **Given** a view with opacity="0.5", **When** I increment to "0.6", **Then** the view's opacity changes visually
2. **Given** a view with opacity="1.0", **When** I try to increment beyond "1.0", **Then** the value stays at "1.0" (clamped)
3. **Given** a numeric field, **When** I use up/down arrow keys while focused, **Then** the value increments/decrements by step amount
4. **Given** an empty numeric field, **When** I enter "0.75", **Then** the value is accepted and applied

---

### User Story 5 - Select from Enum Options (Priority: P2)

As a user configuring attributes with fixed options (autosize, text-alignment, style), I want a dropdown menu showing valid options so that I don't need to memorize valid values.

**Why this priority**: Dropdowns prevent invalid values and improve discoverability of options.

**Independent Test**: Can be tested by selecting a CTextLabel and changing text-alignment via dropdown.

**Acceptance Scenarios**:

1. **Given** a CTextLabel with text-alignment="center", **When** I open the dropdown, **Then** I see options: left, center, right
2. **Given** an autosize attribute, **When** I open the dropdown, **Then** I see multi-select flags: left, right, top, bottom, row, column
3. **Given** I select a new option from dropdown, **When** I click it, **Then** the value changes immediately

---

### User Story 6 - Pick Colors from Resources (Priority: P2)

As a user setting color attributes (background-color, font-color, frame-color), I want to select from defined colors in the document or enter a hex value so that I can maintain visual consistency.

**Why this priority**: Color editing is common and resources must be referenced correctly. Critical for visual design workflow.

**Independent Test**: Can be tested by selecting a view and changing background-color.

**Acceptance Scenarios**:

1. **Given** a view with background-color="Background", **When** I open the color picker, **Then** I see all colors defined in the document with swatches
2. **Given** the color picker is open, **When** I select "Accent" from the list, **Then** the attribute changes to "Accent"
3. **Given** a color field, **When** I type "#FF0000FF" directly, **Then** the raw hex value is accepted
4. **Given** a color field, **When** I select a predefined color like "~ BlackCColor", **Then** the predefined reference is used

---

### User Story 7 - Pick Fonts from Resources (Priority: P3)

As a user setting font attributes, I want to select from defined fonts in the document so that I can maintain typography consistency.

**Why this priority**: Font selection is less common than colors but follows the same resource pattern.

**Independent Test**: Can be tested by selecting a CTextLabel and changing its font.

**Acceptance Scenarios**:

1. **Given** a CTextLabel with font="Label", **When** I open the font picker, **Then** I see all fonts defined in the document
2. **Given** the font picker is open, **When** I select "Title", **Then** the font attribute changes and the label re-renders
3. **Given** fonts are defined with different sizes, **When** I view the picker, **Then** I see font preview samples

---

### User Story 8 - Pick Bitmaps from Resources (Priority: P3)

As a user setting bitmap attributes (bitmap, background-offset-bitmap), I want to select from defined bitmaps with thumbnails so that I can choose the right image.

**Why this priority**: Bitmap selection is important for controls like CAnimKnob but less frequent than text/color edits.

**Independent Test**: Can be tested by selecting a CKnob and changing its bitmap.

**Acceptance Scenarios**:

1. **Given** a CKnob with bitmap="knob", **When** I open the bitmap picker, **Then** I see all bitmaps with thumbnail previews
2. **Given** the bitmap picker shows thumbnails, **When** I select "knob-large", **Then** the bitmap attribute changes
3. **Given** a bitmap is multi-frame, **When** I view it in picker, **Then** I see the first frame as preview

---

### User Story 9 - Edit Multiple Selected Views (Priority: P2)

As a user with multiple views selected, I want to edit a shared attribute and have it apply to all selected views so that I can make batch changes efficiently.

**Why this priority**: Multi-selection editing is key for productivity but depends on single-selection editing working first.

**Independent Test**: Can be tested by selecting 3 views and changing a shared attribute.

**Acceptance Scenarios**:

1. **Given** 3 views selected with different background-colors, **When** I set background-color to "Accent", **Then** all 3 views change to "Accent"
2. **Given** 3 views with same font="Label", **When** I change font to "Title", **Then** all 3 views update
3. **Given** views with Mixed values, **When** I edit the Mixed field, **Then** the new value overwrites all selected views
4. **Given** I change a shared attribute, **When** I undo, **Then** all views revert to their original values

---

### User Story 10 - Undo/Redo Property Changes (Priority: P1)

As a user making property edits, I want Ctrl+Z to undo and Ctrl+Y to redo my changes so that I can experiment without fear of making mistakes.

**Why this priority**: Undo/redo is essential for any editor. Must work from day one.

**Independent Test**: Can be tested by editing any attribute, then pressing Ctrl+Z.

**Acceptance Scenarios**:

1. **Given** I changed title from "Hello" to "World", **When** I press Ctrl+Z, **Then** title reverts to "Hello"
2. **Given** I undid a change, **When** I press Ctrl+Y, **Then** the change is reapplied
3. **Given** I made 5 consecutive edits, **When** I press Ctrl+Z 5 times, **Then** all 5 changes are undone in reverse order
4. **Given** multi-selection edit, **When** I undo, **Then** all views revert to their original values in one step

---

### Edge Cases

- What happens when editing an attribute that doesn't exist on the view? Adding new attributes is out of scope for this feature (future: attribute creation).
- What happens when a referenced resource (color, font, bitmap) is deleted? The attribute retains the reference string; validation warning shown.
- What happens when pasting invalid content into a text field? Validation rejects it with error message.
- What happens when editing very long text values? Text fields scroll horizontally; no truncation of value.
- What happens when editing while another user's change comes in (future collaboration)? Out of scope; single-user editing assumed.
- What happens when editing attributes on 100+ selected views? Performance should remain acceptable (<200ms for update).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide editable text inputs for string attributes (title, tooltip, uidesc-label, custom-view-name)
- **FR-002**: System MUST provide editable point inputs for geometry attributes (origin, size) with "x, y" format
- **FR-003**: System MUST provide checkbox toggles for boolean attributes (mouse-enabled, transparent, wants-focus, visible)
- **FR-004**: System MUST provide number inputs with increment/decrement for numeric attributes (opacity, wheel-inc-value, angle-start, angle-range)
- **FR-005**: System MUST provide dropdown selectors for enum attributes (text-alignment, autosize flags, style)
- **FR-006**: System MUST provide a color picker showing all document-defined colors with swatches
- **FR-007**: System MUST provide a font picker showing all document-defined fonts
- **FR-008**: System MUST provide a bitmap picker showing all document-defined bitmaps with thumbnails
- **FR-009**: System MUST update the canvas view in real-time as attribute values change (live preview)
- **FR-010**: System MUST validate inputs and show error feedback for invalid values (red border, error message)
- **FR-011**: System MUST reject invalid values and preserve the original value
- **FR-012**: System MUST support editing attributes across multiple selected views simultaneously
- **FR-013**: System MUST integrate with historyStore to support undo/redo for all property changes
- **FR-014**: System MUST commit edits on Enter key or blur (click outside)
- **FR-015**: System MUST cancel edits on Escape key, restoring original value
- **FR-016**: System MUST persist attribute changes to documentStore

### Key Entities

- **AttributeEditor**: Base abstraction for type-specific attribute input components
- **TextEditor**: String input with validation
- **PointEditor**: Dual-field input for "x, y" formatted values
- **NumberEditor**: Numeric input with step controls and range validation
- **BooleanEditor**: Checkbox toggle
- **EnumEditor**: Dropdown selector with defined options
- **ColorPicker**: Resource selector for colors with swatch preview
- **FontPicker**: Resource selector for fonts with text preview
- **BitmapPicker**: Resource selector for bitmaps with thumbnail preview

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can edit text attributes and see canvas update within 100ms (perceived instant)
- **SC-002**: 100% of editable attributes have type-appropriate input controls
- **SC-003**: Invalid input is rejected with visible error feedback within 50ms of input
- **SC-004**: Undo/redo works correctly for 100% of property edit operations
- **SC-005**: Multi-selection editing applies changes to all selected views in a single operation
- **SC-006**: All resource pickers (color, font, bitmap) show document resources with visual previews
- **SC-007**: Property panel edits persist correctly to the uidesc document structure

---

## Assumptions

- The existing properties panel (011) infrastructure is reused; this feature adds editing capabilities to previously read-only displays
- Resource management (adding/editing colors, fonts, bitmaps) is out of scope; this feature only selects from existing resources
- Attribute creation/deletion is out of scope; only editing existing attributes is supported
- Gradient picker is deferred to a future feature (complex UI for gradient stops)
- Control-tag picker is deferred (requires understanding of parameter binding)
- All VSTGUI attribute types have deterministic validation rules documented in UIDESC_GUIDE.md

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
| FR-014 | ⬜ PENDING | [Test or file that verifies this] |
| FR-015 | ⬜ PENDING | [Test or file that verifies this] |
| FR-016 | ⬜ PENDING | [Test or file that verifies this] |
| SC-001 | ⬜ PENDING | [Measurement or test result] |
| SC-002 | ⬜ PENDING | [Measurement or test result] |
| SC-003 | ⬜ PENDING | [Measurement or test result] |
| SC-004 | ⬜ PENDING | [Measurement or test result] |
| SC-005 | ⬜ PENDING | [Measurement or test result] |
| SC-006 | ⬜ PENDING | [Measurement or test result] |
| SC-007 | ⬜ PENDING | [Measurement or test result] |

**⚠️ CRITICAL**: Any ❌ NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [ ] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with ✅ MET status
- [ ] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [ ] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [ ] **Git Status Check**: Run `git status` to verify all changes are committed
- [ ] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [ ] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [ ] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**⚠️ CRITICAL**: The feature is NOT complete until all work is committed to the feature branch AND the compliance table shows all requirements MET.
