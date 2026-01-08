import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import type { GradientColorStop } from '../../../types/uidesc';
import { GradientsPanel } from '../GradientsPanel';

const mockGradients: Record<string, GradientColorStop[]> = {
  TestGradient: [
    { rgba: '#000000FF', start: '0.00' },
    { rgba: '#FFFFFFFF', start: '1.00' },
  ],
};

const mockGetGradients = vi.hoisted(() => vi.fn(() => mockGradients));
const mockDeleteGradient = vi.hoisted(() => vi.fn(() => ({ removedReferences: [] })));
const mockFindGradientUsages = vi.hoisted(() =>
  vi.fn((): { viewId: string; viewClass: string; attribute: string }[] => [])
);

vi.mock('../../../stores/documentStore', () => ({
  getGradients: mockGetGradients,
  addGradient: vi.fn(),
  deleteGradient: mockDeleteGradient,
  updateGradientName: vi.fn(() => true),
  updateGradientStops: vi.fn(() => []),
  updateViewAttribute: vi.fn(),
  documentStore: { document: {} },
}));

vi.mock('../../../stores/historyStore', () => ({
  pushOperation: vi.fn(),
}));

vi.mock('../../../domain/gradients/historyOperations', () => ({
  initGradientHistoryOperations: vi.fn(),
  createAddGradientOperation: vi.fn(() => ({ type: 'add-gradient' })),
  createDeleteGradientOperation: vi.fn(() => ({ type: 'delete-gradient' })),
  createEditGradientNameOperation: vi.fn(() => ({ type: 'edit-gradient-name' })),
  createEditGradientStopsOperation: vi.fn(() => ({ type: 'edit-gradient-stops' })),
}));

vi.mock('../../../domain/gradients/usage', () => ({
  findGradientUsages: mockFindGradientUsages,
}));

async function expandSection() {
  const header = screen.getByRole('button', { name: /Gradients/i });
  await fireEvent.click(header);
}

describe('GradientsPanel - Delete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetGradients.mockReturnValue(mockGradients);
    mockFindGradientUsages.mockReturnValue([]);
  });

  describe('given gradient with no usages', () => {
    it('should delete immediately without confirmation', async () => {
      const user = userEvent.setup();
      render(() => <GradientsPanel />);
      await expandSection();

      const item = screen.getByTestId('gradient-item');
      await user.hover(item);

      const deleteButton = screen.getByTestId('delete-gradient-button');
      await user.click(deleteButton);

      expect(mockDeleteGradient).toHaveBeenCalledWith('TestGradient');
      expect(screen.queryByTestId('delete-confirm-dialog')).not.toBeInTheDocument();
    });
  });

  describe('given gradient with usages', () => {
    beforeEach(() => {
      mockFindGradientUsages.mockReturnValue([
        { viewId: 'view1', viewClass: 'CView', attribute: 'gradient' },
      ]);
    });

    it('should show confirmation dialog', async () => {
      const user = userEvent.setup();
      render(() => <GradientsPanel />);
      await expandSection();

      const item = screen.getByTestId('gradient-item');
      await user.hover(item);

      const deleteButton = screen.getByTestId('delete-gradient-button');
      await user.click(deleteButton);

      const dialog = screen.getByTestId('delete-confirm-dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveTextContent(/TestGradient/);
      expect(dialog).toHaveTextContent(/1 view/);
    });

    it('should show plural views message for multiple usages', async () => {
      mockFindGradientUsages.mockReturnValue([
        { viewId: 'view1', viewClass: 'CView', attribute: 'gradient' },
        { viewId: 'view2', viewClass: 'CTextButton', attribute: 'gradient' },
      ]);

      const user = userEvent.setup();
      render(() => <GradientsPanel />);
      await expandSection();

      const item = screen.getByTestId('gradient-item');
      await user.hover(item);

      const deleteButton = screen.getByTestId('delete-gradient-button');
      await user.click(deleteButton);

      expect(screen.getByText(/2 views/)).toBeInTheDocument();
    });

    it('should delete when confirm button clicked', async () => {
      const user = userEvent.setup();
      render(() => <GradientsPanel />);
      await expandSection();

      const item = screen.getByTestId('gradient-item');
      await user.hover(item);

      const deleteButton = screen.getByTestId('delete-gradient-button');
      await user.click(deleteButton);

      const confirmButton = screen.getByTestId('confirm-delete');
      await user.click(confirmButton);

      expect(mockDeleteGradient).toHaveBeenCalledWith('TestGradient');
      expect(screen.queryByTestId('delete-confirm-dialog')).not.toBeInTheDocument();
    });

    it('should close dialog when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(() => <GradientsPanel />);
      await expandSection();

      const item = screen.getByTestId('gradient-item');
      await user.hover(item);

      const deleteButton = screen.getByTestId('delete-gradient-button');
      await user.click(deleteButton);

      const cancelButton = screen.getByTestId('cancel-delete');
      await user.click(cancelButton);

      expect(mockDeleteGradient).not.toHaveBeenCalled();
      expect(screen.queryByTestId('delete-confirm-dialog')).not.toBeInTheDocument();
    });
  });

  describe('given usage popover', () => {
    beforeEach(() => {
      mockFindGradientUsages.mockReturnValue([
        { viewId: 'view1', viewClass: 'CView', attribute: 'gradient' },
        { viewId: 'view2', viewClass: 'CTextButton', attribute: 'gradient' },
      ]);
    });

    it('should show usage badge with count', async () => {
      render(() => <GradientsPanel />);
      await expandSection();

      const badge = screen.getByTestId('usage-badge');
      expect(badge).toHaveTextContent('2');
    });

    it('should open usage popover when badge clicked', async () => {
      const user = userEvent.setup();
      render(() => <GradientsPanel />);
      await expandSection();

      const badge = screen.getByTestId('usage-badge');
      await user.click(badge);

      expect(screen.getByTestId('usage-popover')).toBeInTheDocument();
      expect(screen.getByText(/Uses of "TestGradient"/)).toBeInTheDocument();
    });

    it('should show usage details in popover', async () => {
      const user = userEvent.setup();
      render(() => <GradientsPanel />);
      await expandSection();

      const badge = screen.getByTestId('usage-badge');
      await user.click(badge);

      expect(screen.getByText('CView')).toBeInTheDocument();
      expect(screen.getByText('CTextButton')).toBeInTheDocument();
    });

    it('should close popover when close button clicked', async () => {
      const user = userEvent.setup();
      render(() => <GradientsPanel />);
      await expandSection();

      const badge = screen.getByTestId('usage-badge');
      await user.click(badge);

      const closeButton = screen.getByTestId('close-usage-popover');
      await user.click(closeButton);

      expect(screen.queryByTestId('usage-popover')).not.toBeInTheDocument();
    });
  });
});
