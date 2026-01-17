import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { UploadZone } from './components/UploadZone/UploadZone';
import { Canvas, Legend } from './components/Canvas';
import { RulerContainer } from './components/Canvas/Rulers';
import { FindPanel } from './components/FindPanel';
import { TemplatesPanel } from './components/TemplatesPanel';
import { HierarchyPanel } from './components/HierarchyPanel';
import { ColorsPanel } from './components/ColorsPanel';
import { FontsPanel } from './components/FontsPanel';
import { BitmapsPanel } from './components/BitmapsPanel';
import { GradientsPanel } from './components/GradientsPanel';
import { ControlTagsPanel } from './components/ControlTagsPanel';
import { VariablesPanel } from './components/VariablesPanel';
import { ViewPalette } from './components/ViewPalette';
import { PropertiesPanel } from './components/PropertiesPanel';
import { MainToolbar } from './components/MainToolbar';
import { StorageWarning } from './components/StorageWarning';

import { cleanupLegacyStorage } from './domain/project/legacyStorage';
import { handleSearchShortcut } from './domain/search/shortcuts';
import { detectConflicts } from './domain/shortcuts';
import {
  initializeTheme,
  updateTheme,
  subscribeToSystemThemeChanges,
} from './domain/theme';
import { RULER_THICKNESS } from './domain/rulers';
import { documentStore, getTemplate } from './stores/documentStore';
import { undo, redo } from './stores/historyStore';
import { setAppContainer } from './stores/appContainerStore';
import { openPreferences, initializePreferences, preferencesStore } from './stores/preferencesStore';
import { PreferencesPanel } from './components/PreferencesPanel';
import { searchStore } from './stores/searchStore';
import { templateStore } from './stores/templateStore';
import { fitToView } from './stores/canvasStore';
import { toggleViewMode } from './stores/viewModeStore';
import { initializeProjectStore, projectStore } from './stores/projectStore';
import { closeDatabase } from './services/indexedDB/database';
import './styles/tokens.css';

// Storage quota check interval (5 minutes)
const QUOTA_CHECK_INTERVAL = 5 * 60 * 1000;

export default function App() {
  // Track if storage warning has been dismissed
  const [storageWarningDismissed, setStorageWarningDismissed] = createSignal(false);

  // Clean up legacy localStorage keys from before project-based storage
  cleanupLegacyStorage();

  // Initialize preferences from localStorage on mount
  initializePreferences();

  // Initialize theme after preferences are loaded
  initializeTheme();

  // Detect and log shortcut conflicts (development validation)
  detectConflicts();

  // Initialize IndexedDB for project storage
  onMount(async () => {
    await initializeProjectStore();
  });

  // Cleanup database connection on unmount
  onCleanup(() => {
    closeDatabase();
  });

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

  // Warn on unsaved changes
  createEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (documentStore.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    onCleanup(() => window.removeEventListener('beforeunload', handleBeforeUnload));
  });

  // Global keyboard shortcuts for Find/Replace, Preferences, and Undo/Redo
  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input/textarea
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea') {
        return;
      }

      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl+Z - Undo (only when document loaded)
      if (ctrlOrCmd && e.key.toLowerCase() === 'z' && !e.shiftKey && documentStore.parseState === 'valid') {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Shift+Z or Ctrl+Y - Redo (only when document loaded)
      if (ctrlOrCmd && ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') && documentStore.parseState === 'valid') {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl+, or Cmd+, - Open preferences (only when document loaded)
      if (ctrlOrCmd && e.key === ',' && documentStore.parseState === 'valid') {
        e.preventDefault();
        openPreferences();
        return;
      }

      handleSearchShortcut(e);

      // P - Toggle view mode (wireframe/styled) (only when document loaded)
      if ((e.key === 'p' || e.key === 'P') && !ctrlOrCmd && !e.altKey && !e.shiftKey && documentStore.parseState === 'valid') {
        e.preventDefault();
        toggleViewMode();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => window.removeEventListener('keydown', handleKeyDown));
  });

  const handleFitToView = () => {
    // Account for: left sidebar (240px) + right properties panel (280px) + ruler + padding
    const viewportWidth = window.innerWidth - 240 - 280 - RULER_THICKNESS - 32 - 25;
    // Account for: main toolbar (~48px) + ruler + padding
    const viewportHeight = window.innerHeight - 48 - RULER_THICKNESS - 32;

    const activeId = templateStore.activeTemplateId;
    if (!activeId) return;

    const activeTemplate = getTemplate(activeId);
    if (!activeTemplate?.attributes?.size) return;

    const [width, height] = activeTemplate.attributes.size.split(',').map((s) => Number.parseInt(s.trim(), 10));
    if (Number.isNaN(width) || Number.isNaN(height)) return;

    fitToView({ width: viewportWidth, height: viewportHeight }, { width, height });
  };

  return (
    <main
      ref={setAppContainer}
      style={{ padding: '1rem', margin: '0 auto', "padding-top":  documentStore.parseState === 'valid' ? 0 : '2rem'}}
    >
      {/* Storage warning - shown at top when quota exceeds threshold */}
      <Show when={!projectStore.isSessionOnly && !storageWarningDismissed()}>
        <StorageWarning
          recheckInterval={QUOTA_CHECK_INTERVAL}
          onDismiss={() => setStorageWarningDismissed(true)}
        />
      </Show>

      {/* Show upload zone when no document, canvas when document loaded */}
      {documentStore.parseState === 'valid' ? (
        <>
          <div style={{ display: 'flex', "min-height": '100vh' }}>
            <div style={{ display: 'flex', "flex-direction": 'column', width: '240px', "min-width": '200px', "max-width": '320px', "border-right": '1px solid var(--color-border, #e0e0e0)', "flex-shrink": 0 }}>
              <ViewPalette />
              <TemplatesPanel />
              <HierarchyPanel />
              <ColorsPanel />
              <FontsPanel />
              <BitmapsPanel />
              <GradientsPanel />
              <ControlTagsPanel />
              <VariablesPanel />
            </div>
            <div style={{ flex: 1, "min-width": 0, display: 'flex', "flex-direction": 'column' }}>
              <MainToolbar onFitToView={handleFitToView} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <RulerContainer>
                  <Canvas />
                </RulerContainer>
              </div>
            </div>
            <PropertiesPanel />
          </div>
          <Legend />
          <Show when={searchStore.isOpen}>
            <FindPanel />
          </Show>
          <PreferencesPanel />
        </>
      ) : (
        <>
        <Show when={projectStore.isSessionOnly}>
          <div
            style={{
              "background-color": 'var(--color-warning-100, #fef3c7)',
              "border": '1px solid var(--color-warning-400, #f59e0b)',
              "border-radius": '4px',
              padding: '0.75rem 1rem',
              "margin-bottom": '1rem',
              "max-width": '600px',
              margin: '0 auto 1rem',
              "text-align": 'center',
              color: 'var(--color-warning-800, #92400e)',
            }}
            role="alert"
          >
            <strong>Session-only mode:</strong> IndexedDB is unavailable. Projects will not be saved.
          </div>
        </Show>
        <h1 style={{ "margin-bottom": '1.5rem', "text-align": 'center' }}>VSTGUI-Edit</h1>
        <div style={{ "max-width": '600px', margin: '0 auto' }}>
          <UploadZone />
        </div>
        </>
      )}
    </main>
  );
}
