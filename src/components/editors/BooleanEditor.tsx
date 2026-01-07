import type { Component, JSX } from 'solid-js';
import type { EditorProps } from '../../types/editors';
import sharedStyles from './editors.module.css';

export const BooleanEditor: Component<EditorProps> = (props) => {
  const isChecked = () => props.value.toLowerCase() === 'true';

  const handleChange: JSX.EventHandler<HTMLInputElement, Event> = () => {
    const newValue = isChecked() ? 'false' : 'true';
    props.onChange(newValue);
    props.onCommit();
  };

  return (
    <input
      type="checkbox"
      class={sharedStyles.checkbox}
      checked={isChecked()}
      onChange={handleChange}
      disabled={props.disabled}
    />
  );
};
