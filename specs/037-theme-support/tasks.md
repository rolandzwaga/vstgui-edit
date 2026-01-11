# Tasks: Theme Support

**Input**: Design documents from `/specs/037-theme-support/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Testing Guide**: Every task involving unit/component tests MUST include a sub-task to verify `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests. This ensures SolidJS-specific patterns (microtask flushing, testInRoot, etc.) are followed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create theme domain module structure and foundational types

- [ ] T001 Create theme domain directory structure at `src/domain/theme/`
- [ ] T002 [P] Create EffectiveTheme type definition in `src/domain/theme/types.ts`
- [ ] T003 [P] Create barrel export in `src/domain/theme/index.ts`
- [ ] T004 **Commit**: Stage and commit Phase 1 setup changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Theme service implementation with pure functions and DOM interaction - BLOCKS all user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T006 [P] Write unit tests for `getEffectiveTheme()` pure function in `src/domain/theme/__tests__/themeService.spec.ts`
- [ ] T007 [P] Write unit tests for `isSystemDarkMode()` function with matchMedia mock in `src/domain/theme/__tests__/themeService.spec.ts`
- [ ] T008 [P] Write unit tests for `applyTheme()` DOM function in `src/domain/theme/__tests__/themeService.spec.ts`
- [ ] T009 [P] Write unit tests for `subscribeToSystemThemeChanges()` with cleanup verification in `src/domain/theme/__tests__/themeService.spec.ts`
- [ ] T010 [P] Write integration tests for `updateTheme()` with preferencesStore mock in `src/domain/theme/__tests__/themeService.spec.ts`
- [ ] T011 Implement `getEffectiveTheme(mode, systemPrefersDark)` pure function in `src/domain/theme/themeService.ts`
- [ ] T012 Implement `isSystemDarkMode()` using matchMedia API in `src/domain/theme/themeService.ts`
- [ ] T013 Implement `applyTheme(theme)` setting data-theme attribute in `src/domain/theme/themeService.ts`
- [ ] T014 Implement `subscribeToSystemThemeChanges(callback)` with cleanup return in `src/domain/theme/themeService.ts`
- [ ] T015 Implement `updateTheme()` integrating with preferencesStore in `src/domain/theme/themeService.ts`
- [ ] T016 Implement `initializeTheme()` one-time initialization in `src/domain/theme/themeService.ts`
- [ ] T017 Update barrel export to include all functions in `src/domain/theme/index.ts`
- [ ] T018 Run tests to verify all foundational tests pass
- [ ] T018a [P] Write integration tests for App.tsx theme initialization and mode change effects in `src/__tests__/App.theme.spec.tsx` (verify initializeTheme called, createEffect watches mode, updateTheme triggers on change)
- [ ] T019 **Commit**: Stage and commit Phase 2 foundational theme service

**Checkpoint**: Theme service ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Select a Theme Mode (Priority: P1)

**Goal**: Users can select Light, Dark, or System theme and see immediate visual change

**Independent Test**: Open preferences, select "Dark" theme, verify UI colors change to dark mode values

### Implementation for User Story 1

