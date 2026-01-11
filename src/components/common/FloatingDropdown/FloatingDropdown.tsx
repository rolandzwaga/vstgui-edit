import type { Accessor, JSX } from 'solid-js';
import { createEffect, onCleanup, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { Placement } from '@floating-ui/dom';

export interface FloatingDropdownProps {
  /** Signal indicating if dropdown is open */
  isOpen: Accessor<boolean>;
  /** Callback when dropdown should close */
  onClose: () => void;
  /** Reference to the trigger element */
  triggerRef: HTMLElement | undefined;
  /** Placement relative to trigger (default: 'bottom-start') */
  placement?: Placement;
  /** Offset from trigger in pixels (default: 4) */
  offset?: number;
  /** Additional CSS class for the dropdown container */
  class?: string;
  /** Dropdown content */
  children: JSX.Element;
}

/**
 * FloatingDropdown - A reusable dropdown component with proper scroll handling.
 *
 * Uses Portal to render outside scroll containers and floating-ui for positioning.
 * Handles click-outside, Escape key, and continuous position updates during scroll.
 */
export const FloatingDropdown = (props: FloatingDropdownProps) => {
  let dropdownRef: HTMLDivElement | undefined;
  let cleanupAutoUpdate: (() => void) | undefined;
  let rafId: number | undefined;

  const updatePosition = () => {
    if (!props.triggerRef || !dropdownRef || !props.isOpen()) return;

    computePosition(props.triggerRef, dropdownRef, {
      placement: props.placement ?? 'bottom-start',
      strategy: 'fixed',
      middleware: [offset(props.offset ?? 4), flip(), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      if (dropdownRef) {
        dropdownRef.style.left = `${x}px`;
        dropdownRef.style.top = `${y}px`;
      }
    });
  };

  // Ref callback that sets up autoUpdate when dropdown mounts
  const setDropdownRef = (el: HTMLDivElement) => {
    dropdownRef = el;
    // Apply fixed positioning immediately
    el.style.position = 'fixed';

    if (el && props.triggerRef) {
      rafId = requestAnimationFrame(() => {
        if (dropdownRef && props.triggerRef && props.isOpen()) {
          cleanupAutoUpdate = autoUpdate(props.triggerRef, dropdownRef, updatePosition, {
            animationFrame: true,
          });
        }
      });
    }
  };

  // Cleanup when component unmounts
  onCleanup(() => {
    if (rafId !== undefined) cancelAnimationFrame(rafId);
    cleanupAutoUpdate?.();
  });

  // Cleanup when dropdown closes
  createEffect(() => {
    if (!props.isOpen()) {
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
        rafId = undefined;
      }
      cleanupAutoUpdate?.();
      cleanupAutoUpdate = undefined;
    }
  });

  // Handle click outside
  createEffect(() => {
    if (!props.isOpen()) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        props.triggerRef &&
        dropdownRef &&
        !props.triggerRef.contains(target) &&
        !dropdownRef.contains(target)
      ) {
        props.onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    onCleanup(() => document.removeEventListener('mousedown', handleClickOutside));
  });

  // Handle Escape key
  createEffect(() => {
    if (!props.isOpen()) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        props.onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  });

  return (
    <Show when={props.isOpen()}>
      <Portal>
        <div ref={setDropdownRef} class={props.class}>
          {props.children}
        </div>
      </Portal>
    </Show>
  );
};
