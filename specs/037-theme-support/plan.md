# Implementation Plan: Theme Support

**Branch**: `037-theme-support` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/037-theme-support/spec.md`

## Summary

Implement theme switching functionality that applies light or dark themes based on user selection in preferences, supports a System option that follows OS preference via `prefers-color-scheme`, uses CSS custom properties for all themeable colors, persists theme preference to localStorage, and applies theme immediately when changed. Theme is applied via a `data-theme` attribute on the document root element, with a blocking inline script in `<head>` to prevent flash of incorrect theme (FOIT).

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode), SolidJS 1.9.10
**Primary Dependencies**: SolidJS stores (createStore), CSS custom properties, matchMedia API
**Storage**: localStorage via existing preferencesStore
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: SolidJS SPA with Vite build system
**Performance Goals**: Theme switch < 1 second, OS theme change response < 100ms
**Constraints**: No FOIT on page load, WCAG AA contrast (4.5:1), no dialog-specific overrides
**Scale/Scope**: ~80 CSS module files with ~40 unique semantic color variables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Phase 0)

| Gate | Status | Notes |
|------|--------|-------|
| SolidJS Only (XII) | PASS | Using createEffect for matchMedia listener, no React patterns |
| Static Imports Only (XXI) | PASS | No dynamic imports required |
| Test-First (I) | PASS | Tests written before implementation per workflow |
| CSS Modules (XV) | PASS | Extending tokens.css with `[data-theme="dark"]` selector |
| No Unauthorized Dependencies (XI) | PASS | No new dependencies required - using native matchMedia API |
| Security (III) | PASS | No sensitive data, localStorage preference is non-sensitive |
| Accessibility (IX) | PASS | WCAG AA contrast ratios enforced in dark theme |

### Post-Design Check (Phase 1)

| Gate | Status | Notes |
|------|--------|-------|
| SolidJS Only (XII) | PASS | Design uses createEffect, onCleanup - pure SolidJS patterns |
| Static Imports Only (XXI) | PASS | All imports static, no lazy loading |
| Test-First (I) | PASS | Testing strategy defined, tests before implementation |
| CSS Modules (XV) | PASS | tokens.css extended, no component CSS changes needed |
| No Unauthorized Dependencies (XI) | PASS | Only native APIs (matchMedia, localStorage, DOM) |
| Security (III) | PASS | Inline script in index.html is safe (no user input, no eval) |
| Accessibility (IX) | PASS | Contrast ratios verified in data-model.md, all meet WCAG AA |
| Domain Knowledge (XIX) | PASS | Not uidesc-related, existing preferences infrastructure reused |
| Technical Overview (XX) | PASS | Consulted CLAUDE.md, existing preferencesStore reused |
| Zero Failing Tests (XVIII) | PASS | Testing strategy covers all new code |
| Quality Gates (XXIII) | PASS | All three gates (lint:css, check, typecheck) in DoD |

## Project Structure

### Documentation (this feature)

```text
specs/037-theme-support/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (minimal - no API endpoints)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── theme/                    # NEW: Theme domain logic
│       ├── themeService.ts       # Theme application and OS detection
│       ├── themeService.spec.ts  # Tests for theme service
│       └── index.ts              # Barrel export
├── stores/
│   └── preferencesStore.ts       # EXISTING: Already has setThemeModePreference
├── styles/
│   └── tokens.css                # EXISTING: Add [data-theme="dark"] overrides
├── components/
│   └── PreferencesPanel/
│       └── sections/
│           └── ThemeSection.tsx  # EXISTING: Remove stub note
└── index.tsx                     # EXISTING: Initialize theme on mount

