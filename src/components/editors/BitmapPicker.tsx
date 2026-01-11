import type { Component, JSX } from 'solid-js';
import { createSignal, createEffect, Show, For, createMemo } from 'solid-js';
import type { BitmapPickerProps } from '../../types/editors';
import { FloatingDropdown } from '../common/FloatingDropdown';
import styles from './BitmapPicker.module.css';

export const BitmapPicker: Component<BitmapPickerProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);
  let buttonRef: HTMLButtonElement | undefined;

  const currentIndex = createMemo(() => props.documentBitmaps.indexOf(props.value));

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

  const selectBitmap = (bitmap: string) => {
    if (bitmap !== props.value) {
      props.onChange(bitmap);
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
        if (props.documentBitmaps.length > 0) {
          setHighlightedIndex((prev) => (prev + 1) % props.documentBitmaps.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (props.documentBitmaps.length > 0) {
          setHighlightedIndex(
            (prev) => (prev - 1 + props.documentBitmaps.length) % props.documentBitmaps.length
          );
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex() >= 0 && highlightedIndex() < props.documentBitmaps.length) {
          selectBitmap(props.documentBitmaps[highlightedIndex()]);
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
          when={props.documentBitmaps.length > 0}
          fallback={<div class={styles.emptyState}>No bitmaps defined</div>}
        >
          <div role="listbox" class={styles.bitmapList}>
            <For each={props.documentBitmaps}>
              {(bitmap, index) => (
                <div
                  role="option"
                  class={`${styles.bitmapOption} ${index() === highlightedIndex() ? styles.highlighted : ''}`}
                  aria-selected={bitmap === props.value}
                  onClick={() => selectBitmap(bitmap)}
                  onMouseEnter={() => setHighlightedIndex(index())}
                >
                  {bitmap}
                </div>
              )}
            </For>
          </div>
        </Show>
      </FloatingDropdown>
    </div>
  );
};
