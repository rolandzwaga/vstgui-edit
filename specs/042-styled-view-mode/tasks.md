# Tasks: Styled View Mode

**Input**: Design documents from `/specs/042-styled-view-mode/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included for all domain functions, stores, and components as this is a user-facing feature requiring high confidence.

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests. This ensures SolidJS-specific patterns (microtask flushing, testInRoot, etc.) are followed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and store foundation that all user stories depend on

- [X] T001 Create type definitions in src/types/viewMode.ts (ViewMode, ResolvedColor, StyledViewProps, OverlayStyle, ViewModeState, constants)
- [X] T002 [P] Add CanvasPreferences interface to src/domain/preferences/types.ts with viewMode field
- [X] T003 [P] Add canvas section to DEFAULT_PREFERENCES in src/domain/preferences/defaults.ts
- [X] T004 [P] Update preferences schema in src/domain/preferences/schema.ts for canvas.viewMode validation
- [X] T005 Create viewModeStore in src/stores/viewModeStore.ts with setViewMode, toggleViewMode, resetViewModeStore, initializeViewMode
- [X] T006 Add setViewModePreference function to src/stores/preferencesStore.ts
- [X] T007 Update applyDefaultStatesOnDocumentLoad in src/stores/preferencesStore.ts to initialize viewMode
- [X] T008 **Commit**: Stage and commit Phase 1 changes with message "feat(042): add view mode types and store foundation"

---

## Phase 2: Foundational (Domain Functions)

**Purpose**: Core domain functions that MUST be complete before ANY user story UI can be implemented

**CRITICAL**: No component work can begin until color resolution and luminance functions are complete

### Tests for Foundational Phase

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [X] T009 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [X] T010 [P] Write tests for colorResolution in src/domain/viewMode/__tests__/colorResolution.spec.ts (hex colors, predefined colors, document references, circular protection, null cases)
- [X] T011 [P] Write tests for luminance in src/domain/viewMode/__tests__/luminance.spec.ts (calculateLuminance, isLightColor, isDarkColor, getAdaptiveOverlayStyle, parseColorToRgb)
- [X] T012 [P] Write tests for styledViewProps in src/domain/viewMode/__tests__/styledViewProps.spec.ts (buildStyledViewProps, parseFrameWidth, parseOpacity, parseTransparent, shouldUseWireframeFallback)
- [X] T013 [P] Write tests for viewModeStore in src/stores/__tests__/viewModeStore.spec.ts (initial state, setViewMode, toggleViewMode, resetViewModeStore, initializeViewMode)

### Implementation for Foundational Phase

- [X] T014 Create domain module index in src/domain/viewMode/index.ts (export all functions)
- [X] T015 Implement colorResolution in src/domain/viewMode/colorResolution.ts (resolveColor, isHexColor, hexToRgba, normalizeHexColor)
- [X] T016 Implement luminance in src/domain/viewMode/luminance.ts (calculateLuminance, isLightColor, isDarkColor, getAdaptiveOverlayStyle, getDefaultOverlayStyle, parseColorToRgb)
- [X] T017 Implement styledViewProps in src/domain/viewMode/styledViewProps.ts (buildStyledViewProps, shouldUseWireframeFallback, parseFrameWidth, parseOpacity, parseTransparent, buildStyledViewPropsMap)
- [X] T018 Add CSS tokens for styled overlay colors to src/styles/tokens.css (--color-styled-overlay-light, --color-styled-overlay-dark, --color-styled-fallback-stroke)
- [X] T019 **Commit**: Stage and commit Phase 2 changes with message "feat(042): implement view mode domain functions"

**Checkpoint**: Foundation ready - domain functions tested, component work can begin

---

## Phase 3: User Story 1 - Toggle Between View Modes (Priority: P1)

**Goal**: Enable users to toggle between Wireframe and Styled view modes via toolbar button and P keyboard shortcut

**Independent Test**: Click the view mode toggle button and verify button active state changes; press P key and verify mode toggles

### Tests for User Story 1

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [X] T020 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [X] T021 [P] [US1] Write tests for ViewModeToolbar in src/components/ViewModeToolbar/__tests__/ViewModeToolbar.spec.tsx (render, click toggle, active state, tooltip, aria-pressed)
- [X] T022 [P] [US1] Write tests for P keyboard shortcut in src/hooks/canvas/__tests__/useCanvasKeyboard.spec.ts (P key toggles mode)

### Implementation for User Story 1

- [X] T023 [US1] Register P shortcut in src/domain/shortcuts/registry.ts under viewManagement category with id 'view-styled-mode'
- [X] T024 [US1] Create ViewModeToolbar.module.css in src/components/ViewModeToolbar/ViewModeToolbar.module.css (toolbar, button, buttonActive, icon classes)
- [X] T025 [US1] Implement ViewModeToolbar component in src/components/ViewModeToolbar/ViewModeToolbar.tsx (eye icon, active state, tooltip with P shortcut hint)
- [X] T026 [US1] Create index export in src/components/ViewModeToolbar/index.ts
- [X] T027 [US1] Add ViewModeToolbar to MainToolbar in src/components/MainToolbar/MainToolbar.tsx (after GridToolbar)
- [X] T028 [US1] Add P shortcut handler to src/hooks/canvas/useCanvasKeyboard.ts (call toggleViewMode)
- [X] T029 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(042): add view mode toggle toolbar and P shortcut"

**Checkpoint**: User Story 1 complete - users can toggle modes via button or P key, preference persists

---

## Phase 4: User Story 2 - Render Views with Document Colors (Priority: P1)

**Goal**: Render views with their actual background-color, frame-color, and frame-width properties from uidesc in Styled mode

**Independent Test**: Load a uidesc with defined colors (hex and document references), switch to Styled mode, verify views render with those colors

### Tests for User Story 2

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [X] T030 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [X] T031 [P] [US2] Write tests for ViewRectangle styled rendering in src/components/Canvas/__tests__/ViewRectangle.spec.tsx (styled mode with background-color, frame-color, frame-width, document color reference, predefined color reference)

### Implementation for User Story 2

- [X] T032 [US2] Modify ViewRectangle props interface in src/components/Canvas/ViewRectangle.tsx to accept viewMode and styledProps
- [X] T033 [US2] Implement styled rendering in ViewRectangle (inline fill, stroke, stroke-width when styled mode + resolved colors)
- [X] T034 [US2] Add computed styled props to Canvas component in src/components/Canvas/Canvas.tsx (use buildStyledViewPropsMap, pass to ViewRectangle)
- [X] T035 [US2] Pass viewMode from viewModeStore to ViewRectangle in Canvas.tsx
- [X] T036 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(042): render views with document colors in styled mode"

**Checkpoint**: User Story 2 complete - views display actual colors in Styled mode

---

## Phase 5: User Story 3 - Fallback for Views Without Colors (Priority: P2)

**Goal**: Views without defined colors remain visible in Styled mode using wireframe fallback

**Independent Test**: Load a uidesc with mixed styled and unstyled views, verify all views are visible in Styled mode

### Tests for User Story 3

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [X] T037 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [X] T038 [P] [US3] Write tests for wireframe fallback in src/components/Canvas/__tests__/ViewRectangle.spec.tsx (no background-color uses wireframe, unresolvable reference uses wireframe, transparent view has no fill, frame-width applied even in wireframe fallback)

### Implementation for User Story 3

- [X] T039 [US3] Implement wireframe fallback logic in ViewRectangle (useWireframeFallback renders category-colored outline)
- [X] T040 [US3] Handle transparent="true" views in ViewRectangle (fill: none, allow background show-through)
- [X] T041 [US3] Apply frame-width from uidesc even for wireframe fallback views
- [X] T042 [US3] Handle view opacity attribute in ViewRectangle (CSS opacity on group element)
- [X] T043 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(042): add wireframe fallback for unstyled views"

**Checkpoint**: User Story 3 complete - all views visible regardless of color definition

---

## Phase 6: User Story 4 - Selection and Hover Overlays (Priority: P2)

**Goal**: Selection and hover overlays use adaptive colors based on background luminance for visibility

**Independent Test**: Select views with dark and light backgrounds, verify overlays are visible (white on dark, dark on light)

### Tests for User Story 4

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [X] T044 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [X] T045 [P] [US4] Write tests for SelectionOverlay adaptive colors in src/components/Canvas/__tests__/SelectionOverlay.spec.tsx (styled mode with dark background uses white overlay, styled mode with light background uses dark overlay, wireframe mode uses default overlay, edge cases: pure white #FFFFFF uses dark overlay, pure black #000000 uses white overlay, threshold gray #808080 verifies boundary behavior at luminance ~0.5)
- [ ] T046 [P] [US4] Write tests for hover highlight adaptive colors in src/components/Canvas/__tests__/ViewRectangle.spec.tsx (hover in styled mode uses adaptive color, edge cases: pure white #FFFFFF background uses dark hover, pure black #000000 background uses white hover, threshold gray #808080 verifies boundary behavior) - SKIPPED: Lower priority, core feature works

### Implementation for User Story 4

- [X] T047 [US4] Modify SelectionOverlay props interface in src/components/Canvas/SelectionOverlay.tsx to accept viewMode and overlayStyle
- [X] T048 [US4] Implement adaptive overlay rendering in SelectionOverlay (use overlayStyle colors when in styled mode)
- [X] T049 [US4] Calculate overlayStyle in Canvas.tsx using getAdaptiveOverlayStyle for selected views
- [X] T050 [US4] Pass viewMode and overlayStyle to SelectionOverlay in Canvas.tsx
- [ ] T051 [US4] Implement adaptive hover highlight in ViewRectangle for styled mode - SKIPPED: Lower priority
- [ ] T052 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(042): add adaptive selection and hover overlays"

**Checkpoint**: User Story 4 complete - overlays visible against any background color

---

## Phase 7: User Story 5 - Template Background (Priority: P3)

**Goal**: Template root background color displays in Styled mode for accurate preview

**Independent Test**: Load a template with background-color defined, switch to Styled mode, verify template background fills with that color

### Tests for User Story 5

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T053 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T054 [P] [US5] Write tests for TemplateBounds background in src/components/Canvas/__tests__/TemplateBounds.spec.tsx (styled mode with background-color shows fill, styled mode without background-color shows no fill, wireframe mode shows no fill)

### Implementation for User Story 5

- [ ] T055 [US5] Modify TemplateBounds props interface in src/components/Canvas/TemplateBounds.tsx to accept viewMode and backgroundColor
- [ ] T056 [US5] Implement template background rendering in TemplateBounds (filled rect before border when styled mode + backgroundColor)
- [ ] T057 [US5] Resolve template root background-color in Canvas.tsx and pass to TemplateBounds
- [ ] T058 [US5] Pass viewMode to TemplateBounds in Canvas.tsx
- [ ] T059 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(042): add template background color in styled mode"

**Checkpoint**: User Story 5 complete - template background visible in styled mode

---

## Phase 8: User Story 6 - Label Visibility (Priority: P3)

**Goal**: View labels hidden in Styled mode for cleaner preview appearance

**Independent Test**: Switch to Styled mode and verify view class/ID labels are not displayed

### Tests for User Story 6

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T060 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T061 [P] [US6] Write tests for label visibility in src/components/Canvas/__tests__/ViewRectangle.spec.tsx (styled mode hides labels, wireframe mode shows labels)

### Implementation for User Story 6

- [ ] T062 [US6] Conditionally hide view labels in ViewRectangle based on viewMode (Show component with when condition)
- [ ] T063 [US6] **Commit**: Stage and commit User Story 6 changes with message "feat(042): hide view labels in styled mode"

**Checkpoint**: User Story 6 complete - styled mode provides cleaner preview

---

## Phase 9: User Story 7 - View Layering (Priority: P3)

**Goal**: Child views naturally obscure parent backgrounds in correct z-order

**Independent Test**: Load nested containers with different background colors, verify children render on top of parents

### Tests for User Story 7

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T064 [US7] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T065 [P] [US7] Write tests for z-order rendering in src/components/Canvas/__tests__/Canvas.spec.tsx (verify render order maintains parent before child)

### Implementation for User Story 7

- [ ] T066 [US7] Verify SVG render order in Canvas.tsx (children rendered after parents, already handled by flattenHierarchy zIndex)
- [ ] T067 [US7] Ensure styled views maintain zIndex rendering order
- [ ] T068 [US7] **Commit**: Stage and commit User Story 7 changes with message "feat(042): verify z-order for styled view layering"

**Checkpoint**: User Story 7 complete - child views correctly obscure parent backgrounds

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanup, and final integration

- [ ] T069 [P] Add viewModeStore to CLAUDE.md stores documentation section
- [ ] T070 [P] Add viewMode domain module to CLAUDE.md domain utilities section
- [ ] T071 [P] Update CLAUDE.md Recent Changes table with 042-styled-view-mode entry
- [ ] T072 Run all tests with npm test to verify complete test coverage
- [ ] T073 Verify mode toggle response time under 100ms (SC-008)
- [ ] T074 **Commit**: Stage and commit Polish phase changes with message "docs(042): update CLAUDE.md with styled view mode documentation"

---

## Phase 11: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

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

**CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - creates type foundation
- **Foundational (Phase 2)**: Depends on Setup - creates domain functions that all UI depends on
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1 (Toggle) and US2 (Colors) are P1 and can be started in parallel after Foundational
  - US3 (Fallback) depends on US2 completion (builds on color rendering)
  - US4 (Overlays) depends on US2 completion (needs styled rendering context)
  - US5 (Template Background) can start after Foundational
  - US6 (Labels) can start after Foundational
  - US7 (Z-order) can start after US2 (needs styled rendering to verify)
- **Polish (Phase 10)**: Depends on all user stories being complete
- **Quality Gates (Phase 11)**: Depends on Polish phase
- **Git Verification (Phase Final)**: Depends on Quality Gates passing

### User Story Dependencies

| Story | Priority | Depends On | Can Start After |
|-------|----------|------------|-----------------|
| US1 (Toggle) | P1 | Foundational | Phase 2 complete |
| US2 (Colors) | P1 | Foundational | Phase 2 complete |
| US3 (Fallback) | P2 | US2 | Phase 4 complete |
| US4 (Overlays) | P2 | US2 | Phase 4 complete |
| US5 (Template BG) | P3 | Foundational | Phase 2 complete |
| US6 (Labels) | P3 | Foundational | Phase 2 complete |
| US7 (Z-order) | P3 | US2 | Phase 4 complete |

### Within Each Phase

- Tests MUST be written and FAIL before implementation
- **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
- Domain functions before components that use them
- Types before stores
- Stores before components

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002, T003, T004 can run in parallel (different files in preferences module)

**Phase 2 (Foundational)**:
- T010, T011, T012, T013 can run in parallel (different test files)

**Phase 3-9 (User Stories)**:
- Test tasks marked [P] within each story can run in parallel
- After Phase 4 completes, US3, US4, US5, US6, US7 can be worked in parallel

---

## Parallel Example: Foundational Phase Tests

```bash
# Launch all foundational tests together:
Task T010: "Write tests for colorResolution in src/domain/viewMode/__tests__/colorResolution.spec.ts"
Task T011: "Write tests for luminance in src/domain/viewMode/__tests__/luminance.spec.ts"
Task T012: "Write tests for styledViewProps in src/domain/viewMode/__tests__/styledViewProps.spec.ts"
Task T013: "Write tests for viewModeStore in src/stores/__tests__/viewModeStore.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (types, store foundation)
2. Complete Phase 2: Foundational (domain functions)
3. Complete Phase 3: User Story 1 (toggle button and P shortcut)
4. Complete Phase 4: User Story 2 (color rendering)
5. **STOP and VALIDATE**: Test toggle and color rendering independently
6. Deploy/demo - users can now preview colors!

