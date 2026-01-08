# Feature Specification: Schema-Driven Property Panel

**Feature Branch**: `022-schema-driven-properties`  
**Created**: 2026-01-08  
**Status**: Draft  
**Input**: Generate property panel from JSON schema to show all valid attributes for a view class, not just instance values

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All Available Properties (Priority: P1)

As a UI designer editing a view in the vstgui-edit application, I want to see ALL properties available for a view's class type, so that I can discover and set properties that aren't currently defined on the view instance.

**Why this priority**: This is the core functionality that addresses the original bug where properties disappear when their referenced resources are deleted. Without this, users lose the ability to edit certain properties entirely.

**Independent Test**: Can be tested by selecting any view and verifying the property panel shows all schema-defined attributes for that view's class, regardless of what's currently set on the instance.

**Acceptance Scenarios**:

1. **Given** a CTextLabel view with only `origin`, `size`, and `title` set, **When** I select this view, **Then** the property panel shows all CTextLabel attributes including `font-color`, `font`, `text-alignment`, etc.
2. **Given** a view with a `font-color` referencing a color that was deleted, **When** I select this view, **Then** the `font-color` property is still visible in the panel (showing as empty/invalid)
3. **Given** a view element with no `class` attribute (implicit CViewContainer), **When** I select this view, **Then** the property panel shows all CViewContainer attributes

---

### User Story 2 - Distinguish Unset Properties (Priority: P1)

As a UI designer, I want to visually distinguish between properties that have values and properties that are available but not set, so that I can understand the current state of a view at a glance.

**Why this priority**: Critical for usability - users need to know which properties are actively configured vs available for configuration.

**Independent Test**: Can be tested by selecting a view and verifying unset properties appear with distinct visual styling (dimmed, placeholder text, etc.)

**Acceptance Scenarios**:

1. **Given** a view with `font-color` not set, **When** I view the property panel, **Then** `font-color` appears with visual indication it's unset (dimmed or placeholder styling)
2. **Given** a view with `font-color` set to a valid value, **When** I view the property panel, **Then** `font-color` appears with normal styling showing the value
3. **Given** multiple properties in a group where some are set and some unset, **When** I view the property panel, **Then** I can clearly distinguish set from unset properties

---

### User Story 3 - Set Previously Unset Properties (Priority: P1)

As a UI designer, I want to be able to set a value on an unset property, so that I can add new attributes to a view without editing raw XML/JSON.

**Why this priority**: Essential for the property panel to be useful - users must be able to add properties, not just edit existing ones.

**Independent Test**: Can be tested by clicking an unset property, entering a value, and verifying the attribute is added to the view instance.

**Acceptance Scenarios**:

1. **Given** a CTextLabel with no `font-color` set, **When** I click the unset `font-color` property and select a color, **Then** the `font-color` attribute is added to the view instance
2. **Given** I set a value on an unset property, **When** the value is saved, **Then** the property changes from unset styling to normal styling
3. **Given** a newly created view with minimal attributes, **When** I set values on multiple unset properties, **Then** all those attributes are added to the view instance

---

### User Story 4 - Inherited Attributes Display (Priority: P2)

As a UI designer, I want to see properties inherited from parent classes, so that I can access all available configuration options for a view.

**Why this priority**: Important for complete functionality but builds on the core schema-driven display.

**Independent Test**: Can be tested by selecting a CTextLabel and verifying it shows attributes from CView, CControl, CParamDisplay, and CTextLabel.

**Acceptance Scenarios**:

1. **Given** a CTextLabel view selected, **When** I view the property panel, **Then** I see CView attributes (origin, size, opacity, etc.), CControl attributes (tag, default-value, etc.), CParamDisplay attributes (font, font-color, etc.), and CTextLabel-specific attributes
2. **Given** the inheritance chain CTextLabel → CParamDisplay → CControl → CView, **When** displaying attributes, **Then** all inherited attributes are properly merged without duplicates

---

