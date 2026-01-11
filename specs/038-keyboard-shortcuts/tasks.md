# Tasks: Keyboard Shortcuts System

**Input**: Design documents from `/specs/038-keyboard-shortcuts/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the feature specification. Test tasks are omitted unless the user specifically requests TDD approach.

**Testing Guide**: If tests are added, every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and project structure setup

- [ ] T001 Create type definitions for shortcuts system in src/types/shortcuts.ts
  - ShortcutCategoryId type (10 categories)
  - ShortcutDefinition interface (id, keys, description, category, context?)
  - ShortcutCategoryMeta interface (id, name, order)
  - ShortcutConflict interface (normalizedKey, shortcuts)
  - ShortcutsPanelState interface (isOpen, searchQuery, expandedCategories)
- [ ] T002 Create src/domain/shortcuts/ directory structure
- [ ] T003 **Commit**: Stage and commit Phase 1 changes with descriptive message

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core registry and utilities that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Implement SHORTCUT_CATEGORIES constant in src/domain/shortcuts/registry.ts
  - 10 categories with id, name, order: canvas, selection, editing, clipboard, alignment, viewManagement, grouping, findReplace, file, general
- [ ] T005 Implement SHORTCUT_REGISTRY constant in src/domain/shortcuts/registry.ts
  - All 44 shortcuts from data-model.md
  - Canvas Navigation (10), Selection (3), Editing (6), Clipboard (4), Alignment (6), View Management (5), Grouping (2), Find/Replace (4), File (2), General (2)
- [ ] T006 [P] Implement platform detection in src/domain/shortcuts/platform.ts
  - isMacPlatform(): boolean - detect macOS via navigator.platform
  - getModifierKeyName(): string - "Cmd" on Mac, "Ctrl" otherwise
  - formatKeysForPlatform(keys): string - convert Ctrl+ to Cmd+ on Mac (FR-020)
- [ ] T007 [P] Implement registry query functions in src/domain/shortcuts/registry.ts
  - getShortcutsByCategory(category): ShortcutDefinition[]
  - getShortcutById(id): ShortcutDefinition | undefined
  - getShortcutsGroupedByCategory(): Map<ShortcutCategoryId, ShortcutDefinition[]>
  - getShortcutCount(): number
  - getCategoryStats(): Map<ShortcutCategoryId, number>
- [ ] T008 [P] Implement search utilities in src/domain/shortcuts/search.ts
  - searchShortcuts(query): ShortcutDefinition[] - case-insensitive substring match on keys and description (FR-007, FR-008)
- [ ] T009 [P] Implement conflict detection in src/domain/shortcuts/conflicts.ts
  - detectConflicts(): ShortcutConflict[] - find duplicate key combinations (FR-021)
  - hasConflict(shortcutId): boolean
  - getConflictForShortcut(shortcutId): ShortcutConflict | undefined
  - Log warnings to console for detected conflicts (FR-022)
- [ ] T010 Create barrel export in src/domain/shortcuts/index.ts
  - Export all from registry.ts, platform.ts, search.ts, conflicts.ts
- [ ] T011 **Commit**: Stage and commit Phase 2 changes with descriptive message

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Access Shortcuts Reference Panel (Priority: P1)

**Goal**: Enable users to open a searchable keyboard shortcuts panel via `?` or `Ctrl+/`

**Independent Test**: Press `?` or `Ctrl+/` and verify the shortcuts panel opens with a searchable list organized by category

### Implementation for User Story 1

- [ ] T012 [US1] Create shortcutsPanelStore in src/stores/shortcutsPanelStore.ts per contract
  - shortcutsPanelStore: Readonly<ShortcutsPanelState>
  - openShortcutsPanel(): clears search, expands all categories, sets isOpen true
  - closeShortcutsPanel(): sets isOpen false
  - toggleShortcutsPanel(): toggles isOpen
  - resetShortcutsPanelStore(): for testing
- [ ] T013 [P] [US1] Create ShortcutItem component in src/components/ShortcutsPanel/ShortcutItem.tsx
  - Props: shortcut: ShortcutDefinition
  - Display key combination in keyboard-key styled format (FR-012)
  - Display action description (FR-013)
  - Display context note if present
  - tabIndex={0} for accessibility (FR-027)
- [ ] T014 [P] [US1] Create ShortcutItem.module.css with kbd styling
  - Use design tokens from src/styles/tokens.css
  - Keyboard key visual styling (bordered, slightly raised appearance)
- [ ] T015 [P] [US1] Create ShortcutCategory component in src/components/ShortcutsPanel/ShortcutCategory.tsx
  - Props: category: ShortcutCategoryMeta, shortcuts: ShortcutDefinition[], expanded: boolean, onToggle
  - Collapsible/expandable category section (FR-017)
  - Category name header (FR-014)
  - List of ShortcutItem components
- [ ] T016 [P] [US1] Create ShortcutCategory.module.css
  - Category header styling
  - Expand/collapse indicator
- [ ] T017 [US1] Create ShortcutsPanel component in src/components/ShortcutsPanel/ShortcutsPanel.tsx
  - Modal dialog with overlay (FR-003)
  - Header with title "Keyboard Shortcuts" and close button
  - Close via Escape key, overlay click, or close button (FR-003)
  - Display categories grouped using ShortcutCategory (FR-005)
  - All categories expanded by default (FR-017a)
  - role="dialog", aria-modal="true", aria-labelledby
- [ ] T018 [P] [US1] Create ShortcutsPanel.module.css
  - Modal overlay styling
  - Panel positioning and sizing
  - Header and close button styling
  - Scrollable content area
- [ ] T019 [US1] Modify useCanvasKeyboard.ts to add `?` handler in src/hooks/canvas/useCanvasKeyboard.ts
  - Handle `?` key when no input focused (FR-001)
  - Check documentStore.document exists (FR-006)
  - Check no other modal is open (preferencesStore.isOpen)
  - Call openShortcutsPanel()
- [ ] T020 [US1] Modify useCanvasKeyboard.ts to add `Ctrl+/` handler in src/hooks/canvas/useCanvasKeyboard.ts
  - Handle Ctrl+/ (or Cmd+/ on Mac) (FR-002)
  - Same guards as ? key
  - Call openShortcutsPanel()
- [ ] T021 [US1] Mount ShortcutsPanel in App.tsx or EditorLayout
  - Add ShortcutsPanel component to render tree
  - Panel renders based on shortcutsPanelStore.isOpen
- [ ] T022 [US1] **Commit**: Stage and commit User Story 1 changes with descriptive message

**Checkpoint**: User Story 1 complete - panel opens via keyboard shortcuts, displays organized shortcuts, closes properly

---

## Phase 4: User Story 2 - Search Shortcuts (Priority: P1)

**Goal**: Enable users to filter shortcuts by typing in a search field

**Independent Test**: Open shortcuts panel, type "zoom", verify only zoom-related shortcuts are displayed

### Implementation for User Story 2

- [ ] T023 [US2] Add search state actions to shortcutsPanelStore in src/stores/shortcutsPanelStore.ts
  - setSearchQuery(query): string - updates searchQuery
  - clearSearch(): clears searchQuery to empty string
- [ ] T024 [P] [US2] Create ShortcutSearch component in src/components/ShortcutsPanel/ShortcutSearch.tsx
  - Props: value: string, onChange: (query: string) => void, inputRef
  - Search input field (FR-004)
  - Placeholder text "Search shortcuts..."
  - Clear button when query present
- [ ] T025 [P] [US2] Create ShortcutSearch.module.css
  - Search input styling
  - Clear button styling
- [ ] T026 [US2] Integrate ShortcutSearch into ShortcutsPanel in src/components/ShortcutsPanel/ShortcutsPanel.tsx
  - Add ShortcutSearch above category list
  - Auto-focus search input on panel open (FR-011)
  - Connect to setSearchQuery from store
- [ ] T027 [US2] Implement search filtering in ShortcutsPanel in src/components/ShortcutsPanel/ShortcutsPanel.tsx
  - Use searchShortcuts() when searchQuery is non-empty (FR-007, FR-008, FR-009)
  - Display flat filtered results when searching (FR-015)
  - Hide category headers when searching (FR-015)
  - Show grouped categories when not searching
- [ ] T028 [US2] Add empty state to ShortcutsPanel in src/components/ShortcutsPanel/ShortcutsPanel.tsx
  - Display "No shortcuts found" when search yields no results (FR-010)
- [ ] T029 [US2] **Commit**: Stage and commit User Story 2 changes with descriptive message

**Checkpoint**: User Story 2 complete - search filters shortcuts in real-time, shows empty state when no results

---

## Phase 5: User Story 3 - View Shortcuts by Category (Priority: P1)

**Goal**: Display shortcuts organized by functional category with collapsible sections

**Independent Test**: Open shortcuts panel without searching, verify shortcuts are grouped under clear category headings

### Implementation for User Story 3

- [ ] T030 [US3] Add category expansion actions to shortcutsPanelStore in src/stores/shortcutsPanelStore.ts
  - expandCategory(categoryId): adds to expandedCategories Set
  - collapseCategory(categoryId): removes from expandedCategories Set
  - toggleCategory(categoryId): toggles presence in Set
  - expandAllCategories(): adds all category IDs
  - collapseAllCategories(): clears Set
  - isCategoryExpanded(categoryId): boolean check
- [ ] T031 [US3] Connect category expansion to ShortcutsPanel in src/components/ShortcutsPanel/ShortcutsPanel.tsx
  - Pass expanded state from store to ShortcutCategory
  - Connect onToggle to toggleCategory
  - Categories sorted by order from SHORTCUT_CATEGORIES (FR-016)
- [ ] T032 [US3] Verify all categories display correctly
  - Canvas Navigation, Selection, Editing, Clipboard, Alignment, View Management, Grouping, Find/Replace, File, General (FR-016)
  - Each category header visible (FR-014)
  - Shortcuts grouped under correct category (FR-005)
- [ ] T033 [US3] **Commit**: Stage and commit User Story 3 changes with descriptive message

**Checkpoint**: User Story 3 complete - shortcuts organized by category, categories collapsible

---

## Phase 6: User Story 4 - Access Shortcuts from Preferences (Priority: P2)

**Goal**: Provide access to shortcuts reference from the Preferences panel

**Independent Test**: Open Preferences, navigate to Keyboard Shortcuts section, click button to open full panel

### Implementation for User Story 4

- [ ] T034 [US4] Modify KeyboardShortcutsSection to use centralized registry in src/components/PreferencesPanel/sections/KeyboardShortcutsSection.tsx
  - Import SHORTCUT_REGISTRY, SHORTCUT_CATEGORIES from domain/shortcuts
  - Replace existing KEYBOARD_SHORTCUTS usage with registry data (FR-024)
  - Display shortcuts organized by category matching standalone panel
- [ ] T035 [US4] Add "Open Full Panel" button to KeyboardShortcutsSection in src/components/PreferencesPanel/sections/KeyboardShortcutsSection.tsx
  - Button opens standalone shortcuts panel with search (FR-025)
  - Close Preferences panel when opening shortcuts panel
  - Import openShortcutsPanel from store
- [ ] T036 [US4] **Commit**: Stage and commit User Story 4 changes with descriptive message

**Checkpoint**: User Story 4 complete - Preferences uses registry, button opens full panel

---

## Phase 7: User Story 5 - Detect Shortcut Conflicts (Priority: P3)

**Goal**: Detect and warn about duplicate keyboard shortcut definitions

**Independent Test**: Review console output at startup for any conflict warnings

### Implementation for User Story 5

- [ ] T037 [US5] Add conflict visual indicator to ShortcutItem in src/components/ShortcutsPanel/ShortcutItem.tsx
  - Import hasConflict, getConflictForShortcut from domain/shortcuts
  - Display warning icon when shortcut has conflicts (FR-023)
  - Add tooltip explaining the conflict
- [ ] T038 [P] [US5] Update ShortcutItem.module.css with conflict styling
  - Warning icon styling
  - Tooltip styling
- [ ] T039 [US5] Initialize conflict detection on app startup
  - Call detectConflicts() during app initialization
  - Console warnings logged automatically (FR-022)
- [ ] T040 [US5] **Commit**: Stage and commit User Story 5 changes with descriptive message

**Checkpoint**: User Story 5 complete - conflicts detected and displayed

---

## Phase 8: Accessibility & Polish

**Purpose**: Keyboard navigation and cross-cutting improvements

- [ ] T041 Implement keyboard navigation in ShortcutsPanel in src/components/ShortcutsPanel/ShortcutsPanel.tsx
  - Tab navigation: search -> shortcut list -> close button (FR-026)
  - Arrow keys navigate within shortcut list (FR-026)
  - Focus visible indicators
- [ ] T042 Add platform-aware key display to ShortcutItem in src/components/ShortcutsPanel/ShortcutItem.tsx
  - Use formatKeysForPlatform() for displaying keys (FR-020)
  - Show Cmd instead of Ctrl on macOS
- [ ] T043 [P] Deprecate or redirect existing preferences/keyboardShortcuts.ts
  - Update src/domain/preferences/keyboardShortcuts.ts to re-export from domain/shortcuts
  - Maintain backward compatibility for any existing consumers
- [ ] T044 Update CLAUDE.md with new domain/store documentation
  - Add shortcutsPanelStore to Stores section
  - Add shortcuts domain to Domain Utilities section
  - Add to Recent Changes table
- [ ] T045 Run quickstart.md validation scenarios
- [ ] T046 **Commit**: Stage and commit Polish phase changes with descriptive message

---

## Phase 9: Quality Gates (MANDATORY)

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
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2
- **User Story 2 (Phase 4)**: Depends on Phase 2, builds on US1 components
- **User Story 3 (Phase 5)**: Depends on Phase 2, builds on US1 components
- **User Story 4 (Phase 6)**: Depends on Phase 2, independent of US1-3
- **User Story 5 (Phase 7)**: Depends on Phase 2, builds on US1 components
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - creates panel and store
- **User Story 2 (P1)**: Adds search to US1's panel
- **User Story 3 (P1)**: Adds category expansion to US1's panel
- **User Story 4 (P2)**: Independent - modifies Preferences panel
- **User Story 5 (P3)**: Adds conflict indicators to US1's ShortcutItem

### Parallel Opportunities

**Phase 2 (Foundational)**:
```
T006 platform.ts     \
T007 registry.ts      > Can run in parallel (different files)
T008 search.ts       /
T009 conflicts.ts   /
```

**Phase 3 (User Story 1)**:
```
T013 ShortcutItem.tsx      \
T014 ShortcutItem.module.css > Can run in parallel
T015 ShortcutCategory.tsx   |
T016 ShortcutCategory.module.css /
T018 ShortcutsPanel.module.css /
```

**Phase 4 (User Story 2)**:
```
T024 ShortcutSearch.tsx     \
T025 ShortcutSearch.module.css > Can run in parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup (types)
2. Complete Phase 2: Foundational (registry, utilities)
3. Complete Phase 3: User Story 1 (panel opens, displays shortcuts)
4. **VALIDATE**: Panel opens with ? or Ctrl+/, shows all 44 shortcuts
5. Complete Phase 4: User Story 2 (search)
6. **VALIDATE**: Search filters shortcuts
7. Complete Phase 5: User Story 3 (categories)
8. **VALIDATE**: Categories expand/collapse

