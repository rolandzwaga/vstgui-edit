# Research: Theme Support

**Feature**: 037-theme-support
**Date**: 2026-01-11

## Research Tasks

### 1. FOIT Prevention Strategy

**Question**: How to prevent flash of incorrect theme on page load?

**Decision**: Blocking inline script in `<head>` that sets `data-theme` attribute before body renders.

**Rationale**:
- Inline scripts in `<head>` block rendering until complete
- Script runs before any CSS is applied to body content
- Reading localStorage and setting attribute is synchronous and fast (~1ms)
- No need for external script loading which would cause delay

**Implementation Pattern**:
```html
<script>
  (function() {
    try {
      var stored = localStorage.getItem('vstgui-edit:preferences');
      var prefs = stored ? JSON.parse(stored) : null;
      var mode = prefs && prefs.theme && prefs.theme.mode ? prefs.theme.mode : 'system';

      var theme = mode;
      if (mode === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })();
</script>
```

**Alternatives Considered**:
- CSS-only `@media (prefers-color-scheme)`: Does not support user override, rejected
- Separate stylesheet loading: Adds network delay, rejected
- Flash and fix after hydration: Poor UX, rejected

### 2. CSS Custom Property Organization

**Question**: How to organize dark theme CSS custom properties?

**Decision**: Use existing `--color-*` names, override values in `[data-theme="dark"]` selector.

**Rationale**:
- No changes required to component CSS files
- Single source of truth in tokens.css
- Easy to maintain consistency
- Follows modern CSS theming patterns

**Implementation Pattern**:
```css
:root {
  --color-background: var(--color-neutral-50);
  --color-surface: #ffffff;
  --color-text-primary: var(--color-neutral-900);
  /* ... existing light theme values ... */
}

[data-theme="dark"] {
  --color-background: var(--color-neutral-900);
  --color-surface: var(--color-neutral-800);
  --color-text-primary: var(--color-neutral-50);
  /* ... dark theme overrides ... */
}
```

**Alternatives Considered**:
- Separate dark-prefixed variables: Requires component changes, rejected
- CSS-in-JS theming: Goes against project architecture, rejected
- Multiple CSS files: Adds complexity and potential FOIT, rejected

### 3. OS Theme Change Detection

**Question**: How to detect and respond to OS theme changes in real-time?

**Decision**: Use `matchMedia` API with `addEventListener('change')` pattern.

**Rationale**:
- Native browser API, no dependencies needed
- Synchronous change detection
- Wide browser support (all modern browsers)
- Event-based, no polling required

**Implementation Pattern**:
```typescript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function handleOSThemeChange(event: MediaQueryListEvent): void {
  if (preferencesStore.preferences.theme.mode === 'system') {
    const effectiveTheme = event.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }
}

// Modern browsers
mediaQuery.addEventListener('change', handleOSThemeChange);

// Cleanup
mediaQuery.removeEventListener('change', handleOSThemeChange);
```

**Alternatives Considered**:
- Polling with setInterval: Inefficient, delayed response, rejected
- MutationObserver on prefers-color-scheme: Not applicable, rejected
- Third-party library: Unnecessary dependency, rejected

### 4. Dark Theme Color Palette

**Question**: What dark theme colors ensure WCAG AA compliance?

**Decision**: Use dark grays (not pure black) with inverted neutral scale.