### User Story 5 - Multi-Selection with Same Class (Priority: P2)

As a UI designer selecting multiple views of the same class, I want to see all available properties for that class, so that I can batch-edit any property across the selection.

**Why this priority**: Extends the core functionality to multi-selection scenarios.

**Independent Test**: Can be tested by selecting multiple CTextLabel views and verifying all CTextLabel attributes are shown.

**Acceptance Scenarios**:

1. **Given** three CTextLabel views selected, **When** I view the property panel, **Then** I see all CTextLabel attributes
2. **Given** three CTextLabel views with different `font-color` values selected, **When** I view the property panel, **Then** `font-color` shows as "mixed" with the ability to set a common value
3. **Given** two CTextLabel views where one has `title` set and one doesn't, **When** I view the property panel, **Then** `title` shows as "mixed"

---

### User Story 6 - Multi-Selection with Different Classes (Priority: P3)

As a UI designer selecting views of different classes, I want to see the common properties available to all selected views, so that I can batch-edit shared attributes.

**Why this priority**: Edge case that builds on multi-selection. Most users select same-class views.

**Independent Test**: Can be tested by selecting a CTextLabel and a CSlider and verifying only common base attributes are shown.

**Acceptance Scenarios**:

1. **Given** a CTextLabel and a CSlider selected, **When** I view the property panel, **Then** I see only attributes common to both (CControl and CView attributes)
2. **Given** views with no common class beyond CView, **When** I view the property panel, **Then** only CView attributes are shown

---

### Edge Cases

- What happens when a view has `custom-view-name` but no `class`? → Show CViewContainer attributes (the VSTGUI default)
- What happens when a view has an unknown/invalid `class` value? → Show CView attributes as fallback, indicate error
- How does system handle schema loading failure? → Fall back to current behavior (instance-only attributes)
- What happens when user clears a property value? → Property becomes unset (optional: remove from instance)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST parse the JSON schema to extract all attribute definitions for each view class
- **FR-002**: System MUST resolve attribute inheritance following the schema's `allOf` references
- **FR-003**: System MUST display ALL schema-defined attributes for the selected view's class in the property panel
- **FR-004**: System MUST visually distinguish between set attributes (have instance values) and unset attributes (schema-only)
- **FR-005**: System MUST allow users to set values on unset attributes, adding them to the view instance
- **FR-006**: System MUST default to CViewContainer attributes when no `class` attribute is present
- **FR-007**: System MUST properly group attributes into categories (identity, geometry, appearance, text, behavior, other)
- **FR-008**: System MUST show appropriate editor types based on schema type definitions (color picker for colors, dropdown for enums, etc.)
- **FR-009**: System MUST handle multi-selection by showing schema attributes for the common base class
- **FR-010**: System MUST cache resolved schema attributes for performance

### Key Entities

- **AttributeDefinition**: Represents a schema-defined attribute with name, type, description, and optional enum values
- **ViewClassSchema**: Resolved set of all attributes for a view class including inherited attributes
- **AttributeEntry**: Enhanced to include `isUnset`, `schemaType`, `enumValues`, and `description` fields

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Property panel displays 100% of schema-defined attributes for any selected view class
- **SC-002**: Users can set values on unset properties and have them persist to the document
- **SC-003**: Schema attribute resolution completes in under 50ms for any view class
- **SC-004**: All existing property panel tests continue to pass
- **SC-005**: The original bug (deleted color reference hides property) is resolved - property remains visible

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
- [ ] **Quality Gate - CSS**: Run `npm run lint:css` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Code**: Run `npm run check` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Types**: Run `npm run typecheck` - MUST pass with zero errors/warnings
- [ ] **Git Status Check**: Run `git status` to verify all changes are committed
- [ ] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [ ] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [ ] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**⚠️ CRITICAL**: The feature is NOT complete until:
1. All quality gates pass (lint:css, check, typecheck) with zero errors/warnings
2. All work is committed to the feature branch
3. The compliance table shows all requirements MET
