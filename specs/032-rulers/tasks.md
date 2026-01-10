# Tasks: Canvas Rulers

**Input**: Design documents from `/specs/032-rulers/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test tasks are included per specification requirement (TDD approach). Each test task must be written and failing BEFORE implementation.

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Types and Design Tokens)

**Purpose**: Create type definitions and design tokens needed by all user stories

- [ ] T001 Create ruler type definitions in src/types/ruler.ts (TickMark, TickType, TickIntervals, VisibleRange, TickIntervalConfig, RulerOrientation, and all component props interfaces)
- [ ] T002 [P] Add ruler design tokens to src/styles/tokens.css (--ruler-thickness, --ruler-font-size, --ruler-background, --ruler-border-color, --ruler-tick-color, --ruler-tick-major-color, --ruler-label-color, --ruler-cursor-indicator-color, --ruler-template-bounds-color, --ruler-origin-background)
- [ ] T003 **Commit**: Stage and commit Phase 1 changes with message "feat(032): add ruler types and design tokens"

---

## Phase 2: Foundational (Domain Utilities and Store)

**Purpose**: Pure domain logic and state management that MUST be complete before ANY user story components

**CRITICAL**: No component work can begin until this phase is complete

### Domain: tickCalculation.ts (Test-First)

- [ ] T004 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding with test tasks
- [ ] T005 [P] Write tests for calculateTickIntervals in src/domain/rulers/__tests__/tickCalculation.spec.ts (base intervals at 100% zoom, doubled intervals at 25% zoom, halved intervals at 400%+ zoom, minScreenSpacing invariant, **extreme zoom edge cases: verify minScreenSpacing >= 30px at 10% zoom and 500% zoom**)
- [ ] T006 [P] Write tests for alignIntervalToGrid in src/domain/rulers/__tests__/tickCalculation.spec.ts (no adjustment when grid disabled, alignment to grid when enabled for all presets: 5, 8, 10, 12, 16, 20)
- [ ] T007 Implement calculateTickIntervals in src/domain/rulers/tickCalculation.ts (power-of-2 scaling, DEFAULT_TICK_CONFIG export)
- [ ] T008 Implement alignIntervalToGrid in src/domain/rulers/tickCalculation.ts (grid alignment logic for GRID_SIZE_PRESETS)

### Domain: tickGeneration.ts (Test-First)

- [ ] T009 [P] Write tests for calculateVisibleRange in src/domain/rulers/__tests__/tickGeneration.spec.ts (no pan 100% zoom, panned left, panned right, zoomed in, zoomed out, large templates up to 4000px)
- [ ] T010 [P] Write tests for formatTickLabel in src/domain/rulers/__tests__/tickGeneration.spec.ts (positive integers, negative values, rounding decimals, large values)
- [ ] T011 [P] Write tests for generateTicks in src/domain/rulers/__tests__/tickGeneration.spec.ts (major ticks with labels, minor ticks without labels, sorted ascending, visible range boundaries, negative coordinates)
- [ ] T012 Implement calculateVisibleRange in src/domain/rulers/tickGeneration.ts
- [ ] T013 Implement formatTickLabel in src/domain/rulers/tickGeneration.ts
- [ ] T014 Implement generateTicks in src/domain/rulers/tickGeneration.ts (depends on T012, T013)

### Domain: coordinateMapping.ts (Test-First)

- [ ] T015 [P] Write tests for screenToCanvasCoordinates in src/domain/rulers/__tests__/coordinateMapping.spec.ts (no pan 100% zoom, panned, zoomed, ruler offset subtraction)
- [ ] T016 [P] Write tests for canvasToScreenPosition in src/domain/rulers/__tests__/coordinateMapping.spec.ts (no pan 100% zoom, panned, zoomed, negative values)
- [ ] T017 [P] Write tests for calculateTemplateBoundsPosition in src/domain/rulers/__tests__/coordinateMapping.spec.ts (no pan 100% zoom, panned left, panned right, zoomed, template sizes up to 4000px)
- [ ] T018 Implement screenToCanvasCoordinates and RULER_THICKNESS constant in src/domain/rulers/coordinateMapping.ts
- [ ] T019 Implement canvasToScreenPosition in src/domain/rulers/coordinateMapping.ts
- [ ] T020 Implement calculateTemplateBoundsPosition in src/domain/rulers/coordinateMapping.ts

### Domain: Barrel Export

- [ ] T021 Create barrel exports in src/domain/rulers/index.ts (export all functions and constants from tickCalculation, tickGeneration, coordinateMapping)

### Store: rulerStore (Test-First)

- [ ] T022 Write tests for rulerStore in src/stores/__tests__/rulerStore.spec.ts (initial null state, setCursorPosition, clearCursorPosition, resetRulerStore) using testInRoot wrapper
- [ ] T023 Implement rulerStore in src/stores/rulerStore.ts (cursorPosition signal, setCursorPosition, clearCursorPosition, resetRulerStore actions)

- [ ] T024 **Commit**: Stage and commit Phase 2 changes with message "feat(032): add ruler domain utilities and store"

**Checkpoint**: Foundation ready - all domain utilities tested and working, store ready

---

## Phase 3: User Story 1 - Visual Coordinate Reference (Priority: P1)

**Goal**: Display horizontal and vertical rulers along canvas edges with numbered tick marks showing pixel coordinates

**Independent Test**: Load any template and verify rulers display with readable tick marks and numbers starting from 0

**Acceptance Criteria**:
- Horizontal ruler appears along top edge when template is loaded
- Vertical ruler appears along left edge when template is loaded
- Numbered tick marks show coordinates in pixels starting from 0
- Rulers hide when no template is loaded

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T025 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T026 [P] [US1] Write tests for HorizontalRuler in src/components/Canvas/Rulers/__tests__/HorizontalRuler.spec.tsx (renders tick marks for visible range, major ticks have labels, minor ticks no labels, renders at correct width)
- [ ] T027 [P] [US1] Write tests for VerticalRuler in src/components/Canvas/Rulers/__tests__/VerticalRuler.spec.tsx (renders tick marks for visible range, labels positioned correctly, renders at correct height)
- [ ] T028 [P] [US1] Write tests for RulerContainer in src/components/Canvas/Rulers/__tests__/RulerContainer.spec.tsx (CSS grid layout, renders children in viewport, rulers hidden when no template, rulers visible when template loaded)

### Implementation for User Story 1

- [ ] T029 [P] [US1] Create HorizontalRuler component in src/components/Canvas/Rulers/HorizontalRuler.tsx (tick rendering with For, memoized intervals and ticks, major/minor distinction)
- [ ] T030 [P] [US1] Create HorizontalRuler.module.css in src/components/Canvas/Rulers/HorizontalRuler.module.css (ruler, tick, tickMajor, tickMinor, label classes using design tokens)
- [ ] T031 [P] [US1] Create VerticalRuler component in src/components/Canvas/Rulers/VerticalRuler.tsx (vertical orientation, labels positioned to right of ticks)
- [ ] T032 [P] [US1] Create VerticalRuler.module.css in src/components/Canvas/Rulers/VerticalRuler.module.css (vertical styling, rotated or side-positioned labels)
- [ ] T033 [US1] Create RulerContainer component in src/components/Canvas/Rulers/RulerContainer.tsx (CSS Grid layout, conditional ruler rendering based on parseState)
- [ ] T034 [US1] Create RulerContainer.module.css in src/components/Canvas/Rulers/RulerContainer.module.css (grid layout: origin 20x20, horizontal top, vertical left, viewport center)
- [ ] T035 [US1] Create barrel exports in src/components/Canvas/Rulers/index.ts
- [ ] T036 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(032): add horizontal and vertical rulers with tick marks"

**Checkpoint**: Rulers display with tick marks when template is loaded

---

## Phase 4: User Story 2 - Zoom-Aware Scaling (Priority: P1)

**Goal**: Rulers scale tick intervals appropriately when zoom changes to maintain readability

**Independent Test**: Zoom in/out and verify ruler numbers update correctly and tick spacing adjusts

**Acceptance Criteria**:
- At 200% zoom, tick spacing doubles visually but coordinates remain accurate
- At 50% zoom, tick spacing halves and density adjusts for readability
- Coordinates accurate regardless of zoom level

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T037 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T038 [P] [US2] Write tests for zoom-aware HorizontalRuler in src/components/Canvas/Rulers/__tests__/HorizontalRuler.spec.tsx (tick spacing at 50% zoom, tick spacing at 200% zoom, coordinate accuracy at various zoom levels)
- [ ] T039 [P] [US2] Write tests for zoom-aware VerticalRuler in src/components/Canvas/Rulers/__tests__/VerticalRuler.spec.tsx (same zoom scenarios)

### Implementation for User Story 2

- [ ] T040 [US2] Update HorizontalRuler in src/components/Canvas/Rulers/HorizontalRuler.tsx to read zoomLevel from canvasStore and recalculate intervals via createMemo
- [ ] T041 [US2] Update VerticalRuler in src/components/Canvas/Rulers/VerticalRuler.tsx to read zoomLevel from canvasStore and recalculate intervals
- [ ] T042 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(032): add zoom-aware tick scaling to rulers"

**Checkpoint**: Rulers maintain readability across zoom levels (10%-500%)

---

## Phase 5: User Story 3 - Pan-Aware Origin (Priority: P1)

**Goal**: Rulers reflect current pan offset, origin indicator shows position

**Independent Test**: Pan canvas and verify ruler numbers shift appropriately, origin indicator updates

**Acceptance Criteria**:
- At pan (0,0), rulers show 0 at intersection corner
- When panned, rulers show correct coordinates for visible area
- Origin indicator shows current pan offset values

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T043 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T044 [P] [US3] Write tests for RulerOrigin in src/components/Canvas/Rulers/__tests__/RulerOrigin.spec.tsx (shows crosshair/+ icon at origin, shows abbreviated offset when panned, tooltip shows full coordinates, 20x20px size, border styling, updates reactively)
- [ ] T045 [P] [US3] Write tests for pan-aware rulers in src/components/Canvas/Rulers/__tests__/HorizontalRuler.spec.tsx (tick positions shift with panOffset, negative coordinates visible when panned right)

### Implementation for User Story 3

- [ ] T046 [P] [US3] Create RulerOrigin component in src/components/Canvas/Rulers/RulerOrigin.tsx (reads panOffset from canvasStore, displays offset or 0,0)
- [ ] T047 [P] [US3] Create RulerOrigin.module.css in src/components/Canvas/Rulers/RulerOrigin.module.css (20x20 corner, centered text, border styling)
- [ ] T048 [US3] Update HorizontalRuler in src/components/Canvas/Rulers/HorizontalRuler.tsx to read panOffset from canvasStore and recalculate visible range
- [ ] T049 [US3] Update VerticalRuler in src/components/Canvas/Rulers/VerticalRuler.tsx to read panOffset and recalculate visible range
- [ ] T050 [US3] Update RulerContainer in src/components/Canvas/Rulers/RulerContainer.tsx to include RulerOrigin component
- [ ] T051 [US3] Update barrel exports in src/components/Canvas/Rulers/index.ts to include RulerOrigin
- [ ] T052 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(032): add pan-aware origin indicator to rulers"

**Checkpoint**: Rulers and origin indicator reflect pan state accurately

---

## Phase 6: User Story 4 - Major and Minor Tick Marks (Priority: P2)

**Goal**: Visual hierarchy with major ticks (numbered) and minor ticks (unnumbered)

**Independent Test**: Examine ruler rendering at various zoom levels, verify tick hierarchy

**Acceptance Criteria**:
- At 100% zoom: major ticks every 100px with numbers, minor ticks every 10px
- At 400%+ zoom: additional detail visible (every 10px numbered)
- At 25% zoom: tick density reduces (major ticks every 200px+)

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T053 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T054 [P] [US4] Write tests for major/minor tick styling in src/components/Canvas/Rulers/__tests__/HorizontalRuler.spec.tsx (major ticks taller, minor ticks shorter, labels only on major)

### Implementation for User Story 4

- [ ] T055 [US4] Update HorizontalRuler.module.css with distinct major tick height (12px) and minor tick height (6px)
- [ ] T056 [US4] Update VerticalRuler.module.css with distinct major tick width (12px) and minor tick width (6px)
- [ ] T057 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(032): add major/minor tick mark styling"

**Checkpoint**: Tick hierarchy is visually clear at all zoom levels

---

## Phase 7: User Story 5 - Cursor Position Indicator (Priority: P2)

**Goal**: Show cursor position highlighted on rulers when hovering over canvas

**Independent Test**: Move cursor over canvas, verify position indicators move on both rulers

**Acceptance Criteria**:
- Position indicator appears at cursor X on horizontal ruler and Y on vertical ruler
- Indicators update in real-time (within 16ms)
- Indicators disappear when cursor leaves canvas

### Tests for User Story 5

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T058 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T059 [P] [US5] Write tests for CursorIndicator in src/components/Canvas/Rulers/__tests__/CursorIndicator.spec.tsx (visibility toggle, correct positioning, tooltip shows coordinate, horizontal vs vertical orientation)
- [ ] T060 [P] [US5] Write tests for cursor tracking in src/components/Canvas/Rulers/__tests__/RulerContainer.spec.tsx (mouse move updates rulerStore, mouse leave clears position)

### Implementation for User Story 5

- [ ] T061 [P] [US5] Create CursorIndicator component in src/components/Canvas/Rulers/CursorIndicator.tsx (accent line, tooltip with coordinate, CSS transform positioning)
- [ ] T062 [P] [US5] Create CursorIndicator.module.css in src/components/Canvas/Rulers/CursorIndicator.module.css (indicator line, tooltip positioning, hidden state)
- [ ] T063 [US5] Update HorizontalRuler in src/components/Canvas/Rulers/HorizontalRuler.tsx to render CursorIndicator when cursorPosition is not null
- [ ] T064 [US5] Update VerticalRuler in src/components/Canvas/Rulers/VerticalRuler.tsx to render CursorIndicator
- [ ] T065 [US5] Update RulerContainer in src/components/Canvas/Rulers/RulerContainer.tsx to handle mouse events (onMouseMove calls screenToCanvasCoordinates and setCursorPosition, onMouseLeave calls clearCursorPosition)
- [ ] T066 [US5] Update barrel exports in src/components/Canvas/Rulers/index.ts to include CursorIndicator
- [ ] T067 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(032): add cursor position indicator to rulers"

**Checkpoint**: Cursor position is highlighted on rulers in real-time

---

## Phase 8: User Story 6 - Template Bounds Indicator (Priority: P2)

**Goal**: Show template extent highlighted on rulers

**Independent Test**: Load template, verify bounds indicator shows from 0 to template size

**Acceptance Criteria**:
- Horizontal ruler shows indicator from 0 to template width
- Vertical ruler shows indicator from 0 to template height
- Indicator extends beyond visible area appropriately when panned

### Tests for User Story 6

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T068 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T069 [P] [US6] Write tests for template bounds in src/components/Canvas/Rulers/__tests__/HorizontalRuler.spec.tsx (bounds indicator rendered, correct width based on templateWidth prop, position updates with pan)

### Implementation for User Story 6

- [ ] T070 [US6] Update HorizontalRuler in src/components/Canvas/Rulers/HorizontalRuler.tsx to render template bounds indicator using calculateTemplateBoundsPosition
- [ ] T071 [US6] Update VerticalRuler in src/components/Canvas/Rulers/VerticalRuler.tsx to render template bounds indicator
- [ ] T072 [US6] Add templateBounds CSS class to HorizontalRuler.module.css and VerticalRuler.module.css (shaded background region)
- [ ] T073 [US6] **Commit**: Stage and commit User Story 6 changes with message "feat(032): add template bounds indicator to rulers"

**Checkpoint**: Template extent is visually indicated on rulers

---

## Phase 9: User Story 7 - Grid Alignment Markers (Priority: P3)

**Goal**: Ruler ticks align with grid settings when grid is enabled

**Independent Test**: Enable grid, change grid size, verify ruler ticks align to grid intervals

**Acceptance Criteria**:
- With 16px grid enabled, ticks align to 16px boundaries
- Changing grid size updates ruler ticks
- Grid disabled shows standard intervals

### Tests for User Story 7

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T074 [US7] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T075 [P] [US7] Write tests for grid-aligned ticks in src/components/Canvas/Rulers/__tests__/HorizontalRuler.spec.tsx (ticks at grid intervals when enabled, standard intervals when disabled, all grid presets: 5, 8, 10, 12, 16, 20)

### Implementation for User Story 7

- [ ] T076 [US7] Update HorizontalRuler in src/components/Canvas/Rulers/HorizontalRuler.tsx to read gridStore.isVisible and gridStore.size, call alignIntervalToGrid
- [ ] T077 [US7] Update VerticalRuler in src/components/Canvas/Rulers/VerticalRuler.tsx with same grid alignment logic
- [ ] T078 [US7] **Commit**: Stage and commit User Story 7 changes with message "feat(032): add grid-aligned tick marks to rulers"

**Checkpoint**: Ruler ticks reinforce grid when enabled

---

## Phase 10: Integration

**Purpose**: Wire rulers into Canvas component, integration testing

### Integration with Canvas.tsx

- [ ] T079 Update src/components/Canvas/Canvas.tsx to wrap canvas content with RulerContainer (import RulerContainer, wrap existing canvasWrapper with it)

### Integration Tests

- [ ] T080 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T081 Write integration tests in src/components/Canvas/Rulers/__tests__/Rulers.integration.spec.tsx (rulers with zoom/pan interactions, cursor indicator real-time updates, template bounds across scenarios, FR-001 through FR-016 coverage)

### Documentation

- [ ] T082 Update CLAUDE.md with rulerStore documentation in Stores section
- [ ] T083 Update CLAUDE.md with ruler domain utilities in Domain Utilities section
- [ ] T084 Update CLAUDE.md Recent Changes table with 032-rulers entry

- [ ] T085 **Commit**: Stage and commit Phase 10 changes with message "feat(032): integrate rulers with Canvas and add integration tests"

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T086 Verify all tests pass with `npm test`
- [ ] T087 Verify performance requirements (60fps pan/zoom, 16ms cursor updates)
- [ ] T088 Run quickstart.md validation scenarios
- [ ] T089 Fill out requirement compliance table in spec.md (FR-001 through FR-016, SC-001 through SC-007)
- [ ] T090 **Commit**: Stage and commit Polish phase changes with message "feat(032): complete ruler implementation polish"

---

## Phase Final-1: Quality Gates (MANDATORY)

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

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user story components
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1-US3 (P1): Core functionality, should be done in order
  - US4-US6 (P2): Enhancements, can start after US1-US3
  - US7 (P3): Grid integration, can start after US1-US3
- **Integration (Phase 10)**: Depends on US1-US3 minimum
- **Polish (Phase 11)**: Depends on all desired user stories

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 (domain utilities, store)
- **User Story 2 (P1)**: Depends on US1 (builds on ruler components)
- **User Story 3 (P1)**: Depends on US1 (adds origin indicator)
- **User Story 4 (P2)**: Depends on US1 (CSS styling enhancement)
- **User Story 5 (P2)**: Depends on US1, US2, US3 (cursor indicator needs working rulers)
- **User Story 6 (P2)**: Depends on US1, US2, US3 (bounds indicator needs working rulers)
- **User Story 7 (P3)**: Depends on US1 (grid alignment enhancement)

### Within Each User Story

- **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
- Tests MUST be written and FAIL before implementation
- CSS modules in parallel with components
- Integration after core implementation

### Parallel Opportunities

Within Phase 2 (Foundational):
```bash
# All domain test tasks can run in parallel:
T005, T006 (tickCalculation tests)
T009, T010, T011 (tickGeneration tests)
T015, T016, T017 (coordinateMapping tests)

