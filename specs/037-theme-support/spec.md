# Feature Specification: Theme Support

**Feature Branch**: `037-theme-support`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Implement actual theme switching functionality that applies light or dark theme based on user selection in preferences, supports System option that follows OS preference, uses CSS custom properties for all themeable colors, persists theme preference, and applies theme immediately when changed."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select a Theme Mode (Priority: P1)

A user wants to choose their preferred visual theme for the editor. They open the Preferences panel, navigate to the Theme section, and select their desired theme mode (Light, Dark, or System). The editor immediately updates its appearance to reflect the selected theme.

**Why this priority**: This is the core functionality - without the ability to select and apply a theme, no other theme features can work. It delivers immediate user value by enabling visual customization.

**Independent Test**: Can be fully tested by opening preferences, selecting "Dark" theme, and verifying the UI colors change to dark mode values. Delivers visual customization value as a standalone feature.

**Acceptance Scenarios**:

1. **Given** the editor is open with the default theme, **When** the user opens Preferences and selects "Dark" theme, **Then** the entire UI immediately updates to use dark mode colors (dark backgrounds, light text).

2. **Given** the editor is displaying dark theme, **When** the user selects "Light" theme, **Then** the entire UI immediately updates to use light mode colors (light backgrounds, dark text).

3. **Given** the user selects a theme, **When** they close and reopen the application, **Then** the selected theme is restored on launch.

---

### User Story 2 - System Theme Following (Priority: P2)

A user wants the editor to match their operating system's theme preference. They select "System" mode, and the editor automatically switches between light and dark themes based on the OS setting.

**Why this priority**: Follows modern UI conventions and respects user's system-wide preferences. Builds on P1's theme infrastructure but adds automatic switching.

**Independent Test**: Can be tested by selecting "System" mode in preferences, then changing OS appearance settings and verifying the editor theme updates accordingly.

**Acceptance Scenarios**:

1. **Given** the user has selected "System" theme mode, **When** the OS is set to dark mode, **Then** the editor displays in dark theme.

2. **Given** the user has selected "System" theme mode, **When** the OS is set to light mode, **Then** the editor displays in light theme.

3. **Given** the editor is running with "System" mode selected, **When** the user changes their OS theme preference, **Then** the editor immediately updates to match the new OS setting without requiring a refresh.

---

### User Story 3 - Consistent Theme Across All Components (Priority: P3)

A user expects the selected theme to apply consistently across all parts of the editor interface, including panels, toolbars, dialogs, and the canvas area.

**Why this priority**: Ensures visual consistency. Builds on P1/P2 by extending theme coverage to all UI elements.

**Independent Test**: Can be tested by switching to dark theme and visually inspecting all major UI areas (toolbar, sidebar panels, preferences dialog, canvas) to verify consistent dark styling.

**Acceptance Scenarios**:

1. **Given** the user has selected dark theme, **When** they view the main toolbar, **Then** it displays with dark theme styling.

2. **Given** the user has selected dark theme, **When** they open the Preferences panel, **Then** the dialog displays with dark theme styling including proper contrast.

3. **Given** the user has selected dark theme, **When** they view the hierarchy, properties, and other side panels, **Then** all panels display with consistent dark theme styling.

---

### Edge Cases

