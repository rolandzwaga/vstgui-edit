/**
 * Tests for ModeToggle component
 * Find/Replace mode toggle buttons.
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { ModeToggle } from '../ModeToggle';
import type { FindPanelMode } from '../../../types/search';

describe('ModeToggle', () => {
  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render Find button', () => {
      render(() => <ModeToggle mode="find" onModeChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Find' })).toBeInTheDocument();
    });

    it('should render Replace button', () => {
      render(() => <ModeToggle mode="find" onModeChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Replace' })).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('should highlight Find button when in find mode', () => {
      const { container } = render(() => <ModeToggle mode="find" onModeChange={vi.fn()} />);

      const findButton = screen.getByRole('button', { name: 'Find' });
      expect(findButton.className).toContain('Active');
    });

    it('should highlight Replace button when in replace mode', () => {
      const { container } = render(() => <ModeToggle mode="replace" onModeChange={vi.fn()} />);

      const replaceButton = screen.getByRole('button', { name: 'Replace' });
      expect(replaceButton.className).toContain('Active');
    });

    it('should not highlight Find button when in replace mode', () => {
      render(() => <ModeToggle mode="replace" onModeChange={vi.fn()} />);

      const findButton = screen.getByRole('button', { name: 'Find' });
      expect(findButton.className).not.toContain('Active');
    });
  });

  describe('mode change', () => {
    it('should call onModeChange with find when Find is clicked', () => {
      const onModeChange = vi.fn();
      render(() => <ModeToggle mode="replace" onModeChange={onModeChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Find' }));

      expect(onModeChange).toHaveBeenCalledWith('find');
    });

    it('should call onModeChange with replace when Replace is clicked', () => {
      const onModeChange = vi.fn();
      render(() => <ModeToggle mode="find" onModeChange={onModeChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Replace' }));

      expect(onModeChange).toHaveBeenCalledWith('replace');
    });

    it('should not call onModeChange when clicking active mode', () => {
      const onModeChange = vi.fn();
      render(() => <ModeToggle mode="find" onModeChange={onModeChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Find' }));

      expect(onModeChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have aria-pressed for Find button', () => {
      render(() => <ModeToggle mode="find" onModeChange={vi.fn()} />);

      const findButton = screen.getByRole('button', { name: 'Find' });
      expect(findButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have aria-pressed false for inactive mode', () => {
      render(() => <ModeToggle mode="find" onModeChange={vi.fn()} />);

      const replaceButton = screen.getByRole('button', { name: 'Replace' });
      expect(replaceButton).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
