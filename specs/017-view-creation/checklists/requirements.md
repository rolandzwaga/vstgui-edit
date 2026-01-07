# Requirements Quality Checklist: View Creation & Deletion

**Purpose**: Unit tests for requirements - validate completeness, clarity, and consistency of the specification  
**Created**: 2026-01-07  
**Focus**: Full requirements quality validation for all user stories  
**Depth**: Standard  

---

## Requirement Completeness

- [ ] CHK001 - Are deletion keyboard triggers fully specified (Delete AND Backspace)? [Completeness, Spec FR-001]
- [ ] CHK002 - Is the behavior for deleting the root template view defined? [Gap, Edge Case]
- [ ] CHK003 - Are all VSTGUI view classes enumerated for the palette (30+ classes)? [Completeness, Spec FR-019, SC-006]
- [ ] CHK004 - Are default sizes specified for each view class category? [Completeness, Spec FR-026]
- [ ] CHK005 - Is the unique ID generation strategy defined for new views? [Gap, Spec FR-029]
- [ ] CHK006 - Are the category names and groupings for the palette explicitly listed? [Completeness, Spec FR-020]
- [ ] CHK007 - Is clipboard storage format/structure defined? [Gap, Key Entities]

## Requirement Clarity

- [ ] CHK008 - Is "sensible default size" quantified for all view class types? [Clarity, Spec FR-026]
- [ ] CHK009 - Is "internal clipboard" vs system clipboard explicitly distinguished? [Clarity, Spec FR-011]
- [ ] CHK010 - Is the ghost preview appearance (opacity, color, border) specified? [Clarity, Spec FR-024]
- [ ] CHK011 - Is "offset by 10 pixels" behavior clear when views would go out of bounds? [Clarity, Spec FR-006, FR-014]
- [ ] CHK012 - Is the drop target detection algorithm defined (how to determine "container under drop point")? [Clarity, Spec FR-025]
- [ ] CHK013 - Is "incremental offsets" for multiple pastes quantified? [Clarity, US3 Scenario 5]

## Requirement Consistency

- [ ] CHK014 - Are duplicate offset (FR-006) and paste offset (FR-014) values consistent? [Consistency]
- [ ] CHK015 - Is selection behavior after creation consistent across all creation methods (duplicate, paste, drag)? [Consistency, FR-009, FR-017, FR-027]
- [ ] CHK016 - Is undo/redo support consistently required for all mutating operations? [Consistency, FR-003, FR-010, FR-018, FR-028]

## Acceptance Criteria Quality

- [ ] CHK017 - Are all acceptance scenarios testable without subjective interpretation? [Measurability]
- [ ] CHK018 - Are timing requirements in success criteria (1s, 2s, 3s) measurable? [Measurability, SC-001 to SC-005]
- [ ] CHK019 - Is "no delay" for search filtering quantified with a threshold? [Measurability, SC-007]

## Scenario Coverage

- [ ] CHK020 - Are requirements defined for keyboard shortcut conflicts with text input fields? [Coverage, Gap]
- [ ] CHK021 - Are requirements defined for creating views when canvas is not visible/loaded? [Coverage, Edge Case]
- [ ] CHK022 - Are requirements defined for palette panel positioning and sizing? [Coverage, Spec FR-019]
- [ ] CHK023 - Is drag cancellation via Escape key specified? [Coverage, Edge Case, US5 Scenario 7]
- [ ] CHK024 - Are requirements for dragging multiple items from palette defined? [Coverage, Gap]

## Edge Case Coverage

- [ ] CHK025 - Is behavior defined when deleting a view that is the template's only child? [Edge Case, Gap]
- [ ] CHK026 - Is behavior defined for pasting when clipboard contains deleted view references? [Edge Case, Gap]
- [ ] CHK027 - Is behavior defined for creating nested containers via drag (container into container)? [Edge Case, Spec FR-025]
- [ ] CHK028 - Is behavior defined when search field is focused and user presses Delete key? [Edge Case, Gap]
- [ ] CHK029 - Is maximum clipboard size or view count limit defined? [Edge Case, Gap]

## Non-Functional Requirements

- [ ] CHK030 - Are accessibility requirements defined for the view palette (keyboard navigation, ARIA)? [NFR, Gap]
- [ ] CHK031 - Are accessibility requirements defined for drag-and-drop operations? [NFR, Gap]
- [ ] CHK032 - Are performance requirements defined for large hierarchies (100+ views)? [NFR, Gap]

## Dependencies & Assumptions

- [ ] CHK033 - Is the dependency on existing selectionStore documented? [Dependency]
- [ ] CHK034 - Is the dependency on existing historyStore documented? [Dependency]
- [ ] CHK035 - Is the assumption about "no referential integrity" for template attributes validated? [Assumption, Edge Cases]
- [ ] CHK036 - Is the assumption about resource references remaining as strings validated? [Assumption, Edge Cases]

## Ambiguities & Conflicts

- [ ] CHK037 - Is "child of template root" clearly defined when template has CViewContainer wrapper? [Ambiguity, Spec FR-025]
- [ ] CHK038 - Does "all descendants" include nested children at all levels? [Ambiguity, FR-002, FR-007, FR-016]
- [ ] CHK039 - Is priority between "create as sibling" vs "at template root" defined when dropping on non-container? [Ambiguity, Edge Cases]

---

## Summary

- **Total Items**: 39
- **Categories**: 9
- **Traceability**: 85% items reference spec sections or identify gaps
