/**
 * SettingToggle Component
 *
 * A toggle switch for boolean preferences.
 */

import type { Component, JSX } from 'solid-js';
import { Show } from 'solid-js';
import styles from './controls.module.css';

export interface SettingToggleProps {
  /** Unique ID for the input */
  id: string;

  /** Label text */
  label: string;

  /** Current value */
  value: boolean;

  /** Change handler */
  onChange: (value: boolean) => void;

  /** Optional description text */
  description?: string;

  /** Whether the toggle is disabled */
  disabled?: boolean;
}

export const SettingToggle: Component<SettingToggleProps> = (props) => {
  const handleChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    props.onChange(e.currentTarget.checked);
  };

  return (
    <div class={styles.settingRow}>
      <div class={styles.settingInfo}>
        <label for={props.id} class={styles.settingLabel}>
          {props.label}
        </label>
        <Show when={props.description}>
          <p class={styles.settingDescription}>{props.description}</p>
        </Show>
      </div>
      <input
        type="checkbox"
        id={props.id}
        class={styles.toggle}
        checked={props.value}
        onChange={handleChange}
        disabled={props.disabled}
      />
    </div>
  );
};
