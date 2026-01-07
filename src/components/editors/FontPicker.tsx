import type { Component, JSX } from 'solid-js';
import { createSignal, createEffect, onCleanup, Show, For, createMemo } from 'solid-js';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { FontPickerProps } from '../../types/editors';
import styles from './FontPicker.module.css';

export const FontPicker: Component<FontPickerProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);
  let buttonRef: HTMLButtonElement | undefined;
  let dropdownRef: HTMLDivElement | undefined;

  const currentIndex = createMemo(() => props.documentFonts.indexOf(props.value));

  const updateDropdownPosition = () => {
    if (!buttonRef || !dropdownRef || !isOpen()) return;

    computePosition(buttonRef, dropdownRef, {
      placement: 'bottom-start',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      if (dropdownRef) {
        dropdownRef.style.left = `${x}px`;
        dropdownRef.style.top = `${y}px`;
      }
    });
  };

  createEffect(() => {
    if (isOpen()) {
      setHighlightedIndex(currentIndex());
      updateDropdownPosition();
    }
  });

  createEffect(() => {
    if (!isOpen()) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef &&
        dropdownRef &&
        !buttonRef.contains(target) &&
        !dropdownRef.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    onCleanup(() => document.removeEventListener('mousedown', handleClickOutside));
  });

  const openDropdown = () => {
    if (props.disabled) return;
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const selectFont = (font: string) => {
    if (font !== props.value) {
      props.onChange(font);
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
        if (props.documentFonts.length > 0) {
          setHighlightedIndex((prev) => (prev + 1) % props.documentFonts.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (props.documentFonts.length > 0) {
          setHighlightedIndex(
            (prev) => (prev - 1 + props.documentFonts.length) % props.documentFonts.length
          );
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex() >= 0 && highlightedIndex() < props.documentFonts.length) {
          selectFont(props.documentFonts[highlightedIndex()]);
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

      <Show when={isOpen()}>
        <div ref={dropdownRef} class={styles.dropdown}>
          <Show
            when={props.documentFonts.length > 0}
            fallback={<div class={styles.emptyState}>No fonts defined</div>}
          >
            <div role="listbox" class={styles.fontList}>
              <For each={props.documentFonts}>
                {(font, index) => (
                  <div
                    role="option"
                    class={`${styles.fontOption} ${index() === highlightedIndex() ? styles.highlighted : ''}`}
                    aria-selected={font === props.value}
                    onClick={() => selectFont(font)}
                    onMouseEnter={() => setHighlightedIndex(index())}
                  >
                    {font}
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};
