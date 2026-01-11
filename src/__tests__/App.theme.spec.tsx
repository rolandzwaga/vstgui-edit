/**
 * App Theme Integration Tests
 *
 * Tests theme initialization and mode change effects in App.tsx.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@solidjs/testing-library';

// Mock theme service
const mockInitializeTheme = vi.fn();
const mockUpdateTheme = vi.fn();
const mockSubscribeToSystemThemeChanges = vi.fn().mockReturnValue(vi.fn());

vi.mock('../domain/theme', () => ({
  initializeTheme: () => mockInitializeTheme(),
  updateTheme: () => mockUpdateTheme(),
  subscribeToSystemThemeChanges: (_cb: () => void) => mockSubscribeToSystemThemeChanges(),
}));

// Mock stores to avoid side effects
vi.mock('../stores/preferencesStore', async () => {
  const actual = await vi.importActual<
    typeof import('../stores/preferencesStore')
  >('../stores/preferencesStore');
  return {
    ...actual,
    initializePreferences: vi.fn(),
    preferencesStore: {
      preferences: {
        theme: { mode: 'light' },
      },
    },
  };
});

vi.mock('../stores/documentStore', () => ({
  documentStore: {
    parseState: 'idle',
    isDirty: false,
  },
}));

vi.mock('../stores/searchStore', () => ({
  searchStore: {
    isOpen: false,
  },
}));

vi.mock('../stores/templateStore', () => ({
  templateStore: {
    activeTemplateId: null,
  },
}));

describe('App theme integration', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    originalMatchMedia = window.matchMedia;
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
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    cleanup();
    window.matchMedia = originalMatchMedia;
    vi.resetModules();
  });

  it('calls initializeTheme on mount', async () => {
    const { default: App } = await import('../App');
    render(() => <App />);

    expect(mockInitializeTheme).toHaveBeenCalled();
  });

  it('theme service functions are exported from domain module', async () => {
    // This validates the contract is fulfilled
    const themeModule = await vi.importActual<typeof import('../domain/theme')>(
      '../domain/theme'
    );

    expect(typeof themeModule.initializeTheme).toBe('function');
    expect(typeof themeModule.updateTheme).toBe('function');
    expect(typeof themeModule.subscribeToSystemThemeChanges).toBe('function');
    expect(typeof themeModule.getEffectiveTheme).toBe('function');
    expect(typeof themeModule.isSystemDarkMode).toBe('function');
    expect(typeof themeModule.applyTheme).toBe('function');
  });
});
