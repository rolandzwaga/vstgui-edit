import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { AddColorButton } from '../AddColorButton';

describe('AddColorButton', () => {
  describe('given default state', () => {
    it('should render button with add icon', () => {
      render(() => <AddColorButton onClick={() => {}} />);

      expect(screen.getByTestId('add-color-button')).toBeInTheDocument();
    });

    it('should have accessible label', () => {
      render(() => <AddColorButton onClick={() => {}} />);

      const button = screen.getByRole('button', { name: /add color/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('given click interaction', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(() => <AddColorButton onClick={onClick} />);

      await user.click(screen.getByTestId('add-color-button'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('given disabled state', () => {
    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(() => <AddColorButton onClick={onClick} disabled />);

      const button = screen.getByTestId('add-color-button');
      expect(button).toBeDisabled();

      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('given keyboard accessibility', () => {
    it('should be focusable', () => {
      render(() => <AddColorButton onClick={() => {}} />);

      const button = screen.getByTestId('add-color-button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should trigger onClick on Enter', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(() => <AddColorButton onClick={onClick} />);

      const button = screen.getByTestId('add-color-button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
