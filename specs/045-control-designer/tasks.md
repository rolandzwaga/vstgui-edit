# Tasks: Control Designer Plugin Architecture

**Input**: Design documents from `F:\projects\vstgui-edit\specs\045-control-designer\`
**Prerequisites**: plan.md, spec.md, research.md (in plan.md)

**Tests**: Tests are NOT explicitly requested in the spec - implementation tasks only.

**Testing Guide**: Use `/testing-guide` skill if manual testing needed.

**SolidJS Guide**: Use `/solidjs-guide` skill before writing components or stores.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new type system and shared architecture without breaking existing code

- [X] T001 [P] Create type definitions in `F:\projects\vstgui-edit\src\types\controlDesigner\base.ts` (ControlTypeId, ControlCategory, BaseControlDesign, LightingConfig, BaseOutputConfig, MaterialTarget)
- [X] T002 [P] Create knob type definitions in `F:\projects\vstgui-edit\src\types\controlDesigner\knob.ts` (migrate from knobDesigner.ts: KnobDesign, KnobLayer, RotationalOutputConfig)
- [X] T003 [P] Create slider type definitions in `F:\projects\vstgui-edit\src\types\controlDesigner\slider.ts` (SliderDesign, SliderTrack, SliderHandle, SliderValueFill, HandleShape, ValueFillMode, LinearOutputConfig)
- [X] T004 [P] Create type definitions index in `F:\projects\vstgui-edit\src\types\controlDesigner\index.ts` (re-exports)
- [X] T005 Create plugin registry in `F:\projects\vstgui-edit\src\domain\controlDesigner\registry.ts` (ControlTypePlugin interface, register/get/getAll functions, Map-based registry)
- [X] T006 [P] Create shared materials utilities in `F:\projects\vstgui-edit\src\domain\controlDesigner\materials.ts` (migrate material creation from knobDesigner)
- [X] T007 [P] Create shared scene utilities in `F:\projects\vstgui-edit\src\domain\controlDesigner\scene.ts` (migrate scene setup from knobRenderer)
- [X] T008 [P] Create shared filmstrip utilities in `F:\projects\vstgui-edit\src\domain\controlDesigner\filmstrip.ts` (migrate canvas operations from knobRenderer)
- [X] T009 [P] Create shared validation utilities in `F:\projects\vstgui-edit\src\domain\controlDesigner\validation.ts` (base validation patterns)
- [X] T010 [P] Create defaults factory in `F:\projects\vstgui-edit\src\domain\controlDesigner\defaults.ts` (shared default values)
- [X] T011 [P] Create domain index in `F:\projects\vstgui-edit\src\domain\controlDesigner\index.ts` (re-exports)
- [X] T012 **Commit**: Stage and commit Phase 1 changes with message "feat: add control designer type system and shared utilities"

---

## Phase 2: Foundational (Database & Knob Plugin)

**Purpose**: Extend IndexedDB schema and create knob plugin wrapper - MUST complete before new UI

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T013 Update IndexedDB schema in `F:\projects\vstgui-edit\src\domain\project\types.ts` and `F:\projects\vstgui-edit\src\services\indexedDB\database.ts` (bump DB_VERSION from 3 to 4, add controlType index to presets store, add migration logic in database.ts onupgradeneeded handler to add controlType: 'knob' to existing presets)
- [X] T014 Update preset service in `F:\projects\vstgui-edit\src\services\indexedDB\presetService.ts` (add getByControlType(controlType) query, update getAll to support controlType filter)
- [X] T015 Update project types in `F:\projects\vstgui-edit\src\domain\project\types.ts` (add INDEXES.PRESETS_BY_CONTROL_TYPE = 'controlType')
- [X] T016 Create knob validation in `F:\projects\vstgui-edit\src\domain\knobDesigner\validation.ts` (migrate knob-specific constraints from existing code) [Already exists, updated with controlType support]
- [X] T017 Create knob defaults in `F:\projects\vstgui-edit\src\domain\knobDesigner\defaults.ts` (migrate DEFAULT_KNOB_DESIGN, layer factories) [Already exists, updated with controlType field]
- [X] T018 Create knob plugin definition in `F:\projects\vstgui-edit\src\domain\knobDesigner\plugin.ts` (ControlTypePlugin implementation, wraps existing knob functionality, registers LayerPanel and IndicatorPanel)
- [X] T019 Create knob renderer in `F:\projects\vstgui-edit\src\services\controlRenderer\knobRenderer.ts` (migrate from src/services/knobRenderer/index.ts, implement ControlRenderer interface)
- [X] T020 Create base renderer in `F:\projects\vstgui-edit\src\services\controlRenderer\base.ts` (shared scene/camera/lighting setup extracted from knobRenderer)
- [X] T021 Create renderer service index in `F:\projects\vstgui-edit\src\services\controlRenderer\index.ts` (re-exports)
- [X] T022 **Commit**: Stage and commit Phase 2 changes with message "feat: extend IndexedDB for control types and create knob plugin"

**Checkpoint**: Foundation ready - knob plugin registered, database schema updated

---

## Phase 3: User Story 3 - Use Existing Knob Designer via Plugin (Priority: P2)

**Goal**: Preserve existing knob functionality through the new plugin architecture (backward compatibility before adding slider)

**Independent Test**: Right-click a bitmap, select "Design Knob", verify all existing features work identically

**Why P2 first**: This validates the plugin architecture works correctly before implementing slider (US1). We need to prove we haven't broken anything.

### Implementation for User Story 3

- [X] T023 [P] [US3] Migrate LightingPanel to shared location in `F:\projects\vstgui-edit\src\components\ControlDesigner\LightingPanel.tsx` (accept lighting state and callbacks via props instead of reading knobDesignerStore directly)
- [X] T024 [P] [US3] Migrate LightingPanel styles to `F:\projects\vstgui-edit\src\components\ControlDesigner\LightingPanel.module.css`
- [X] T025 [P] [US3] Update MaterialPanel in `F:\projects\vstgui-edit\src\components\KnobDesigner\MaterialPanel.tsx` (add optional targetSelector prop with dropdown for component selection)
- [X] T026 [P] [US3] Update PresetSelector in `F:\projects\vstgui-edit\src\components\KnobDesigner\PresetSelector.tsx` (add controlType filter prop, update preset loading to filter by type)
- [X] T027 [P] [US3] Update OutputPanel in `F:\projects\vstgui-edit\src\components\KnobDesigner\OutputPanel.tsx` (make rotation settings conditional based on control category)
- [X] T028 [US3] Create unified store in `F:\projects\vstgui-edit\src\stores\controlDesignerStore.ts` (multi-type state with designs record, activeControlType signal, plugin dispatch, auto-save on tab switch, delegates to plugins for validation/rendering)
- [X] T029 [US3] Create ControlTypeTabs component in `F:\projects\vstgui-edit\src\components\ControlDesigner\ControlTypeTabs.tsx` (tab bar rendering, active state management, click handlers)
- [X] T030 [US3] Create ControlTypeTabs styles in `F:\projects\vstgui-edit\src\components\ControlDesigner\ControlTypeTabs.module.css`
- [X] T031 [US3] Create ControlPreview component in `F:\projects\vstgui-edit\src\components\ControlDesigner\ControlPreview.tsx` (unified preview with renderer lifecycle, raycaster for component selection, canvas management)
- [X] T032 [US3] Create ControlPreview styles in `F:\projects\vstgui-edit\src\components\ControlDesigner\ControlPreview.module.css`
- [X] T033 [US3] Create ControlDesignerModal in `F:\projects\vstgui-edit\src\components\ControlDesigner\ControlDesignerModal.tsx` (modal shell with tabs, dynamic panel rendering based on active plugin, action buttons)
- [X] T034 [US3] Create ControlDesignerModal styles in `F:\projects\vstgui-edit\src\components\ControlDesigner\ControlDesignerModal.module.css`
- [X] T035 [US3] Create ControlDesigner index in `F:\projects\vstgui-edit\src\components\ControlDesigner\index.ts` (re-exports)
- [X] T036 [US3] Register knob plugin in application startup (call registerControlType(knobPlugin) in appropriate initialization location)
- [X] T037 [US3] Update bitmap context menu to use new ControlDesignerModal (replace KnobDesignerModal invocation with new modal - kept legacy modal for now, added new unified modal to App)
- [ ] T038 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat: migrate knob designer to plugin architecture"

**Checkpoint**: Knob designer works through new unified modal and plugin system - backward compatibility confirmed

---

## Phase 4: User Story 2 - Switch Between Control Types (Priority: P1)

**Goal**: Enable tab switching between Knob and Slider (slider panels exist but may be stubs initially)

**Independent Test**: Open designer, click Knob/Slider tabs, verify panel switching and state preservation

**Why after US3**: We need the knob plugin working before we can test switching away from it and back.

### Implementation for User Story 2

- [ ] T039 [P] [US2] Create slider defaults in `F:\projects\vstgui-edit\src\domain\sliderDesigner\defaults.ts` (DEFAULT_SLIDER_DESIGN factory with sensible track/handle/fill values)
- [ ] T040 [P] [US2] Create slider validation in `F:\projects\vstgui-edit\src\domain\sliderDesigner\validation.ts` (slider-specific constraints: track length 10-100%, width 5-50%, handle dimensions, corner radius ranges)
- [ ] T041 [US2] Create slider plugin definition in `F:\projects\vstgui-edit\src\domain\sliderDesigner\plugin.ts` (ControlTypePlugin implementation for slider, registers TrackPanel/HandlePanel/ValueFillPanel, category: 'linear')
- [ ] T042 [P] [US2] Create TrackPanel stub in `F:\projects\vstgui-edit\src\components\SliderDesigner\TrackPanel.tsx` (orientation, length, width, depth, corner radius controls - can be basic inputs initially)
- [ ] T043 [P] [US2] Create TrackPanel styles in `F:\projects\vstgui-edit\src\components\SliderDesigner\TrackPanel.module.css`
- [ ] T044 [P] [US2] Create HandlePanel stub in `F:\projects\vstgui-edit\src\components\SliderDesigner\HandlePanel.tsx` (shape selector, width, height, grip lines controls)
- [ ] T045 [P] [US2] Create HandlePanel styles in `F:\projects\vstgui-edit\src\components\SliderDesigner\HandlePanel.module.css`
- [ ] T046 [P] [US2] Create ValueFillPanel stub in `F:\projects\vstgui-edit\src\components\SliderDesigner\ValueFillPanel.tsx` (mode selector, color picker, glow intensity)
- [ ] T047 [P] [US2] Create ValueFillPanel styles in `F:\projects\vstgui-edit\src\components\SliderDesigner\ValueFillPanel.module.css`
- [ ] T048 [P] [US2] Create SliderDesigner index in `F:\projects\vstgui-edit\src\components\SliderDesigner\index.ts` (re-exports)
- [ ] T049 [US2] Register slider plugin in application startup (call registerControlType(sliderPlugin) after knob registration)
- [ ] T050 [US2] Verify tab switching performance in `F:\projects\vstgui-edit\src\stores\controlDesignerStore.ts` (ensure switchControlType completes <200ms per SC-003)
- [ ] T051 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat: add slider plugin and enable control type switching"

**Checkpoint**: Users can switch between Knob and Slider tabs, state preserves across switches

---

## Phase 5: User Story 1 - Design a Slider Control (Priority: P1) 🎯 MVP

**Goal**: Fully implement slider 3D rendering and filmstrip generation

**Independent Test**: Right-click bitmap, select "Design Slider", configure track/handle/fill, generate filmstrip

### Implementation for User Story 1

- [ ] T052 [P] [US1] Create slider geometry utilities in `F:\projects\vstgui-edit\src\domain\sliderDesigner\geometry.ts` (functions to create RoundedBoxGeometry for track and handle, handle position calculation for linear interpolation, grip line geometry)
- [ ] T053 [P] [US1] Create slider domain index in `F:\projects\vstgui-edit\src\domain\sliderDesigner\index.ts` (re-exports)
- [ ] T054 [US1] Implement slider renderer in `F:\projects\vstgui-edit\src\services\controlRenderer\sliderRenderer.ts` (ControlRenderer implementation: initialize scene with track/handle/fill meshes, updateScene on design changes, setPosition for handle movement, generateFilmstrip with linear frame generation, raycaster setup for component selection)
- [ ] T054b [US1] Implement generation progress UI in `F:\projects\vstgui-edit\src\components\ControlDesigner\ControlDesignerModal.tsx` (display stage labels, frame counter with progress bar, percentage display, cancel button wired to store.cancelGeneration(); satisfies FR-018)
- [ ] T055 [US1] Complete TrackPanel implementation in `F:\projects\vstgui-edit\src\components\SliderDesigner\TrackPanel.tsx` (wire all controls to store, add validation feedback, material integration via MaterialPanel target prop)
- [ ] T056 [US1] Complete HandlePanel implementation in `F:\projects\vstgui-edit\src\components\SliderDesigner\HandlePanel.tsx` (wire all controls to store, handle shape previews, material integration)
- [ ] T057 [US1] Complete ValueFillPanel implementation in `F:\projects\vstgui-edit\src\components\SliderDesigner\ValueFillPanel.tsx` (fill mode selector with visual indicators, color picker integration, glow intensity slider)
- [ ] T058 [US1] Update MaterialPanel for slider components in `F:\projects\vstgui-edit\src\components\ControlDesigner\MaterialPanel.tsx` (extend target selector to support 'track' | 'handle' | 'fill', synchronize with 3D preview click selection)
- [ ] T059 [US1] Update ControlPreview for slider raycasting in `F:\projects\vstgui-edit\src\components\ControlDesigner\ControlPreview.tsx` (implement onCanvasClick with raycaster, map intersected objects to slider component IDs via userData.componentId)
- [ ] T060 [US1] Add "Design Slider" context menu option in bitmap context menu component (add menu item that opens ControlDesignerModal with controlType: 'slider')
- [ ] T061 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat: implement slider 3D rendering and filmstrip generation"

**Checkpoint**: Users can design and generate slider filmstrips with full 3D preview and material controls

---

## Phase 6: User Story 4 - Apply Materials to Slider Components (Priority: P2)

**Goal**: Enable independent material application to track, handle, and fill via click selection and dropdown

**Independent Test**: Design slider, click track in preview, verify MaterialPanel shows track materials; switch to handle via dropdown, verify synchronization

### Implementation for User Story 4

- [ ] T062 [US4] Enhance MaterialPanel target selector in `F:\projects\vstgui-edit\src\components\ControlDesigner\MaterialPanel.tsx` (add visual component thumbnails/icons next to dropdown options for slider mode, ensure onChange syncs with preview selection)
- [ ] T063 [US4] Add component highlight on hover in `F:\projects\vstgui-edit\src\components\ControlDesigner\ControlPreview.tsx` (raycaster on mousemove, outline shader or emissive boost on hovered component)
- [ ] T064 [US4] Update slider renderer component selection in `F:\projects\vstgui-edit\src\services\controlRenderer\sliderRenderer.ts` (implement setSelectedComponent to highlight/outline selected component, store userData.componentId on each mesh)
- [ ] T065 [US4] Add material type presets for slider in `F:\projects\vstgui-edit\src\domain\controlDesigner\materials.ts` (metallic, brushed, plastic, wood presets specific to slider components)
- [ ] T066 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat: enable material application to slider components via click and dropdown"

**Checkpoint**: Users can apply independent materials to slider components using both click selection and dropdown

---

## Phase 7: User Story 5 - Save and Load Slider Presets (Priority: P3)

**Goal**: Enable slider preset save/load with proper control type filtering

**Independent Test**: Design slider, save as preset, load preset in new bitmap context, verify knob presets don't appear in slider mode

### Implementation for User Story 5

- [ ] T067 [US5] Update preset service query in `F:\projects\vstgui-edit\src\services\indexedDB\presetService.ts` (ensure getByControlType correctly filters, add error handling for missing controlType field)
- [ ] T068 [US5] Update PresetSelector filtering in `F:\projects\vstgui-edit\src\components\ControlDesigner\PresetSelector.tsx` (ensure preset list only shows presets matching activeControlType, add empty state message "No slider presets yet")
- [ ] T069 [US5] Add slider preset save validation in `F:\projects\vstgui-edit\src\stores\controlDesignerStore.ts` (ensure saved presets include controlType: 'slider', validate design before save)
- [ ] T070 [US5] Test preset migration for existing knob presets (verify knobs with missing controlType get 'knob' added on first access after DB_VERSION 4 upgrade)
- [ ] T071 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat: enable slider preset save and load with type filtering"

**Checkpoint**: Users can save/load slider presets independently from knob presets

---

## Phase 8: User Story 6 - Configure Slider Output Settings (Priority: P3)

**Goal**: Adapt OutputPanel to show linear-specific settings and accurate filmstrip preview

**Independent Test**: Design slider, adjust frame count and layout, verify output summary shows correct dimensions and estimated file size

### Implementation for User Story 6

- [ ] T072 [US6] Update OutputPanel for linear controls in `F:\projects\vstgui-edit\src\components\ControlDesigner\OutputPanel.tsx` (conditionally hide rotation settings when category === 'linear', show position-based frame description, update filmstrip dimension calculation for horizontal/vertical layout)
- [ ] T073 [US6] Add output validation for sliders in `F:\projects\vstgui-edit\src\domain\sliderDesigner\validation.ts` (ensure frame count produces valid texture dimensions, warn if dimensions approach 8192x8192 limit)
- [ ] T074 [US6] Update filmstrip utilities for linear layout in `F:\projects\vstgui-edit\src\domain\controlDesigner\filmstrip.ts` (calculateFilmstripDimensions handles horizontal/vertical for linear controls, estimates file size accurately)
- [ ] T075 [US6] **Commit**: Stage and commit User Story 6 changes with message "feat: adapt output panel for slider filmstrip configuration"

**Checkpoint**: Users can configure slider output settings with accurate preview information

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T076 [P] Add error boundaries around ControlDesignerModal in `F:\projects\vstgui-edit\src\components\ControlDesigner\ControlDesignerModal.tsx` (catch rendering errors, show fallback UI: "Control Designer encountered an error. [Reload] [Close]". On Reload: re-initialize renderer. On Close: call closeDesigner(). Log error details to console for debugging.)
- [ ] T077 [P] Add loading states to filmstrip generation in `F:\projects\vstgui-edit\src\stores\controlDesignerStore.ts` (progress percentage, stage descriptions, cancel button functionality)
- [ ] T078 [P] Add keyboard shortcuts to ControlDesignerModal (Escape to close, Ctrl+S to save preset, Ctrl+G to generate)
- [ ] T079 [P] Add accessibility attributes to all panels (ARIA labels, keyboard navigation for tabs, focus management)
- [ ] T080 [P] Add narrow dimension warning to OutputPanel (non-blocking warning if track width <15px or height <15px per edge case in spec)
- [ ] T081 [P] Optimize renderer memory usage in `F:\projects\vstgui-edit\src\services\controlRenderer\base.ts` (ensure proper disposal of geometries and materials, texture cleanup)
- [ ] T082 [P] Add generation cancellation cleanup in `F:\projects\vstgui-edit\src\stores\controlDesignerStore.ts` (discard partial renders, reset state to design mode on cancel per edge case in spec)
- [ ] T083 [P] Update CLAUDE.md with Control Designer architecture section (document plugin system, registry pattern, control categories, renderer interface)
- [ ] T084 Performance optimization: measure and optimize tab switching time (target <200ms per SC-003)
- [ ] T085 Performance optimization: measure and optimize slider filmstrip generation (target same performance as knob per SC-006)
- [ ] T086 Code review: verify 70% panel code reuse (count LOC in shared panels vs type-specific panels per SC-004)
- [ ] T087 Code review: verify slider implementation <500 LOC excluding tests (count files in sliderDesigner/ per SC-005)
- [ ] T088 Deprecate old knobDesignerStore in `F:\projects\vstgui-edit\src\stores\knobDesignerStore.ts` (add deprecation comments, keep for compatibility but redirect to controlDesignerStore)
- [ ] T089 Deprecate old knobRenderer in `F:\projects\vstgui-edit\src\services\knobRenderer\index.ts` (add deprecation comments, redirect imports to controlRenderer)
- [ ] T090 **Commit**: Stage and commit Polish phase changes with message "feat: polish control designer with error handling, performance, and docs"

---

## Phase 10: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**⚠️ CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [ ] TQG-1 **CSS Linting**: Run `npm run lint:css` from `F:\projects\vstgui-edit\` - Fix ALL errors and warnings
- [ ] TQG-2 **Code Quality**: Run `npm run check` from `F:\projects\vstgui-edit\` - Fix ALL errors and warnings
- [ ] TQG-3 **Type Safety**: Run `npm run typecheck` from `F:\projects\vstgui-edit\` - Fix ALL errors and warnings
- [ ] TQG-4 **Verify Clean**: Re-run all three commands to confirm zero issues remain

**If Quality Gates Fail**:
1. STOP - do not proceed to Git Verification
2. FIX all reported errors and warnings
3. RE-RUN the failing command(s)
4. REPEAT until all three commands pass cleanly

**NO EXCEPTIONS**: Even "pre-existing" issues MUST be resolved. The spec is NOT complete until all quality gates pass.

---

## Phase 11: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL-1 **Verify Git Status**: Run `git status` from `F:\projects\vstgui-edit\` to check for uncommitted changes
- [ ] TFINAL-2 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with message "chore: finalize control designer implementation"
- [ ] TFINAL-3 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user stories
- **User Story 3 (Phase 3)**: Depends on Foundational (Phase 2) - Validates plugin architecture
- **User Story 2 (Phase 4)**: Depends on User Story 3 (Phase 3) - Needs working knob plugin to test switching
- **User Story 1 (Phase 5)**: Depends on User Story 2 (Phase 4) - Needs slider plugin registered and panels stubbed
- **User Story 4 (Phase 6)**: Depends on User Story 1 (Phase 5) - Needs slider renderer working
- **User Story 5 (Phase 7)**: Depends on User Story 1 (Phase 5) - Needs slider design complete
- **User Story 6 (Phase 8)**: Depends on User Story 1 (Phase 5) - Needs slider filmstrip generation working
- **Polish (Phase 9)**: Depends on User Stories 1-6 being complete
- **Quality Gates (Phase 10)**: Depends on all implementation phases
- **Git Verification (Phase 11)**: Depends on Quality Gates passing

### Rationale for User Story Order

The spec lists priorities as US1 (P1), US2 (P1), US3 (P2), but the implementation order is:
1. **US3 first**: Validates the plugin architecture doesn't break existing knob functionality
2. **US2 second**: Enables tab switching once knob plugin works
3. **US1 third**: Implements slider with validated architecture
4. **US4-6 last**: Enhance slider with materials, presets, and output configuration

This order ensures each step builds on validated foundations.

### Parallel Opportunities

**Phase 1 (Setup)**: Tasks T001-T011 can run in parallel (all marked [P])

**Phase 2 (Foundational)**:
- T016-T017 (knob validation and defaults) can run in parallel
- T019-T021 (renderer files) can run in parallel after T018

**Phase 3 (US3)**:
- T023-T027 (panel migrations) can run in parallel
- T029-T030 (ControlTypeTabs) can run in parallel with T031-T032 (ControlPreview)

**Phase 4 (US2)**:
- T039-T040 (slider defaults and validation) can run in parallel
- T042-T048 (slider panel stubs) can run in parallel

**Phase 5 (US1)**:
- T052-T053 (slider geometry and index) can run in parallel

**Phase 6 (US4)**: All tasks run sequentially (depend on each other)

**Phase 7 (US5)**: All tasks run sequentially (depend on each other)

**Phase 8 (US6)**: All tasks run sequentially (depend on each other)

**Phase 9 (Polish)**: Tasks T076-T083 can run in parallel (all marked [P])

---

## Implementation Strategy

### MVP First (User Stories 3, 2, 1)

1. Complete Phase 1: Setup (type system and shared utilities)
2. Complete Phase 2: Foundational (IndexedDB and knob plugin wrapper)
3. Complete Phase 3: User Story 3 (knob backward compatibility)
4. **STOP and VALIDATE**: Test that existing knob workflow still works
5. Complete Phase 4: User Story 2 (tab switching)
6. **STOP and VALIDATE**: Test switching between knob and slider tabs
7. Complete Phase 5: User Story 1 (slider design and generation)
8. **STOP and VALIDATE**: Test full slider workflow end-to-end
9. **MVP COMPLETE**: Can design both knobs and sliders, switch between them

### Incremental Delivery Beyond MVP

After MVP (Phases 1-5):
1. Add Phase 6: User Story 4 (material component selection) → Deploy
2. Add Phase 7: User Story 5 (slider presets) → Deploy
3. Add Phase 8: User Story 6 (output configuration) → Deploy
4. Each addition enhances functionality without breaking previous features

### Parallel Team Strategy

With multiple developers after Phase 2 completes:

**Option 1: Sequential for architecture validation**
- Complete US3 first (all developers) - validates architecture
- Then split: Developer A on US2, Developer B on US1 stubs
- Then converge on US1 implementation

**Option 2: Parallel after US3**
- All developers complete US3 together (architecture validation)
- Developer A: US1 (slider implementation)
- Developer B: US4 (material selection)
- Developer C: US5 and US6 (presets and output)

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- **Testing Guide**: Use `/testing-guide` skill if manual testing scenarios needed
- **SolidJS Guide**: Use `/solidjs-guide` skill before writing components or stores
- **Commit after each phase** - each phase ends with a commit task
- Stop at checkpoints to validate story independently
- Architecture validation (US3) is critical before adding new control types
- Database migration happens once in Phase 2 - must be correct
- RoundedBoxGeometry is a Three.js addon (three/addons) - no new external dependency
- Raycaster for component selection uses standard Three.js patterns
- Material target synchronization (click vs dropdown) is key for US4
- Performance targets: <200ms tab switching (SC-003), same generation speed as knob (SC-006)

---

## Success Criteria Verification

| Criterion | Verification Method | Target Phase |
|-----------|---------------------|--------------|
| SC-001: Slider design <5 min | Manual timing test after Phase 5 | Phase 5 |
| SC-002: Knob functionality preserved | Manual verification after Phase 3 | Phase 3 |
| SC-003: Tab switching <200ms | Performance measurement in Phase 4 | Phase 4 |
| SC-004: 70% panel code reuse | LOC comparison in Phase 9 | Phase 9 (T086) |
| SC-005: <500 LOC per new type | LOC count of sliderDesigner/ in Phase 9 | Phase 9 (T087) |
| SC-006: Same generation performance | Benchmark comparison in Phase 9 | Phase 9 (T085) |
| SC-007: Preset workflow identical | Manual test after Phase 7 | Phase 7 |

---

## Total Task Count

- **Setup**: 12 tasks (T001-T012)
- **Foundational**: 10 tasks (T013-T022)
- **User Story 3**: 16 tasks (T023-T038)
- **User Story 2**: 13 tasks (T039-T051)
- **User Story 1**: 10 tasks (T052-T061)
- **User Story 4**: 5 tasks (T062-T066)
- **User Story 5**: 5 tasks (T067-T071)
- **User Story 6**: 4 tasks (T072-T075)
- **Polish**: 15 tasks (T076-T090)
- **Quality Gates**: 4 tasks (TQG-1 to TQG-4)
- **Git Verification**: 3 tasks (TFINAL-1 to TFINAL-3)

**Total**: 97 tasks

**Parallel opportunities**: 23 tasks marked [P] across Setup, Foundational, and user story phases

---

## Suggested MVP Scope

**MVP = Phases 1-5 (User Stories 3, 2, 1)**

This delivers:
- ✅ Plugin architecture with registry system
- ✅ Knob designer preserved (backward compatibility)
- ✅ Tab switching between control types
- ✅ Slider design and filmstrip generation
- ✅ Unified modal with shared panels
- ✅ IndexedDB schema with control type support

**Deferred to post-MVP**:
- Material component click selection (US4)
- Slider presets (US5)
- Output configuration enhancements (US6)

This validates the core architecture and provides immediate value (slider generation) while deferring polish features.
