# Tasks: Canvas Grid System

**Input**: Design documents from `/specs/007-canvas-grid/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests. This ensures SolidJS-specific patterns (microtask flushing, testInRoot, etc.) are followed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Types, store, and design tokens that all user stories depend on

- [x] T001 Create grid type definitions in `src/types/grid.ts` (GridStyle, GridSizePreset, GridSettings, GridProps)
- [x] T002 [P] Add grid color tokens to `src/styles/tokens.css` (--color-grid-minor, --color-grid-major with light/dark theme support)
- [x] T003 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T004 Write tests for gridStore in `src/stores/__tests__/gridStore.spec.ts` (test visibility toggle, size change, style change, reset, defaults)
- [x] T005 Implement gridStore in `src/stores/gridStore.ts` (signals for isVisible, size, style; actions: toggleVisibility, setGridSize, setGridStyle, resetGrid; constants: GRID_SIZE_PRESETS, DEFAULT_GRID_SIZE, DEFAULT_GRID_STYLE, MAJOR_LINE_INTERVAL)
- [x] T006 [P] Write tests for grid utilities in `src/domain/canvas/__tests__/grid.spec.ts` (isMajorLine, calculateLineCount, getPatternId, isValidGridSize)
- [x] T007 [P] Implement grid utilities in `src/domain/canvas/grid.ts` (isMajorLine, calculateLineCount, getPatternId, isValidGridSize)
- [x] T008 Export grid utilities from `src/domain/canvas/index.ts`
- [x] T009 Run `npx biome check --write .` and `npx tsc --noEmit` to verify quality
- [x] T010 **Commit**: Stage and commit Phase 1 changes with message "feat(007-canvas-grid): add types, store, utilities, and tokens"

---

## Phase 2: User Story 1 - View Grid Overlay (Priority: P1) MVP

**Goal**: Render a grid overlay on the canvas behind template views with theme-adaptive colors

**Independent Test**: Load a uidesc file and verify grid lines appear behind template views

**FR Coverage**: FR-001 (render grid), FR-002 (pan/zoom transform), FR-009 (theme colors), FR-010 (defaults), FR-012 (no grid without document)

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T011 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T012 [P] [US1] Write Grid component tests in `src/components/Canvas/__tests__/Grid.spec.tsx` (renders when visible, hidden when not visible, renders behind views, uses correct grid size from store, uses theme colors)

### Implementation for User Story 1

- [x] T013 [US1] Create Grid.module.css in `src/components/Canvas/Grid.module.css` (grid container styles using design tokens)
- [x] T014 [US1] Implement Grid component in `src/components/Canvas/Grid.tsx` (SVG pattern for lines style, rect fill, reads from gridStore, theme-adaptive colors via CSS)
- [x] T015 [US1] Update Canvas component in `src/components/Canvas/Canvas.tsx` to include Grid component (render before template views, conditionally show based on documentStore.parseState)
- [x] T016 [US1] Export Grid from `src/components/Canvas/index.ts`
- [x] T017 [US1] Run tests `npm test` and verify Grid tests pass
- [x] T018 [US1] Run `npx biome check --write .` and `npx tsc --noEmit`
- [x] T019 [US1] **Commit**: Stage and commit US1 changes with message "feat(007-canvas-grid): add Grid component with SVG pattern rendering"

**Checkpoint**: Grid visible on canvas with default 10px spacing, transforms with pan/zoom

---

## Phase 3: User Story 2 - Toggle Grid Visibility (Priority: P1)

**Goal**: Toggle grid visibility with G key (respecting keyboard filter)

**Independent Test**: Press G key and verify grid appears/disappears

**FR Coverage**: FR-003 (G key toggle), FR-004 (ignore in text input), FR-005 (ignore with modifiers)

### Tests for User Story 2

- [x] T020 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T021 [P] [US2] Write G key toggle tests in `src/components/Canvas/__tests__/Canvas.spec.tsx` (G key toggles grid, ignores G in text input, ignores G with Ctrl/Cmd/Alt modifiers)

### Implementation for User Story 2

- [x] T022 [US2] Update handleKeyDown in `src/components/Canvas/Canvas.tsx` to handle G key (call toggleVisibility from gridStore, apply existing keyboard filter logic)
- [x] T023 [US2] Run tests `npm test` and verify toggle tests pass
- [x] T024 [US2] Run `npx biome check --write .` and `npx tsc --noEmit`
- [x] T025 [US2] **Commit**: Stage and commit US2 changes with message "feat(007-canvas-grid): add G key toggle for grid visibility"

**Checkpoint**: G key toggles grid on/off (filtered when in text input or with modifiers)

---

## Phase 4: User Story 3 - Configure Grid Size (Priority: P2)

**Goal**: Change grid spacing via toolbar size selector

**Independent Test**: Select different size presets and verify grid spacing changes

**FR Coverage**: FR-006 (size presets 5,8,10,12,16,20), FR-011 (GridToolbar with size selection)

### Tests for User Story 3

- [x] T026 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [x] T027 [P] [US3] Write GridToolbar tests in `src/components/GridToolbar/__tests__/GridToolbar.spec.tsx` (displays current size, size dropdown with presets, calls setGridSize on change)

### Implementation for User Story 3

- [x] T028 [US3] Create GridToolbar.module.css in `src/components/GridToolbar/GridToolbar.module.css` (toolbar styles following ZoomToolbar pattern)
- [x] T029 [US3] Implement GridToolbar component in `src/components/GridToolbar/GridToolbar.tsx` (visibility toggle button, size dropdown with GRID_SIZE_PRESETS, reads/writes gridStore)
- [x] T030 [US3] Create barrel export in `src/components/GridToolbar/index.ts`
- [x] T031 [US3] Run tests `npm test` and verify GridToolbar tests pass
- [x] T032 [US3] Run `npx biome check --write .` and `npx tsc --noEmit`
- [x] T033 [US3] **Commit**: Stage and commit US3 changes with message "feat(007-canvas-grid): add GridToolbar with size presets"

**Checkpoint**: Grid size changes via toolbar dropdown

---

## Phase 5: User Story 4 - Major/Minor Grid Lines (Priority: P2)

**Goal**: Render major grid lines every 5th line in darker color

**Independent Test**: View grid and verify every 5th line is visually distinct

**FR Coverage**: FR-007 (major lines every 5th)

### Tests for User Story 4

- [ ] T034 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T035 [P] [US4] Write major line tests in `src/components/Canvas/__tests__/Grid.spec.tsx` (major lines rendered every 5th interval, major lines use --color-grid-major)

### Implementation for User Story 4

- [ ] T036 [US4] Update Grid component in `src/components/Canvas/Grid.tsx` to render major lines (add second pattern layer for major lines at MAJOR_LINE_INTERVAL, use --color-grid-major)
- [ ] T037 [US4] Run tests `npm test` and verify major line tests pass
- [ ] T038 [US4] Run `npx biome check --write .` and `npx tsc --noEmit`
- [ ] T039 [US4] **Commit**: Stage and commit US4 changes with message "feat(007-canvas-grid): add major grid lines every 5th interval"

**Checkpoint**: Major lines visually distinct every 50px (at 10px grid size)

---

## Phase 6: User Story 5 - Grid Style Options (Priority: P3)

**Goal**: Support lines, dots, and crosshairs grid styles

**Independent Test**: Switch between styles and verify visual changes

**FR Coverage**: FR-008 (three styles), FR-011 (style selection in toolbar)

### Tests for User Story 5

- [ ] T040 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T041 [P] [US5] Write style tests in `src/components/Canvas/__tests__/Grid.spec.tsx` (lines style renders lines, dots style renders circles, crosshairs style renders crosses)
- [ ] T042 [P] [US5] Write style selector tests in `src/components/GridToolbar/__tests__/GridToolbar.spec.tsx` (style selector shows current style, calls setGridStyle on change)

### Implementation for User Story 5

- [ ] T043 [US5] Update Grid component in `src/components/Canvas/Grid.tsx` to support all styles (add pattern generators for dots and crosshairs, switch based on gridStore.style)
- [ ] T044 [US5] Update GridToolbar in `src/components/GridToolbar/GridToolbar.tsx` to add style selector (dropdown or buttons for lines/dots/crosshairs)
- [ ] T045 [US5] Run tests `npm test` and verify style tests pass
- [ ] T046 [US5] Run `npx biome check --write .` and `npx tsc --noEmit`
- [ ] T047 [US5] **Commit**: Stage and commit US5 changes with message "feat(007-canvas-grid): add grid style options (lines, dots, crosshairs)"

**Checkpoint**: All three grid styles working with immediate visual feedback

---

## Phase 7: MainToolbar Integration

**Goal**: Integrate GridToolbar alongside ZoomToolbar in main toolbar container

**FR Coverage**: FR-011 (toolbar container)

### Tests for MainToolbar

- [ ] T048 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T049 [P] Write MainToolbar tests in `src/components/MainToolbar/__tests__/MainToolbar.spec.tsx` (renders ZoomToolbar, renders GridToolbar, passes onFitToView to ZoomToolbar)

### Implementation for MainToolbar

- [ ] T050 Create MainToolbar.module.css in `src/components/MainToolbar/MainToolbar.module.css` (flex container for toolbars)
- [ ] T051 Implement MainToolbar in `src/components/MainToolbar/MainToolbar.tsx` (renders ZoomToolbar and GridToolbar side by side)
- [ ] T052 Create barrel export in `src/components/MainToolbar/index.ts`
- [ ] T053 Update App.tsx to use MainToolbar instead of ZoomToolbar directly
- [ ] T054 Run tests `npm test` and verify MainToolbar tests pass
- [ ] T055 Run `npx biome check --write .` and `npx tsc --noEmit`
- [ ] T056 **Commit**: Stage and commit MainToolbar changes with message "feat(007-canvas-grid): add MainToolbar container"

**Checkpoint**: Both toolbars visible and functional in unified container

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance verification, documentation

- [ ] T057 Add ARIA labels to GridToolbar controls in `src/components/GridToolbar/GridToolbar.tsx` (aria-label for toggle, dropdowns)
- [ ] T058 Verify keyboard navigation works for all GridToolbar controls (tab order, enter to activate)
- [ ] T059 Run test coverage `npm run test:coverage` and verify 80%+ for new code
- [ ] T060 Update CLAUDE.md with gridStore documentation (utility module section)
- [ ] T061 Update CLAUDE.md Recent Changes with feature summary
- [ ] T062 Run `npx biome check --write .` and `npx tsc --noEmit` final check
- [ ] T063 Run all tests `npm test` and verify all pass
- [ ] T064 **Commit**: Stage and commit Polish phase changes with message "feat(007-canvas-grid): add accessibility, update docs"

---

## Phase Final: Git Verification & Compliance

**Purpose**: Ensure all work is committed and requirements met

- [ ] T065 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] T066 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [ ] T067 **Confirm Clean**: Verify working tree is clean (nothing to commit)
- [ ] T068 Update spec.md Requirement Compliance Table with evidence for all FR-xxx and SC-xxx
- [ ] T069 Verify all requirements show MET status in compliance table
- [ ] T070 **Final Commit**: Commit updated spec.md with compliance table

**CRITICAL**: Feature is NOT complete until all requirements verified and all work committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (US1)**: Depends on Phase 1 - Grid rendering foundation
- **Phase 3 (US2)**: Depends on Phase 2 - Toggle requires Grid component
- **Phase 4 (US3)**: Depends on Phase 1 - GridToolbar can start after store ready
- **Phase 5 (US4)**: Depends on Phase 2 - Major lines extend Grid component
- **Phase 6 (US5)**: Depends on Phase 2 + Phase 4 - Styles need Grid + Toolbar
- **Phase 7 (MainToolbar)**: Depends on Phase 4 - Needs GridToolbar complete
- **Phase 8 (Polish)**: Depends on all user stories
- **Phase Final**: Depends on Phase 8

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (Grid) | Phase 1 | T010 |
| US2 (Toggle) | US1 | T019 |
| US3 (Size) | Phase 1 | T010 (parallel with US1) |
| US4 (Major Lines) | US1 | T019 |
| US5 (Styles) | US1 + US3 | T019 + T033 |

### Parallel Opportunities

**Phase 1** (can run in parallel):
- T002 (tokens) || T001 (types) || T006 (utility tests) || T007 (utilities)

**After Phase 1**:
- T012 (Grid tests) || T021 (toggle tests) || T027 (toolbar tests)

**User Stories 1 + 3** (can run in parallel):
- US1 (Grid component) || US3 (GridToolbar) - both only need Phase 1 complete

---

## Parallel Example: Phase 1

```bash
# Launch parallel tasks in Phase 1:
Task: T001 "Create grid type definitions in src/types/grid.ts"
Task: T002 "Add grid color tokens to src/styles/tokens.css"
Task: T006 "Write tests for grid utilities"
Task: T007 "Implement grid utilities"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (types, store, tokens)
2. Complete Phase 2: User Story 1 (Grid rendering)
3. Complete Phase 3: User Story 2 (G key toggle)
4. **STOP and VALIDATE**: Grid visible, toggles with G key
5. Demo/deploy if ready

### Incremental Delivery

1. Setup + US1 + US2 → Basic grid with toggle (MVP)
2. Add US3 → Grid size configuration via toolbar
3. Add US4 → Major/minor line hierarchy
4. Add US5 → Style options (lines/dots/crosshairs)
5. Add MainToolbar → Unified toolbar container
6. Polish → Accessibility, documentation

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 70 |
| Phase 1 (Setup) | 10 |
| US1 (Grid) | 9 |
| US2 (Toggle) | 6 |
| US3 (Size) | 8 |
| US4 (Major Lines) | 6 |
| US5 (Styles) | 8 |
| MainToolbar | 9 |
| Polish | 8 |
| Final | 6 |
| Parallel Opportunities | 12 tasks marked [P] |

**MVP Scope**: Phase 1 + US1 + US2 (25 tasks) - Grid visible and toggleable
**Full Scope**: All phases (70 tasks) - Complete grid system with toolbar
