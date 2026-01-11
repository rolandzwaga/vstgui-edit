import type { Component, JSX } from 'solid-js';
import { Show, onMount } from 'solid-js';
import type { EditorProps } from '../../types/editors';
import sharedStyles from './editors.module.css';
import styles from './TextEditor.module.css';

export const TextEditor: Component<EditorProps> = (props) => {
  let inputRef: HTMLInputElement | undefined;

  onMount(() => {
    setTimeout(() => inputRef?.focus(), 0);
  });

  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    props.onChange(e.currentTarget.value);
  };

  const handleKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (e) => {
    if (e.key === 'Enter') {
      props.onCommit();
    } else if (e.key === 'Escape') {
      props.onCancel();
    }
  };

  const handleBlur = () => {
    props.onCancel();
  };

  return (
    <div class={styles.wrapper}>
      <input
        ref={inputRef}
        type="text"
        class={`${sharedStyles.editorInput} ${props.error ? sharedStyles.editorInputError : ''}`}
        value={props.value}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={props.disabled}
        placeholder={props.placeholder}
        aria-invalid={props.error ? 'true' : undefined}
      />
      <Show when={props.error}>
        <span class={sharedStyles.errorMessage}>{props.error}</span>
      </Show>
    </div>
  );
};
