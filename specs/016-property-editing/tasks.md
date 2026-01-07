# Tasks: Property Editing

**Input**: Design documents from `/specs/016-property-editing/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create types and project structure for editor components

- [ ] T001 Create editor types in `src/types/editors.ts` (EditorType enum, AttributeTypeConfig, ValidationResult, EditorProps interfaces)
- [ ] T002 [P] Create `src/components/editors/` directory structure
- [ ] T003 [P] Create `src/domain/properties/__tests__/` directory structure
- [ ] T004 [P] Create `src/components/editors/__tests__/` directory structure
- [ ] T005 **Commit**: Stage and commit Phase 1 setup changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain utilities and store extensions that ALL editors depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Domain Utilities

- [ ] T006 **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding with tests
- [ ] T007 Write tests for `attributeTypes.ts` in `src/domain/properties/__tests__/attributeTypes.spec.ts`
- [ ] T008 Implement ATTRIBUTE_TYPE_MAP and getAttributeConfig() in `src/domain/properties/attributeTypes.ts`
- [ ] T009 [P] Write tests for validation utilities in `src/domain/properties/__tests__/validation.spec.ts`
- [ ] T010 [P] Implement validation functions (validatePoint, validateSize, validateNumber, validateBoolean, validateColor) in `src/domain/properties/validation.ts`

### Store Extensions

- [ ] T011 Write tests for documentStore extensions in `src/stores/__tests__/documentStore.attribute.spec.ts`
- [ ] T012 Implement `getViewAttribute()` and `updateViewAttribute()` in `src/stores/documentStore.ts`
- [ ] T013 Export new functions from documentStore and verify existing tests still pass

### Editor Base CSS

- [ ] T014 [P] Create shared editor styles in `src/components/editors/editors.module.css` (error states, focus styles, input base)

- [ ] T015 **Commit**: Stage and commit Phase 2 foundational changes

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1+10 - Text Editing with Undo/Redo (Priority: P1) 🎯 MVP

**Goal**: Enable editing text attributes (title, tooltip) with live preview and full undo/redo support

**Independent Test**: Select a CTextLabel, edit "title" to new value, verify canvas updates. Press Ctrl+Z to undo.

### Tests for User Story 1+10

- [ ] T016 [US1] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T017 [US1] Write tests for TextEditor component in `src/components/editors/__tests__/TextEditor.spec.tsx`
- [ ] T018 [US1] Write integration tests for text editing + history in `src/components/PropertiesPanel/__tests__/PropertiesPanel.edit.spec.tsx`

### Implementation for User Story 1+10

- [ ] T019 [US1] Create TextEditor component in `src/components/editors/TextEditor.tsx` with value/onChange/onCommit/onCancel props
- [ ] T020 [US1] Create TextEditor styles in `src/components/editors/TextEditor.module.css`
- [ ] T021 [US1] Create property edit history operation factory in `src/domain/properties/historyOperations.ts`
- [ ] T022 [US1] Extend AttributeRow in `src/components/PropertiesPanel/AttributeRow.tsx` to render TextEditor for text-type attributes
- [ ] T023 [US1] Wire up history integration: push operation on commit, support undo/redo
- [ ] T024 [US1] Verify Enter commits, Escape cancels, blur commits (FR-014, FR-015)
- [ ] T025 [US1] Run `npx biome check --write . && npx tsc --noEmit` and fix any issues
- [ ] T026 [US1] **Commit**: Stage and commit User Story 1+10 (Text + Undo/Redo) changes

**Checkpoint**: Text editing with undo/redo fully functional

---

## Phase 4: User Story 2 - Geometry Editing (Priority: P1)

**Goal**: Enable editing origin and size attributes with "x, y" format validation

**Independent Test**: Select view, edit origin to "100, 200", verify view moves on canvas

### Tests for User Story 2

- [ ] T027 [US2] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T028 [US2] Write tests for PointEditor in `src/components/editors/__tests__/PointEditor.spec.tsx`

### Implementation for User Story 2

- [ ] T029 [US2] Create PointEditor component in `src/components/editors/PointEditor.tsx` with point validation
- [ ] T030 [US2] Create PointEditor styles in `src/components/editors/PointEditor.module.css`
- [ ] T031 [US2] Extend AttributeRow to render PointEditor for point-type attributes (origin, size)
- [ ] T032 [US2] Add validation error display (red border, error message) per FR-010
- [ ] T033 [US2] Verify invalid values rejected, original preserved (FR-011)
- [ ] T034 [US2] Run `npx biome check --write . && npx tsc --noEmit` and fix any issues
- [ ] T035 [US2] **Commit**: Stage and commit User Story 2 (Geometry) changes

**Checkpoint**: Geometry editing with validation fully functional

---

## Phase 5: User Story 3 - Boolean Editing (Priority: P1)

**Goal**: Enable toggling boolean attributes with checkbox

**Independent Test**: Select view, toggle mouse-enabled checkbox, verify value changes

### Tests for User Story 3

- [ ] T036 [US3] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T037 [US3] Write tests for BooleanEditor in `src/components/editors/__tests__/BooleanEditor.spec.tsx`

### Implementation for User Story 3

- [ ] T038 [US3] Create BooleanEditor component in `src/components/editors/BooleanEditor.tsx`
- [ ] T039 [US3] Create BooleanEditor styles in `src/components/editors/BooleanEditor.module.css`
- [ ] T040 [US3] Extend AttributeRow to render BooleanEditor for boolean-type attributes
- [ ] T041 [US3] Verify checkbox toggles immediately and pushes history operation
- [ ] T042 [US3] Run `npx biome check --write . && npx tsc --noEmit` and fix any issues
- [ ] T043 [US3] **Commit**: Stage and commit User Story 3 (Boolean) changes

**Checkpoint**: Boolean editing fully functional

---

## Phase 6: User Story 4 - Numeric Editing (Priority: P2)

**Goal**: Enable editing numeric attributes with increment/decrement and range clamping

**Independent Test**: Select view with opacity, increment value, verify visual change

### Tests for User Story 4

- [ ] T044 [US4] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T045 [US4] Write tests for NumberEditor in `src/components/editors/__tests__/NumberEditor.spec.tsx`

### Implementation for User Story 4

- [ ] T046 [US4] Create NumberEditor component in `src/components/editors/NumberEditor.tsx` with min/max/step props
- [ ] T047 [US4] Create NumberEditor styles in `src/components/editors/NumberEditor.module.css`
- [ ] T048 [US4] Add increment/decrement buttons or spinbox UI
- [ ] T049 [US4] Implement up/down arrow key handling for increment/decrement
- [ ] T050 [US4] Extend AttributeRow to render NumberEditor for number-type attributes
- [ ] T051 [US4] Verify range clamping (e.g., opacity 0-1)
- [ ] T052 [US4] Run `npx biome check --write . && npx tsc --noEmit` and fix any issues
- [ ] T053 [US4] **Commit**: Stage and commit User Story 4 (Numeric) changes

**Checkpoint**: Numeric editing with increment/decrement fully functional

---

## Phase 7: User Story 5 - Enum Selection (Priority: P2)

**Goal**: Enable selecting from fixed options via dropdown

**Independent Test**: Select CTextLabel, change text-alignment via dropdown

### Tests for User Story 5

- [ ] T054 [US5] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T055 [US5] Write tests for EnumEditor in `src/components/editors/__tests__/EnumEditor.spec.tsx`

### Implementation for User Story 5

- [ ] T056 [US5] Create EnumEditor component in `src/components/editors/EnumEditor.tsx` with options prop
- [ ] T057 [US5] Create EnumEditor styles in `src/components/editors/EnumEditor.module.css`
- [ ] T058 [US5] Use @floating-ui/dom for dropdown positioning
- [ ] T059 [US5] Handle autosize multi-flag special case (flags prop instead of options)
- [ ] T060 [US5] Extend AttributeRow to render EnumEditor for enum-type attributes
- [ ] T061 [US5] Run `npx biome check --write . && npx tsc --noEmit` and fix any issues
- [ ] T062 [US5] **Commit**: Stage and commit User Story 5 (Enum) changes

**Checkpoint**: Enum selection fully functional

---

## Phase 8: User Story 6+9 - Color Picker with Multi-Selection (Priority: P2)

**Goal**: Enable color selection from document resources with multi-selection editing support

**Independent Test**: Select 3 views, change background-color to "Accent", verify all update

### Tests for User Story 6+9

- [ ] T063 [US6] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T064 [US6] Write tests for ColorPicker in `src/components/editors/__tests__/ColorPicker.spec.tsx`
- [ ] T065 [US9] Write tests for multi-selection editing in `src/components/PropertiesPanel/__tests__/PropertiesPanel.multiselect.edit.spec.tsx`

### Implementation for User Story 6+9

- [ ] T066 [US6] Create ColorPicker component in `src/components/editors/ColorPicker.tsx`
- [ ] T067 [US6] Create ColorPicker styles in `src/components/editors/ColorPicker.module.css` with color swatches
- [ ] T068 [US6] Access document colors via documentStore for resource list
- [ ] T069 [US6] Support hex color direct input and predefined colors (~)
- [ ] T070 [US6] Use @floating-ui/dom for picker dropdown positioning
- [ ] T071 [US9] Implement multi-selection editing logic in AttributeRow (apply to all selected views)
- [ ] T072 [US9] Create batched history operation for multi-view edits
- [ ] T073 [US6] Extend AttributeRow to render ColorPicker for color-type attributes
- [ ] T074 [US6] Verify color validation per data-model.md rules
- [ ] T075 [US6] Run `npx biome check --write . && npx tsc --noEmit` and fix any issues
- [ ] T076 [US6] **Commit**: Stage and commit User Story 6+9 (Color + Multi-selection) changes

**Checkpoint**: Color picker and multi-selection editing fully functional

---

## Phase 9: User Story 7 - Font Picker (Priority: P3)

**Goal**: Enable font selection from document resources with preview

**Independent Test**: Select CTextLabel, change font via picker, verify text re-renders

### Tests for User Story 7

- [ ] T077 [US7] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T078 [US7] Write tests for FontPicker in `src/components/editors/__tests__/FontPicker.spec.tsx`

### Implementation for User Story 7

- [ ] T079 [US7] Create FontPicker component in `src/components/editors/FontPicker.tsx`
- [ ] T080 [US7] Create FontPicker styles in `src/components/editors/FontPicker.module.css` with font previews
- [ ] T081 [US7] Access document fonts via documentStore
- [ ] T082 [US7] Extend AttributeRow to render FontPicker for font-type attributes
- [ ] T083 [US7] Run `npx biome check --write . && npx tsc --noEmit` and fix any issues
- [ ] T084 [US7] **Commit**: Stage and commit User Story 7 (Font) changes

**Checkpoint**: Font picker fully functional

---

## Phase 10: User Story 8 - Bitmap Picker (Priority: P3)

**Goal**: Enable bitmap selection from document resources with thumbnails

**Independent Test**: Select view with bitmap attribute, change bitmap via picker

### Tests for User Story 8

- [ ] T085 [US8] **Verify Testing Guide** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T086 [US8] Write tests for BitmapPicker in `src/components/editors/__tests__/BitmapPicker.spec.tsx`

### Implementation for User Story 8

- [ ] T087 [US8] Create BitmapPicker component in `src/components/editors/BitmapPicker.tsx`
- [ ] T088 [US8] Create BitmapPicker styles in `src/components/editors/BitmapPicker.module.css` with thumbnails
- [ ] T089 [US8] Access document bitmaps via documentStore, handle path vs embedded data
- [ ] T090 [US8] Extend AttributeRow to render BitmapPicker for bitmap-type attributes
- [ ] T091 [US8] Run `npx biome check --write . && npx tsc --noEmit` and fix any issues
- [ ] T092 [US8] **Commit**: Stage and commit User Story 8 (Bitmap) changes

**Checkpoint**: Bitmap picker fully functional

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation

- [ ] T093 Run full test suite: `npm test` - verify all tests pass
- [ ] T094 Run `npx biome check --write .` - final lint/format pass
- [ ] T095 Run `npx tsc --noEmit` - final type check
- [ ] T096 [P] Update CLAUDE.md with new editor utilities and patterns
- [ ] T097 [P] Verify live preview performance (<100ms per SC-001)
- [ ] T098 Verify all FR requirements met - update spec.md compliance table
- [ ] T099 Verify all SC requirements met - update spec.md compliance table
- [ ] T100 **Commit**: Stage and commit Polish phase changes

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] T101 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] T102 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit
- [ ] T103 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational completion
  - US1+10 → US2 → US3 → US4 → US5 → US6+9 → US7 → US8 (sequential by priority)
  - Or parallel by different developers after Phase 2
- **Polish (Phase 11)**: After all user stories complete

### User Story Dependencies

| Story | Priority | Dependencies | Can Start After |
|-------|----------|--------------|-----------------|
| US1+10 (Text+Undo) | P1 | Foundational | Phase 2 |
| US2 (Geometry) | P1 | Foundational | Phase 2 |
| US3 (Boolean) | P1 | Foundational | Phase 2 |
| US4 (Numeric) | P2 | Foundational | Phase 2 |
| US5 (Enum) | P2 | Foundational | Phase 2 |
| US6+9 (Color+Multi) | P2 | Foundational | Phase 2 |
| US7 (Font) | P3 | Foundational, ColorPicker pattern from US6 | Phase 8 |
| US8 (Bitmap) | P3 | Foundational, ColorPicker pattern from US6 | Phase 8 |

### Within Each User Story

1. **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md`
2. Write tests (MUST FAIL before implementation)
3. Implement component
4. Integrate into AttributeRow
5. Verify with quality checks
6. Commit

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
- T009 + T010 (validation) can run parallel to T007 + T008 (attributeTypes)
- T014 (CSS) can run parallel to domain work

