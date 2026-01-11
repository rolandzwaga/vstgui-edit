import { createEffect, onCleanup, Show } from 'solid-js';
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

import { handleSearchShortcut } from './domain/search/shortcuts';
import {
  initializeTheme,
  updateTheme,
  subscribeToSystemThemeChanges,
} from './domain/theme';
import { documentStore, getTemplate } from './stores/documentStore';
import { openPreferences, initializePreferences, preferencesStore } from './stores/preferencesStore';
import { PreferencesPanel } from './components/PreferencesPanel';
import { ShortcutsPanel } from './components/ShortcutsPanel';
import { searchStore } from './stores/searchStore';
import { templateStore } from './stores/templateStore';
import { fitToView } from './stores/canvasStore';
import './styles/tokens.css';

export default function App() {
  // Initialize preferences from localStorage on mount
  initializePreferences();

  // Initialize theme after preferences are loaded
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

  // Global keyboard shortcuts for Find/Replace and Preferences
  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input/textarea
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea') {
        return;
      }

      // Ctrl+, or Cmd+, - Open preferences (only when document loaded)
      const ctrlOrCmd = e.ctrlKey || e.metaKey;
      if (ctrlOrCmd && e.key === ',' && documentStore.parseState === 'valid') {
        e.preventDefault();
        openPreferences();
        return;
      }

      handleSearchShortcut(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => window.removeEventListener('keydown', handleKeyDown));
  });

  const handleFitToView = () => {
    const viewportWidth = window.innerWidth - 64;
    const viewportHeight = window.innerHeight - 200;

    const activeId = templateStore.activeTemplateId;
    if (!activeId) return;

    const activeTemplate = getTemplate(activeId);
    if (!activeTemplate?.attributes?.size) return;

    const [width, height] = activeTemplate.attributes.size.split(',').map((s) => Number.parseInt(s.trim(), 10));
    if (Number.isNaN(width) || Number.isNaN(height)) return;

    fitToView({ width: viewportWidth, height: viewportHeight }, { width, height });
  };

  return (
    <main style={{ padding: '1rem', margin: '0 auto', "padding-top":  documentStore.parseState === 'valid' ? 0 : '2rem'}}>
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
          <ShortcutsPanel />
        </>
      ) : (
        <>
        <h1 style={{ "margin-bottom": '1.5rem', "text-align": 'center' }}>VSTGUI-Edit</h1>
        <div style={{ "max-width": '600px', margin: '0 auto' }}>
          <UploadZone />
        </div>
        </>
      )}
    </main>
  );
}
