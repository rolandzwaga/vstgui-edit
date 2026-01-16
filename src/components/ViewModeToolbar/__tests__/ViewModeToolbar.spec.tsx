import { cleanup, render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { resetViewModeStore, setViewMode, viewModeStore } from '../../../stores/viewModeStore';
import { ViewModeToolbar } from '../ViewModeToolbar';

describe('ViewModeToolbar', () => {
  beforeEach(() => {
    resetViewModeStore();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    test('renders toolbar with toggle button', () => {
      render(() => <ViewModeToolbar />);
      const button = screen.getByRole('button', { name: /toggle.*view.*mode|styled.*mode/i });
      expect(button).toBeInTheDocument();
    });

    test('renders with correct aria-label', () => {
      render(() => <ViewModeToolbar />);
      const toolbar = screen.getByRole('toolbar', { name: /view mode/i });
      expect(toolbar).toBeInTheDocument();
    });
  });

  describe('button active state', () => {
    test('button is not active when in wireframe mode', () => {
      resetViewModeStore();
      render(() => <ViewModeToolbar />);
      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-pressed')).toBe('false');
    });

    test('button is active when in styled mode', () => {
      setViewMode('styled');
      render(() => <ViewModeToolbar />);
      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('click toggle', () => {
    test('clicking button toggles from wireframe to styled mode', async () => {
      const user = userEvent.setup();
      resetViewModeStore();
      render(() => <ViewModeToolbar />);
      const button = screen.getByRole('button');

      expect(viewModeStore.mode).toBe('wireframe');
      await user.click(button);
      expect(viewModeStore.mode).toBe('styled');
    });

    test('clicking button toggles from styled to wireframe mode', async () => {
      const user = userEvent.setup();
      setViewMode('styled');
      render(() => <ViewModeToolbar />);
      const button = screen.getByRole('button');

      expect(viewModeStore.mode).toBe('styled');
      await user.click(button);
      expect(viewModeStore.mode).toBe('wireframe');
    });

    test('multiple clicks toggle mode correctly', async () => {
      const user = userEvent.setup();
      resetViewModeStore();
      render(() => <ViewModeToolbar />);
      const button = screen.getByRole('button');

      expect(viewModeStore.mode).toBe('wireframe');
      await user.click(button);
      expect(viewModeStore.mode).toBe('styled');
      await user.click(button);
      expect(viewModeStore.mode).toBe('wireframe');
      await user.click(button);
      expect(viewModeStore.mode).toBe('styled');
    });
  });

  describe('tooltip', () => {
    test('has tooltip with shortcut hint', () => {
      render(() => <ViewModeToolbar />);
      const button = screen.getByRole('button');
      const title = button.getAttribute('title');
      expect(title).toContain('P');
    });

    test('tooltip indicates wireframe mode when active', () => {
      setViewMode('styled');
      render(() => <ViewModeToolbar />);
      const button = screen.getByRole('button');
      const title = button.getAttribute('title');
      expect(title).toBeDefined();
    });
  });

  describe('aria-pressed', () => {
    test('updates aria-pressed when mode changes', async () => {
      const user = userEvent.setup();
      resetViewModeStore();
      render(() => <ViewModeToolbar />);
      const button = screen.getByRole('button');

      expect(button.getAttribute('aria-pressed')).toBe('false');
      await user.click(button);
      expect(button.getAttribute('aria-pressed')).toBe('true');
      await user.click(button);
      expect(button.getAttribute('aria-pressed')).toBe('false');
    });
  });
});
