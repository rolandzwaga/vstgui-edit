import type { Component } from 'solid-js';
import { toggleViewMode, viewModeStore } from '../../stores/viewModeStore';
import styles from './ViewModeToolbar.module.css';

/**
 * ViewModeToolbar - Provides toggle for wireframe/styled view mode.
 *
 * Features:
 * - Toggle button to switch between wireframe and styled modes
 * - Keyboard shortcut: P
 */
export const ViewModeToolbar: Component = () => {
  return (
    <div class={styles.toolbar} role="toolbar" aria-label="View mode controls">
      <button
        type="button"
        class={styles.button}
        classList={{
          [styles.buttonActive]: viewModeStore.mode === 'styled',
        }}
        onClick={() => toggleViewMode()}
        aria-label="Toggle styled view mode"
        aria-pressed={viewModeStore.mode === 'styled'}
        title={viewModeStore.mode === 'wireframe' ? 'Switch to Styled Mode (P)' : 'Switch to Wireframe Mode (P)'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <rect x="7" y="7" width="10" height="10" fill="currentColor" opacity="0.3" />
        </svg>
      </button>
    </div>
  );
};
