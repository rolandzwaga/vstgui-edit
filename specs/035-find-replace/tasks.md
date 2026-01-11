# Tasks: Find/Replace

**Input**: Design documents from `/specs/035-find-replace/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are included for each user story phase as specified in the feature requirements.

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, types, and base store structure

- [ ] T001 Create search type definitions in `src/types/search.ts` per data-model.md
- [ ] T002 [P] Create searchStore skeleton in `src/stores/searchStore.ts` with signals and reactive store object
- [ ] T003 [P] Create domain module barrel export in `src/domain/search/index.ts`
- [ ] T004 [P] Create FindPanel component directory structure `src/components/FindPanel/`
- [ ] T005 [P] Create FindPanel styles skeleton in `src/components/FindPanel/FindPanel.module.css`
- [ ] T006 **Commit**: Stage and commit Phase 1 changes with message "feat(035): setup search types and store skeleton"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain logic that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

### Domain Logic

- [ ] T007 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T008 [P] Implement query parsing functions in `src/domain/search/searchQuery.ts`:
  - `parseSearchQuery()` - Main parsing function (class/attribute/global detection)
  - `isClassNameLike()` - Class name pattern detection (C/UI prefix)
  - `escapeSearchTerm()` - Escape special characters
  - `unescapeValue()` - Unescape \: to : etc.
- [ ] T009 [P] Write unit tests for searchQuery.ts in `src/domain/search/__tests__/searchQuery.spec.ts`
- [ ] T010 [P] Implement SearchableView preparation in `src/domain/search/searchEngine.ts`:
  - `prepareViewForSearch()` - Convert RenderableView to SearchableView
  - `buildDisplayPath()` - Build parent path string
- [ ] T011 [P] Write unit tests for view preparation in `src/domain/search/__tests__/searchEngine.spec.ts` (part 1)
- [ ] T012 Implement core matching functions in `src/domain/search/searchEngine.ts`:
  - `matchesQuery()` - Core matching logic (class/attribute/global)
  - `passesCategoryFilter()` - Category filter check
  - `isDescendantOf()` - Scope filter check
  - `executeSearch()` - Full search orchestration
- [ ] T013 Write unit tests for matching functions in `src/domain/search/__tests__/searchEngine.spec.ts` (part 2)
- [ ] T014 **Commit**: Stage and commit Phase 2 domain logic with message "feat(035): implement search domain logic"

### Store Implementation

- [ ] T015 Implement searchStore actions in `src/stores/searchStore.ts`:
  - Panel open/close: `openFindPanel()`, `openReplacePanel()`, `closeFindPanel()`, `toggleFindPanel()`
  - Query: `setRawQuery()`, `setParsedQuery()`, `setSearchResults()`
  - Navigation: `navigateToNext()`, `navigateToPrevious()`, `selectResultAtIndex()`
  - Filters: `setCategoryFilter()`, `setAllCategoryFilters()`, `setSearchScope()`, `setMode()`
  - Replace: `setReplaceValue()`
  - Highlights: `updateHighlightedIds()`, `clearHighlights()`
  - Reset: `resetSearchStore()`
- [ ] T016 [P] Write unit tests for searchStore in `src/stores/__tests__/searchStore.spec.ts`
- [ ] T017 **Commit**: Stage and commit Phase 2 store implementation with message "feat(035): implement searchStore with all actions"

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Search Views by Class Name (Priority: P1) MVP

**Goal**: Users can press Ctrl+F, type a class name like "CKnob", and see all matching views in a results list

**Independent Test**: Load uidesc file, press Ctrl+F, type "CKnob", verify matching views are listed and can be selected

**FR Coverage**: FR-001, FR-003, FR-004, FR-005, FR-006, FR-007, FR-010, FR-011, FR-034

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T018 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T019 [P] [US1] Write SearchInput component tests in `src/components/FindPanel/__tests__/SearchInput.spec.tsx`:
  - Debounced input (150ms delay)
  - Auto-focus on mount
  - Immediate onInput callback
  - Debounced onDebouncedInput callback
- [ ] T020 [P] [US1] Write ResultItem component tests in `src/components/FindPanel/__tests__/ResultItem.spec.tsx`:
  - Displays class name
  - Displays parent path
  - Shows matched attribute context
  - Selected state styling
  - Click handler
- [ ] T021 [P] [US1] Write ResultsList component tests in `src/components/FindPanel/__tests__/ResultsList.spec.tsx`:
  - Renders list of results
  - Empty state message
  - Scrollable container
  - Current selection highlighted
- [ ] T022 [P] [US1] Write FindPanel component tests in `src/components/FindPanel/__tests__/FindPanel.spec.tsx`:
  - Opens on Ctrl+F (FR-001)
  - Focuses search input
  - Fixed position top-right (FR-034)
  - Closes on Escape
  - Displays result count (FR-006)

### Implementation for User Story 1

- [ ] T023 [P] [US1] Implement SearchInput component in `src/components/FindPanel/SearchInput.tsx`:
  - Text input with value prop
  - Debounce using setTimeout/clearTimeout pattern (150ms)
  - onInput callback (immediate)
  - onDebouncedInput callback (after delay)
  - Auto-focus on mount
  - aria-label for accessibility
- [ ] T024 [P] [US1] Implement ResultItem component in `src/components/FindPanel/ResultItem.tsx`:
  - Display className, displayPath, matchedAttribute/Value
  - Selected state with different background
  - Click handler for selection
  - role="option" for accessibility
- [ ] T025 [US1] Implement ResultsList component in `src/components/FindPanel/ResultsList.tsx`:
  - Scrollable container with max-height
  - Map results to ResultItem components
  - Empty state message ("No matches found")
  - role="listbox" for accessibility
- [ ] T026 [US1] Implement FindPanel component in `src/components/FindPanel/FindPanel.tsx`:
  - Portal for fixed positioning
  - Top-right position (VS Code style)
  - Contains SearchInput and ResultsList
  - Result count display ("12 results")
  - Connect to searchStore
  - Close button
- [ ] T027 [US1] Add FindPanel styles in `src/components/FindPanel/FindPanel.module.css`:
  - Panel: fixed position, top-right, 320px width
  - Shadow and border radius
  - Input styling
  - Results list styling
  - Result item styling (normal and selected states)
- [ ] T028 [US1] Integrate keyboard shortcut Ctrl+F in Editor component to open FindPanel
- [ ] T029 [US1] Add SearchHighlight component in `src/components/Canvas/SearchHighlight.tsx`:
  - SVG rect overlay for search matches
  - Dashed border style for non-current matches
- [ ] T030 [US1] Integrate SearchHighlight into Canvas component to render search highlights
- [ ] T031 [US1] **Commit**: Stage and commit User Story 1 with message "feat(035): implement class name search (US1)"

**Checkpoint**: At this point, User Story 1 should be fully functional - Ctrl+F opens panel, typing finds views

---

## Phase 4: User Story 2 - Navigate Search Results (Priority: P1)

**Goal**: Users can step through search results using Find Next/Previous buttons or F3/Shift+F3

**Independent Test**: Search for any term, use Find Next/Previous to cycle through results, verify selection changes and canvas pans

**FR Coverage**: FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-035, FR-036, FR-037

### Tests for User Story 2

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T032 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T033 [P] [US2] Write NavigationButtons tests in `src/components/FindPanel/__tests__/NavigationButtons.spec.tsx`:
  - "N of M" counter display (FR-016)
  - Find Next button click
  - Find Previous button click
  - Disabled state when no results
- [ ] T034 [P] [US2] Write keyboard navigation tests in ResultsList:
  - Arrow Down navigates to next (FR-036)
  - Arrow Up navigates to previous (FR-036)
  - Enter selects current result (FR-037)
  - Wrap from last to first (FR-017)
  - Wrap from first to last (FR-017)
- [ ] T035 [P] [US2] Write integration tests for navigation:
  - Clicking result selects on canvas (FR-035)
  - F3 navigates to next result (FR-012)
  - Shift+F3 navigates to previous result (FR-013)
  - Canvas pans to show selected view (FR-015)

### Implementation for User Story 2

- [ ] T036 [P] [US2] Implement NavigationButtons in `src/components/FindPanel/NavigationButtons.tsx`:
  - "N of M" counter display
  - Find Next button with onClick handler
  - Find Previous button with onClick handler
  - Disabled state when totalCount is 0
  - aria-labels for accessibility
- [ ] T037 [US2] Add keyboard navigation to ResultsList:
  - Arrow Up/Down handlers (FR-036)
  - Enter handler to select (FR-037)
  - Wrap logic for first/last (FR-017)
  - Focus management for keyboard users
- [ ] T038 [US2] Implement result selection with canvas integration in searchStore:
  - `selectResultAtIndex()` - select view via selectionStore
  - Pan canvas to center selected view using canvasStore
  - Auto-scroll result into view in results list
- [ ] T039 [US2] Add global keyboard shortcuts for F3/Shift+F3:
  - `handleSearchKeyboard()` function in searchStore
  - F3 calls navigateToNext() (FR-012)
  - Shift+F3 calls navigateToPrevious() (FR-013)
  - Integrate with Editor keydown handler
- [ ] T040 [US2] Integrate NavigationButtons into FindPanel
- [ ] T041 [US2] Update SearchHighlight to distinguish current result:
  - Current result: solid border, different color
  - Other matches: dashed border
  - FR-019 compliance
- [ ] T042 [US2] **Commit**: Stage and commit User Story 2 with message "feat(035): implement result navigation (US2)"

**Checkpoint**: User Stories 1 AND 2 should work - search and navigate through results

---

## Phase 5: User Story 3 - Search by Attribute Values (Priority: P2)

**Goal**: Users can search for views by attribute values using "attribute:value" syntax

**Independent Test**: Search for "background-color:#FF0000", verify only views with that attribute value appear

**FR Coverage**: FR-008, FR-010

### Tests for User Story 3

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T043 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T044 [P] [US3] Write attribute search tests in `src/domain/search/__tests__/searchEngine.spec.ts`:
  - "background-color:#FF0000" matches views with that color
  - "origin:10, 20" matches views with that origin
  - "font:MyFont" matches views with that font
  - Case-insensitive value matching (FR-010)
  - Partial value matching within attribute
- [ ] T045 [P] [US3] Write query parsing tests for attribute syntax in `src/domain/search/__tests__/searchQuery.spec.ts`:
  - "attribute:value" detection
  - Escaped colon handling (\:)
  - Multiple colons handling (first colon is delimiter)

### Implementation for User Story 3

- [ ] T046 [US3] Ensure parseSearchQuery handles attribute:value syntax correctly:
  - Parse "attribute:value" format
  - Handle escaped colons in values
  - Return correct attributeName and value fields
- [ ] T047 [US3] Ensure matchesQuery handles attribute search type:
  - Check if view has the specified attribute
  - Case-insensitive substring match on value
  - Return false if attribute doesn't exist
- [ ] T048 [US3] Update ResultItem to show matched attribute context:
  - Display "attributeName: value" when matchedAttribute exists
  - Highlight the matched portion (optional enhancement)
- [ ] T049 [US3] **Commit**: Stage and commit User Story 3 with message "feat(035): implement attribute value search (US3)"

**Checkpoint**: Users can now search by class name OR attribute values

---

## Phase 6: User Story 4 - Filter by View Category (Priority: P2)

**Goal**: Users can filter search results by view category (container, control, display, custom)

**Independent Test**: Enable "Controls only" filter, verify only control-type views appear in results

**FR Coverage**: FR-009, FR-028

### Tests for User Story 4

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T050 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T051 [P] [US4] Write CategoryFilter component tests in `src/components/FindPanel/__tests__/CategoryFilter.spec.tsx`:
  - Checkbox per category (container, control, display, custom)
  - Toggle behavior
  - Multi-select support (FR-028)
  - Filter state reflected in checkboxes
- [ ] T052 [P] [US4] Write category filter domain tests in `src/domain/search/__tests__/searchEngine.spec.ts`:
  - passesCategoryFilter returns true when category enabled
  - passesCategoryFilter returns false when category disabled
  - All filters disabled shows no results
  - All filters enabled shows all matching results

### Implementation for User Story 4

- [ ] T053 [US4] Implement CategoryFilter component in `src/components/FindPanel/CategoryFilter.tsx`:
  - Checkbox per category
  - onChange handlers calling setCategoryFilter
  - Labels: Containers, Controls, Display, Custom
  - Collapsible section (optional)
- [ ] T054 [US4] Integrate CategoryFilter into FindPanel
- [ ] T055 [US4] Ensure executeSearch uses category filters:
  - Call passesCategoryFilter for each view
  - Filter out views that don't pass
- [ ] T056 [US4] Add styles for CategoryFilter in `src/components/FindPanel/FindPanel.module.css`
- [ ] T057 [US4] **Commit**: Stage and commit User Story 4 with message "feat(035): implement category filtering (US4)"

**Checkpoint**: Users can now filter results by view category

---

## Phase 7: User Story 5 - Replace Attribute Values (Priority: P3)

**Goal**: Users can replace attribute values across matching views with full undo support

**Independent Test**: Find views with color, replace with new color, verify changes, Ctrl+Z undoes all

**FR Coverage**: FR-002, FR-021, FR-022, FR-023, FR-024, FR-025, FR-026, FR-038

### Tests for User Story 5

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T058 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T059 [P] [US5] Write replace domain tests in `src/domain/search/__tests__/replaceOperations.spec.ts`:
  - validateReplaceValue rejects class name changes (FR-038)
  - validateReplaceValue validates point format for origin/size
  - validateReplaceValue validates color format
  - replaceAttribute skips locked views (FR-026)
  - replaceAll returns correct counts
- [ ] T060 [P] [US5] Write history operation tests in `src/domain/search/__tests__/historyOperations.spec.ts`:
  - createReplaceOperation undo restores old value
  - createReplaceOperation redo applies new value
  - createReplaceAllOperation undoes all changes in one action (FR-025)
- [ ] T061 [P] [US5] Write ReplaceControls component tests in `src/components/FindPanel/__tests__/ReplaceControls.spec.tsx`:
  - Replace value input
  - Replace button calls onReplace
  - Replace All button calls onReplaceAll
  - Disabled state when canReplace is false
  - Error message display
- [ ] T062 [P] [US5] Write ModeToggle component tests in `src/components/FindPanel/__tests__/ModeToggle.spec.tsx`:
  - Find/Replace tab toggle
  - Ctrl+Shift+F opens in Replace mode (FR-002)

### Implementation for User Story 5

- [ ] T063 [P] [US5] Implement replaceOperations.ts in `src/domain/search/replaceOperations.ts`:
  - READ_ONLY_ATTRIBUTES constant
  - validateReplaceValue() with format validation
  - replaceAttribute() single replace with lock check
  - replaceAll() batch replace with counts
- [ ] T064 [P] [US5] Implement historyOperations.ts in `src/domain/search/historyOperations.ts`:
  - createReplaceOperation() for single replace
  - createReplaceAllOperation() for batch replace
- [ ] T065 [US5] Write unit tests for replaceOperations.ts
- [ ] T066 [US5] Write unit tests for historyOperations.ts
- [ ] T067 [US5] Implement ModeToggle component in `src/components/FindPanel/ModeToggle.tsx`:
  - Find/Replace tabs or toggle buttons
  - Mode change handler
  - Visual indicator for current mode
- [ ] T068 [US5] Implement ReplaceControls component in `src/components/FindPanel/ReplaceControls.tsx`:
  - Replace value text input
  - Replace button (single)
  - Replace All button
  - Validation error display
  - Disabled states
- [ ] T069 [US5] Integrate ModeToggle and ReplaceControls into FindPanel:
  - Show ReplaceControls only when mode is 'replace'
  - Wire up replace handlers
- [ ] T070 [US5] Implement replace handlers in searchStore or integration layer:
  - handleReplace() - replace current result
  - handleReplaceAll() - replace all matching results
  - Push history operation for undo support
  - Refresh search results after replace
- [ ] T071 [US5] Add Ctrl+Shift+F keyboard shortcut to open Replace mode
- [ ] T072 [US5] Add styles for ModeToggle and ReplaceControls in `src/components/FindPanel/FindPanel.module.css`
- [ ] T073 [US5] **Commit**: Stage and commit User Story 5 with message "feat(035): implement replace with undo support (US5)"

**Checkpoint**: Users can now find and replace attribute values with full undo

---

## Phase 8: User Story 6 - Filter by Parent Container (Priority: P3)

**Goal**: Users can restrict search to descendants of selected containers

**Independent Test**: Select a container, enable "Search within selection", verify only descendants appear

**FR Coverage**: FR-027, FR-029

### Tests for User Story 6

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T074 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T075 [P] [US6] Write ScopeFilter component tests in `src/components/FindPanel/__tests__/ScopeFilter.spec.tsx`:
  - "All views" option
  - "Within selection" option (FR-027)
  - Disabled when no selection
  - Shows container name when scoped
- [ ] T076 [P] [US6] Write scope filter domain tests:
  - isDescendantOf correctly identifies descendants
  - executeSearch respects scope filter
  - Scope with no selection searches all (FR-027 edge case)

### Implementation for User Story 6

- [ ] T077 [US6] Implement ScopeFilter component in `src/components/FindPanel/ScopeFilter.tsx`:
  - Radio buttons or toggle for All/Selection scope
  - Show selected container name when scoped
  - Disable "Within selection" when no selection
- [ ] T078 [US6] Integrate ScopeFilter into FindPanel
- [ ] T079 [US6] Ensure executeSearch uses scope filter:
  - Get selected container IDs from selectionStore
  - Use isDescendantOf to filter views
  - Handle multiple selected containers (FR-027)
- [ ] T080 [US6] Implement filter state reset on panel close (FR-029)
- [ ] T081 [US6] Add styles for ScopeFilter in `src/components/FindPanel/FindPanel.module.css`
- [ ] T082 [US6] **Commit**: Stage and commit User Story 6 with message "feat(035): implement scope filtering (US6)"

**Checkpoint**: All user stories are now independently functional

---

## Phase 9: Result Highlighting and Panel Behavior

**Purpose**: Canvas highlighting (FR-018, FR-019, FR-020) and panel behavior (FR-030, FR-031, FR-032, FR-033)

- [ ] T083 Write tests for canvas highlighting behavior:
  - All matches highlighted while panel open (FR-018)
  - Current result has distinct style (FR-019)
  - Highlights don't interfere with selection (FR-020)
  - Highlights cleared when panel closes (FR-033)
- [ ] T084 Ensure SearchHighlight styling distinguishes current vs other matches
- [ ] T085 Implement panel behavior:
  - Escape closes panel (FR-030) - already done in US1
  - Panel doesn't block canvas interaction (FR-031)
  - Query remembered during session (FR-032)
  - Highlights cleared on close (FR-033)
- [ ] T086 Write integration tests for panel behavior
- [ ] T087 **Commit**: Stage and commit highlighting and panel behavior with message "feat(035): implement canvas highlighting and panel behavior"

---

## Phase 10: Polish and Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T088 Add empty state handling:
  - "No views in document" when document has no views
  - "No matches found" with suggestions when search yields no results
- [ ] T089 Add validation error messages for Replace operations
- [ ] T090 Performance optimization:
  - Verify search completes within 200ms (SC-002)
  - Verify Replace All completes within 1s for 100 views (SC-004)
- [ ] T091 Accessibility improvements:
  - ARIA roles on all interactive elements
  - Keyboard navigation throughout
  - Screen reader announcements for result count
- [ ] T092 Update barrel export in `src/domain/search/index.ts` with all exports
- [ ] T093 Update CLAUDE.md with searchStore documentation:
  - Add searchStore to Stores section
  - Add search domain functions to Domain Utilities section
  - Update Recent Changes table
- [ ] T094 Run quickstart.md validation - verify all scenarios work
- [ ] T095 **Commit**: Stage and commit Polish phase with message "feat(035): polish and cross-cutting improvements"

---

## Phase Final-1: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [ ] TQG-1 **CSS Linting**: Run `npm run lint:css` - Fix ALL errors and warnings
- [ ] TQG-2 **Code Quality**: Run `npm run check` - Fix ALL errors and warnings
- [ ] TQG-3 **Type Safety**: Run `npm run typecheck` - Fix ALL errors and warnings
- [ ] TQG-4 **Tests**: Run `npm test` - ALL tests must pass
- [ ] TQG-5 **Verify Clean**: Re-run all four commands to confirm zero issues remain

**If Quality Gates Fail**:
1. STOP - do not proceed to Git Verification
2. FIX all reported errors and warnings
3. RE-RUN the failing command(s)
4. REPEAT until all commands pass cleanly

**NO EXCEPTIONS**: Even "pre-existing" issues MUST be resolved. The spec is NOT complete until all quality gates pass.

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL-1 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL-2 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with an appropriate message
- [ ] TFINAL-3 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies and Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority - implement US1 first (simpler), then US2 (builds on US1)
  - US3 and US4 are both P2 priority - can be implemented in parallel after US1/US2
  - US5 and US6 are both P3 priority - can be implemented in parallel after US3/US4
- **Highlighting (Phase 9)**: Can run in parallel with later user stories
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Depends On | Can Parallelize With |
|-------|----------|------------|---------------------|
| US1 - Class Search | P1 | Foundational | None (first) |
| US2 - Navigation | P1 | US1 | None |
| US3 - Attribute Search | P2 | US2 | US4 |
| US4 - Category Filter | P2 | US2 | US3 |
| US5 - Replace | P3 | US3 (needs attribute search) | US6 |
| US6 - Scope Filter | P3 | US4 (needs filtering pattern) | US5 |

### Within Each User Story

- **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
- Tests MUST be written and FAIL before implementation
- Domain logic before components
- Components before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Within Setup (Phase 1)**:
```
T002 searchStore skeleton || T003 domain barrel || T004 directory structure || T005 styles skeleton
```

**Within Foundational (Phase 2)**:
```
T008 searchQuery.ts || T010 searchEngine prep
T009 searchQuery tests || T011 searchEngine tests
```

**Within US1 (Phase 3)**:
```
T019 SearchInput tests || T020 ResultItem tests || T021 ResultsList tests || T022 FindPanel tests
T023 SearchInput component || T024 ResultItem component
```

**Within US5 (Phase 7)**:
```
T059 replace domain tests || T060 history tests || T061 ReplaceControls tests || T062 ModeToggle tests
T063 replaceOperations.ts || T064 historyOperations.ts
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 - Class Search
4. Complete Phase 4: User Story 2 - Navigation
5. **STOP and VALIDATE**: Test search and navigation independently
6. Deploy/demo if ready - users can search by class name and navigate results

