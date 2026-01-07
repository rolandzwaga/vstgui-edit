import type { Component, JSX } from 'solid-js';
import { createSignal, createEffect, onCleanup, Show, For, createMemo } from 'solid-js';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { EnumEditorProps } from '../../types/editors';
import styles from './EnumEditor.module.css';

export const EnumEditor: Component<EnumEditorProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);
  let buttonRef: HTMLButtonElement | undefined;
  let dropdownRef: HTMLDivElement | undefined;

  const currentIndex = createMemo(() => props.options.indexOf(props.value));

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

    const handleFocusOut = (e: FocusEvent) => {
      const relatedTarget = e.relatedTarget as Node | null;
      if (
        buttonRef &&
        dropdownRef &&
        relatedTarget &&
        !buttonRef.contains(relatedTarget) &&
        !dropdownRef.contains(relatedTarget)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    buttonRef?.addEventListener('focusout', handleFocusOut);
    
    onCleanup(() => {
      document.removeEventListener('mousedown', handleClickOutside);
      buttonRef?.removeEventListener('focusout', handleFocusOut);
    });
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

      <Show when={isOpen()}>
        <div
          ref={dropdownRef}
          role="listbox"
          class={styles.dropdown}
        >
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
      </Show>
    </div>
  );
};
