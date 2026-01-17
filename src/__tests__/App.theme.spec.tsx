/**
 * App Theme Integration Tests
 *
 * Tests theme initialization and mode change effects in App.tsx.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@solidjs/testing-library';

// Mock theme service - must be before App import
const mockInitializeTheme = vi.fn();
const mockUpdateTheme = vi.fn();
const mockSubscribeToSystemThemeChanges = vi.fn().mockReturnValue(vi.fn());

vi.mock('../domain/theme', () => ({
  initializeTheme: () => mockInitializeTheme(),
  updateTheme: () => mockUpdateTheme(),
  subscribeToSystemThemeChanges: (_cb: () => void) => mockSubscribeToSystemThemeChanges(),
}));

// Mock stores to avoid side effects
vi.mock('../stores/preferencesStore', () => ({
  initializePreferences: vi.fn(),
  openPreferences: vi.fn(),
  preferencesStore: {
    preferences: {
      theme: { mode: 'light' },
    },
  },
}));

vi.mock('../stores/documentStore', () => ({
  documentStore: {
    parseState: 'idle',
    isDirty: false,
  },
  loadFile: vi.fn(),
  createNewDocument: vi.fn(),
  getTemplate: vi.fn(),
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

vi.mock('../stores/projectStore', () => ({
  initializeProjectStore: vi.fn().mockResolvedValue(undefined),
  projectStore: {
    isProjectListOpen: false,
    isSessionOnly: false,
    currentProject: null,
    pendingFile: null,
  },
  listProjects: vi.fn().mockResolvedValue([]),
  scheduleDocumentSave: vi.fn(),
  closeProjectList: vi.fn(),
  openProject: vi.fn(),
  deleteProject: vi.fn(),
  renameProject: vi.fn(),
  createProject: vi.fn(),
}));

vi.mock('../stores/historyStore', () => ({
  undo: vi.fn(),
  redo: vi.fn(),
}));

vi.mock('../stores/canvasStore', () => ({
  fitToView: vi.fn(),
}));

vi.mock('../stores/viewModeStore', () => ({
  toggleViewMode: vi.fn(),
}));

vi.mock('../stores/appContainerStore', () => ({
  setAppContainer: vi.fn(),
}));

vi.mock('../services/indexedDB/database', () => ({
  closeDatabase: vi.fn(),
}));

// Mock domain utilities
vi.mock('../domain/project/legacyStorage', () => ({
  cleanupLegacyStorage: vi.fn(),
}));

vi.mock('../domain/shortcuts', () => ({
  detectConflicts: vi.fn(),
}));

vi.mock('../domain/search/shortcuts', () => ({
  handleSearchShortcut: vi.fn(),
}));

vi.mock('../domain/rulers', () => ({
  RULER_THICKNESS: 20,
}));

vi.mock('../domain/createNew/documentFactory', () => ({
  createDocument: vi.fn(),
}));

// Mock all heavy components
vi.mock('../components/UploadZone/UploadZone', () => ({
  UploadZone: () => null,
}));

vi.mock('../components/Canvas', () => ({
  Canvas: () => null,
  Legend: () => null,
}));

vi.mock('../components/Canvas/Rulers', () => ({
  RulerContainer: (props: { children: unknown }) => props.children,
}));

vi.mock('../components/ConfirmDialog', () => ({
  ConfirmDialog: () => null,
}));

vi.mock('../components/CreateNewDialog', () => ({
  CreateNewDialog: () => null,
}));

vi.mock('../components/FindPanel', () => ({
  FindPanel: () => null,
}));

vi.mock('../components/OrphanWarningDialog', () => ({
  OrphanWarningDialog: () => null,
}));

vi.mock('../components/ProjectList', () => ({
  ProjectList: () => null,
}));

vi.mock('../components/TemplatesPanel', () => ({
  TemplatesPanel: () => null,
}));

vi.mock('../components/HierarchyPanel', () => ({
  HierarchyPanel: () => null,
}));

vi.mock('../components/ColorsPanel', () => ({
  ColorsPanel: () => null,
}));

vi.mock('../components/FontsPanel', () => ({
  FontsPanel: () => null,
}));

vi.mock('../components/BitmapsPanel', () => ({
  BitmapsPanel: () => null,
}));

vi.mock('../components/GradientsPanel', () => ({
  GradientsPanel: () => null,
}));

vi.mock('../components/ControlTagsPanel', () => ({
  ControlTagsPanel: () => null,
}));

vi.mock('../components/VariablesPanel', () => ({
  VariablesPanel: () => null,
}));

vi.mock('../components/ViewPalette', () => ({
  ViewPalette: () => null,
}));

vi.mock('../components/PropertiesPanel', () => ({
  PropertiesPanel: () => null,
}));

vi.mock('../components/MainToolbar', () => ({
  MainToolbar: () => null,
}));

vi.mock('../components/StorageWarning', () => ({
  StorageWarning: () => null,
}));

vi.mock('../components/PreferencesPanel', () => ({
  PreferencesPanel: () => null,
}));

// Now import App after all mocks are set up
import App from '../App';

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
  });

  it('calls initializeTheme on mount', () => {
    render(() => <App />);
    expect(mockInitializeTheme).toHaveBeenCalled();
  });
});
