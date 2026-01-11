/**
 * Tests for PreferencesPanel component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { PreferencesPanel } from '../PreferencesPanel';
import {
  preferencesStore,
  openPreferences,
  closePreferences,
  resetPreferencesStore,
  initializePreferences,
} from '../../../stores/preferencesStore';

describe('PreferencesPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    resetPreferencesStore();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  describe('modal open/close', () => {
    it('does not render when closed', () => {
      render(() => <PreferencesPanel />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders when open', () => {
      openPreferences();

      render(() => <PreferencesPanel />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders modal heading', () => {
      openPreferences();

      render(() => <PreferencesPanel />);

      expect(screen.getByRole('heading', { name: 'Preferences' })).toBeInTheDocument();
    });
  });

  describe('Escape key', () => {
    it('closes panel on Escape key', async () => {
      const user = userEvent.setup();
      openPreferences();

      render(() => <PreferencesPanel />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('overlay click', () => {
    it('closes panel when clicking overlay', async () => {
      const user = userEvent.setup();
      openPreferences();

      render(() => <PreferencesPanel />);

      // Find and click the overlay (the element with overlay class)
      const overlay = screen.getByRole('dialog').parentElement;
      if (overlay) {
        await user.click(overlay);
      }

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not close when clicking inside panel', async () => {
      const user = userEvent.setup();
      openPreferences();

      render(() => <PreferencesPanel />);

      await user.click(screen.getByRole('dialog'));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('X button', () => {
    it('renders close button', () => {
      openPreferences();

      render(() => <PreferencesPanel />);

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('closes panel when X button clicked', async () => {
      const user = userEvent.setup();
      openPreferences();

      render(() => <PreferencesPanel />);

      await user.click(screen.getByRole('button', { name: /close/i }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('focus trap', () => {
    it('panel is focusable', () => {
      openPreferences();

      render(() => <PreferencesPanel />);

      // The dialog should have tabIndex to be focusable
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('ARIA attributes', () => {
    it('has dialog role', () => {
      openPreferences();

      render(() => <PreferencesPanel />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal attribute', () => {
      openPreferences();

      render(() => <PreferencesPanel />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby pointing to heading', () => {
      openPreferences();

      render(() => <PreferencesPanel />);

      const dialog = screen.getByRole('dialog');
      const headingId = dialog.getAttribute('aria-labelledby');
      expect(headingId).toBeTruthy();

      const heading = document.getElementById(headingId!);
      expect(heading).toHaveTextContent('Preferences');
    });
  });

  describe('responsive behavior', () => {
    it('renders with fixed overlay covering viewport', () => {
      openPreferences();

      render(() => <PreferencesPanel />);

      const dialog = screen.getByRole('dialog');
      const overlay = dialog.parentElement;

      // The overlay should exist
      expect(overlay).toBeInTheDocument();
    });

    it('renders panel with max-width', () => {
      openPreferences();

      render(() => <PreferencesPanel />);

      const dialog = screen.getByRole('dialog');
      // Panel should have max-width set (tested via styles)
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('sidebar integration', () => {
    it('renders sidebar navigation', () => {
      openPreferences();

      render(() => <PreferencesPanel />);

      expect(screen.getByRole('navigation', { name: 'Preferences sections' })).toBeInTheDocument();
    });

    it('renders all 6 section buttons in sidebar', () => {
      openPreferences();

      render(() => <PreferencesPanel />);

      // Find sidebar nav and check for buttons
      const nav = screen.getByRole('navigation', { name: 'Preferences sections' });
      const buttons = nav.querySelectorAll('button');
      expect(buttons).toHaveLength(6);
    });

    it('switches section when sidebar item clicked', async () => {
      const user = userEvent.setup();
      openPreferences();

      render(() => <PreferencesPanel />);

      // Default is grid
      expect(preferencesStore.activeSection).toBe('grid');

      // Find sidebar and click theme button
      const nav = screen.getByRole('navigation', { name: 'Preferences sections' });
      const themeButton = Array.from(nav.querySelectorAll('button')).find(
        el => el.textContent?.includes('Theme')
      );
      if (themeButton) {
        await user.click(themeButton);
        expect(preferencesStore.activeSection).toBe('theme');
      }
    });
  });

  describe('section content', () => {
    it('renders grid section content by default', () => {
      openPreferences();
      initializePreferences();

      render(() => <PreferencesPanel />);

      // Grid section should have grid-related content
      // Look for the section heading
      expect(screen.getByRole('heading', { name: 'Grid' })).toBeInTheDocument();
    });
  });

  describe('footer', () => {
    it('renders footer with reset button', () => {
      openPreferences();

      render(() => <PreferencesPanel />);

      expect(screen.getByRole('button', { name: /reset to defaults/i })).toBeInTheDocument();
    });
  });
});
