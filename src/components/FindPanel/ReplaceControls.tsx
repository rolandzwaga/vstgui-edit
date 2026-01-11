/**
 * ReplaceControls Component
 * Replace input field and action buttons for replacing attribute values.
 */

import { Show } from 'solid-js';
import styles from './FindPanel.module.css';

export interface ReplaceControlsProps {
  /** Current replacement value */
  value: string;
  /** Called when input value changes */
  onInput: (value: string) => void;
  /** Called when Replace button is clicked */
  onReplace: () => void;
  /** Called when Replace All button is clicked */
  onReplaceAll: () => void;
  /** Whether there are results to replace */
  hasResults: boolean;
  /** Attribute name being replaced (for placeholder) */
  attributeName?: string;
  /** Error message to display */
  error?: string;
}

export function ReplaceControls(props: ReplaceControlsProps) {
  const isDisabled = () => !props.hasResults || props.value.trim() === '';

  const placeholder = () =>
    props.attributeName
      ? `Replace ${props.attributeName} with...`
      : 'Replace with...';

  return (
    <div class={styles.replaceControls}>
      <input
        type="text"
        class={`${styles.replaceInput} ${props.error ? styles.replaceInputError : ''}`}
        value={props.value}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        placeholder={placeholder()}
        aria-label="Replacement value"
        aria-invalid={!!props.error}
      />
      <div class={styles.replaceButtons}>
        <button
          type="button"
          class={styles.replaceButton}
          onClick={props.onReplace}
          disabled={isDisabled()}
        >
          Replace
        </button>
        <button
          type="button"
          class={`${styles.replaceButton} ${styles.replaceButtonPrimary}`}
          onClick={props.onReplaceAll}
          disabled={isDisabled()}
        >
          Replace All
        </button>
      </div>
      <Show when={props.error}>
        <div class={styles.replaceError} role="alert">
          {props.error}
        </div>
      </Show>
    </div>
  );
}