### Incremental Delivery

1. Setup + Foundational -> Core data ready
2. Add User Story 1 -> Panel works (MVP!)
3. Add User Story 2 -> Search works
4. Add User Story 3 -> Categories work
5. Add User Story 4 -> Preferences integration
6. Add User Story 5 -> Conflict detection
7. Polish -> Accessibility, documentation

---

## Requirement Mapping

| Requirement | Task(s) | File(s) |
|-------------|---------|---------|
| FR-001 | T019 | useCanvasKeyboard.ts |
| FR-002 | T020 | useCanvasKeyboard.ts |
| FR-003 | T017 | ShortcutsPanel.tsx |
| FR-004 | T024 | ShortcutSearch.tsx |
| FR-005 | T017, T032 | ShortcutsPanel.tsx |
| FR-006 | T019, T020 | useCanvasKeyboard.ts |
| FR-007 | T008, T027 | search.ts, ShortcutsPanel.tsx |
| FR-008 | T008, T027 | search.ts, ShortcutsPanel.tsx |
| FR-009 | T027 | ShortcutsPanel.tsx |
| FR-010 | T028 | ShortcutsPanel.tsx |
| FR-011 | T026 | ShortcutsPanel.tsx |
| FR-012 | T013, T014 | ShortcutItem.tsx |
| FR-013 | T013 | ShortcutItem.tsx |
| FR-014 | T015, T032 | ShortcutCategory.tsx |
| FR-015 | T027 | ShortcutsPanel.tsx |
| FR-016 | T004, T032 | registry.ts |
| FR-017 | T015, T031 | ShortcutCategory.tsx |
| FR-017a | T012, T017 | shortcutsPanelStore.ts |
| FR-018 | T005 | registry.ts |
| FR-019 | T001 | shortcuts.ts |
| FR-020 | T006, T042 | platform.ts, ShortcutItem.tsx |
| FR-021 | T009 | conflicts.ts |
| FR-022 | T009, T039 | conflicts.ts |
| FR-023 | T037 | ShortcutItem.tsx |
| FR-024 | T034 | KeyboardShortcutsSection.tsx |
| FR-025 | T035 | KeyboardShortcutsSection.tsx |
| FR-026 | T041 | ShortcutsPanel.tsx |
| FR-027 | T013 | ShortcutItem.tsx |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are NOT included by default - add if requested
- Verify each phase works before proceeding to next
- **IMPORTANT**: Always complete "Phase Final: Git Verification" before marking feature complete
