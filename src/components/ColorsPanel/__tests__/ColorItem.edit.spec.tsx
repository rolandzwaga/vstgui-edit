import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { ColorItem } from '../ColorItem';

const mockUpdateColorName = vi.hoisted(() => vi.fn(() => true));
const mockUpdateColorValue = vi.hoisted(() => vi.fn(() => '#000000FF'));
const mockGetColors = vi.hoisted(() => vi.fn(() => ({ Primary: '#FF0000FF' })));

vi.mock('../../../stores/documentStore', () => ({
  updateColorName: mockUpdateColorName,
  updateColorValue: mockUpdateColorValue,
  getColors: mockGetColors,
}));

vi.mock('../../../stores/historyStore', () => ({
  pushOperation: vi.fn(),
}));

vi.mock('../../../domain/colors/historyOperations', () => ({
  createEditColorNameOperation: vi.fn(() => ({ type: 'edit-color-name' })),
  createEditColorValueOperation: vi.fn(() => ({ type: 'edit-color-value' })),
}));

describe('ColorItem - Edit Mode', () => {
  beforeEach(() => {
    mockUpdateColorName.mockClear();
    mockUpdateColorValue.mockClear();
    mockGetColors.mockReturnValue({ Primary: '#FF0000FF' });
  });

  describe('given name editing', () => {
    it('should enter edit mode on double-click name', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-name'));

      expect(screen.getByTestId('color-name-input')).toBeInTheDocument();
    });

    it('should show current name in input', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-name'));

      const input = screen.getByTestId('color-name-input') as HTMLInputElement;
      expect(input.value).toBe('Primary');
    });

    it('should save name on blur', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-name'));
      const input = screen.getByTestId('color-name-input');
      await user.clear(input);
      await user.type(input, 'NewName');
      await user.tab();

      expect(mockUpdateColorName).toHaveBeenCalledWith('Primary', 'NewName');
    });

    it('should save name on Enter', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-name'));
      const input = screen.getByTestId('color-name-input');
      await user.clear(input);
      await user.type(input, 'NewName{Enter}');

      expect(mockUpdateColorName).toHaveBeenCalledWith('Primary', 'NewName');
    });

    it('should cancel edit on Escape', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-name'));
      const input = screen.getByTestId('color-name-input');
      await user.clear(input);
      await user.type(input, 'NewName{Escape}');

      expect(mockUpdateColorName).not.toHaveBeenCalled();
      expect(screen.queryByTestId('color-name-input')).not.toBeInTheDocument();
    });

    it('should not save if name unchanged', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-name'));
      await user.keyboard('{Enter}');

      expect(mockUpdateColorName).not.toHaveBeenCalled();
    });
  });

  describe('given value editing', () => {
    it('should open color picker on double-click value', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-value'));

      // Color picker core should be rendered in a floating dropdown
      await waitFor(() => {
        expect(screen.getByTestId('hue-slider')).toBeInTheDocument();
      });
    });

    it('should not open picker when readonly', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" isReadOnly />);

      await user.dblClick(screen.getByTestId('color-value'));

      // Picker should not open
      expect(screen.queryByTestId('hue-slider')).not.toBeInTheDocument();
    });
  });

  describe('given readonly mode', () => {
    it('should not enter edit mode on double-click when readonly', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" isReadOnly />);

      await user.dblClick(screen.getByTestId('color-name'));

      expect(screen.queryByTestId('color-name-input')).not.toBeInTheDocument();
    });
  });
});
