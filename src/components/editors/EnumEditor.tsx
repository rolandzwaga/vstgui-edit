import type { Component, JSX } from 'solid-js';
import { createSignal, createEffect, For, createMemo } from 'solid-js';
import type { EnumEditorProps } from '../../types/editors';
import { FloatingDropdown } from '../common/FloatingDropdown';
import styles from './EnumEditor.module.css';

export const EnumEditor: Component<EnumEditorProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);
  let buttonRef: HTMLButtonElement | undefined;

  const currentIndex = createMemo(() => props.options.indexOf(props.value));

  // Reset highlight when dropdown opens
  createEffect(() => {
    if (isOpen()) {
      setHighlightedIndex(currentIndex());
    }
  });

  const openDropdown = () => {
    if (props.disabled) return;
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const selectOption = (option: string) => {
    if (option !== props.value) {
      props.onChange(option);
      props.onCommit();
    }
    closeDropdown();
  };

  const handleButtonClick = () => {
    if (isOpen()) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const handleKeyDown: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (e) => {
    if (props.disabled) return;

    if (!isOpen()) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        openDropdown();
        return;
      }
      if (e.key === 'Escape') {
        props.onCancel();
        return;
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % props.options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + props.options.length) % props.options.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex() >= 0) {
          selectOption(props.options[highlightedIndex()]);
        }
        break;
    }
  };

  return (
    <div class={styles.wrapper}>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        class={styles.trigger}
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        disabled={props.disabled}
        aria-expanded={isOpen()}
        aria-haspopup="listbox"
      >
        <span class={styles.value}>{props.value}</span>
        <span class={styles.indicator}>▾</span>
      </button>

      <FloatingDropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        triggerRef={buttonRef}
        class={styles.dropdown}
      >
        <div role="listbox">
          <For each={props.options}>
            {(option, index) => (
              <div
                role="option"
                class={`${styles.option} ${index() === highlightedIndex() ? styles.highlighted : ''}`}
                aria-selected={option === props.value}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setHighlightedIndex(index())}
              >
                {option}
              </div>
            )}
          </For>
        </div>
      </FloatingDropdown>
    </div>
  );
};
