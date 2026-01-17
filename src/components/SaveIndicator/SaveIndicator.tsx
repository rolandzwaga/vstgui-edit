import { type Component, Show, createMemo } from 'solid-js';

import { projectStore } from '../../stores/projectStore';

import styles from './SaveIndicator.module.css';

/**
 * Formats a time for display in the save indicator.
 * Shows hours and minutes in 24-hour format.
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * SaveIndicator displays the current save status in the toolbar.
 *
 * States:
 * - Saving: "Saving..." with animation
 * - Saved: "Saved at [time]"
 * - Error: "Save failed"
 * - Dirty: "Unsaved changes"
 * - Clean: "All changes saved" or hidden
 */
export const SaveIndicator: Component = () => {
  const statusClass = createMemo(() => {
    const status = projectStore.saveStatus;
    const isDirty = projectStore.isDirty;

    if (status === 'saving') return styles.saving;
    if (status === 'error') return styles.error;
    if (isDirty) return styles.dirty;
    if (status === 'saved') return styles.saved;
    return '';
  });

  const statusText = createMemo(() => {
    const status = projectStore.saveStatus;
    const isDirty = projectStore.isDirty;
    const lastSaved = projectStore.lastSavedAt;

    if (status === 'saving') {
      return 'Saving...';
    }

    if (status === 'error') {
      return 'Save failed';
    }

    if (isDirty) {
      return 'Unsaved changes';
    }

    if (status === 'saved' && lastSaved) {
      return `Saved at ${formatTime(lastSaved)}`;
    }

    return 'All changes saved';
  });

  return (
    <Show when={projectStore.currentProject}>
      <div
        class={`${styles.indicator} ${statusClass()}`}
        data-testid="save-indicator"
        role="status"
        aria-live="polite"
      >
        <Show when={projectStore.saveStatus === 'saving'}>
          <span class={styles.spinner} aria-hidden="true" />
        </Show>
        <span class={styles.text}>{statusText()}</span>
      </div>
    </Show>
  );
};
