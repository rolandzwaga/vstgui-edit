import type { Component } from 'solid-js';
import styles from './AddVariableButton.module.css';

export interface AddVariableButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const AddVariableButton: Component<AddVariableButtonProps> = (props) => {
  return (
    <button
      type="button"
      class={styles.button}
      onClick={props.onClick}
      disabled={props.disabled}
      data-testid="add-variable-button"
      aria-label="Add variable"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M6 1v10M1 6h10"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </button>
  );
};