### Incremental Delivery

1. Setup + Foundational -> Foundation ready
2. Add US1 -> Ctrl+F works, can see results (MVP!)
3. Add US2 -> F3/Shift+F3 navigation, canvas selection
4. Add US3 -> Attribute search "color:#FF0000"
5. Add US4 -> Category filtering
6. Add US5 -> Replace functionality with undo
7. Add US6 -> Scope filtering
8. Each story adds value without breaking previous stories

### Test Coverage Targets

| Category | Target Coverage |
|----------|-----------------|
| Domain functions | 90%+ |
| Store actions | 85%+ |
| Components | 80%+ |
| Integration | Key flows covered |

---

## Task Summary

| Phase | Task Count | Parallelizable |
|-------|------------|----------------|
| Setup | 6 | 4 |
| Foundational | 11 | 6 |
| US1 - Class Search | 14 | 8 |
| US2 - Navigation | 11 | 4 |
| US3 - Attribute Search | 7 | 3 |
| US4 - Category Filter | 8 | 3 |
| US5 - Replace | 16 | 8 |
| US6 - Scope Filter | 9 | 3 |
| Highlighting | 5 | 0 |
| Polish | 8 | 2 |
| Quality Gates | 5 | 0 |
| Git Verification | 3 | 0 |
| **Total** | **103** | **41** |

