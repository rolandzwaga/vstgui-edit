import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { ColorItem } from '../ColorItem';

vi.mock('../../../stores/documentStore', () => ({
  getColors: vi.fn(() => ({ Primary: '#FF0000FF' })),
  updateColorName: vi.fn(() => true),
  updateColorValue: vi.fn(() => '#000000FF'),
}));

vi.mock('../../../stores/historyStore', () => ({
  pushOperation: vi.fn(),
}));

vi.mock('../../../domain/colors/historyOperations', () => ({
  createEditColorNameOperation: vi.fn(() => ({ type: 'edit-color-name' })),
  createEditColorValueOperation: vi.fn(() => ({ type: 'edit-color-value' })),
}));

describe('ColorItem - Usage Badge', () => {
  describe('given usageCount prop', () => {
    it('should show usage badge when count > 0', () => {
      render(() => <ColorItem name="Primary" value="#FF0000FF" usageCount={3} />);

      expect(screen.getByTestId('usage-badge')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should not show usage badge when count is 0', () => {
      render(() => <ColorItem name="Primary" value="#FF0000FF" usageCount={0} />);

      expect(screen.queryByTestId('usage-badge')).not.toBeInTheDocument();
    });

    it('should not show usage badge when count is undefined', () => {
      render(() => <ColorItem name="Primary" value="#FF0000FF" />);

      expect(screen.queryByTestId('usage-badge')).not.toBeInTheDocument();
    });
  });

  describe('given usage badge click', () => {
    it('should call onUsageClick when badge clicked', async () => {
      const onUsageClick = vi.fn();
      const user = userEvent.setup();
      render(() => (
        <ColorItem
          name="Primary"
          value="#FF0000FF"
          usageCount={3}
          onUsageClick={onUsageClick}
        />
      ));

      await user.click(screen.getByTestId('usage-badge'));

      expect(onUsageClick).toHaveBeenCalledWith('Primary');
    });
  });

  describe('given badge accessibility', () => {
    it('should have aria-label', () => {
      render(() => <ColorItem name="Primary" value="#FF0000FF" usageCount={3} />);

      const badge = screen.getByTestId('usage-badge');
      expect(badge).toHaveAttribute('aria-label', '3 usages');
    });

    it('should use singular for 1 usage', () => {
      render(() => <ColorItem name="Primary" value="#FF0000FF" usageCount={1} />);

      const badge = screen.getByTestId('usage-badge');
      expect(badge).toHaveAttribute('aria-label', '1 usage');
    });
  });
});
