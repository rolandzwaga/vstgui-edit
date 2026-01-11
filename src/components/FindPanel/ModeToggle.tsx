/**
 * ModeToggle Component
 * Toggle buttons for switching between Find and Replace modes.
 */

import type { FindPanelMode } from '../../types/search';
import styles from './FindPanel.module.css';

export interface ModeToggleProps {
  /** Current mode */
  mode: FindPanelMode;
  /** Called when mode changes */
  onModeChange: (mode: FindPanelMode) => void;
}

export function ModeToggle(props: ModeToggleProps) {
  const handleClick = (targetMode: FindPanelMode) => {
    if (props.mode !== targetMode) {
      props.onModeChange(targetMode);
    }
  };

  return (
    <div class={styles.modeToggle}>
      <button
        type="button"
        class={`${styles.modeButton} ${props.mode === 'find' ? styles.modeButtonActive : ''}`}
        onClick={() => handleClick('find')}
        aria-pressed={props.mode === 'find'}
      >
        Find
      </button>
      <button
        type="button"
        class={`${styles.modeButton} ${props.mode === 'replace' ? styles.modeButtonActive : ''}`}
        onClick={() => handleClick('replace')}
        aria-pressed={props.mode === 'replace'}
      >
        Replace
      </button>
    </div>
  );
}
