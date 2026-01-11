/**
 * Tests for PreferencesButton component
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { PreferencesButton } from '../PreferencesButton';
import { preferencesStore, resetPreferencesStore, closePreferences } from '../../../stores/preferencesStore';

describe('PreferencesButton', () => {
  beforeEach(() => {
    localStorage.clear();
    resetPreferencesStore();
  });

  afterEach(() => {
    cleanup();
    closePreferences();
    localStorage.clear();
  });

  describe('render', () => {
    it('renders button', () => {
      render(() => <PreferencesButton />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with accessible label', () => {
      render(() => <PreferencesButton />);

      expect(screen.getByRole('button', { name: /preferences/i })).toBeInTheDocument();
    });

    it('renders gear icon', () => {
      render(() => <PreferencesButton />);

      const button = screen.getByRole('button');
      // Button should contain an SVG (gear icon)
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('click opens panel', () => {
    it('opens preferences panel when clicked', async () => {
      const user = userEvent.setup();

      render(() => <PreferencesButton />);

      expect(preferencesStore.isOpen).toBe(false);

      await user.click(screen.getByRole('button'));

      expect(preferencesStore.isOpen).toBe(true);
    });
  });

  describe('tooltip', () => {
    it('has title attribute for tooltip', () => {
      render(() => <PreferencesButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Preferences (Ctrl+,)');
    });
  });
});
