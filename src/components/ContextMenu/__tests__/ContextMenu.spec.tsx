import { fireEvent, render, screen } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetSelection, select } from '../../../stores/selectionStore';
import {
  hideContextMenu,
  resetContextMenu,
  showContextMenu,
} from '../../../stores/contextMenuStore';
import { ContextMenu } from '../ContextMenu';

describe('ContextMenu', () => {
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    resetContextMenu();
    resetSelection();
    vi.clearAllMocks();
  });

  afterEach(() => {
    hideContextMenu();
  });

  describe('visibility', () => {
    it('should not render when menu is closed', () => {
      render(() => <ContextMenu onDelete={mockOnDelete} />);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should render when menu is open', () => {
      showContextMenu(100, 100);
      render(() => <ContextMenu onDelete={mockOnDelete} />);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('Delete menu item', () => {
    it('should render Delete menu item when open', () => {
      showContextMenu(100, 100);
      render(() => <ContextMenu onDelete={mockOnDelete} />);
      expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
    });

    it('should disable Delete when no views are selected', () => {
      showContextMenu(100, 100);
      render(() => <ContextMenu onDelete={mockOnDelete} />);
      const deleteItem = screen.getByRole('menuitem', { name: /delete/i });
      expect(deleteItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('should enable Delete when views are selected', () => {
      select('MainView-0');
      showContextMenu(100, 100);
      render(() => <ContextMenu onDelete={mockOnDelete} />);
      const deleteItem = screen.getByRole('menuitem', { name: /delete/i });
      expect(deleteItem).toHaveAttribute('aria-disabled', 'false');
    });

    it('should call onDelete when Delete is clicked with selection', () => {
      select('MainView-0');
      showContextMenu(100, 100);
      render(() => <ContextMenu onDelete={mockOnDelete} />);
      const deleteItem = screen.getByRole('menuitem', { name: /delete/i });
      fireEvent.click(deleteItem);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should not call onDelete when Delete is clicked without selection', () => {
      showContextMenu(100, 100);
      render(() => <ContextMenu onDelete={mockOnDelete} />);
      const deleteItem = screen.getByRole('menuitem', { name: /delete/i });
      fireEvent.click(deleteItem);
      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('should close menu after Delete is clicked', () => {
      select('MainView-0');
      showContextMenu(100, 100);
      render(() => <ContextMenu onDelete={mockOnDelete} />);
      const deleteItem = screen.getByRole('menuitem', { name: /delete/i });
      fireEvent.click(deleteItem);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('keyboard interaction', () => {
    it('should close menu on Escape key', () => {
      showContextMenu(100, 100);
      render(() => <ContextMenu onDelete={mockOnDelete} />);
      expect(screen.getByRole('menu')).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('click outside', () => {
    it('should close menu when clicking outside', () => {
      showContextMenu(100, 100);
      render(() => (
        <div>
          <div data-testid="outside">Outside</div>
          <ContextMenu onDelete={mockOnDelete} />
        </div>
      ));
      expect(screen.getByRole('menu')).toBeInTheDocument();
      fireEvent.mouseDown(screen.getByTestId('outside'));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('event propagation', () => {
    it('should stop mousedown propagation on menu', () => {
      const parentMouseDown = vi.fn();
      showContextMenu(100, 100);
      render(() => (
        <div onMouseDown={parentMouseDown}>
          <ContextMenu onDelete={mockOnDelete} />
        </div>
      ));
      const menu = screen.getByRole('menu');
      fireEvent.mouseDown(menu);
      expect(parentMouseDown).not.toHaveBeenCalled();
    });

    it('should stop mouseup propagation on menu', () => {
      const parentMouseUp = vi.fn();
      showContextMenu(100, 100);
      render(() => (
        <div onMouseUp={parentMouseUp}>
          <ContextMenu onDelete={mockOnDelete} />
        </div>
      ));
      const menu = screen.getByRole('menu');
      fireEvent.mouseUp(menu);
      expect(parentMouseUp).not.toHaveBeenCalled();
    });
  });
});