index.html                        # MODIFY: Add blocking theme script in <head>
```

**Structure Decision**: Minimal new files - theme logic in `src/domain/theme/themeService.ts`, CSS overrides in existing `tokens.css`, HTML script in existing `index.html`. The existing preferencesStore already handles theme.mode persistence.

## Complexity Tracking

No constitution violations requiring justification.

## Implementation Phases

### Phase 1: Theme Service Core

Create the theme domain module with pure functions and DOM interaction.

**Files**:
- `src/domain/theme/themeService.ts` - Core logic
- `src/domain/theme/__tests__/themeService.spec.ts` - Unit tests
- `src/domain/theme/index.ts` - Barrel export

**Functions**:
1. `getEffectiveTheme(mode, systemPrefersDark)` - Pure function to resolve effective theme
2. `isSystemDarkMode()` - Check OS preference via matchMedia
3. `applyTheme(theme)` - Set data-theme attribute on document
4. `subscribeToSystemThemeChanges(callback)` - OS change listener
5. `updateTheme()` - Update theme based on current preferences
6. `initializeTheme()` - One-time initialization

### Phase 2: Dark Theme CSS

Add dark theme color overrides to tokens.css.

**File**: `src/styles/tokens.css`

**Changes**:
1. Add `[data-theme="dark"]` selector block after `:root`
2. Override all semantic color variables
3. Update grid colors (move from @media to [data-theme])
4. Adjust shadow opacities
5. Invert tooltip colors

**Color Categories**:
- Semantic colors (background, surface, text, border)
- Upload zone states
- Canvas colors (background, template bounds)
- Selection and hover colors
- Tooltip colors
- Panel and item colors
- Ruler colors
- Shadow tokens
- Primary color adjustments

### Phase 3: FOIT Prevention

Add blocking inline script to index.html.

**File**: `index.html`

**Script Location**: Inside `<head>`, before `</head>`

**Script Logic**:
1. Read preferences from localStorage
2. Extract theme.mode (default: 'system')
3. If mode is 'system', check matchMedia
4. Set data-theme attribute on documentElement
5. Fallback to 'light' on any error

### Phase 4: App Integration

Integrate theme service with App component.

**File**: `src/App.tsx`

**Changes**:
1. Import theme service functions
2. Call `initializeTheme()` after `initializePreferences()`
3. Add createEffect to watch `preferencesStore.preferences.theme.mode`
4. Add createEffect for OS change listener (when mode is 'system')
5. Proper cleanup with onCleanup

### Phase 5: UI Cleanup

Remove stub note from ThemeSection.

**File**: `src/components/PreferencesPanel/sections/ThemeSection.tsx`

**Changes**:
1. Remove the stub note paragraph
2. Update component documentation comment

**File**: `src/components/PreferencesPanel/sections/sections.module.css`

**Changes**:
1. Remove `.stubNote` CSS class (no longer needed)

## Testing Strategy

### Unit Tests (Pure Functions)

| Function | Test Cases |
|----------|------------|
| `getEffectiveTheme` | light mode returns light, dark mode returns dark, system mode follows OS |
| Input validation | Invalid modes handled gracefully |

### Integration Tests (DOM Functions)

| Function | Test Cases |
|----------|------------|
| `applyTheme` | Sets data-theme attribute correctly |
| `isSystemDarkMode` | Returns correct value based on matchMedia mock |
| `subscribeToSystemThemeChanges` | Callback invoked on change, cleanup works |
| `updateTheme` | Integrates with preferencesStore correctly |

### Component Tests

| Component | Test Cases |
|-----------|------------|
| `ThemeSection` | Mode selection triggers preference change, no stub note |
| `App` | Theme initialized on mount, responds to mode changes |

### Visual Verification

Manual testing required for:
- All UI components render correctly in dark theme
- No FOIT on page load (fresh load with each mode)
- Theme transition is instant (no flicker)
- WCAG AA contrast verification

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing color overrides | Audit all CSS files for hardcoded colors |
| FOIT on slow devices | Script is minimal and synchronous |
| localStorage unavailable | Fallback to light theme |
| matchMedia unsupported | Fallback to light theme for 'system' mode |
| Contrast failures | Pre-calculated contrast ratios in data-model.md |

## Definition of Done

- [ ] All tests pass (unit, integration, component)
- [ ] Dark theme CSS complete with all variables
- [ ] FOIT prevention script in index.html
- [ ] App integration complete with effects
- [ ] Stub note removed from ThemeSection
- [ ] Quality gates pass (lint:css, check, typecheck)
- [ ] Manual visual verification in both themes
- [ ] CLAUDE.md updated with new domain module
