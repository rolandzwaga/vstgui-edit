import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { ColorItem } from '../ColorItem';

const mockDeleteColor = vi.hoisted(() => vi.fn(() => '#FF0000FF'));
const mockGetColors = vi.hoisted(() => vi.fn(() => ({ Primary: '#FF0000FF' })));

vi.mock('../../../stores/documentStore', () => ({
  deleteColor: mockDeleteColor,
  getColors: mockGetColors,
  updateColorName: vi.fn(() => true),
  updateColorValue: vi.fn(() => '#000000FF'),
  documentStore: { document: null },
}));

vi.mock('../../../stores/historyStore', () => ({
  pushOperation: vi.fn(),
}));

vi.mock('../../../domain/colors/historyOperations', () => ({
  createDeleteColorOperation: vi.fn(() => ({ type: 'delete-color' })),
  createEditColorNameOperation: vi.fn(() => ({ type: 'edit-color-name' })),
  createEditColorValueOperation: vi.fn(() => ({ type: 'edit-color-value' })),
}));

describe('ColorItem - Delete', () => {
  beforeEach(() => {
    mockDeleteColor.mockClear();
  });

  describe('given delete button', () => {
    it('should render delete button on hover', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" onDelete={() => {}} />);

      const item = screen.getByTestId('color-item');
      await user.hover(item);

      expect(screen.getByTestId('delete-color-button')).toBeInTheDocument();
    });

    it('should have accessible label', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" onDelete={() => {}} />);

      const item = screen.getByTestId('color-item');
      await user.hover(item);

      const button = screen.getByRole('button', { name: /delete/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('given delete click with no usages', () => {
    it('should call onDelete callback', async () => {
      const onDelete = vi.fn();
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" onDelete={onDelete} />);

      const item = screen.getByTestId('color-item');
      await user.hover(item);
      await user.click(screen.getByTestId('delete-color-button'));

      expect(onDelete).toHaveBeenCalledWith('Primary');
    });
  });

  describe('given readonly mode', () => {
    it('should not show delete button', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" isReadOnly />);

      const item = screen.getByTestId('color-item');
      await user.hover(item);

      expect(screen.queryByTestId('delete-color-button')).not.toBeInTheDocument();
    });
  });
});