# After tests pass, implementations can be parallelized by file:
tickCalculation.ts, tickGeneration.ts, coordinateMapping.ts
```

Within User Stories:
```bash
# Tests can run in parallel:
T026, T027, T028 (US1 component tests)

# Component and CSS can run in parallel:
T029 + T030 (HorizontalRuler)
T031 + T032 (VerticalRuler)
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (types, tokens)
2. Complete Phase 2: Foundational (domain utilities, store)
3. Complete Phase 3-5: User Stories 1-3 (core ruler functionality)
4. **STOP and VALIDATE**: Test rulers with zoom/pan independently
5. Deploy/demo if ready

**MVP delivers**: Rulers with tick marks, zoom-aware scaling, pan-aware origin

### Incremental Delivery

1. Setup + Foundational -> Foundation ready
2. Add US1 (Visual Coordinate Reference) -> Test -> Deploy (basic rulers)
3. Add US2 (Zoom-Aware Scaling) -> Test -> Deploy (readable at any zoom)
4. Add US3 (Pan-Aware Origin) -> Test -> Deploy (spatial awareness)
5. Add US4-US6 (P2 enhancements) -> Test -> Deploy (polished experience)
6. Add US7 (Grid Alignment) -> Test -> Deploy (grid integration)

### Task Count Summary

| Phase | Task Count |
|-------|------------|
| Phase 1: Setup | 3 |
| Phase 2: Foundational | 21 |
| Phase 3: US1 (P1) | 12 |
| Phase 4: US2 (P1) | 6 |
| Phase 5: US3 (P1) | 10 |
| Phase 6: US4 (P2) | 5 |
| Phase 7: US5 (P2) | 10 |
| Phase 8: US6 (P2) | 6 |
| Phase 9: US7 (P3) | 5 |
| Phase 10: Integration | 7 |
| Phase 11: Polish | 5 |
| Phase Final-1: Quality Gates | 4 |
| Phase Final: Git Verification | 3 |
| **Total** | **97** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests (SolidJS-specific patterns like microtask flushing, testInRoot)
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **IMPORTANT**: Always complete "Phase Final: Git Verification" before marking feature complete
