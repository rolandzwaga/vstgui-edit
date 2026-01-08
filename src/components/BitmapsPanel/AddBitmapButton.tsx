import type { Component } from 'solid-js';
import styles from './AddBitmapButton.module.css';

export interface AddBitmapButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const AddBitmapButton: Component<AddBitmapButtonProps> = (props) => {
  return (
    <button
      type="button"
      class={styles.button}
      data-testid="add-bitmap-button"
      aria-label="Add bitmap"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <svg
        class={styles.icon}
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 1v12M1 7h12"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  );
};