---

## Requirement Coverage Map

| Requirement | User Story | Task(s) |
|-------------|------------|---------|
| FR-001 | US1 | T022, T028 |
| FR-002 | US5 | T062, T071 |
| FR-003 | US1 | T022 |
| FR-004 | US1 | T025, T026 |
| FR-005 | US1 | T024 |
| FR-006 | US1 | T022, T026 |
| FR-007 | US1 | T012, T013 |
| FR-008 | US3 | T044, T046-T47 |
| FR-009 | US4 | T051-T055 |
| FR-010 | US1, US3 | T012, T044 |
| FR-011 | US1 | T019, T023 |
| FR-012 | US2 | T035, T039 |
| FR-013 | US2 | T035, T039 |
| FR-014 | US2 | T035, T038 |
| FR-015 | US2 | T035, T038 |
| FR-016 | US2 | T033, T036 |
| FR-017 | US2 | T034, T037 |
| FR-018 | Phase 9 | T083, T084 |
| FR-019 | Phase 9 | T083, T041 |
| FR-020 | Phase 9 | T083, T084 |
| FR-021 | US5 | T061, T068 |
| FR-022 | US5 | T061, T070 |
| FR-023 | US5 | T061, T070 |
| FR-024 | US5 | T059, T063 |
| FR-025 | US5 | T060, T064 |
| FR-026 | US5 | T059, T063 |
| FR-027 | US6 | T075-T079 |
| FR-028 | US4 | T051, T053 |
| FR-029 | US6 | T080 |
| FR-030 | US1 | T022 |
| FR-031 | Phase 9 | T085 |
| FR-032 | Phase 9 | T085 |
| FR-033 | Phase 9 | T085 |
| FR-034 | US1 | T022, T026 |
| FR-035 | US2 | T035 |
| FR-036 | US2 | T034, T037 |
| FR-037 | US2 | T034, T037 |
| FR-038 | US5 | T059, T063 |

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
