import type { Component, JSX } from 'solid-js';
import { createSignal, createEffect, Show, For, createMemo } from 'solid-js';
import type { ControlTagPickerProps } from '../../types/editors';
import { FloatingDropdown } from '../common/FloatingDropdown';
import styles from './ControlTagPicker.module.css';

export const ControlTagPicker: Component<ControlTagPickerProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);
  let buttonRef: HTMLButtonElement | undefined;

  const currentIndex = createMemo(() => props.documentControlTags.indexOf(props.value));

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

  const selectControlTag = (tag: string) => {
    if (tag !== props.value) {
      props.onChange(tag);
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
        if (props.documentControlTags.length > 0) {
          setHighlightedIndex((prev) => (prev + 1) % props.documentControlTags.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (props.documentControlTags.length > 0) {
          setHighlightedIndex(
            (prev) => (prev - 1 + props.documentControlTags.length) % props.documentControlTags.length
          );
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex() >= 0 && highlightedIndex() < props.documentControlTags.length) {
          selectControlTag(props.documentControlTags[highlightedIndex()]);
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
        <Show
          when={props.documentControlTags.length > 0}
          fallback={<div class={styles.emptyState}>No control tags defined</div>}
        >
          <div role="listbox" class={styles.tagList}>
            <For each={props.documentControlTags}>
              {(tag, index) => (
                <div
                  role="option"
                  class={`${styles.tagOption} ${index() === highlightedIndex() ? styles.highlighted : ''}`}
                  aria-selected={tag === props.value}
                  onClick={() => selectControlTag(tag)}
                  onMouseEnter={() => setHighlightedIndex(index())}
                >
                  {tag}
                </div>
              )}
            </For>
          </div>
        </Show>
      </FloatingDropdown>
    </div>
  );
};
