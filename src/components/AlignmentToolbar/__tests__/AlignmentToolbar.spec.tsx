import { fireEvent, render, screen } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { clearSelection, select, selectionStore, toggleSelect } from '../../../stores/selectionStore';
import { AlignmentToolbar } from '../AlignmentToolbar';

// Mock document store to provide view data
const mockViews: Record<string, { parentId: string | null }> = {
  root: { parentId: null },
  view1: { parentId: 'root' },
  view2: { parentId: 'root' },
  view3: { parentId: 'root' },
  view4: { parentId: 'root' },
};

vi.mock('../../../stores/documentStore', () => ({
  documentStore: {
    getParentId: (id: string) => mockViews[id]?.parentId ?? null,
    getView: (id: string) => mockViews[id] ? { id, parentId: mockViews[id].parentId } : null,
  },
  getParentId: (id: string) => mockViews[id]?.parentId ?? null,
  updateViewOrigin: vi.fn(),
}));

describe('AlignmentToolbar', () => {
  beforeEach(() => {
    clearSelection();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearSelection();
  });

  describe('button enable/disable states', () => {
    it('disables all buttons when no selection', () => {
      testInRoot(() => {
        render(() => <AlignmentToolbar />);

        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
          expect(button).toBeDisabled();
        });
      });
    });

    it('disables all buttons when only root view selected', () => {
      testInRoot(() => {
        select('root');
        render(() => <AlignmentToolbar />);

        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
          expect(button).toBeDisabled();
        });
      });
    });

    it('enables alignment buttons when 1 non-root view selected', () => {
      testInRoot(() => {
        select('view1');
        render(() => <AlignmentToolbar />);

        // Alignment buttons should be enabled
        const alignLeftBtn = screen.getByRole('button', { name: /align left/i });
        expect(alignLeftBtn).not.toBeDisabled();

        // Distribution buttons should still be disabled (need 3+ views)
        const distHorizBtn = screen.getByRole('button', { name: /distribute horizontal/i });
        expect(distHorizBtn).toBeDisabled();
      });
    });

    it('enables alignment buttons when 2+ views selected', () => {
      testInRoot(() => {
        select('view1');
        toggleSelect('view2');
        render(() => <AlignmentToolbar />);

        const alignLeftBtn = screen.getByRole('button', { name: /align left/i });
        const alignCenterBtn = screen.getByRole('button', { name: /align center/i });
        const alignRightBtn = screen.getByRole('button', { name: /align right/i });
        const alignTopBtn = screen.getByRole('button', { name: /align top/i });
        const alignMiddleBtn = screen.getByRole('button', { name: /align middle/i });
        const alignBottomBtn = screen.getByRole('button', { name: /align bottom/i });

        expect(alignLeftBtn).not.toBeDisabled();
        expect(alignCenterBtn).not.toBeDisabled();
        expect(alignRightBtn).not.toBeDisabled();
        expect(alignTopBtn).not.toBeDisabled();
        expect(alignMiddleBtn).not.toBeDisabled();
        expect(alignBottomBtn).not.toBeDisabled();
      });
    });

    it('disables distribution buttons when < 3 views selected', () => {
      testInRoot(() => {
        select('view1');
        toggleSelect('view2');
        render(() => <AlignmentToolbar />);

        const distHorizBtn = screen.getByRole('button', { name: /distribute horizontal/i });
        const distVertBtn = screen.getByRole('button', { name: /distribute vertical/i });

        expect(distHorizBtn).toBeDisabled();
        expect(distVertBtn).toBeDisabled();
      });
    });

    it('enables distribution buttons when 3+ views selected', () => {
      testInRoot(() => {
        select('view1');
        toggleSelect('view2');
        toggleSelect('view3');
        render(() => <AlignmentToolbar />);

        const distHorizBtn = screen.getByRole('button', { name: /distribute horizontal/i });
        const distVertBtn = screen.getByRole('button', { name: /distribute vertical/i });

        expect(distHorizBtn).not.toBeDisabled();
        expect(distVertBtn).not.toBeDisabled();
      });
    });
  });

  describe('button grouping', () => {
    it('groups buttons correctly (horizontal, vertical, distribution)', () => {
      testInRoot(() => {
        render(() => <AlignmentToolbar />);

        const toolbar = screen.getByRole('toolbar');
        expect(toolbar).toBeInTheDocument();

        // Check that all button groups are present
        const groups = toolbar.querySelectorAll('[data-testid="button-group"]');
        expect(groups.length).toBe(3);
      });
    });
  });

  describe('ARIA attributes', () => {
    it('has role="toolbar"', () => {
      testInRoot(() => {
        render(() => <AlignmentToolbar />);

        const toolbar = screen.getByRole('toolbar');
        expect(toolbar).toBeInTheDocument();
      });
    });

    it('has aria-label', () => {
      testInRoot(() => {
        render(() => <AlignmentToolbar />);

        const toolbar = screen.getByRole('toolbar', { name: /alignment/i });
        expect(toolbar).toBeInTheDocument();
      });
    });
  });

  describe('button interactions', () => {
    it('triggers alignment operation when alignment button clicked', () => {
      testInRoot(() => {
        // Select some views
        select('view1');
        toggleSelect('view2');

        render(() => <AlignmentToolbar />);

        const alignLeftBtn = screen.getByRole('button', { name: /align left/i });

        // Should not throw when clicked
        expect(() => fireEvent.click(alignLeftBtn)).not.toThrow();
      });
    });
  });

  describe('tooltips with keyboard shortcuts', () => {
    it('shows keyboard shortcut in tooltip for align left', () => {
      testInRoot(() => {
        render(() => <AlignmentToolbar />);

        const alignLeftBtn = screen.getByRole('button', { name: /align left/i });
        expect(alignLeftBtn.getAttribute('title')).toContain('Ctrl+Shift+L');
      });
    });

    it('shows keyboard shortcut in tooltip for align center', () => {
      testInRoot(() => {
        render(() => <AlignmentToolbar />);

        const alignCenterBtn = screen.getByRole('button', { name: /align center/i });
        expect(alignCenterBtn.getAttribute('title')).toContain('Ctrl+Shift+C');
      });
    });

    it('shows keyboard shortcut in tooltip for align right', () => {
      testInRoot(() => {
        render(() => <AlignmentToolbar />);

        const alignRightBtn = screen.getByRole('button', { name: /align right/i });
        expect(alignRightBtn.getAttribute('title')).toContain('Ctrl+Shift+R');
      });
    });
  });
});
