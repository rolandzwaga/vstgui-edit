/**
 * AlignmentButton Component
 *
 * Individual button for alignment/distribution operations.
 */

import type { Component, JSX } from 'solid-js';
import styles from './AlignmentToolbar.module.css';

export interface AlignmentButtonProps {
  /** Type of alignment or distribution this button performs */
  type: string;
  /** Icon component to render */
  icon: Component;
  /** Button label for tooltip and aria-label */
  label: string;
  /** Keyboard shortcut (optional, for tooltip) */
  shortcut?: string;
  /** Whether the button is disabled */
  disabled: boolean;
  /** Click handler */
  onClick: () => void;
}

/**
 * AlignmentButton - A toolbar button for alignment operations.
 *
 * Renders an icon button with tooltip that includes the keyboard shortcut.
 */
export const AlignmentButton: Component<AlignmentButtonProps> = (props) => {
  const tooltip = (): string => {
    if (props.shortcut) {
      return `${props.label} (${props.shortcut})`;
    }
    return props.label;
  };

  const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = () => {
    if (!props.disabled) {
      props.onClick();
    }
  };

  return (
    <button
      type="button"
      class={styles.button}
      title={tooltip()}
      aria-label={props.label}
      disabled={props.disabled}
      onClick={handleClick}
    >
      <props.icon />
    </button>
  );
};