- [ ] T020 [US1] Add FOIT prevention inline script to `index.html` inside `<head>` before `</head>`
- [ ] T021 [US1] Add dark theme CSS custom property overrides in `src/styles/tokens.css` with `[data-theme="dark"]` selector
- [ ] T022 [US1] Override semantic colors (background, surface, text-primary, text-secondary, text-muted, border, border-focus) in `src/styles/tokens.css`
- [ ] T023 [US1] Override upload zone colors (idle, dragging, success, error backgrounds and borders) in `src/styles/tokens.css`
- [ ] T024 [US1] Override canvas colors (background, template-bounds, grid-minor, grid-major) in `src/styles/tokens.css`
- [ ] T025 [US1] Override selection and hover colors in `src/styles/tokens.css`
- [ ] T026 [US1] Override tooltip colors (inverted for dark theme) in `src/styles/tokens.css`
- [ ] T027 [US1] Override panel and item colors in `src/styles/tokens.css`
- [ ] T028 [US1] Override ruler colors in `src/styles/tokens.css`
- [ ] T029 [US1] Override shadow tokens with increased opacity in `src/styles/tokens.css`
- [ ] T030 [US1] Override primary color adjustments in `src/styles/tokens.css`
- [ ] T031 [US1] Remove `@media (prefers-color-scheme: dark)` block from `src/styles/tokens.css` (replaced by data-theme selector)
- [ ] T032 [US1] Import theme service in `src/App.tsx`
- [ ] T033 [US1] Add `initializeTheme()` call after `initializePreferences()` in `src/App.tsx`
- [ ] T034 [US1] Add createEffect watching `preferencesStore.preferences.theme.mode` calling `updateTheme()` in `src/App.tsx`
- [ ] T035 [US1] Verify theme switches instantly when selecting Light/Dark in preferences
- [ ] T036 [US1] **Commit**: Stage and commit User Story 1 - theme selection

**Checkpoint**: User Story 1 complete - users can select and immediately see Light/Dark themes

---

## Phase 4: User Story 2 - System Theme Following (Priority: P2)

**Goal**: System mode automatically follows OS theme preference with real-time updates

**Independent Test**: Select "System" mode, change OS appearance settings, verify editor theme updates accordingly

### Implementation for User Story 2

- [ ] T037 [US2] Add createEffect for OS theme change listener when mode is 'system' in `src/App.tsx`
- [ ] T038 [US2] Add onCleanup to remove OS theme change listener in `src/App.tsx`
- [ ] T039 [US2] Write integration test for OS theme change detection in `src/domain/theme/__tests__/themeService.spec.ts`
- [ ] T040 [US2] Verify FOIT prevention script handles 'system' mode with matchMedia check in `index.html`
- [ ] T041 [US2] Test that theme updates within 100ms of OS theme change
- [ ] T042 [US2] **Commit**: Stage and commit User Story 2 - system theme following

**Checkpoint**: User Story 2 complete - System mode follows OS preference with real-time updates

---

## Phase 5: User Story 3 - Consistent Theme Across All Components (Priority: P3)

**Goal**: Theme applies consistently to all UI areas (toolbar, panels, dialogs, canvas)

**Independent Test**: Switch to dark theme, visually inspect all major UI areas for consistent dark styling

### Implementation for User Story 3

- [ ] T043 [US3] Audit all CSS module files for any hardcoded colors not using CSS custom properties (use: `grep -rn "color:" src/components --include="*.css" | grep -v "var(--"` to find violations)
- [ ] T044 [US3] Fix any hardcoded colors found to use appropriate CSS custom property variables
- [ ] T045 [US3] Remove stub note paragraph from `src/components/PreferencesPanel/sections/ThemeSection.tsx`
- [ ] T046 [US3] Remove `.stubNote` CSS class from `src/components/PreferencesPanel/sections/sections.module.css`
- [ ] T047 [US3] Update ThemeSection component documentation comment to reflect full implementation
- [ ] T048 [US3] Verify toolbar displays with dark theme styling
- [ ] T049 [US3] Verify Preferences panel displays with dark theme styling
- [ ] T050 [US3] Verify hierarchy panel displays with dark theme styling
- [ ] T051 [US3] Verify properties panel displays with dark theme styling
- [ ] T052 [US3] Verify canvas area displays with dark theme styling
- [ ] T053 [US3] Verify all confirmation dialogs display with dark theme styling
- [ ] T054 [US3] **Commit**: Stage and commit User Story 3 - consistent theme across components

**Checkpoint**: All user stories complete - theme applies consistently across entire UI

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, WCAG compliance verification, and cleanup