- What happens when localStorage is unavailable? The editor defaults to light theme as the ultimate fallback.
- What happens when the OS does not support `prefers-color-scheme`? The editor falls back to light theme when system mode is selected.
- How does the theme affect canvas view colors? Canvas category colors (container, control, display, custom) retain their existing values in dark theme; individual colors are adjusted only if they fail WCAG AA contrast (4.5:1 minimum ratio) against the dark canvas background (#1e1e1e).
- What happens during theme transition? Theme changes are applied instantly with no visible flicker or delay.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a complete light theme color palette defined as CSS custom properties on `:root`
- **FR-002**: System MUST provide a complete dark theme color palette with appropriate contrast ratios for readability
- **FR-003**: System MUST apply theme based on the stored preference in `preferencesStore.preferences.theme.mode`
- **FR-004**: System MUST support three theme modes: 'light', 'dark', and 'system'
- **FR-005**: When 'system' mode is selected, system MUST detect OS theme preference using `matchMedia('(prefers-color-scheme: dark)')`
- **FR-006**: When 'system' mode is selected, system MUST listen for OS theme changes and update immediately
- **FR-007**: Theme changes MUST be applied immediately without page reload (live preview)
- **FR-008**: System MUST apply theme on application startup using a blocking inline script in `<head>` that reads localStorage and sets `data-theme` attribute before body renders, preventing any flash of incorrect theme
- **FR-009**: Theme MUST be applied to all existing UI components (toolbars, panels, dialogs, canvas elements)
- **FR-010**: The "stub note" in ThemeSection.tsx MUST be removed once theme is fully implemented
- **FR-011**: System MUST apply theme by setting a data attribute (e.g., `data-theme="dark"`) on the document root element
- **FR-012**: Dark theme color values MUST provide WCAG 2.1 AA compliant contrast ratios (4.5:1 for normal text)

### Key Entities

- **Theme Mode**: The user's selected preference ('light', 'dark', or 'system') - already defined as `ThemeMode` type
- **Effective Theme**: The actual theme being displayed ('light' or 'dark'), derived from mode and OS preference when in 'system' mode
- **Theme Color Variables**: The set of CSS custom properties that define colors for both light and dark themes

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between light and dark themes in under 1 second (instant visual feedback)
- **SC-002**: Theme selection persists across browser sessions 100% of the time when localStorage is available
- **SC-003**: System mode correctly reflects OS preference changes within 100ms of OS theme change
- **SC-004**: 100% of existing UI components (toolbar, panels, dialogs, canvas) display correctly in both themes
- **SC-005**: All text elements maintain WCAG AA readable contrast (4.5:1 ratio) in both themes
- **SC-006**: No visible flash or flicker occurs when theme is applied on page load

## Clarifications

### Session 2026-01-11

- Q: FOIT (Flash of Incorrect Theme) Prevention Strategy - How should the theme be applied on initial page load to prevent a flash of the wrong theme before JavaScript initializes? → A: Blocking inline script in `<head>` that reads localStorage and sets `data-theme` attribute before body renders
- Q: Canvas View Category Colors - How should the canvas view category colors (container, control, display, custom) behave in dark theme? → A: Adjust category colors only if contrast fails on dark background
- Q: Dialog Components Styling Scope - Should dialogs (Preferences, confirmation dialogs) require dialog-specific theme overrides, or inherit from existing CSS custom properties? → A: Dialogs inherit from existing CSS custom properties on :root (no dialog-specific changes)
- Q: localStorage Unavailability Handling - How should the theme system behave when localStorage is unavailable (private browsing, storage quota exceeded)? → A: Default to light theme as the ultimate fallback
- Q: CSS Custom Property Naming Convention - How should dark theme CSS custom properties be organized relative to existing light theme properties? → A: Use existing `--color-*` names, override values in `[data-theme="dark"]` selector

## Assumptions

- The existing `preferencesStore` infrastructure handles persistence correctly (verified via existing tests)
- All existing components use CSS custom properties from `tokens.css` rather than hardcoded colors
- The `matchMedia` API is available in all target browsers (modern Chrome, Firefox, Safari, Edge)
- The current light theme colors in `tokens.css` are acceptable as the base light theme palette

## Reusable Functionality

The following existing functionality can be reused:

1. **preferencesStore** (`src/stores/preferencesStore.ts`):
   - `preferencesStore.preferences.theme.mode` - already stores the theme preference
   - `setThemeModePreference()` - already persists theme changes to localStorage
   - `initializePreferences()` - can be extended to call theme initialization

2. **ThemeSection** (`src/components/PreferencesPanel/sections/ThemeSection.tsx`):
   - Complete UI for theme selection already implemented
   - Already calls `setThemeModePreference()` on selection change

3. **tokens.css** (`src/styles/tokens.css`):
   - All semantic color variables already defined (--color-background, --color-surface, --color-text-primary, etc.)
   - Dark theme implemented by overriding existing `--color-*` property values in `[data-theme="dark"]` selector (no new property names needed)

4. **preferences types** (`src/domain/preferences/types.ts`):
   - `ThemeMode` type already defined as 'light' | 'dark' | 'system'
   - `ThemePreferences` interface already defined

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status     | Evidence                                          |
|-------------|------------|---------------------------------------------------|
| FR-001      | PENDING    | [Light theme variables in tokens.css]             |
| FR-002      | PENDING    | [Dark theme variables in tokens.css]              |
| FR-003      | PENDING    | [Theme service reads from preferencesStore]       |
| FR-004      | PENDING    | [Theme mode handling in service]                  |
| FR-005      | PENDING    | [matchMedia usage in theme service]               |
| FR-006      | PENDING    | [matchMedia change listener in theme service]     |
| FR-007      | PENDING    | [Live theme switching test]                       |
| FR-008      | PENDING    | [initializeTheme call on app startup]             |
| FR-009      | PENDING    | [Visual verification of all components]           |
| FR-010      | PENDING    | [ThemeSection.tsx stub note removed]              |
| FR-011      | PENDING    | [data-theme attribute on documentElement]         |
| FR-012      | PENDING    | [Contrast ratio verification]                     |
| SC-001      | PENDING    | [Theme switch timing test]                        |
| SC-002      | PENDING    | [Persistence test across sessions]                |
| SC-003      | PENDING    | [OS theme change response timing]                 |
| SC-004      | PENDING    | [Component coverage verification]                 |
| SC-005      | PENDING    | [Contrast ratio measurements]                     |
| SC-006      | PENDING    | [No flash on page load test]                      |

**CRITICAL**: Any NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [ ] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with MET status
- [ ] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [ ] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [ ] **Quality Gate - CSS**: Run `npm run lint:css` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Code**: Run `npm run check` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Types**: Run `npm run typecheck` - MUST pass with zero errors/warnings
- [ ] **Git Status Check**: Run `git status` to verify all changes are committed
- [ ] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [ ] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [ ] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**CRITICAL**: The feature is NOT complete until:
1. All quality gates pass (lint:css, check, typecheck) with zero errors/warnings
2. All work is committed to the feature branch
3. The compliance table shows all requirements MET
