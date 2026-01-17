import type { Accessor, JSX } from 'solid-js';
import { createEffect, createRenderEffect, onCleanup, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { Placement } from '@floating-ui/dom';
import { appContainer } from '../../../stores/appContainerStore';

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
    // Apply fixed positioning and high z-index immediately (above modals)
    el.style.position = 'fixed';
    el.style.zIndex = '350'; // --z-modal-dropdown

    // Set min-width based on trigger element width
    if (props.triggerRef) {
      el.style.minWidth = `${props.triggerRef.offsetWidth}px`;
    }

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
  // Listens on the app container instead of document to avoid interference
  // with Portal content (which renders as a sibling to the app container).
  // This means clicks inside the Portal won't trigger the click-outside handler.
  // Uses createRenderEffect to ensure listener is registered synchronously when isOpen changes.
  createRenderEffect(() => {
    if (!props.isOpen()) return;

    const container = appContainer();
    if (!container) return;

    let frameId: number | undefined;

    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is inside trigger
      if (props.triggerRef && props.triggerRef.contains(e.target as Node)) {
        return; // Click on trigger, don't close
      }

      // Click is inside app container but outside trigger - close dropdown
      props.onClose();
    };

    // Delay adding listener to next frame to avoid catching the opening click
    frameId = requestAnimationFrame(() => {
      container.addEventListener('mousedown', handleClickOutside);
    });

    onCleanup(() => {
      if (frameId !== undefined) cancelAnimationFrame(frameId);
      container.removeEventListener('mousedown', handleClickOutside);
    });
  });

  // Handle Escape key
  // Uses createRenderEffect to ensure listener is registered synchronously when isOpen changes.
  createRenderEffect(() => {
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
        <div
          ref={setDropdownRef}
          class={props.class}
          data-floating-dropdown
        >
          {props.children}
        </div>
      </Portal>
    </Show>
  );
};