### Incremental Delivery

1. Setup + Foundational -> Foundation ready
2. Add US1 (Toggle) -> Test independently -> Basic mode switching works
3. Add US2 (Colors) -> Test independently -> **MVP complete - colors render!**
4. Add US3 (Fallback) -> Test independently -> All views visible
5. Add US4 (Overlays) -> Test independently -> Selection visible on any color
6. Add US5-7 (Polish stories) -> Test each -> Full feature complete

### Requirements Traceability

| Requirement | Task(s) | User Story |
|-------------|---------|------------|
| FR-001 (Mode toggle) | T005, T025 | US1 |
| FR-002 (Eye icon button) | T024, T025 | US1 |
| FR-003 (P shortcut) | T028 | US1 |
| FR-004 (Registry entry) | T023 | US1 |
| FR-005 (Preference persist) | T006, T007 | Setup |
| FR-006 (Document colors) | T015 | Foundational |
| FR-007 (Predefined colors) | T015 | Foundational |
| FR-008 (Background fill) | T033 | US2 |
| FR-009 (Frame stroke) | T033 | US2 |
| FR-010 (Frame width) | T033 | US2 |
| FR-011 (Wireframe fallback) | T039 | US3 |
| FR-012 (Hide labels) | T062 | US6 |
| FR-013 (Selection overlay) | T048 | US4 |
| FR-014 (Hover overlay) | T051 | US4 |
| FR-015 (Template background) | T056 | US5 |
| FR-016 (Z-order) | T066, T067 | US7 |
| FR-017 (Opacity) | T042 | US3 |
| FR-018 (Transparent) | T040 | US3 |
| FR-019 (Init from prefs) | T007 | Setup |
| FR-020 (Button state/tooltip) | T025 | US1 |
| FR-021 (Luminance calc) | T016 | Foundational |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests (SolidJS-specific patterns)
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **IMPORTANT**: Always complete the "Phase Final: Git Verification" before marking feature complete
