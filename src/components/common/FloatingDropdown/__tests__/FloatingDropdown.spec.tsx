import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { FloatingDropdown } from '../FloatingDropdown';

// Mock floating-ui
vi.mock('@floating-ui/dom', () => ({
  computePosition: vi.fn().mockResolvedValue({ x: 100, y: 200 }),
  autoUpdate: vi.fn().mockImplementation((_ref, _floating, update) => {
    // Call update immediately like the real autoUpdate does
    update();
    return vi.fn();
  }),
  offset: vi.fn().mockReturnValue({}),
  flip: vi.fn().mockReturnValue({}),
  shift: vi.fn().mockReturnValue({}),
}));

import { computePosition, autoUpdate } from '@floating-ui/dom';

describe('FloatingDropdown', () => {
  let triggerRef: HTMLButtonElement | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    // Create a trigger element in the document
    triggerRef = document.createElement('button');
    triggerRef.textContent = 'Trigger';
    document.body.appendChild(triggerRef);
  });

  afterEach(() => {
    cleanup();
    if (triggerRef && triggerRef.parentNode) {
      triggerRef.parentNode.removeChild(triggerRef);
    }
    triggerRef = undefined;
  });

  describe('rendering', () => {
    it('does not render children when closed', () => {
      const [isOpen] = createSignal(false);

      render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={() => {}}
          triggerRef={triggerRef}
        >
          <div data-testid="dropdown-content">Content</div>
        </FloatingDropdown>
      ));

      expect(document.querySelector('[data-testid="dropdown-content"]')).toBeNull();
    });

    it('renders children in portal when open', () => {
      const [isOpen] = createSignal(true);

      render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={() => {}}
          triggerRef={triggerRef}
        >
          <div data-testid="dropdown-content">Content</div>
        </FloatingDropdown>
      ));

      const content = document.querySelector('[data-testid="dropdown-content"]');
      expect(content).not.toBeNull();
      // Should be rendered in body (via Portal), not in the component tree
      expect(content?.closest('body > div')).not.toBeNull();
    });

    it('applies custom class to dropdown container', () => {
      const [isOpen] = createSignal(true);

      render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={() => {}}
          triggerRef={triggerRef}
          class="custom-dropdown"
        >
          <div>Content</div>
        </FloatingDropdown>
      ));

      const dropdown = document.querySelector('.custom-dropdown');
      expect(dropdown).not.toBeNull();
    });
  });

  describe('positioning', () => {
    it('calls computePosition with strategy fixed', async () => {
      const [isOpen] = createSignal(true);

      render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={() => {}}
          triggerRef={triggerRef}
        >
          <div>Content</div>
        </FloatingDropdown>
      ));

      // Wait for RAF
      await new Promise((resolve) => requestAnimationFrame(resolve));

      expect(computePosition).toHaveBeenCalledWith(
        triggerRef,
        expect.any(HTMLElement),
        expect.objectContaining({
          strategy: 'fixed',
          placement: 'bottom-start',
        })
      );
    });

    it('uses custom placement when provided', async () => {
      const [isOpen] = createSignal(true);

      render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={() => {}}
          triggerRef={triggerRef}
          placement="top-end"
        >
          <div>Content</div>
        </FloatingDropdown>
      ));

      await new Promise((resolve) => requestAnimationFrame(resolve));

      expect(computePosition).toHaveBeenCalledWith(
        triggerRef,
        expect.any(HTMLElement),
        expect.objectContaining({
          placement: 'top-end',
        })
      );
    });

    it('sets up autoUpdate with animationFrame option', async () => {
      const [isOpen] = createSignal(true);

      render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={() => {}}
          triggerRef={triggerRef}
        >
          <div>Content</div>
        </FloatingDropdown>
      ));

      await new Promise((resolve) => requestAnimationFrame(resolve));

      expect(autoUpdate).toHaveBeenCalledWith(
        triggerRef,
        expect.any(HTMLElement),
        expect.any(Function),
        expect.objectContaining({
          animationFrame: true,
        })
      );
    });
  });

  describe('cleanup', () => {
    it('cleans up autoUpdate when dropdown closes', async () => {
      const cleanupFn = vi.fn();
      vi.mocked(autoUpdate).mockReturnValue(cleanupFn);

      const [isOpen, setIsOpen] = createSignal(true);

      render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={() => {}}
          triggerRef={triggerRef}
        >
          <div>Content</div>
        </FloatingDropdown>
      ));

      await new Promise((resolve) => requestAnimationFrame(resolve));
      expect(autoUpdate).toHaveBeenCalled();

      setIsOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(cleanupFn).toHaveBeenCalled();
    });

    it('cleans up autoUpdate on unmount', async () => {
      const cleanupFn = vi.fn();
      vi.mocked(autoUpdate).mockReturnValue(cleanupFn);

      const [isOpen] = createSignal(true);

      const { unmount } = render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={() => {}}
          triggerRef={triggerRef}
        >
          <div>Content</div>
        </FloatingDropdown>
      ));

      await new Promise((resolve) => requestAnimationFrame(resolve));

      unmount();

      expect(cleanupFn).toHaveBeenCalled();
    });
  });

  describe('click outside', () => {
    it('calls onClose when clicking outside dropdown', async () => {
      const onClose = vi.fn();
      const [isOpen] = createSignal(true);

      render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={onClose}
          triggerRef={triggerRef}
        >
          <div data-testid="dropdown-content">Content</div>
        </FloatingDropdown>
      ));

      // Click outside
      fireEvent.mouseDown(document.body);

      expect(onClose).toHaveBeenCalled();
    });

    it('does not call onClose when clicking inside dropdown', async () => {
      const onClose = vi.fn();
      const [isOpen] = createSignal(true);

      render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={onClose}
          triggerRef={triggerRef}
        >
          <div data-testid="dropdown-content">Content</div>
        </FloatingDropdown>
      ));

      const content = document.querySelector('[data-testid="dropdown-content"]');
      fireEvent.mouseDown(content!);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when clicking on trigger', async () => {
      const onClose = vi.fn();
      const [isOpen] = createSignal(true);

      render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={onClose}
          triggerRef={triggerRef}
        >
          <div>Content</div>
        </FloatingDropdown>
      ));

      fireEvent.mouseDown(triggerRef!);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('escape key', () => {
    it('calls onClose when Escape is pressed', () => {
      const onClose = vi.fn();
      const [isOpen] = createSignal(true);

      render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={onClose}
          triggerRef={triggerRef}
        >
          <div>Content</div>
        </FloatingDropdown>
      ));

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });

    it('does not call onClose for other keys', () => {
      const onClose = vi.fn();
      const [isOpen] = createSignal(true);

      render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={onClose}
          triggerRef={triggerRef}
        >
          <div>Content</div>
        </FloatingDropdown>
      ));

      fireEvent.keyDown(document, { key: 'Enter' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('applies position fixed style to dropdown', async () => {
      const [isOpen] = createSignal(true);

      render(() => (
        <FloatingDropdown
          isOpen={isOpen}
          onClose={() => {}}
          triggerRef={triggerRef}
          class="test-dropdown"
        >
          <div>Content</div>
        </FloatingDropdown>
      ));

      await new Promise((resolve) => requestAnimationFrame(resolve));

      const dropdown = document.querySelector('.test-dropdown');
      expect(dropdown).not.toBeNull();
      expect((dropdown as HTMLElement).style.position).toBe('fixed');
    });
  });
});