**Within User Story Phases**:
- Tests can be written in parallel (if multiple developers)
- US1, US2, US3 can run in parallel after Phase 2 (all P1, no dependencies)
- US4, US5 can run in parallel (both P2, no dependencies)
- US7, US8 can run in parallel (both P3, similar patterns)

---

## Implementation Strategy

### MVP First (User Story 1+10 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1+10 (Text + Undo/Redo)
4. **STOP and VALIDATE**: Test text editing + undo independently
5. Demo basic editing capability

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1+10 → Text + Undo/Redo working (MVP!)
3. Add US2 → Geometry editing working
4. Add US3 → Boolean editing working
5. Add US4+5 → Numeric + Enum editing working
6. Add US6+9 → Color picker + Multi-selection working
7. Add US7+8 → Font + Bitmap pickers working (Full feature!)

---

## Summary

| Phase | Tasks | User Story | Parallel |
|-------|-------|------------|----------|
| 1. Setup | T001-T005 | - | Some |
| 2. Foundational | T006-T015 | - | Some |
| 3. Text+Undo | T016-T026 | US1+US10 | Tests |
| 4. Geometry | T027-T035 | US2 | Some |
| 5. Boolean | T036-T043 | US3 | Some |
| 6. Numeric | T044-T053 | US4 | Some |
| 7. Enum | T054-T062 | US5 | Some |
| 8. Color+Multi | T063-T076 | US6+US9 | Tests |
| 9. Font | T077-T084 | US7 | Some |
| 10. Bitmap | T085-T092 | US8 | Some |
| 11. Polish | T093-T100 | - | Some |
| Final. Git | T101-T103 | - | No |

**Total Tasks**: 103
**MVP Scope**: Phases 1-3 (26 tasks) delivers text editing with undo/redo
