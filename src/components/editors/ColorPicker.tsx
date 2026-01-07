import type { Component, JSX } from 'solid-js';
import { createSignal, createEffect, onCleanup, Show, For, createMemo } from 'solid-js';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { ColorPickerProps } from '../../types/editors';
import { validateColor } from '../../domain/properties/validation';
import styles from './ColorPicker.module.css';

export const ColorPicker: Component<ColorPickerProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [hexInput, setHexInput] = createSignal('');
  const [hexError, setHexError] = createSignal<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);
  let buttonRef: HTMLButtonElement | undefined;
  let dropdownRef: HTMLDivElement | undefined;

  const isHexColor = createMemo(() => {
    const val = props.value;
    return val.startsWith('#') || val.startsWith('~');
  });

  const swatchColor = createMemo(() => {
    if (props.value.startsWith('#')) {
      return props.value;
    }
    return null;
  });

  const currentIndex = createMemo(() => props.documentColors.indexOf(props.value));

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
      setHexInput('');
      setHexError(null);
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

  const selectColor = (color: string) => {
    if (color !== props.value) {
      props.onChange(color);
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

  const handleButtonKeyDown: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (e) => {
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
        if (props.documentColors.length > 0) {
          setHighlightedIndex((prev) => (prev + 1) % props.documentColors.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (props.documentColors.length > 0) {
          setHighlightedIndex(
            (prev) => (prev - 1 + props.documentColors.length) % props.documentColors.length
          );
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex() >= 0 && highlightedIndex() < props.documentColors.length) {
          selectColor(props.documentColors[highlightedIndex()]);
        }
        break;
    }
  };

  const handleHexInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    const value = e.currentTarget.value;
    setHexInput(value);
    setHexError(null);
    props.onChange(value);
  };

  const handleHexKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = hexInput();
      const validation = validateColor(value, props.documentColors);
      if (!validation.valid) {
        setHexError(validation.error ?? 'Invalid color');
        return;
      }
      props.onCommit();
      closeDropdown();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
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
        onKeyDown={handleButtonKeyDown}
        disabled={props.disabled}
        aria-expanded={isOpen()}
        aria-haspopup="listbox"
      >
        <Show when={swatchColor()}>
          <span
            class={styles.swatch}
            style={{ 'background-color': swatchColor() ?? undefined }}
            data-testid="color-swatch"
          />
        </Show>
        <span class={styles.value}>{props.value}</span>
        <span class={styles.indicator}>▾</span>
      </button>

      <Show when={isOpen()}>
        <div ref={dropdownRef} class={styles.dropdown}>
          <div class={styles.hexSection}>
            <input
              type="text"
              class={styles.hexInput}
              placeholder="#RRGGBB"
              value={hexInput()}
              onInput={handleHexInput}
              onKeyDown={handleHexKeyDown}
            />
            <Show when={hexError()}>
              <span class={styles.hexError}>{hexError()}</span>
            </Show>
          </div>

          <Show when={props.documentColors.length > 0}>
            <div class={styles.divider} />
            <div role="listbox" class={styles.colorList}>
              <For each={props.documentColors}>
                {(color, index) => (
                  <div
                    role="option"
                    class={`${styles.colorOption} ${index() === highlightedIndex() ? styles.highlighted : ''}`}
                    aria-selected={color === props.value}
                    onClick={() => selectColor(color)}
                    onMouseEnter={() => setHighlightedIndex(index())}
                  >
                    {color}
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