- [ ] T055 [P] Verify all text meets WCAG AA contrast (4.5:1) in dark theme
- [ ] T056 [P] Verify focus indicators are visible in dark theme
- [ ] T057 [P] Verify no flash of incorrect theme (FOIT) on fresh page load with each mode
- [ ] T058 [P] Verify theme transition is instant with no flicker
- [ ] T059 [P] Test localStorage unavailability fallback (private browsing mode)
- [ ] T059a [P] Test SC-002: Verify theme preference persists across simulated browser sessions (save theme, clear memory state, reload preferences, verify theme restored)
- [ ] T060 Update CLAUDE.md with new theme domain module documentation
- [ ] T061 Run quickstart.md validation - test all documented patterns work
- [ ] T062 **Commit**: Stage and commit Polish phase changes

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
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 (builds on theme infrastructure)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (requires theme CSS to be in place)
- **Polish (Phase 6)**: Depends on all user stories being complete
- **Quality Gates**: Depends on Polish phase completion
- **Git Verification**: Depends on Quality Gates passing

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Core theme selection
- **User Story 2 (P2)**: Requires US1 infrastructure - adds OS preference following
- **User Story 3 (P3)**: Requires US1 CSS - ensures consistent application across all components

### Within Each Phase

- **Phase 2 (Foundational)**: Tests (T006-T010) can run in parallel, then implementation (T011-T016) sequential
- **Phase 3 (US1)**: index.html (T020), tokens.css (T021-T031), App.tsx (T032-T034) - mostly sequential
- **Phase 4 (US2)**: App.tsx effects (T037-T038) depend on US1 completion
- **Phase 5 (US3)**: Audit (T043-T044), UI cleanup (T045-T047), verification (T048-T053) - mostly parallel

### Parallel Opportunities

Within Phase 2 (Foundational):
```
# Run all test tasks in parallel:
T006: Unit tests for getEffectiveTheme()
T007: Unit tests for isSystemDarkMode()
T008: Unit tests for applyTheme()
T009: Unit tests for subscribeToSystemThemeChanges()
T010: Integration tests for updateTheme()
```

Within Phase 3 (US1) - CSS overrides can run in parallel:
```
# Run CSS override tasks in parallel:
T022-T031: Different color category overrides in tokens.css
```

Within Phase 6 (Polish):
```
# Run verification tasks in parallel:
T055: WCAG contrast verification
T056: Focus indicator verification
T057: FOIT verification
T058: Transition verification
T059: localStorage fallback testing
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types and directory structure)
2. Complete Phase 2: Foundational (theme service with tests)
3. Complete Phase 3: User Story 1 (Light/Dark selection works)
4. **STOP and VALIDATE**: Test theme selection independently
5. Users can now select Light or Dark theme

### Incremental Delivery

1. Setup + Foundational -> Theme service ready
2. User Story 1 -> Manual Light/Dark selection works (MVP!)
3. User Story 2 -> System mode follows OS preference
4. User Story 3 -> Theme applies consistently everywhere
5. Each story adds value without breaking previous stories

### Key Files Modified

| File | Purpose |
|------|---------|
| `src/domain/theme/types.ts` | NEW: EffectiveTheme type |
| `src/domain/theme/themeService.ts` | NEW: Theme service functions |
| `src/domain/theme/__tests__/themeService.spec.ts` | NEW: Theme service tests |
| `src/domain/theme/index.ts` | NEW: Barrel export |
| `index.html` | MODIFY: Add FOIT prevention script |
| `src/styles/tokens.css` | MODIFY: Add [data-theme="dark"] overrides |
| `src/App.tsx` | MODIFY: Initialize theme and add effects |
| `src/components/PreferencesPanel/sections/ThemeSection.tsx` | MODIFY: Remove stub note |
| `src/components/PreferencesPanel/sections/sections.module.css` | MODIFY: Remove .stubNote class |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests (SolidJS-specific patterns)
- Verify tests fail before implementing (T006-T010 should fail initially)
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- No new npm dependencies required - uses native browser APIs (matchMedia, localStorage, CSS custom properties)
