import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { AddGradientButton } from '../AddGradientButton';

describe('AddGradientButton', () => {
  describe('given default state', () => {
    it('should render button with add icon', () => {
      render(() => <AddGradientButton onClick={() => {}} />);

      expect(screen.getByTestId('add-gradient-button')).toBeInTheDocument();
    });

    it('should have accessible label', () => {
      render(() => <AddGradientButton onClick={() => {}} />);

      const button = screen.getByRole('button', { name: /add gradient/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('given click interaction', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(() => <AddGradientButton onClick={onClick} />);

      await user.click(screen.getByTestId('add-gradient-button'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('given disabled state', () => {
    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(() => <AddGradientButton onClick={onClick} disabled />);

      const button = screen.getByTestId('add-gradient-button');
      expect(button).toBeDisabled();

      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('given keyboard accessibility', () => {
    it('should be focusable', () => {
      render(() => <AddGradientButton onClick={() => {}} />);

      const button = screen.getByTestId('add-gradient-button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should trigger onClick on Enter', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(() => <AddGradientButton onClick={onClick} />);

      const button = screen.getByTestId('add-gradient-button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
