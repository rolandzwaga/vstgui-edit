import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { ColorItem } from '../ColorItem';

const mockUpdateColorName = vi.hoisted(() => vi.fn(() => true));
const mockUpdateColorValue = vi.hoisted(() => vi.fn(() => '#000000FF'));
const mockGetColors = vi.hoisted(() =>
  vi.fn(() => ({ Primary: '#FF0000FF', Secondary: '#00FF00FF' }))
);

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

describe('ColorItem - Validation', () => {
  beforeEach(() => {
    mockUpdateColorName.mockClear();
    mockUpdateColorValue.mockClear();
  });

  describe('given name validation', () => {
    it('should show error for empty name', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-name'));
      const input = screen.getByTestId('color-name-input');
      await user.clear(input);
      await user.keyboard('{Enter}');

      expect(mockUpdateColorName).not.toHaveBeenCalled();
      expect(screen.getByTestId('color-name-error')).toBeInTheDocument();
    });

    it('should show error for duplicate name', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-name'));
      const input = screen.getByTestId('color-name-input');
      await user.clear(input);
      await user.type(input, 'Secondary{Enter}');

      expect(mockUpdateColorName).not.toHaveBeenCalled();
      expect(screen.getByTestId('color-name-error')).toBeInTheDocument();
    });

    it('should allow same name (no change)', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-name'));
      await user.keyboard('{Enter}');

      expect(screen.queryByTestId('color-name-error')).not.toBeInTheDocument();
    });

    it('should show error styling on input', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-name'));
      const input = screen.getByTestId('color-name-input');
      await user.clear(input);
      await user.keyboard('{Enter}');

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('given value validation', () => {
    it('should show error for invalid hex format', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-value'));
      const input = screen.getByTestId('color-value-input');
      await user.clear(input);
      await user.type(input, 'invalid{Enter}');

      expect(mockUpdateColorValue).not.toHaveBeenCalled();
      expect(screen.getByTestId('color-value-error')).toBeInTheDocument();
    });

    it('should accept valid hex with alpha', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-value'));
      const input = screen.getByTestId('color-value-input');
      await user.clear(input);
      await user.type(input, '#AABBCCDD{Enter}');

      expect(mockUpdateColorValue).toHaveBeenCalledWith('Primary', '#AABBCCDD');
      expect(screen.queryByTestId('color-value-error')).not.toBeInTheDocument();
    });

    it('should accept valid hex without alpha', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-value'));
      const input = screen.getByTestId('color-value-input');
      await user.clear(input);
      await user.type(input, '#AABBCC{Enter}');

      expect(mockUpdateColorValue).toHaveBeenCalledWith('Primary', '#AABBCC');
    });

    it('should show error styling on input', async () => {
      const user = userEvent.setup();
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      await user.dblClick(screen.getByTestId('color-value'));
      const input = screen.getByTestId('color-value-input');
      await user.clear(input);
      await user.type(input, 'xyz{Enter}');

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
