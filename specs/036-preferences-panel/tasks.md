# Tasks: Preferences Panel

**Input**: Design documents from `/specs/036-preferences-panel/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Test-first approach - write tests before implementation as specified.

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Tests co-located with source files (`*.spec.ts`, `*.spec.tsx`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and foundational types

- [ ] T001 Create directory structure: `src/components/PreferencesPanel/`, `src/components/PreferencesPanel/sections/`, `src/components/PreferencesPanel/controls/`, `src/components/PreferencesPanel/__tests__/`, `src/domain/preferences/`, `src/domain/preferences/__tests__/`
- [ ] T002 [P] Create preference types in `src/domain/preferences/types.ts` (UserPreferences, GridPreferences, SnapPreferences, SmartGuidesPreferences, CustomGuidesPreferences, ThemePreferences, UIPreferences, SavePreferences)
- [ ] T003 [P] Create UI types in `src/domain/preferences/types.ts` (PreferencesSection, KeyboardShortcut, ShortcutCategory, PreferencesState)
- [ ] T004 [P] Create validation types in `src/domain/preferences/types.ts` (PreferencesValidationResult, MigrationResult, LegacyKey)
- [ ] T005 [P] Create default values in `src/domain/preferences/defaults.ts` (DEFAULT_PREFERENCES constant)
- [ ] T006 [P] Create type re-exports in `src/types/preferences.ts`
- [ ] T007 **Commit**: Stage and commit Phase 1 changes with message "feat(preferences): add types and directory structure"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain logic and store that all UI components depend on

**CRITICAL**: No user story work can begin until this phase is complete

### Domain Layer Tests

- [ ] T008 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T009 [P] Write tests for validation in `src/domain/preferences/__tests__/validation.spec.ts` (validatePreferences with AJV, invalid data handling, partial data handling)
- [ ] T010 [P] Write tests for persistence in `src/domain/preferences/__tests__/persistence.spec.ts` (loadPreferences, savePreferences, localStorage unavailability with private browsing mode simulation, corruption handling with console.warn verification)
- [ ] T011 [P] Write tests for migration in `src/domain/preferences/__tests__/migration.spec.ts` (needsMigration, migratePreferences, legacy key deletion verification, partial migration, alignmentToolbarStore state round-trip persistence)
- [ ] T012 [P] Write tests for keyboard shortcuts in `src/domain/preferences/__tests__/keyboardShortcuts.spec.ts` (KEYBOARD_SHORTCUTS structure, 23 shortcuts across 5 categories)

### Domain Layer Implementation

- [ ] T013 [P] Create validation schema in `src/domain/preferences/schema.ts` (PREFERENCES_SCHEMA for AJV)
- [ ] T014 Implement validation in `src/domain/preferences/validation.ts` (validatePreferences using AJV) - depends on T013
- [ ] T015 Implement persistence in `src/domain/preferences/persistence.ts` (STORAGE_KEY, loadPreferences, savePreferences, mergeWithDefaults, isStorageAvailable) - depends on T014
- [ ] T016 Implement migration in `src/domain/preferences/migration.ts` (LEGACY_KEYS, needsMigration, migratePreferences with immediate key deletion, verify old keys removed after migration) - depends on T015
- [ ] T017 [P] Create keyboard shortcuts data in `src/domain/preferences/keyboardShortcuts.ts` (KEYBOARD_SHORTCUTS constant with 23 shortcuts in 5 categories)
- [ ] T018 [P] Create domain barrel export in `src/domain/preferences/index.ts`

### Store Tests

- [ ] T019 Write tests for preferencesStore in `src/stores/__tests__/preferencesStore.spec.ts` (initialization, preference setters, panel state, reset, auto-save effect, store sync)

### Store Implementation

- [ ] T020 Implement preferencesStore in `src/stores/preferencesStore.ts` (store state, panel actions, preference setters, initializePreferences, applyPreferencesToStores, resetToDefaults, auto-save effect) - depends on T016

- [ ] T021 **Commit**: Stage and commit Phase 2 changes with message "feat(preferences): add domain logic and store"

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - Access Preferences Panel (Priority: P1)

**Goal**: Open a preferences panel from the toolbar with organized sections and close via X/Escape/overlay click

**Independent Test**: Click preferences button in toolbar, verify panel opens with sidebar navigation and 6 sections, close via Escape/X/overlay

### Tests for User Story 1

- [ ] T022 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T023 [P] [US1] Write tests for SettingToggle in `src/components/PreferencesPanel/__tests__/SettingToggle.spec.tsx` (render with label, onChange callback, disabled state, description)
- [ ] T024 [P] [US1] Write tests for SettingSelect in `src/components/PreferencesPanel/__tests__/SettingSelect.spec.tsx` (render with options, onChange callback, keyboard navigation, floating-ui dropdown)
- [ ] T025 [P] [US1] Write tests for SettingSlider in `src/components/PreferencesPanel/__tests__/SettingSlider.spec.tsx` (render with value, onChange callback, min/max constraints, unit display)
- [ ] T026 [P] [US1] Write tests for PreferencesSidebar in `src/components/PreferencesPanel/__tests__/PreferencesSidebar.spec.tsx` (render 6 sections, active state, section change callback, keyboard navigation)
- [ ] T027 [P] [US1] Write tests for PreferencesPanel in `src/components/PreferencesPanel/__tests__/PreferencesPanel.spec.tsx` (modal open/close, Escape key, overlay click, X button, focus trap, ARIA attributes, responsive behavior on browser resize)

### Implementation for User Story 1

- [ ] T028 [P] [US1] Create control styles in `src/components/PreferencesPanel/controls/controls.module.css` (settingRow, settingLabel, settingDescription, toggle, select, slider)
- [ ] T029 [P] [US1] Implement SettingToggle in `src/components/PreferencesPanel/controls/SettingToggle.tsx`
- [ ] T030 [P] [US1] Implement SettingSelect in `src/components/PreferencesPanel/controls/SettingSelect.tsx` (uses @floating-ui/dom for dropdown positioning)
- [ ] T031 [P] [US1] Implement SettingSlider in `src/components/PreferencesPanel/controls/SettingSlider.tsx`
- [ ] T032 [US1] Create controls barrel export in `src/components/PreferencesPanel/controls/index.ts` - depends on T029, T030, T031
- [ ] T033 [P] [US1] Create sidebar styles in `src/components/PreferencesPanel/PreferencesSidebar.module.css` (sidebar, navItem, navItemActive, icon)
- [ ] T034 [US1] Implement PreferencesSidebar in `src/components/PreferencesPanel/PreferencesSidebar.tsx` (PREFERENCES_SECTIONS data, FontAwesome icons - verify free tier icon availability: faGrip, faMagnet, faAlignLeft, faRuler, faPalette, faKeyboard; use fallback solid icons if needed) - depends on T033
- [ ] T035 [P] [US1] Create panel styles in `src/components/PreferencesPanel/PreferencesPanel.module.css` (overlay, panel, header, content, main, footer, closeButton)
- [ ] T036 [US1] Implement PreferencesPanel shell in `src/components/PreferencesPanel/PreferencesPanel.tsx` (modal container, header with X button, sidebar integration, section switching, Escape/overlay close, focus management) - depends on T034, T035

### Toolbar Integration for User Story 1

- [ ] T037 [US1] Write tests for PreferencesButton in `src/components/MainToolbar/__tests__/PreferencesButton.spec.tsx` (render, click opens panel)
- [ ] T038 [US1] Implement PreferencesButton in `src/components/MainToolbar/PreferencesButton.tsx` (gear icon button)
- [ ] T039 [US1] Add PreferencesButton to MainToolbar in `src/components/MainToolbar/MainToolbar.tsx` (after AlignmentToolbar)
- [ ] T040 [US1] Add Ctrl+, keyboard shortcut handler in `src/routes/EditorPage.tsx` (add to existing handleKeyDown, only active when document loaded)

- [ ] T041 [US1] **Commit**: Stage and commit User Story 1 changes with message "feat(preferences): add panel access and shell"

**Checkpoint**: User Story 1 complete - panel opens/closes with sidebar navigation

---

## Phase 4: User Story 2 - Configure Grid Settings (Priority: P1)

**Goal**: Configure grid size, style, and default visibility with immediate application and persistence

**Independent Test**: Open preferences, change grid size/style/visibility, verify canvas updates immediately, close and reopen to verify persistence

### Tests for User Story 2

- [ ] T042 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T043 [P] [US2] Write tests for GridSection in `src/components/PreferencesPanel/__tests__/GridSection.spec.tsx` (size dropdown with presets, style dropdown, visibility toggle, onChange callbacks)

### Implementation for User Story 2

- [ ] T044 [P] [US2] Create section styles in `src/components/PreferencesPanel/sections/sections.module.css` (sectionHeading, sectionDescription, settingGroup)
- [ ] T045 [US2] Implement GridSection in `src/components/PreferencesPanel/sections/GridSection.tsx` (SettingSelect for size with [5,8,10,12,16,20], SettingSelect for style, SettingToggle for visibleByDefault) - depends on T032, T044
- [ ] T046 [US2] Wire GridSection to PreferencesPanel section rendering in `src/components/PreferencesPanel/PreferencesPanel.tsx`
- [ ] T047 [US2] Ensure gridStore updates are applied in `src/stores/preferencesStore.ts` applyPreferencesToStores (setGridSize, setGridStyle from gridStore)

- [ ] T048 [US2] **Commit**: Stage and commit User Story 2 changes with message "feat(preferences): add grid settings section"

**Checkpoint**: User Story 2 complete - grid settings configurable and persist

---

## Phase 5: User Story 3 - Configure Snap Settings (Priority: P1)

**Goal**: Configure snap-to-grid enabled state and threshold with immediate application

**Independent Test**: Open preferences, toggle snap enabled, adjust threshold slider, drag view to verify snapping matches threshold

### Tests for User Story 3

- [ ] T049 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T050 [P] [US3] Write tests for SnapSection in `src/components/PreferencesPanel/__tests__/SnapSection.spec.tsx` (enabled toggle, threshold slider 1-20, onChange callbacks)

### Implementation for User Story 3

- [ ] T051 [US3] Implement SnapSection in `src/components/PreferencesPanel/sections/SnapSection.tsx` (SettingToggle for enabledByDefault, SettingSlider for threshold 1-20 with "px" unit) - depends on T032, T044
- [ ] T052 [US3] Wire SnapSection to PreferencesPanel section rendering in `src/components/PreferencesPanel/PreferencesPanel.tsx`
- [ ] T053 [US3] Ensure snapThreshold updates are applied in `src/stores/preferencesStore.ts` applyPreferencesToStores (setSnapThreshold from gridStore)

- [ ] T054 [US3] **Commit**: Stage and commit User Story 3 changes with message "feat(preferences): add snap settings section"

**Checkpoint**: User Story 3 complete - snap settings configurable and persist

---

## Phase 6: User Story 4 - Configure Smart Guides Settings (Priority: P2)

**Goal**: Configure smart guides enabled by default setting

**Independent Test**: Open preferences, toggle smart guides default, reload, verify smart guides state matches preference

### Tests for User Story 4

- [ ] T055 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T056 [P] [US4] Write tests for SmartGuidesSection in `src/components/PreferencesPanel/__tests__/SmartGuidesSection.spec.tsx` (enabled toggle, onChange callback)

### Implementation for User Story 4

- [ ] T057 [US4] Implement SmartGuidesSection in `src/components/PreferencesPanel/sections/SmartGuidesSection.tsx` (SettingToggle for enabledByDefault) - depends on T032, T044
- [ ] T058 [US4] Wire SmartGuidesSection to PreferencesPanel section rendering in `src/components/PreferencesPanel/PreferencesPanel.tsx`
- [ ] T059 [US4] Update applyPreferencesToStores to set smartGuidesStore initial state in `src/stores/preferencesStore.ts`

- [ ] T060 [US4] **Commit**: Stage and commit User Story 4 changes with message "feat(preferences): add smart guides settings section"

**Checkpoint**: User Story 4 complete - smart guides default setting configurable

---

## Phase 7: User Story 5 - Configure Custom Guides Settings (Priority: P2)

**Goal**: Configure snap-to-custom-guides enabled by default setting

**Independent Test**: Open preferences, toggle snap-to-guides default, reload, verify custom guides snap state matches preference

### Tests for User Story 5

- [ ] T061 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T062 [P] [US5] Write tests for CustomGuidesSection in `src/components/PreferencesPanel/__tests__/CustomGuidesSection.spec.tsx` (snap toggle, onChange callback)

### Implementation for User Story 5

- [ ] T063 [US5] Implement CustomGuidesSection in `src/components/PreferencesPanel/sections/CustomGuidesSection.tsx` (SettingToggle for snapEnabledByDefault) - depends on T032, T044
- [ ] T064 [US5] Wire CustomGuidesSection to PreferencesPanel section rendering in `src/components/PreferencesPanel/PreferencesPanel.tsx`
- [ ] T065 [US5] Update applyPreferencesToStores to set guidesStore initial snap state in `src/stores/preferencesStore.ts`

- [ ] T066 [US5] **Commit**: Stage and commit User Story 5 changes with message "feat(preferences): add custom guides settings section"

**Checkpoint**: User Story 5 complete - custom guides snap default setting configurable

---

## Phase 8: User Story 6 - View Keyboard Shortcuts Reference (Priority: P2)

**Goal**: Display read-only keyboard shortcuts reference organized by category

**Independent Test**: Open preferences, navigate to Keyboard Shortcuts section, verify all 23 shortcuts displayed in 5 categories

### Tests for User Story 6

- [ ] T067 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T068 [P] [US6] Write tests for KeyboardShortcutsSection in `src/components/PreferencesPanel/__tests__/KeyboardShortcutsSection.spec.tsx` (render 5 categories, 23 shortcuts, read-only display, key/description format)

### Implementation for User Story 6

- [ ] T069 [P] [US6] Create shortcuts styles in `src/components/PreferencesPanel/sections/KeyboardShortcutsSection.module.css` (categoryGroup, categoryName, shortcutList, shortcutItem, keyCombo, description)
- [ ] T070 [US6] Implement KeyboardShortcutsSection in `src/components/PreferencesPanel/sections/KeyboardShortcutsSection.tsx` (render KEYBOARD_SHORTCUTS from domain, category groups with shortcut lists) - depends on T017, T069
- [ ] T071 [US6] Wire KeyboardShortcutsSection to PreferencesPanel section rendering in `src/components/PreferencesPanel/PreferencesPanel.tsx`

- [ ] T072 [US6] **Commit**: Stage and commit User Story 6 changes with message "feat(preferences): add keyboard shortcuts reference"

**Checkpoint**: User Story 6 complete - keyboard shortcuts reference viewable

---

## Phase 9: User Story 7 - Configure Theme Preference (Priority: P3)

**Goal**: Select theme preference (Light/Dark/System) with persistence (theme application stubbed)

**Independent Test**: Open preferences, select each theme option, verify selection persists on reload

### Tests for User Story 7

- [ ] T073 [US7] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T074 [P] [US7] Write tests for ThemeSection in `src/components/PreferencesPanel/__tests__/ThemeSection.spec.tsx` (theme dropdown with light/dark/system, onChange callback, stubbed note)

### Implementation for User Story 7

- [ ] T075 [US7] Implement ThemeSection in `src/components/PreferencesPanel/sections/ThemeSection.tsx` (SettingSelect for mode with light/dark/system options, note about stubbed implementation) - depends on T032, T044
- [ ] T076 [US7] Wire ThemeSection to PreferencesPanel section rendering in `src/components/PreferencesPanel/PreferencesPanel.tsx`

- [ ] T077 [US7] **Commit**: Stage and commit User Story 7 changes with message "feat(preferences): add theme settings section (stubbed)"

**Checkpoint**: User Story 7 complete - theme preference selectable and persisted

---

## Phase 10: User Story 8 - Reset All Preferences (Priority: P2)

**Goal**: Reset all preferences to factory defaults with confirmation dialog

**Independent Test**: Modify multiple settings, click Reset to Defaults, confirm in dialog, verify all settings return to defaults

### Tests for User Story 8

- [ ] T078 [US8] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T079 [P] [US8] Write tests for ResetConfirmDialog in `src/components/PreferencesPanel/__tests__/ResetConfirmDialog.spec.tsx` (render, confirm callback, cancel callback, Escape key, focus management)

### Implementation for User Story 8

- [ ] T080 [P] [US8] Create reset dialog styles in `src/components/PreferencesPanel/ResetConfirmDialog.module.css` (dialog structure following FormatChangeDialog pattern)
- [ ] T081 [US8] Implement ResetConfirmDialog in `src/components/PreferencesPanel/ResetConfirmDialog.tsx` (confirmation message, Confirm/Cancel buttons, Escape key handling) - depends on T080
- [ ] T082 [US8] Add reset button to PreferencesPanel footer in `src/components/PreferencesPanel/PreferencesPanel.tsx`, integrate ResetConfirmDialog
- [ ] T083 [US8] Implement resetToDefaults in preferencesStore (clear localStorage, reset state, apply to stores, close dialog) in `src/stores/preferencesStore.ts`

- [ ] T084 [US8] **Commit**: Stage and commit User Story 8 changes with message "feat(preferences): add reset to defaults functionality"

**Checkpoint**: User Story 8 complete - reset to defaults works with confirmation

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Finalize integration, app initialization, barrel exports, and documentation

- [ ] T085 [P] Create sections barrel export in `src/components/PreferencesPanel/sections/index.ts`
- [ ] T086 [P] Create PreferencesPanel barrel export in `src/components/PreferencesPanel/index.ts`
- [ ] T087 Add initializePreferences() call in app initialization (App.tsx or EditorPage.tsx on mount)
- [ ] T088 Apply visibleByDefault and enabledByDefault preferences on document load (integrate with document loading flow)
- [ ] T089 Write integration test in `src/components/PreferencesPanel/__tests__/PreferencesPanel.integration.spec.tsx` (full flow: open, modify settings, verify persistence, migration, verify canvas updates immediately when preferences change - test gridStore/snapThreshold reactive updates)
- [ ] T090 Update CLAUDE.md with preferencesStore documentation (exports, usage patterns)
- [ ] T091 Update CLAUDE.md with domain/preferences utilities documentation
- [ ] T092 Update CLAUDE.md Recent Changes table with 036-preferences-panel entry
- [ ] T093 **Commit**: Stage and commit Polish phase changes with message "feat(preferences): finalize integration and documentation"

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

**NO EXCEPTIONS**: The spec is NOT complete until all quality gates pass.

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with an appropriate message
- [ ] TFINAL **Confirm Clean**: Verify working tree is clean (nothing to commit)

**CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - US1 (Panel Access): Can start after Foundational
  - US2 (Grid): Depends on US1 (needs panel shell and controls)
  - US3 (Snap): Depends on US1 (needs panel shell and controls)
  - US4 (Smart Guides): Depends on US1
  - US5 (Custom Guides): Depends on US1
  - US6 (Shortcuts): Depends on US1
  - US7 (Theme): Depends on US1
  - US8 (Reset): Depends on US1
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

| User Story | Depends On | Can Parallel With |
|------------|------------|-------------------|
| US1 (Panel Access) | Phase 2 | - |
| US2 (Grid Settings) | US1 | US3, US4, US5, US6, US7, US8 |
| US3 (Snap Settings) | US1 | US2, US4, US5, US6, US7, US8 |
| US4 (Smart Guides) | US1 | US2, US3, US5, US6, US7, US8 |
| US5 (Custom Guides) | US1 | US2, US3, US4, US6, US7, US8 |
| US6 (Shortcuts) | US1 | US2, US3, US4, US5, US7, US8 |
| US7 (Theme) | US1 | US2, US3, US4, US5, US6, US8 |
| US8 (Reset) | US1 | US2, US3, US4, US5, US6, US7 |

### Within Each User Story

- **Verify Testing Guide first** - Read `specs/TESTING-GUIDE.md` before any test task
- Tests MUST be written and FAIL before implementation
- Styles before components
- Components before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1** (all parallel):
- T002, T003, T004, T005, T006

**Phase 2** (domain tests parallel, store after domain):
- T009, T010, T011, T012 (parallel)
- T013, T017, T018 (parallel after tests)

**User Stories 2-8** (all parallel after US1):
- Once US1 complete, all other stories can proceed in parallel

---

## Parallel Example: Phase 2 Domain Tests

```bash
# Launch all domain tests together:
Task: "Write tests for validation in src/domain/preferences/__tests__/validation.spec.ts"
Task: "Write tests for persistence in src/domain/preferences/__tests__/persistence.spec.ts"
Task: "Write tests for migration in src/domain/preferences/__tests__/migration.spec.ts"
Task: "Write tests for keyboard shortcuts in src/domain/preferences/__tests__/keyboardShortcuts.spec.ts"
```

## Parallel Example: User Stories 2-8

```bash
# After US1 complete, launch all section implementations:
Task: "Implement GridSection in src/components/PreferencesPanel/sections/GridSection.tsx"
Task: "Implement SnapSection in src/components/PreferencesPanel/sections/SnapSection.tsx"
Task: "Implement SmartGuidesSection in src/components/PreferencesPanel/sections/SmartGuidesSection.tsx"
Task: "Implement CustomGuidesSection in src/components/PreferencesPanel/sections/CustomGuidesSection.tsx"
Task: "Implement ThemeSection in src/components/PreferencesPanel/sections/ThemeSection.tsx"
Task: "Implement KeyboardShortcutsSection in src/components/PreferencesPanel/sections/KeyboardShortcutsSection.tsx"
Task: "Implement ResetConfirmDialog in src/components/PreferencesPanel/ResetConfirmDialog.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Panel Access)
4. Complete Phase 4: User Story 2 (Grid Settings)
5. Complete Phase 5: User Story 3 (Snap Settings)
6. **STOP and VALIDATE**: Test panel opens, grid/snap settings work
7. Deploy/demo if ready - core functionality complete

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Panel accessible (MVP foundation!)
3. Add User Stories 2+3 -> Core settings work -> Deploy/Demo (MVP!)
4. Add User Stories 4+5 -> All guide settings -> Deploy/Demo
5. Add User Story 6 -> Shortcuts reference -> Deploy/Demo
6. Add User Stories 7+8 -> Theme + Reset -> Deploy/Demo (Complete!)
7. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests (SolidJS-specific patterns)
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- Modal uses CSS centering (like FormatChangeDialog), not floating-ui for container
- SettingSelect uses @floating-ui/dom for dropdown positioning (like EnumEditor)
- Migration deletes legacy keys immediately after successful migration
- Theme application is stubbed - only persistence implemented
