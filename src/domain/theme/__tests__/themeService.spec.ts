/**
 * Theme Service Tests
 *
 * Unit and integration tests for theme service functions.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Define mock function type
type MockMatchMedia = ReturnType<typeof vi.fn> & {
  matches: boolean;
  media: string;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  onchange: null;
  dispatchEvent: ReturnType<typeof vi.fn>;
};

// Create a proper matchMedia mock
function createMatchMediaMock(matches: boolean): MockMatchMedia {
  const mock = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  })) as MockMatchMedia;
  mock.matches = matches;
  mock.media = '(prefers-color-scheme: dark)';
  mock.addEventListener = vi.fn();
  mock.removeEventListener = vi.fn();
  mock.addListener = vi.fn();
  mock.removeListener = vi.fn();
  mock.onchange = null;
  mock.dispatchEvent = vi.fn();
  return mock;
}

describe('getEffectiveTheme', () => {
  let getEffectiveTheme: typeof import('../themeService').getEffectiveTheme;

  beforeEach(async () => {
    const module = await import('../themeService');
    getEffectiveTheme = module.getEffectiveTheme;
  });

  it('returns light when mode is light regardless of system preference', () => {
    expect(getEffectiveTheme('light', true)).toBe('light');
    expect(getEffectiveTheme('light', false)).toBe('light');
  });

  it('returns dark when mode is dark regardless of system preference', () => {
    expect(getEffectiveTheme('dark', true)).toBe('dark');
    expect(getEffectiveTheme('dark', false)).toBe('dark');
  });

  it('returns dark when mode is system and system prefers dark', () => {
    expect(getEffectiveTheme('system', true)).toBe('dark');
  });

  it('returns light when mode is system and system prefers light', () => {
    expect(getEffectiveTheme('system', false)).toBe('light');
  });
});

describe('isSystemDarkMode', () => {
  let isSystemDarkMode: typeof import('../themeService').isSystemDarkMode;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(async () => {
    originalMatchMedia = window.matchMedia;
    const module = await import('../themeService');
    isSystemDarkMode = module.isSystemDarkMode;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns true when system prefers dark mode', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }));

    expect(isSystemDarkMode()).toBe(true);
  });

  it('returns false when system prefers light mode', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }));

    expect(isSystemDarkMode()).toBe(false);
  });

  it('returns false when matchMedia is not available', () => {
    // @ts-expect-error Testing matchMedia unavailability
    window.matchMedia = undefined;

    expect(isSystemDarkMode()).toBe(false);
  });
});

describe('applyTheme', () => {
  let applyTheme: typeof import('../themeService').applyTheme;

  beforeEach(async () => {
    document.documentElement.removeAttribute('data-theme');
    const module = await import('../themeService');
    applyTheme = module.applyTheme;
  });

  afterEach(() => {
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

  it('overwrites existing data-theme attribute', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

describe('subscribeToSystemThemeChanges', () => {
  let subscribeToSystemThemeChanges: typeof import('../themeService').subscribeToSystemThemeChanges;
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(async () => {
    originalMatchMedia = window.matchMedia;
    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }));

    const module = await import('../themeService');
    subscribeToSystemThemeChanges = module.subscribeToSystemThemeChanges;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('adds event listener for change events', () => {
    const callback = vi.fn();
    subscribeToSystemThemeChanges(callback);

    expect(mockAddEventListener).toHaveBeenCalledWith('change', callback);
  });

  it('returns cleanup function that removes listener', () => {
    const callback = vi.fn();
    const cleanup = subscribeToSystemThemeChanges(callback);

    expect(typeof cleanup).toBe('function');

    cleanup();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', callback);
  });

  it('does not throw when matchMedia is unavailable', () => {
    // @ts-expect-error Testing matchMedia unavailability
    window.matchMedia = undefined;

    const callback = vi.fn();
    const cleanup = subscribeToSystemThemeChanges(callback);

    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
  });
});

describe('updateTheme', () => {
  let updateTheme: typeof import('../themeService').updateTheme;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(async () => {
    originalMatchMedia = window.matchMedia;
    document.documentElement.removeAttribute('data-theme');

    // Mock matchMedia to return light mode
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }));

    // Reset the module to pick up fresh store state
    vi.resetModules();
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    window.matchMedia = originalMatchMedia;
    vi.resetModules();
  });

  it('applies theme based on preferencesStore mode', async () => {
    // Reset and reimport stores with default state
    const { resetPreferencesStore, initializePreferences } = await import(
      '../../../stores/preferencesStore'
    );
    resetPreferencesStore();
    initializePreferences();

    const module = await import('../themeService');
    updateTheme = module.updateTheme;

    // Default is 'system', matchMedia returns light
    updateTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('applies dark theme when mode is dark', async () => {
    const {
      resetPreferencesStore,
      initializePreferences,
      setThemeModePreference,
    } = await import('../../../stores/preferencesStore');
    resetPreferencesStore();
    initializePreferences();
    setThemeModePreference('dark');

    const module = await import('../themeService');
    updateTheme = module.updateTheme;

    updateTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('applies light theme when mode is light', async () => {
    const {
      resetPreferencesStore,
      initializePreferences,
      setThemeModePreference,
    } = await import('../../../stores/preferencesStore');
    resetPreferencesStore();
    initializePreferences();
    setThemeModePreference('light');

    const module = await import('../themeService');
    updateTheme = module.updateTheme;

    updateTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('applies dark theme when mode is system and OS prefers dark', async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }));

    const {
      resetPreferencesStore,
      initializePreferences,
      setThemeModePreference,
    } = await import('../../../stores/preferencesStore');
    resetPreferencesStore();
    initializePreferences();
    setThemeModePreference('system');

    const module = await import('../themeService');
    updateTheme = module.updateTheme;

    updateTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

describe('initializeTheme', () => {
  let initializeTheme: typeof import('../themeService').initializeTheme;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(async () => {
    originalMatchMedia = window.matchMedia;
    document.documentElement.removeAttribute('data-theme');

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }));

    vi.resetModules();
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    window.matchMedia = originalMatchMedia;
    vi.resetModules();
  });

  it('applies theme on initialization', async () => {
    const { resetPreferencesStore, initializePreferences } = await import(
      '../../../stores/preferencesStore'
    );
    resetPreferencesStore();
    initializePreferences();

    const module = await import('../themeService');
    initializeTheme = module.initializeTheme;

    initializeTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('applies dark theme if preference is dark', async () => {
    const {
      resetPreferencesStore,
      initializePreferences,
      setThemeModePreference,
    } = await import('../../../stores/preferencesStore');
    resetPreferencesStore();
    initializePreferences();
    setThemeModePreference('dark');

    const module = await import('../themeService');
    initializeTheme = module.initializeTheme;

    initializeTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
