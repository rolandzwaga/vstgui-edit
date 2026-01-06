# Tasks: Hierarchy Panel

**Input**: Design documents from `/specs/010-hierarchy-panel/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED per Constitution (Test-First Development). Each implementation task must have tests written FIRST.

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests. This ensures SolidJS-specific patterns (microtask flushing, testInRoot, etc.) are followed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, tests co-located in `__tests__/` directories
- Based on plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create file structure and foundational types

- [ ] T001 Create directory structure: `src/components/HierarchyPanel/`, `src/components/HierarchyPanel/__tests__/`, `src/stores/__tests__/`, `src/domain/hierarchy/`, `src/domain/hierarchy/__tests__/`
- [ ] T002 [P] Create TreeNode type definition in `src/types/hierarchy.ts`
- [ ] T003 **Commit**: Stage and commit Phase 1 changes with message "feat(hierarchy): add directory structure and TreeNode type"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Phase 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T004 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T005 [P] Write unit tests for `buildTree()` function in `src/domain/hierarchy/__tests__/buildTree.spec.ts` - include edge cases: empty template (root with no children), views with missing/empty class attribute returning "Unknown" label
- [ ] T006 [P] Write unit tests for `getContainerIds()` function in `src/domain/hierarchy/__tests__/buildTree.spec.ts`
- [ ] T007 [P] Write unit tests for hierarchyStore in `src/stores/__tests__/hierarchyStore.spec.ts`

### Implementation for Phase 2

- [ ] T008 [P] Implement `buildTree()` function in `src/domain/hierarchy/buildTree.ts` - transforms ViewNode to TreeNode
- [ ] T009 [P] Implement `getContainerIds()` function in `src/domain/hierarchy/buildTree.ts` - collects IDs of nodes with children
- [ ] T010 Create barrel export in `src/domain/hierarchy/index.ts`
- [ ] T011 [P] Implement hierarchyStore in `src/stores/hierarchyStore.ts` - expandedIds signal with toggleExpanded, expandNode, collapseNode, expandAll, isExpanded, resetHierarchy
- [ ] T012 Run `npx biome check --write .` and `npx tsc --noEmit` to verify code quality
- [ ] T013 Run all tests with `npm test` to verify 100% pass rate
- [ ] T014 **Commit**: Stage and commit Phase 2 changes with message "feat(hierarchy): add buildTree utility and hierarchyStore"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Template Hierarchy (Priority: P1) 🎯 MVP

**Goal**: Display a tree view in the left sidebar showing all views with proper hierarchy

**Independent Test**: Load a uidesc file with nested views and verify tree displays all views with correct parent-child relationships

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T015 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T016 [P] [US1] Write component tests for TreeNode in `src/components/HierarchyPanel/__tests__/TreeNode.spec.tsx` - test label display, indentation, children rendering, ARIA attributes (role="treeitem", aria-expanded)
- [ ] T017 [P] [US1] Write component tests for HierarchyPanel in `src/components/HierarchyPanel/__tests__/HierarchyPanel.spec.tsx` - test tree rendering when template loaded, empty template edge case, ARIA attributes (role="tree")
- [ ] T018 [P] [US1] Write component tests for EmptyState in `src/components/HierarchyPanel/__tests__/EmptyState.spec.tsx` - test empty state message

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create TreeNode component in `src/components/HierarchyPanel/TreeNode.tsx` - renders single node with label, indentation, and ARIA attributes (role="treeitem", aria-expanded for containers)
- [ ] T020 [P] [US1] Create TreeNode styles in `src/components/HierarchyPanel/TreeNode.module.css` - indentation, label styling
- [ ] T021 [P] [US1] Create EmptyState component in `src/components/HierarchyPanel/EmptyState.tsx` - "No template loaded" message
- [ ] T022 [P] [US1] Create EmptyState styles in `src/components/HierarchyPanel/EmptyState.module.css`
- [ ] T023 [US1] Create HierarchyPanel component in `src/components/HierarchyPanel/HierarchyPanel.tsx` - reads documentStore, builds tree, renders TreeNode recursively, includes role="tree" and aria-label="View hierarchy"
- [ ] T024 [US1] Create HierarchyPanel styles in `src/components/HierarchyPanel/HierarchyPanel.module.css` - fixed width sidebar, scrollable
- [ ] T025 [US1] Create barrel export in `src/components/HierarchyPanel/index.ts`
- [ ] T026 [US1] Update App.tsx to integrate HierarchyPanel - flex layout with panel on left
- [ ] T027 [US1] Run `npx biome check --write .` and `npx tsc --noEmit` to verify code quality
- [ ] T028 [US1] Run all tests with `npm test` to verify 100% pass rate
- [ ] T029 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(hierarchy): add HierarchyPanel with tree view (FR-001, FR-002, FR-003, FR-012)"

**Checkpoint**: User Story 1 complete - tree view displays hierarchy

---

## Phase 4: User Story 2 - Expand and Collapse Containers (Priority: P1)

**Goal**: Enable expand/collapse functionality for container nodes

**Independent Test**: Click expand/collapse toggles and verify children visibility changes

### Tests for User Story 2 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T030 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T031 [P] [US2] Write component tests for expand/collapse toggle in `src/components/HierarchyPanel/__tests__/TreeNode.expand.spec.tsx` - test toggle visibility, click behavior, children hidden when collapsed

### Implementation for User Story 2

- [ ] T032 [US2] Update TreeNode component to show expand/collapse toggle when hasChildren is true in `src/components/HierarchyPanel/TreeNode.tsx`
- [ ] T033 [US2] Add toggle click handler that calls `toggleExpanded()` from hierarchyStore
- [ ] T034 [US2] Update TreeNode to conditionally render children based on `isExpanded()` state
- [ ] T035 [US2] Update HierarchyPanel to call `expandAll()` with container IDs on initial template load (FR-013)
- [ ] T036 [US2] Update TreeNode.module.css with expand/collapse toggle button styling - use faChevronRight (collapsed) and faChevronDown (expanded) icons
- [ ] T037 [US2] Run `npx biome check --write .` and `npx tsc --noEmit` to verify code quality
- [ ] T038 [US2] Run all tests with `npm test` to verify 100% pass rate
- [ ] T039 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(hierarchy): add expand/collapse functionality (FR-004, FR-005, FR-013)"

**Checkpoint**: User Story 2 complete - containers can be expanded/collapsed

---

## Phase 5: User Story 3 - Selection Sync: Tree to Canvas (Priority: P1)

**Goal**: Clicking a view in the tree selects it on the canvas

**Independent Test**: Click a view in tree and verify canvas shows selection overlay

### Tests for User Story 3 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T040 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T041 [P] [US3] Write component tests for tree selection in `src/components/HierarchyPanel/__tests__/TreeNode.selection.spec.tsx` - test click selects, shift+click toggles

### Implementation for User Story 3

- [ ] T042 [US3] Update TreeNode to handle click events - call `select()` on regular click
- [ ] T043 [US3] Update TreeNode to handle Shift+click - call `toggleSelect()` for multi-selection
- [ ] T044 [US3] Add selected visual state to TreeNode.module.css (background highlight)
- [ ] T045 [US3] Update TreeNode to apply selected class based on `isSelected()` check
- [ ] T046 [US3] Run `npx biome check --write .` and `npx tsc --noEmit` to verify code quality
- [ ] T047 [US3] Run all tests with `npm test` to verify 100% pass rate
- [ ] T048 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(hierarchy): add tree-to-canvas selection sync (FR-006, FR-007)"

**Checkpoint**: User Story 3 complete - clicking tree selects on canvas

---

## Phase 6: User Story 4 - Selection Sync: Canvas to Tree (Priority: P1)

**Goal**: Selecting views on canvas reflects in tree (bidirectional sync)

**Independent Test**: Select view on canvas and verify tree node shows selected state and is visible (parents expanded)

### Tests for User Story 4 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T049 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T050 [P] [US4] Write component tests for canvas-to-tree sync in `src/components/HierarchyPanel/__tests__/HierarchyPanel.sync.spec.tsx` - test selection state reflects, auto-expand on nested selection

### Implementation for User Story 4

- [ ] T051 [US4] Update TreeNode to reactively show selected state based on selectionStore.selectedIds
- [ ] T052 [US4] Add createEffect in HierarchyPanel to auto-expand ancestors when selection changes - uses `getAncestorIds()` and `expandNode()`
- [ ] T053 [US4] Run `npx biome check --write .` and `npx tsc --noEmit` to verify code quality
- [ ] T054 [US4] Run all tests with `npm test` to verify 100% pass rate
- [ ] T055 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(hierarchy): add canvas-to-tree selection sync with auto-expand (FR-008, FR-009)"

**Checkpoint**: User Story 4 complete - bidirectional selection sync works

---

## Phase 7: User Story 5 - View Icons by Class Type (Priority: P2)

**Goal**: Display category icons next to each view in the tree

**Independent Test**: Load template with various view classes and verify each displays appropriate category icon

### Tests for User Story 5 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T056 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T057 [P] [US5] Write component tests for icons in `src/components/HierarchyPanel/__tests__/TreeNode.icons.spec.tsx` - test correct icon for each category

### Implementation for User Story 5

- [ ] T058 [P] [US5] Create icon mapping in `src/components/HierarchyPanel/icons.ts` - CATEGORY_ICONS map (faFolder, faSliders, faFont, faPuzzlePiece)
- [ ] T059 [US5] Update TreeNode to render category icon using solid-fontawesome Fa component
- [ ] T060 [US5] Update TreeNode.module.css with icon styling (size, spacing, color per category)
- [ ] T061 [US5] Run `npx biome check --write .` and `npx tsc --noEmit` to verify code quality
- [ ] T062 [US5] Run all tests with `npm test` to verify 100% pass rate
- [ ] T063 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(hierarchy): add category icons (FR-010)"

**Checkpoint**: User Story 5 complete - icons visually distinguish view types

---

## Phase 8: User Story 6 - Scroll to Selection (Priority: P2)

**Goal**: Tree auto-scrolls to show selected node when selection changes from canvas

**Independent Test**: Select view at bottom of hierarchy on canvas, verify tree scrolls to show it

### Tests for User Story 6 ⚠️

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T064 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T065 [P] [US6] Write component tests for scroll behavior in `src/components/HierarchyPanel/__tests__/TreeNode.scroll.spec.tsx` - test scrollIntoView called on selection

### Implementation for User Story 6

- [ ] T066 [US6] Add ref to TreeNode row element
- [ ] T067 [US6] Add createEffect in TreeNode that calls `scrollIntoView({ block: 'nearest', behavior: 'smooth' })` when node becomes selected
- [ ] T068 [US6] Run `npx biome check --write .` and `npx tsc --noEmit` to verify code quality
- [ ] T069 [US6] Run all tests with `npm test` to verify 100% pass rate
- [ ] T070 [US6] **Commit**: Stage and commit User Story 6 changes with message "feat(hierarchy): add scroll-to-selection (FR-011)"

**Checkpoint**: User Story 6 complete - all P2 features implemented

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final polish, accessibility, documentation, and verification

### Accessibility Tasks ⚠️

> **REQUIRED: Constitution IX mandates keyboard navigation and ARIA compliance**

- [ ] T071 [P] Write accessibility tests in `src/components/HierarchyPanel/__tests__/HierarchyPanel.a11y.spec.tsx` - test keyboard navigation (Tab, Enter, Arrow keys), focus management
- [ ] T072 Add keyboard navigation to TreeNode - Tab to focus, Enter to select, ArrowUp/ArrowDown to navigate siblings, ArrowRight to expand, ArrowLeft to collapse
- [ ] T073 Add focus styles to TreeNode.module.css - visible focus indicator meeting WCAG 2.1 AA (4.5:1 contrast)
- [ ] T074 Verify ARIA attributes work correctly - aria-expanded updates on expand/collapse, aria-selected updates on selection

### Documentation & Verification

- [ ] T075 [P] Add design tokens for hierarchy panel colors to `src/styles/tokens.css` if needed
- [ ] T076 [P] Update CLAUDE.md with hierarchyStore documentation and TreeNode type
- [ ] T077 Run full test suite with coverage: `npx vitest run --coverage`
- [ ] T078 Verify 80% code coverage threshold for new code
- [ ] T079 Run `npx biome check --write .` and `npx stylelint "**/*.css" --fix` for final cleanup
- [ ] T080 Run `npx tsc --noEmit` for final type check
- [ ] T081 **Commit**: Stage and commit Polish phase changes with message "feat(hierarchy): add keyboard navigation and accessibility (Constitution IX)"

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] T082 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] T083 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with an appropriate message
- [ ] T084 **Confirm Clean**: Verify working tree is clean (nothing to commit)
- [ ] T085 **Update spec.md Compliance Table**: Fill in the Requirement Compliance Table with evidence for each FR-xxx and SC-xxx

**⚠️ CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1, US2 can proceed in parallel (no dependencies on each other)
  - US3 depends on US1 (needs TreeNode component)
  - US4 depends on US3 (needs selection in tree first)
  - US5 can proceed in parallel with US3-4 (only needs TreeNode)
  - US6 depends on US4 (needs canvas-to-tree sync first)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - Independent
- **User Story 2 (P1)**: Can start after Foundational - Can parallel with US1
- **User Story 3 (P1)**: Depends on US1 - Needs TreeNode component
- **User Story 4 (P1)**: Depends on US3 - Needs selection in tree
- **User Story 5 (P2)**: Can start after US1 - Only needs TreeNode
- **User Story 6 (P2)**: Depends on US4 - Needs canvas-to-tree sync

### Within Each User Story

- **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
- Tests MUST be written and FAIL before implementation
- Components before integration
- Core implementation before polish
- Story complete before moving to dependent story

### Parallel Opportunities

- T002 (types) can run in parallel with T001 (directories)
- T005, T006, T007 (foundational tests) can run in parallel
- T008, T009, T011 (foundational implementation) can run in parallel
- T016, T017, T018 (US1 tests) can run in parallel
- T019, T020, T021, T022 (US1 components) can run in parallel
- US1 and US2 can proceed in parallel
- US5 can proceed in parallel with US3/US4

---

## Parallel Example: Foundational Phase

```bash
# Launch all foundational tests together:
Task: "Write unit tests for buildTree() in src/domain/hierarchy/__tests__/buildTree.spec.ts"
Task: "Write unit tests for getContainerIds() in src/domain/hierarchy/__tests__/buildTree.spec.ts"
Task: "Write unit tests for hierarchyStore in src/stores/__tests__/hierarchyStore.spec.ts"

# After tests written, launch implementations together:
Task: "Implement buildTree() in src/domain/hierarchy/buildTree.ts"
Task: "Implement getContainerIds() in src/domain/hierarchy/buildTree.ts"
Task: "Implement hierarchyStore in src/stores/hierarchyStore.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1-4 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 - Tree view
4. Complete Phase 4: User Story 2 - Expand/collapse
5. Complete Phase 5: User Story 3 - Tree-to-canvas selection
6. Complete Phase 6: User Story 4 - Canvas-to-tree selection
7. **STOP and VALIDATE**: Test all P1 features work
8. Deploy/demo if ready (MVP complete!)

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Tree displays hierarchy → Demo
3. Add US2 → Expand/collapse works → Demo
4. Add US3 + US4 → Bidirectional selection → Demo (Core MVP!)
5. Add US5 → Icons improve UX → Demo
6. Add US6 → Scroll behavior → Demo (Full feature!)

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
