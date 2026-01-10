# Tasks: Alignment Tools

**Input**: Design documents from `/specs/031-alignment-tools/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/alignment-api.ts

**Tests**: Tests are included for all domain logic and UI components as this is a core feature requiring comprehensive coverage.

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## User Story Mapping

| Story | Title | Priority | Spec Reference |
|-------|-------|----------|----------------|
| US1 | Align Multiple Views Horizontally | P1 | User Story 1 |
| US2 | Align Single View to Parent | P2 | User Story 2 |
| US3 | Keyboard Shortcuts for Alignment | P2 | User Story 3 |
| US4 | Distribute Views Evenly | P3 | User Story 4 |
| US5 | Alignment Toolbar UI | P1 | User Story 5 |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, type definitions, and domain module structure

- [ ] T001 Create alignment type definitions in `src/types/alignment.ts`
- [ ] T002 [P] Create domain module structure `src/domain/alignment/` with index.ts barrel export
- [ ] T003 [P] Create component directory structure `src/components/AlignmentToolbar/` with index.ts barrel export
- [ ] T004 **Commit**: Stage and commit Phase 1 setup changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain logic that MUST be complete before UI components can be implemented

**CRITICAL**: All user stories depend on bounds calculation and alignment/distribution functions

### Tests for Foundation

- [ ] T005 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T006 [P] Create unit tests for viewToBounds in `src/domain/alignment/__tests__/calculateBounds.spec.ts`
- [ ] T007 [P] Create unit tests for calculateSelectionBounds in `src/domain/alignment/__tests__/calculateBounds.spec.ts`
- [ ] T008 [P] Create unit tests for calculateParentBounds in `src/domain/alignment/__tests__/calculateBounds.spec.ts`

### Implementation

- [ ] T009 Implement viewToBounds function in `src/domain/alignment/calculateBounds.ts`
- [ ] T010 Implement calculateSelectionBounds function in `src/domain/alignment/calculateBounds.ts`
- [ ] T011 Implement calculateParentBounds function in `src/domain/alignment/calculateBounds.ts`
- [ ] T012 Export bounds functions from `src/domain/alignment/index.ts`
- [ ] T013 **Commit**: Stage and commit Phase 2 foundational changes

**Checkpoint**: Foundation ready - bounds calculation tested and working

---

## Phase 3: User Story 1 - Align Multiple Views Horizontally (Priority: P1)

**Goal**: Users can select 2+ views and align them to a common edge (left/center/right/top/middle/bottom)

**Independent Test**: Select 2+ views with different positions, click align button, verify views move to share a common edge

### Tests for User Story 1

- [ ] T014 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T015 [P] [US1] Create unit tests for alignViews multi-select in `src/domain/alignment/__tests__/alignViews.spec.ts`:
  - alignLeft: all views move to leftmost left edge
  - alignCenter: all views move to horizontal center of bounding box
  - alignRight: all views move to rightmost right edge
  - alignTop: all views move to topmost top edge
  - alignMiddle: all views move to vertical center of bounding box
  - alignBottom: all views move to bottommost bottom edge
  - Returns empty array if views already aligned (no movement)
- [ ] T016 [P] [US1] Create unit tests for getAlignmentReference in `src/domain/alignment/__tests__/alignViews.spec.ts`
- [ ] T017 [P] [US1] Create unit tests for calculateAlignedPosition in `src/domain/alignment/__tests__/alignViews.spec.ts`
- [ ] T018 [P] [US1] Create unit tests for history operations in `src/domain/alignment/__tests__/historyOperations.spec.ts`:
  - createAlignmentOperation creates valid undo/redo
  - getAlignmentDescription generates correct text
  - undo restores original positions
  - redo reapplies new positions

### Implementation for User Story 1

- [ ] T019 [US1] Implement getAlignmentReference function in `src/domain/alignment/alignViews.ts`
- [ ] T020 [US1] Implement calculateAlignedPosition function in `src/domain/alignment/alignViews.ts`
- [ ] T021 [US1] Implement alignViews function for multi-select case in `src/domain/alignment/alignViews.ts`
- [ ] T022 [US1] Implement createAlignmentOperation in `src/domain/alignment/historyOperations.ts`
- [ ] T023 [US1] Implement getAlignmentDescription in `src/domain/alignment/historyOperations.ts`
- [ ] T024 [US1] Export alignment functions from `src/domain/alignment/index.ts`
- [ ] T025 [US1] **Commit**: Stage and commit User Story 1 changes

**Checkpoint**: Core alignment logic complete - multi-select alignment tested and working

---

## Phase 4: User Story 5 - Alignment Toolbar UI (Priority: P1)

**Goal**: Toolbar with clearly labeled buttons showing alignment direction icons, grouped logically with proper enable/disable states

**Independent Test**: Render toolbar with various selection states, verify correct button enable/disable states

**Note**: This story is prioritized before US2 because the toolbar is needed to expose alignment functionality

### Tests for User Story 5

- [ ] T026 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T027 [P] [US5] Create component tests for AlignmentButton in `src/components/AlignmentToolbar/__tests__/AlignmentButton.spec.tsx`:
  - Renders icon and tooltip
  - Disabled state when disabled=true
  - Click handler fires when enabled
  - aria-label set correctly
- [ ] T028 [P] [US5] Create component tests for AlignmentToolbar in `src/components/AlignmentToolbar/__tests__/AlignmentToolbar.spec.tsx`:
  - All buttons disabled when no selection
  - Alignment buttons enabled when 1 non-root view selected
  - Alignment buttons enabled when 2+ views selected
  - All buttons disabled when only root view selected
  - Distribution buttons disabled when < 3 views
  - Distribution buttons enabled when 3+ views selected
  - Buttons grouped correctly (horizontal, vertical, distribution)
  - Click on alignment button triggers alignment operation
  - ARIA attributes present (role="toolbar", aria-label)

### Implementation for User Story 5

- [ ] T029 [P] [US5] Create alignment icons (8 icons) in `src/components/AlignmentToolbar/AlignmentIcons.tsx`:
  - AlignLeftIcon, AlignCenterIcon, AlignRightIcon
  - AlignTopIcon, AlignMiddleIcon, AlignBottomIcon
  - DistributeHorizontalIcon, DistributeVerticalIcon
- [ ] T030 [P] [US5] Create CSS module styles in `src/components/AlignmentToolbar/AlignmentToolbar.module.css`:
  - Button styles with hover/active/disabled states
  - Group container with separator
  - Use design tokens from `src/styles/tokens.css`
- [ ] T031 [US5] Create AlignmentButton component in `src/components/AlignmentToolbar/AlignmentButton.tsx`
- [ ] T032 [US5] Create AlignmentToolbar component in `src/components/AlignmentToolbar/AlignmentToolbar.tsx`:
  - Horizontal alignment group (Left, Center, Right)
  - Vertical alignment group (Top, Middle, Bottom)
  - Distribution group (Horizontal, Vertical)
  - Button enable/disable logic based on selection
  - onClick handlers that trigger alignment operations
  - Tooltips with keyboard shortcuts
- [ ] T033 [US5] Update barrel export in `src/components/AlignmentToolbar/index.ts`
- [ ] T034 [US5] Integrate AlignmentToolbar into MainToolbar in `src/components/MainToolbar/MainToolbar.tsx`
- [ ] T035 [US5] **Commit**: Stage and commit User Story 5 changes

**Checkpoint**: Toolbar UI complete - users can see and click alignment buttons

---

## Phase 5: User Story 2 - Align Single View to Parent (Priority: P2)

**Goal**: When exactly one non-root view is selected, alignment operations align relative to parent container bounds

**Independent Test**: Select single view inside a container, click align center, verify view centers within parent

### Tests for User Story 2

- [ ] T036 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T037 [P] [US2] Add unit tests for single-view alignment in `src/domain/alignment/__tests__/alignViews.spec.ts`:
  - alignLeft to parent: view moves to x=0 relative to parent
  - alignCenter to parent: view horizontally centers in parent
  - alignRight to parent: view moves to right edge of parent
  - alignTop to parent: view moves to y=0 relative to parent
  - alignMiddle to parent: view vertically centers in parent
  - alignBottom to parent: view moves to bottom edge of parent
  - Returns empty array for root view (no parent)
  - Returns empty array if already at target position

### Implementation for User Story 2

- [ ] T038 [US2] Extend alignViews to handle single-view alignment in `src/domain/alignment/alignViews.ts`:
  - Detect single-view case
  - Use calculateParentBounds to get reference
  - Calculate position relative to parent origin
- [ ] T039 [US2] Add parent-align description handling in `src/domain/alignment/historyOperations.ts`:
  - "Align view to parent left", "Align view to parent center", etc.
- [ ] T040 [US2] **Commit**: Stage and commit User Story 2 changes

**Checkpoint**: Single-view alignment works - users can center views in containers

---

## Phase 6: User Story 3 - Keyboard Shortcuts for Alignment (Priority: P2)

**Goal**: Users can align views using Ctrl+Shift+L/C/R/T/M/B shortcuts

**Independent Test**: Select views, press keyboard shortcut, verify same result as clicking toolbar button

### Tests for User Story 3

- [ ] T041 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T042 [P] [US3] Create unit tests for handleAlignmentShortcut in `src/domain/alignment/__tests__/shortcuts.spec.ts`:
  - Returns true and triggers align left for Ctrl+Shift+L
  - Returns true and triggers align center for Ctrl+Shift+C
  - Returns true and triggers align right for Ctrl+Shift+R
  - Returns true and triggers align top for Ctrl+Shift+T
  - Returns true and triggers align middle for Ctrl+Shift+M
  - Returns true and triggers align bottom for Ctrl+Shift+B
  - Returns false for unrelated keys
  - Returns false when no views selected
  - Returns false when only root view selected

### Implementation for User Story 3

- [ ] T043 [US3] Implement handleAlignmentShortcut function in `src/domain/alignment/shortcuts.ts`
- [ ] T044 [US3] Export handleAlignmentShortcut from `src/domain/alignment/index.ts`
- [ ] T045 [US3] Extend useCanvasKeyboard hook in `src/hooks/canvas/useCanvasKeyboard.ts`:
  - Add Ctrl+Shift detection before existing handlers
  - Call handleAlignmentShortcut
  - Prevent default if handled
- [ ] T046 [US3] Create integration test for keyboard shortcuts in `src/hooks/canvas/__tests__/useCanvasKeyboard.alignment.spec.ts`
- [ ] T047 [US3] **Commit**: Stage and commit User Story 3 changes

**Checkpoint**: Keyboard shortcuts work - power users can align without mouse

---

## Phase 7: User Story 4 - Distribute Views Evenly (Priority: P3)

**Goal**: Users can select 3+ views and distribute them with equal horizontal/vertical gaps

**Independent Test**: Select 3+ views, click distribute horizontally, verify spacing between adjacent views becomes equal

### Tests for User Story 4

- [ ] T048 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T049 [P] [US4] Create unit tests for distributeViews in `src/domain/alignment/__tests__/distributeViews.spec.ts`:
  - distributeHorizontally with 3 views creates equal gaps
  - distributeHorizontally with 4 views keeps outer views fixed
  - distributeVertically with 3 views creates equal gaps
  - Returns empty array for < 3 views
  - Returns empty array if already evenly distributed
  - Handles views of different sizes correctly
  - Handles overlapping views (negative gaps)
- [ ] T050 [P] [US4] Create unit tests for calculateEqualGap in `src/domain/alignment/__tests__/distributeViews.spec.ts`
- [ ] T051 [P] [US4] Add unit tests for getDistributionDescription in `src/domain/alignment/__tests__/historyOperations.spec.ts`

### Implementation for User Story 4

- [ ] T052 [US4] Implement calculateEqualGap function in `src/domain/alignment/distributeViews.ts`
- [ ] T053 [US4] Implement distributeViews function in `src/domain/alignment/distributeViews.ts`:
  - Sort views by position (left for horizontal, top for vertical)
  - Calculate total span and sum of view sizes
  - Calculate equal gap = (span - sum) / (count - 1)
  - Position inner views at previous.right + gap (horizontal) or previous.bottom + gap (vertical)
- [ ] T054 [US4] Implement getDistributionDescription in `src/domain/alignment/historyOperations.ts`
- [ ] T055 [US4] Export distribution functions from `src/domain/alignment/index.ts`
- [ ] T056 [US4] Wire distribution buttons in AlignmentToolbar to call distributeViews in `src/components/AlignmentToolbar/AlignmentToolbar.tsx`
- [ ] T057 [US4] **Commit**: Stage and commit User Story 4 changes

**Checkpoint**: Distribution works - users can space views evenly

---

## Phase 8: Floating Toolbar (Priority: P3)

**Goal**: Toolbar can be detached from main toolbar and float freely, then re-docked

**Independent Test**: Drag toolbar handle, verify toolbar floats. Double-click header, verify re-docks.

### Tests for Floating Toolbar

- [ ] T058 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T059 [P] Create unit tests for alignmentToolbarStore in `src/stores/__tests__/alignmentToolbarStore.spec.ts`:
  - Initial state is docked
  - dock() sets isDocked to true
  - undock(position) sets isDocked to false with position
  - updateFloatingPosition updates position
  - loadAlignmentToolbarState loads from localStorage
  - loadAlignmentToolbarState restores floating position (400, 100) from localStorage after simulated reload
  - saveAlignmentToolbarState saves to localStorage
  - resetAlignmentToolbarStore resets to initial

### Implementation for Floating Toolbar

- [ ] T060 Create alignmentToolbarStore in `src/stores/alignmentToolbarStore.ts`:
  - State: isDocked, floatingPosition
  - Actions: dock, undock, updateFloatingPosition
  - Persistence: loadAlignmentToolbarState, saveAlignmentToolbarState
  - STORAGE_KEY: 'vstgui-edit:alignment-toolbar'
- [ ] T061 Add drag handle component in `src/components/AlignmentToolbar/DragHandle.tsx`
- [ ] T062 Add floating panel styles in `src/components/AlignmentToolbar/AlignmentToolbar.module.css`:
  - Fixed position
  - z-index: var(--z-dropdown)
  - Shadow for floating state
- [ ] T063 Implement floating behavior in `src/components/AlignmentToolbar/AlignmentToolbar.tsx`:
  - Conditional render based on isDocked
  - Portal for floating panel
  - Drag to undock from handle (minimum 20px drag distance before detaching - FR-015a)
  - Position using @floating-ui/dom shift middleware
  - Double-click or button to re-dock
- [ ] T064 Load toolbar state on app init in `src/App.tsx` or appropriate init location
- [ ] T065 **Commit**: Stage and commit Floating Toolbar changes

**Checkpoint**: Floating toolbar works - users can customize toolbar position

---

## Phase 9: Integration & Undo/Redo

**Goal**: Full workflow integration with history support

### Tests for Integration

- [ ] T066 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T067 Create integration tests in `src/components/AlignmentToolbar/__tests__/AlignmentToolbar.integration.spec.tsx`:
  - Full alignment workflow: select views, click button, verify positions
  - Undo after alignment restores original positions
  - Redo after undo reapplies alignment
  - No history entry when no change occurs
  - Keyboard shortcut integration
  - Distribution with undo/redo

### Implementation for Integration

- [ ] T068 Verify history integration works end-to-end
- [ ] T069 Add FR-031 check: Skip history when no views moved (verify in alignViews and distributeViews)
- [ ] T070 **Commit**: Stage and commit Integration changes

---

## Phase 10: Accessibility & Polish

**Purpose**: WCAG 2.1 AA compliance and final polish

- [ ] T071 [P] Add aria-labels to all buttons per FR-032 in `src/components/AlignmentToolbar/AlignmentButton.tsx`
- [ ] T072 [P] Verify keyboard navigation (Tab/Shift+Tab) per FR-034 in `src/components/AlignmentToolbar/AlignmentToolbar.tsx`
- [ ] T073 [P] Add role="toolbar" and aria-label to toolbar container per FR-032
- [ ] T074 Verify tooltips show keyboard shortcuts per FR-020
- [ ] T075 Update CLAUDE.md with new stores and domain utilities:
  - Add alignmentToolbarStore to Stores section
  - Add alignment domain functions to Domain Utilities section
  - Add keyboard shortcuts to documentation
- [ ] T076 **Commit**: Stage and commit Accessibility & Polish changes

---

## Phase Final-1: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [ ] TQG-1 **CSS Linting**: Run `npm run lint:css` - Fix ALL errors and warnings
- [ ] TQG-2 **Code Quality**: Run `npm run check` - Fix ALL errors and warnings
- [ ] TQG-3 **Type Safety**: Run `npm run typecheck` - Fix ALL errors and warnings
- [ ] TQG-4 **Test Suite**: Run `npm test` - All tests must pass
- [ ] TQG-5 **Verify Clean**: Re-run all commands to confirm zero issues remain

**If Quality Gates Fail**:
1. STOP - do not proceed to Git Verification
2. FIX all reported errors and warnings
3. RE-RUN the failing command(s)
4. REPEAT until all commands pass cleanly

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL-1 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL-2 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them
- [ ] TFINAL-3 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    |
    v
Phase 2: Foundational (bounds calculation)
    |
    +---> Phase 3: US1 (multi-view alignment) ---> Phase 4: US5 (toolbar UI)
    |                                                   |
    |                                                   +---> Phase 5: US2 (parent alignment)
    |                                                   |
    |                                                   +---> Phase 6: US3 (keyboard shortcuts)
    |                                                   |
    +-----------------------------------------------+---> Phase 7: US4 (distribution)
                                                        |
                                                        v
                                                   Phase 8: Floating Toolbar
                                                        |
                                                        v
                                                   Phase 9: Integration
                                                        |
                                                        v
                                                   Phase 10: Polish
                                                        |
                                                        v
                                                   Quality Gates
                                                        |
                                                        v
                                                   Git Verification
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (P1) | Phase 2 | - |
| US5 (P1) | US1 | - |
| US2 (P2) | US5 | US3 |
| US3 (P2) | US5 | US2 |
| US4 (P3) | Phase 2, US5 | US2, US3 |

### Within Each User Story

1. **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
2. Tests MUST be written and FAIL before implementation
3. Pure functions before integration
4. Domain before UI wiring
5. Commit after story complete

### Parallel Opportunities per Phase

**Phase 2** (run in parallel):
- T006, T007, T008 (test files)

**Phase 3** (run in parallel):
- T015, T016, T017, T018 (test files)

**Phase 4** (run in parallel):
- T027, T028 (test files)
- T029, T030 (icons and CSS)

**Phase 7** (run in parallel):
- T049, T050, T051 (test files)

---

## Implementation Strategy

### MVP First (User Stories 1 + 5 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (core alignment)
4. Complete Phase 4: User Story 5 (toolbar UI)
5. **STOP and VALIDATE**: Test alignment via toolbar
6. Deploy/demo if ready - users can align views!

### Incremental Delivery

1. **MVP**: Setup + Foundation + US1 + US5 = Basic alignment toolbar
2. **+US2**: Single-view alignment to parent
3. **+US3**: Keyboard shortcuts for power users
4. **+US4**: Distribution for advanced layouts
5. **+Floating**: Customizable toolbar position

---

## File Summary

### New Files

| Path | Purpose |
|------|---------|
| `src/types/alignment.ts` | Type definitions |
| `src/domain/alignment/index.ts` | Barrel export |
| `src/domain/alignment/calculateBounds.ts` | Bounds calculation |
| `src/domain/alignment/alignViews.ts` | Alignment functions |
| `src/domain/alignment/distributeViews.ts` | Distribution functions |
| `src/domain/alignment/historyOperations.ts` | History integration |
| `src/domain/alignment/shortcuts.ts` | Keyboard shortcut handler |
| `src/domain/alignment/__tests__/*.spec.ts` | Domain tests |
| `src/stores/alignmentToolbarStore.ts` | Toolbar state |
| `src/stores/__tests__/alignmentToolbarStore.spec.ts` | Store tests |
| `src/components/AlignmentToolbar/index.ts` | Component barrel |
| `src/components/AlignmentToolbar/AlignmentToolbar.tsx` | Main toolbar |
| `src/components/AlignmentToolbar/AlignmentButton.tsx` | Button component |
| `src/components/AlignmentToolbar/AlignmentIcons.tsx` | SVG icons |
| `src/components/AlignmentToolbar/DragHandle.tsx` | Drag handle |
| `src/components/AlignmentToolbar/AlignmentToolbar.module.css` | Styles |
| `src/components/AlignmentToolbar/__tests__/*.spec.tsx` | Component tests |

### Modified Files

| Path | Change |
|------|--------|
| `src/components/MainToolbar/MainToolbar.tsx` | Add AlignmentToolbar |
| `src/hooks/canvas/useCanvasKeyboard.ts` | Add alignment shortcuts |
| `CLAUDE.md` | Document new utilities |

---

## Task Count Summary

| Phase | Tasks | Story |
|-------|-------|-------|
| Phase 1: Setup | 4 | - |
| Phase 2: Foundational | 9 | - |
| Phase 3: US1 | 12 | US1 |
| Phase 4: US5 | 10 | US5 |
| Phase 5: US2 | 5 | US2 |
| Phase 6: US3 | 7 | US3 |
| Phase 7: US4 | 10 | US4 |
| Phase 8: Floating | 8 | - |
| Phase 9: Integration | 5 | - |
| Phase 10: Polish | 6 | - |
| Quality Gates | 5 | - |
| Git Verification | 3 | - |
| **Total** | **84** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests (SolidJS-specific patterns)
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- All tests use Vitest with @solidjs/testing-library
- Use `testInRoot()` for store/signal tests, `renderWithProviders()` for component tests