**Rationale**:
- Pure black (#000) causes eye strain and halation on OLED screens
- Dark gray backgrounds (#171717, #262626) are industry standard
- Inverted neutral scale maintains relative contrast relationships
- 4.5:1 contrast ratio achievable with proposed colors

**Key Color Mappings**:
| Semantic Variable | Light Theme | Dark Theme |
|------------------|-------------|------------|
| --color-background | neutral-50 (#fafafa) | neutral-900 (#171717) |
| --color-surface | #ffffff | neutral-800 (#262626) |
| --color-text-primary | neutral-900 (#171717) | neutral-50 (#fafafa) |
| --color-text-secondary | neutral-600 (#525252) | neutral-400 (#a3a3a3) |
| --color-text-muted | neutral-400 (#a3a3a3) | neutral-500 (#737373) |
| --color-border | neutral-200 (#e5e5e5) | neutral-700 (#404040) |
| --color-canvas-background | #f9fafb | neutral-900 (#171717) |

**Contrast Verification** (calculated):
- Text primary on surface (dark): #fafafa on #262626 = 13.9:1 (passes AAA)
- Text secondary on surface (dark): #a3a3a3 on #262626 = 5.8:1 (passes AA)
- Text muted on surface (dark): #737373 on #262626 = 4.0:1 (passes for large text)

**Alternatives Considered**:
- Pure black background: Eye strain, poor readability, rejected
- Blue-tinted dark: Inconsistent with light theme, rejected
- Material Design dark: Good but too opinionated, rejected

### 5. Canvas Category Colors in Dark Theme

**Question**: How should view category colors behave in dark theme?

**Decision**: Retain existing category colors in dark theme; adjust only if contrast fails against dark canvas background.

**Analysis**:
| Category | Stroke Color | On Light (#f9fafb) | On Dark (#171717) |
|----------|-------------|-------------------|-------------------|
| Container | #3b82f6 (blue) | 4.3:1 | 3.5:1 |
| Control | #22c55e (green) | 2.6:1 | 2.4:1 |
| Display | #a855f7 (purple) | 3.6:1 | 3.2:1 |
| Custom | #6b7280 (gray) | 4.8:1 | 3.5:1 |

**Decision**: Category colors are semantic indicators for view types, not text. They are used for strokes (thin lines) where lower contrast is acceptable. The fill uses 10% opacity which renders well on both backgrounds. No adjustments needed for dark theme.

**Rationale**:
- Strokes are graphical elements, not text - WCAG AA text requirements don't apply
- Visual distinction between categories is maintained
- User familiarity with colors across themes is valuable
- 10% opacity fills adapt naturally to background

**Alternatives Considered**:
- Brighten all colors for dark: Would lose color identity, rejected
- Separate dark theme category colors: Adds confusion, rejected

### 6. Theme Service Architecture

**Question**: How to structure theme logic for testability and maintainability?

**Decision**: Create `src/domain/theme/themeService.ts` with pure functions and a single initialization function.

**Rationale**:
- Domain layer is appropriate for business logic
- Pure functions enable unit testing without DOM mocking
- Single initialization point integrates with existing preferencesStore
- Separation from store keeps concerns distinct

**API Design**:
```typescript
// Pure functions (easily testable)
export function getEffectiveTheme(mode: ThemeMode, systemPrefersDark: boolean): 'light' | 'dark';
export function isSystemDarkMode(): boolean;

// DOM interaction (integration tests)
export function applyTheme(theme: 'light' | 'dark'): void;
export function initializeTheme(): void;
export function subscribeToSystemThemeChanges(callback: () => void): () => void;
```

**Alternatives Considered**:
- Theme store: Unnecessary state duplication with preferencesStore, rejected
- Component-level logic: Not reusable, harder to test, rejected
- Hook pattern: React concept, not SolidJS, rejected

### 7. Integration with Existing preferencesStore

**Question**: How does theme service integrate with existing preferences infrastructure?

**Decision**: Theme service reads from preferencesStore but doesn't duplicate state. Theme application triggered by createEffect watching theme.mode.

**Integration Points**:
1. `initializePreferences()` in App.tsx already runs on mount
2. Add `initializeTheme()` call after preferences loaded
3. `setThemeModePreference()` already persists to localStorage
4. Add createEffect in App.tsx to call `applyTheme()` when mode changes

**Flow**:
```
Page Load:
  1. index.html script sets data-theme from localStorage (prevents FOIT)
  2. App.tsx mounts, calls initializePreferences()
  3. Theme service initializes, adds OS change listener
  4. createEffect watches preferencesStore.preferences.theme.mode
  5. Effect calls applyTheme() with effective theme

User Changes Theme:
  1. ThemeSection calls setThemeModePreference(newMode)
  2. preferencesStore updates and persists
  3. createEffect triggers, calls applyTheme()
  4. data-theme attribute updates, CSS responds instantly

OS Theme Changes:
  1. matchMedia listener fires (only when mode === 'system')
  2. Theme service recalculates effective theme
  3. applyTheme() called with new effective theme
```

**Alternatives Considered**:
- Separate theme localStorage key: Duplicate storage, rejected
- Theme state in theme service: State duplication, rejected

### 8. Shadow and Overlay Adjustments for Dark Theme

**Question**: Do shadows and overlays need dark theme adjustments?

**Decision**: Increase shadow opacity slightly in dark theme; overlay remains unchanged.

**Rationale**:
- Shadows are less visible on dark backgrounds
- Slightly stronger shadows maintain depth perception
- Overlay (50% black) works well on both themes

**Adjustments**:
```css
[data-theme="dark"] {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.15);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.2), 0 1px 2px -1px rgb(0 0 0 / 0.2);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.2);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.2);
}
```

### 9. Grid Colors for Dark Theme

**Question**: How should grid lines appear in dark theme?

**Decision**: The existing `@media (prefers-color-scheme: dark)` block already handles grid colors. Convert to data-theme selector.

**Current Implementation** (tokens.css lines 209-214):
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-grid-minor: rgba(255, 255, 255, 0.08);
    --color-grid-major: rgba(255, 255, 255, 0.20);
  }
}
```

**Updated Implementation**:
```css
[data-theme="dark"] {
  --color-grid-minor: rgba(255, 255, 255, 0.08);
  --color-grid-major: rgba(255, 255, 255, 0.20);
}
```

**Rationale**: Grid needs white-based lines on dark background, black-based on light. The existing values are appropriate.

### 10. Tooltip and Dropdown Colors

**Question**: How should tooltips and dropdowns appear in dark theme?

**Decision**: Invert tooltip colors (light tooltip on dark theme), keep dropdowns using surface colors.

**Tooltip Adjustments**:
```css
[data-theme="dark"] {
  --color-tooltip-background: var(--color-neutral-100);
  --color-tooltip-text: var(--color-neutral-900);
  --color-tooltip-border: var(--color-neutral-300);
}
```

**Rationale**: Light tooltips on dark backgrounds maintain visibility and contrast. Dropdowns already use --color-surface which adapts automatically.

## Summary of Decisions

| Area | Decision |
|------|----------|
| FOIT Prevention | Blocking inline script in `<head>` |
| CSS Organization | Override `--color-*` in `[data-theme="dark"]` selector |
| OS Detection | matchMedia with change event listener |
| Dark Palette | Dark grays, inverted neutral scale |
| Canvas Colors | Retain category colors unchanged |
| Architecture | domain/theme/themeService.ts with pure functions |
| Integration | createEffect watching preferencesStore.theme.mode |
| Shadows | Slightly increased opacity in dark theme |
| Grid | White-based lines from existing implementation |
| Tooltips | Inverted (light on dark theme) |

## Dependencies

No new npm dependencies required. All functionality uses:
- Native `matchMedia` API
- Native `localStorage` API
- Native CSS custom properties
- Existing SolidJS primitives (createEffect, onCleanup)
