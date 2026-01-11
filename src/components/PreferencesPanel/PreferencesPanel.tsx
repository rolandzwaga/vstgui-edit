/**
 * PreferencesPanel Component
 *
 * Modal dialog for managing all editor preferences.
 */

import { type Component, createEffect, onCleanup, Show, Switch, Match } from 'solid-js';
import {
  preferencesStore,
  closePreferences,
  setActiveSection,
  openResetDialog,
} from '../../stores/preferencesStore';
import { PreferencesSidebar } from './PreferencesSidebar';
import { GridSection } from './sections/GridSection';
import { SnapSection } from './sections/SnapSection';
import { SmartGuidesSection } from './sections/SmartGuidesSection';
import { CustomGuidesSection } from './sections/CustomGuidesSection';
import { ThemeSection } from './sections/ThemeSection';
import { KeyboardShortcutsSection } from './sections/KeyboardShortcutsSection';
import { ResetConfirmDialog } from './ResetConfirmDialog';
import styles from './PreferencesPanel.module.css';

const DIALOG_ID = 'preferences-panel';
const HEADING_ID = `${DIALOG_ID}-heading`;

export const PreferencesPanel: Component = () => {
  let panelRef: HTMLDivElement | undefined;

  // Handle Escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && preferencesStore.isOpen) {
      e.preventDefault();
      closePreferences();
    }
  };

  // Focus management and keyboard handling
  createEffect(() => {
    if (preferencesStore.isOpen) {
      document.addEventListener('keydown', handleKeyDown);

      // Focus panel after render
      requestAnimationFrame(() => {
        panelRef?.focus();
      });
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  // Render active section content
  const renderSection = () => (
    <Switch>
      <Match when={preferencesStore.activeSection === 'grid'}>
        <GridSection />
      </Match>
      <Match when={preferencesStore.activeSection === 'snap'}>
        <SnapSection />
      </Match>
      <Match when={preferencesStore.activeSection === 'smartGuides'}>
        <SmartGuidesSection />
      </Match>
      <Match when={preferencesStore.activeSection === 'customGuides'}>
        <CustomGuidesSection />
      </Match>
      <Match when={preferencesStore.activeSection === 'theme'}>
        <ThemeSection />
      </Match>
      <Match when={preferencesStore.activeSection === 'shortcuts'}>
        <KeyboardShortcutsSection />
      </Match>
    </Switch>
  );

  return (
    <>
      <Show when={preferencesStore.isOpen}>
        <div class={styles.overlay} onClick={closePreferences}>
          <div
            ref={panelRef}
            class={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={HEADING_ID}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <header class={styles.header}>
              <h2 id={HEADING_ID} class={styles.heading}>
                Preferences
              </h2>
              <button
                type="button"
                class={styles.closeButton}
                onClick={closePreferences}
                aria-label="Close preferences"
              >
                &times;
              </button>
            </header>

            <div class={styles.content}>
              <PreferencesSidebar
                activeSection={preferencesStore.activeSection}
                onSectionChange={setActiveSection}
              />
              <main class={styles.main}>
                {renderSection()}
              </main>
            </div>

            <footer class={styles.footer}>
              <button
                type="button"
                class={styles.resetButton}
                onClick={openResetDialog}
              >
                Reset to Defaults
              </button>
            </footer>
          </div>
        </div>
      </Show>

      <ResetConfirmDialog />
    </>
  );
};
