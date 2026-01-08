# Tasks: Schema-Driven Property Panel

**Input**: Design documents from `/specs/022-schema-driven-properties/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and foundational interfaces needed by all user stories

- [ ] T001 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T002 Add EditorType type definition in `src/types/properties.ts`
- [ ] T003 Add AttributeDefinition interface in `src/types/properties.ts`
- [ ] T004 Add ViewClassSchema interface in `src/types/properties.ts`
- [ ] T005 Extend AttributeEntry interface with isUnset, editorType, enumValues, description fields in `src/types/properties.ts`
- [ ] T006 **Commit**: Stage and commit Phase 1 changes with message "feat(022): add schema-driven property types"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema parsing infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Schema Parsing

- [ ] T007 [P] Write tests for schema $ref resolution in `src/domain/properties/__tests__/schemaAttributes.spec.ts`
- [ ] T008 [P] Write tests for inheritance chain resolution in `src/domain/properties/__tests__/schemaAttributes.spec.ts`
- [ ] T009 [P] Write tests for attribute type mapping in `src/domain/properties/__tests__/attributeTypes.spec.ts`
- [ ] T009a [P] Write test: Unknown/invalid class name falls back to CView attributes in `src/domain/properties/__tests__/schemaAttributes.spec.ts`
- [ ] T009b [P] Write test: Schema loading failure gracefully falls back to instance-only attributes in `src/domain/properties/__tests__/schemaAttributes.spec.ts`

### Implementation

- [ ] T010 Implement resolveRef function to dereference $ref pointers in `src/domain/properties/schemaAttributes.ts`
- [ ] T011 Implement getInheritanceChain function in `src/domain/properties/schemaAttributes.ts`
- [ ] T012 Implement resolveClassAttributes function with allOf merging in `src/domain/properties/schemaAttributes.ts`
- [ ] T013 Implement getAttributesForClass with caching in `src/domain/properties/schemaAttributes.ts`
- [ ] T014 [P] Implement getEditorType function in `src/domain/properties/attributeTypes.ts`
- [ ] T015 Run tests to verify schema parsing works correctly
- [ ] T016 **Commit**: Stage and commit Phase 2 changes with message "feat(022): implement schema parsing and attribute resolution"

**Checkpoint**: Schema parsing infrastructure ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View All Available Properties (Priority: P1) 🎯 MVP

**Goal**: Property panel shows ALL schema-defined attributes for a view class, not just instance values

**Independent Test**: Select any view and verify property panel shows all schema-defined attributes for that view's class

### Tests for User Story 1

- [ ] T017 [US1] Write tests for mergeSelections with schema context in `src/domain/properties/__tests__/mergeSelections.spec.ts`
- [ ] T018 [P] [US1] Write test: CTextLabel shows all CTextLabel attributes even when instance only has origin/size
- [ ] T019 [P] [US1] Write test: View with no class attribute shows CViewContainer attributes
- [ ] T020 [P] [US1] Write test: Deleted color reference doesn't hide font-color property

### Implementation for User Story 1

- [ ] T021 [US1] Update mergeSelections signature to accept schema context function in `src/domain/properties/mergeSelections.ts`
- [ ] T022 [US1] Change attribute enumeration to iterate schema attributes instead of instance keys in `src/domain/properties/mergeSelections.ts`
- [ ] T023 [US1] Add isUnset detection when instance lacks attribute value in `src/domain/properties/mergeSelections.ts`
- [ ] T024 [US1] Update groupAttributes to handle new AttributeEntry fields in `src/domain/properties/groupAttributes.ts`
- [ ] T025 [US1] Expand ATTRIBUTE_GROUP_MAP with all schema attributes in `src/domain/properties/groupAttributes.ts`
- [ ] T026 [US1] Update PropertiesPanel to pass schema context to mergeSelections in `src/components/PropertiesPanel/PropertiesPanel.tsx`
- [ ] T026a [US1] Wire editorType from schema to AttributeRow for appropriate editor selection in `src/components/PropertiesPanel/PropertiesPanel.tsx`
- [ ] T027 [US1] Run all tests to verify User Story 1 functionality
- [ ] T028 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(022): display all schema-defined attributes in property panel"

**Checkpoint**: Property panel now shows all schema attributes for selected view class

---

## Phase 4: User Story 2 - Distinguish Unset Properties (Priority: P1)

**Goal**: Visually distinguish between set and unset properties

**Independent Test**: Select a view and verify unset properties appear with distinct styling

### Tests for User Story 2

- [ ] T029 [US2] Write component tests for unset attribute styling in `src/components/PropertiesPanel/__tests__/AttributeRow.spec.tsx`

### Implementation for User Story 2

- [ ] T030 [US2] Add CSS classes for unset attribute styling in `src/components/PropertiesPanel/PropertiesPanel.module.css`
- [ ] T031 [US2] Update AttributeRow to apply unset styling when isUnset is true in `src/components/PropertiesPanel/AttributeRow.tsx`
- [ ] T032 [US2] Add placeholder text display for unset values in `src/components/PropertiesPanel/AttributeRow.tsx`
- [ ] T033 [US2] Run component tests to verify styling
- [ ] T034 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(022): add visual distinction for unset properties"

**Checkpoint**: Users can visually distinguish set from unset properties

---

## Phase 5: User Story 3 - Set Previously Unset Properties (Priority: P1)

**Goal**: Allow users to set values on unset properties, adding them to the view instance

**Independent Test**: Click an unset property, enter a value, and verify the attribute is added to the view instance

### Tests for User Story 3

- [ ] T035 [US3] Write tests for attribute addition in document store in `src/stores/__tests__/documentStore.spec.ts`

### Implementation for User Story 3

- [ ] T036 [US3] Add setViewAttribute action to handle new attribute creation in `src/stores/documentStore.ts`
- [ ] T037 [US3] Update AttributeRow to enable editing on unset attributes in `src/components/PropertiesPanel/AttributeRow.tsx`
- [ ] T038 [US3] Wire attribute value changes to setViewAttribute for unset properties in `src/components/PropertiesPanel/PropertiesPanel.tsx`
- [ ] T039 [US3] Run tests to verify attribute addition works
- [ ] T040 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(022): enable setting values on unset properties"

**Checkpoint**: Users can add new attributes to views via property panel

---

## Phase 6: User Story 4 - Inherited Attributes Display (Priority: P2)

**Goal**: Display attributes inherited from parent classes

**Independent Test**: Select CTextLabel and verify it shows attributes from CView, CControl, CParamDisplay, and CTextLabel

### Tests for User Story 4

- [ ] T041 [US4] Write test for full inheritance chain display in `src/domain/properties/__tests__/schemaAttributes.spec.ts`
- [ ] T042 [P] [US4] Write test: CTextLabel shows CView attributes (origin, size, opacity)
- [ ] T043 [P] [US4] Write test: CTextLabel shows CControl attributes (tag, default-value)
- [ ] T044 [P] [US4] Write test: No duplicate attributes from inheritance chain

### Implementation for User Story 4

- [ ] T045 [US4] Verify resolveClassAttributes properly merges all inherited properties in `src/domain/properties/schemaAttributes.ts`
- [ ] T046 [US4] Add deduplication logic to prevent duplicate attributes from inheritance in `src/domain/properties/schemaAttributes.ts`
- [ ] T047 [US4] Run tests to verify inheritance display
- [ ] T048 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(022): display inherited attributes from parent classes"

**Checkpoint**: Inheritance chain fully resolved and displayed

---

## Phase 7: User Story 5 - Multi-Selection with Same Class (Priority: P2)

**Goal**: Show all class attributes when multiple views of same class are selected

**Independent Test**: Select multiple CTextLabel views and verify all CTextLabel attributes are shown

### Tests for User Story 5

- [ ] T049 [US5] Write test for multi-selection same class in `src/domain/properties/__tests__/mergeSelections.spec.ts`
- [ ] T050 [P] [US5] Write test: Three CTextLabel views show all CTextLabel attributes
- [ ] T051 [P] [US5] Write test: Mixed values show as "mixed" state

### Implementation for User Story 5

- [ ] T052 [US5] Update mergeSelections to use schema from common class for multi-selection in `src/domain/properties/mergeSelections.ts`
- [ ] T053 [US5] Handle mixed isUnset state (one set, one unset) in `src/domain/properties/mergeSelections.ts`
- [ ] T054 [US5] Run tests to verify multi-selection behavior
- [ ] T055 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(022): support multi-selection with same class"

**Checkpoint**: Multi-selection of same class works correctly

---

## Phase 8: User Story 6 - Multi-Selection with Different Classes (Priority: P3)

**Goal**: Show common base class attributes when views of different classes are selected

**Independent Test**: Select CTextLabel and CSlider, verify only CControl/CView attributes shown

### Tests for User Story 6

- [ ] T056 [US6] Write test for findCommonBaseClass function in `src/domain/properties/__tests__/schemaAttributes.spec.ts`
- [ ] T057 [P] [US6] Write test: CTextLabel + CSlider shows CControl attributes
- [ ] T058 [P] [US6] Write test: Views with only CView common show CView attributes

### Implementation for User Story 6

- [ ] T059 [US6] Implement findCommonBaseClass function in `src/domain/properties/schemaAttributes.ts`
- [ ] T060 [US6] Update mergeSelections to use common base class for mixed selection in `src/domain/properties/mergeSelections.ts`
- [ ] T061 [US6] Run tests to verify mixed class selection
- [ ] T062 [US6] **Commit**: Stage and commit User Story 6 changes with message "feat(022): support multi-selection with different classes"

**Checkpoint**: All multi-selection scenarios now work correctly

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, documentation, and cleanup

- [ ] T063 [P] Add performance test: schema resolution < 50ms in `src/domain/properties/__tests__/schemaAttributes.spec.ts`
- [ ] T064 Verify schema cache is populated at module load for performance
- [ ] T065 [P] Update CLAUDE.md with new schema utilities and patterns
- [ ] T066 Run full test suite to verify all existing tests still pass
- [ ] T067 **Commit**: Stage and commit Polish phase changes with message "chore(022): performance optimization and documentation"

---

## Phase Final-1: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**⚠️ CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [ ] TQG-1 **CSS Linting**: Run `npm run lint:css` - Fix ALL errors and warnings
- [ ] TQG-2 **Code Quality**: Run `npm run check` - Fix ALL errors and warnings  
- [ ] TQG-3 **Type Safety**: Run `npm run typecheck` - Fix ALL errors and warnings
- [ ] TQG-4 **Verify Clean**: Re-run all three commands to confirm zero issues remain

**If Quality Gates Fail**:
1. STOP - do not proceed to Git Verification
2. FIX all reported errors and warnings
3. RE-RUN the failing command(s)
4. REPEAT until all three commands pass cleanly

**NO EXCEPTIONS**: Even "pre-existing" issues MUST be resolved. The spec is NOT complete until all quality gates pass.

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL-1 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL-2 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with an appropriate message
- [ ] TFINAL-3 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1, US2, US3 are all P1 priority - complete in order
  - US4, US5 are P2 priority - complete after P1 stories
  - US6 is P3 priority - complete last
- **Polish (Phase 9)**: Depends on all user stories being complete
- **Quality Gates (Phase Final-1)**: Depends on Polish completion
- **Git Verification (Phase Final)**: Depends on Quality Gates passing

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational - Core schema-driven display
- **User Story 2 (P1)**: Depends on US1 - Visual styling for unset
- **User Story 3 (P1)**: Depends on US2 - Enable value setting on unset
- **User Story 4 (P2)**: Depends on Foundational - Can be parallel with US1-3 but logically follows
- **User Story 5 (P2)**: Depends on US1 - Multi-selection same class
- **User Story 6 (P3)**: Depends on US5 - Multi-selection different classes

### Parallel Opportunities

- T007, T008, T009 can run in parallel (different test files)
- T018, T019, T020 can run in parallel (independent test cases)
- T042, T043, T044 can run in parallel (independent test cases)
- T050, T051 can run in parallel (independent test cases)
- T057, T058 can run in parallel (independent test cases)

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup (types)
2. Complete Phase 2: Foundational (schema parsing)
3. Complete Phase 3: User Story 1 (display all attributes)
4. Complete Phase 4: User Story 2 (visual distinction)
5. Complete Phase 5: User Story 3 (set unset properties)
6. **STOP and VALIDATE**: Core functionality complete, original bug fixed

### Incremental Delivery

1. Setup + Foundational → Schema parsing works
2. Add US1 → Property panel shows all attributes (MVP!)
3. Add US2 → Users can see which are set vs unset
4. Add US3 → Users can add new attributes
5. Add US4 → Full inheritance support
6. Add US5 → Multi-selection same class
7. Add US6 → Multi-selection different classes

---

## Files Summary

| File | Action | User Stories |
|------|--------|--------------|
| `src/types/properties.ts` | MODIFY | Setup |
| `src/domain/properties/schemaAttributes.ts` | CREATE | Foundational, US4, US6 |
| `src/domain/properties/attributeTypes.ts` | CREATE | Foundational |
| `src/domain/properties/mergeSelections.ts` | MODIFY | US1, US5, US6 |
| `src/domain/properties/groupAttributes.ts` | MODIFY | US1 |
| `src/components/PropertiesPanel/PropertiesPanel.tsx` | MODIFY | US1, US3 |
| `src/components/PropertiesPanel/AttributeRow.tsx` | MODIFY | US2, US3 |
| `src/components/PropertiesPanel/PropertiesPanel.module.css` | MODIFY | US2 |
| `src/stores/documentStore.ts` | MODIFY | US3 |

---

## Notes

- Constitution requires Test-First Development: write tests before implementation
- All tests must follow patterns in `specs/TESTING-GUIDE.md`
- Performance target: schema resolution < 50ms (SC-003)
- Must not break existing property panel tests (SC-004)
- Original bug (SC-005): deleted color reference must not hide property
