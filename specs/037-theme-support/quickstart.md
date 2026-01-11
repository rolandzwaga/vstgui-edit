# Quickstart: Theme Support

**Feature**: 037-theme-support
**Date**: 2026-01-11

## Quick Reference

### Files to Modify

| File | Change |
|------|--------|
| `index.html` | Add blocking theme script in `<head>` |
| `src/styles/tokens.css` | Add `[data-theme="dark"]` selector with dark theme values |
| `src/App.tsx` | Add theme initialization and change effect |
| `src/components/PreferencesPanel/sections/ThemeSection.tsx` | Remove stub note |

### Files to Create

| File | Purpose |
|------|---------|
| `src/domain/theme/themeService.ts` | Theme application logic |
| `src/domain/theme/__tests__/themeService.spec.ts` | Unit tests |
| `src/domain/theme/index.ts` | Barrel export |

## Implementation Order

1. **Create theme service** (pure functions first, then DOM functions)
2. **Add dark theme CSS** (tokens.css `[data-theme="dark"]` selector)
3. **Add FOIT prevention script** (index.html `<head>`)
4. **Integrate with App** (initialization and change effect)
5. **Remove stub note** (ThemeSection.tsx)

## Key Patterns

### Theme Service Structure

```typescript
// src/domain/theme/themeService.ts
import { preferencesStore } from '../../stores/preferencesStore';
import type { ThemeMode } from '../preferences/types';

export type EffectiveTheme = 'light' | 'dark';

// Pure function - easy to test
export function getEffectiveTheme(
  mode: ThemeMode,
  systemPrefersDark: boolean
): EffectiveTheme {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return systemPrefersDark ? 'dark' : 'light';
}

// OS detection
export function isSystemDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// DOM manipulation
export function applyTheme(theme: EffectiveTheme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

// Subscribe to OS changes
export function subscribeToSystemThemeChanges(callback: () => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

// Main update function
export function updateTheme(): void {
  const mode = preferencesStore.preferences.theme.mode;
  const effectiveTheme = getEffectiveTheme(mode, isSystemDarkMode());
  applyTheme(effectiveTheme);
}

// Initialization
export function initializeTheme(): void {
  updateTheme();
}
```

### FOIT Prevention Script

```html
<!-- index.html, inside <head>, before </head> -->
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

### App Integration

```typescript
// src/App.tsx
import { createEffect, onCleanup } from 'solid-js';
import { preferencesStore } from './stores/preferencesStore';
import {
  initializeTheme,
  updateTheme,
  subscribeToSystemThemeChanges
} from './domain/theme';

export default function App() {
  // Existing initialization
  initializePreferences();

  // Theme initialization
  initializeTheme();

  // React to theme mode changes
  createEffect(() => {
    // Access reactive property to track changes
    const _mode = preferencesStore.preferences.theme.mode;
    updateTheme();
  });

  // Listen for OS theme changes when in system mode
  createEffect(() => {
    if (preferencesStore.preferences.theme.mode === 'system') {
      const unsubscribe = subscribeToSystemThemeChanges(() => {
        updateTheme();
      });
      onCleanup(unsubscribe);
    }
  });

  // ... rest of component
}
```

### Dark Theme CSS Pattern

```css
/* src/styles/tokens.css - Add after :root block */
[data-theme="dark"] {
  /* Semantic Colors */
  --color-background: var(--color-neutral-900);
  --color-surface: var(--color-neutral-800);
  --color-text-primary: var(--color-neutral-50);
  --color-text-secondary: var(--color-neutral-400);
  --color-text-muted: var(--color-neutral-500);
  --color-border: var(--color-neutral-700);
  --color-border-focus: var(--color-primary-400);

  /* Primary Colors */
  --color-primary: var(--color-primary-400);
  --color-primary-hover: var(--color-primary-300);
  --color-primary-light: var(--color-primary-900);

  /* ... additional overrides ... */
}
```

## Testing Patterns

### Unit Tests (Pure Functions)

```typescript
// src/domain/theme/__tests__/themeService.spec.ts
import { describe, it, expect } from 'vitest';
import { getEffectiveTheme } from '../themeService';

describe('getEffectiveTheme', () => {
  it('returns light when mode is light', () => {
    expect(getEffectiveTheme('light', true)).toBe('light');
    expect(getEffectiveTheme('light', false)).toBe('light');
  });

  it('returns dark when mode is dark', () => {
    expect(getEffectiveTheme('dark', true)).toBe('dark');
    expect(getEffectiveTheme('dark', false)).toBe('dark');
  });

  it('follows system preference when mode is system', () => {
    expect(getEffectiveTheme('system', true)).toBe('dark');
    expect(getEffectiveTheme('system', false)).toBe('light');
  });
});
```

### Integration Tests (DOM Functions)

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { applyTheme, isSystemDarkMode } from '../themeService';

describe('applyTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('sets data-theme attribute to light', () => {
    applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('sets data-theme attribute to dark', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

describe('isSystemDarkMode', () => {
  it('returns true when system prefers dark', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    expect(isSystemDarkMode()).toBe(true);
  });
});
```

## Keyboard Shortcuts

No new keyboard shortcuts for theme switching. Users access theme settings via:
- Preferences panel (Ctrl+, or Cmd+,)
- Theme section in preferences sidebar

## Accessibility Checklist

- [ ] All text meets WCAG AA contrast (4.5:1) in dark theme
- [ ] Focus indicators visible in dark theme
- [ ] No reliance on color alone for information
- [ ] Theme toggle is keyboard accessible (existing select component)

## Common Pitfalls

1. **Don't use `@media (prefers-color-scheme)` for user override** - Use `[data-theme]` selector
2. **Don't forget to handle 'system' mode** - Must check OS preference when mode is 'system'
3. **Don't use pure black (#000)** - Use dark gray (#171717) for less eye strain
4. **Don't skip the FOIT script** - Must be in index.html, not in JavaScript bundle
5. **Don't duplicate state** - Read from preferencesStore, don't create separate theme state
