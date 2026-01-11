/**
 * Tests for PreferencesSidebar component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { PreferencesSidebar } from '../PreferencesSidebar';
import type { PreferencesSection } from '../../../types/preferences';

describe('PreferencesSidebar', () => {
  describe('render 6 sections', () => {
    it('renders Grid section', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={() => {}}
        />
      ));

      expect(screen.getByRole('button', { name: /grid/i })).toBeInTheDocument();
    });

    it('renders Snap section', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={() => {}}
        />
      ));

      expect(screen.getByRole('button', { name: /snap/i })).toBeInTheDocument();
    });

    it('renders Smart Guides section', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={() => {}}
        />
      ));

      expect(screen.getByRole('button', { name: /smart guides/i })).toBeInTheDocument();
    });

    it('renders Custom Guides section', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={() => {}}
        />
      ));

      expect(screen.getByRole('button', { name: /custom guides/i })).toBeInTheDocument();
    });

    it('renders Theme section', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={() => {}}
        />
      ));

      expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument();
    });

    it('renders Keyboard Shortcuts section', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={() => {}}
        />
      ));

      expect(screen.getByRole('button', { name: /keyboard shortcuts/i })).toBeInTheDocument();
    });

    it('renders exactly 6 section buttons', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={() => {}}
        />
      ));

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6);
    });
  });

  describe('active state', () => {
    it('applies active style to grid section when active', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={() => {}}
        />
      ));

      const gridButton = screen.getByRole('button', { name: /grid/i });
      expect(gridButton).toHaveAttribute('aria-selected', 'true');
    });

    it('applies active style to snap section when active', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="snap"
          onSectionChange={() => {}}
        />
      ));

      const snapButton = screen.getByRole('button', { name: /^snap$/i });
      expect(snapButton).toHaveAttribute('aria-selected', 'true');
    });

    it('applies active style to shortcuts section when active', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="shortcuts"
          onSectionChange={() => {}}
        />
      ));

      const shortcutsButton = screen.getByRole('button', { name: /keyboard shortcuts/i });
      expect(shortcutsButton).toHaveAttribute('aria-selected', 'true');
    });

    it('only one section is active at a time', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="theme"
          onSectionChange={() => {}}
        />
      ));

      const buttons = screen.getAllByRole('button');
      const selectedButtons = buttons.filter(b => b.getAttribute('aria-selected') === 'true');
      expect(selectedButtons).toHaveLength(1);
    });
  });

  describe('section change callback', () => {
    it('calls onSectionChange with grid when grid clicked', async () => {
      const onSectionChange = vi.fn();
      const user = userEvent.setup();

      render(() => (
        <PreferencesSidebar
          activeSection="snap"
          onSectionChange={onSectionChange}
        />
      ));

      await user.click(screen.getByRole('button', { name: /grid/i }));
      expect(onSectionChange).toHaveBeenCalledWith('grid');
    });

    it('calls onSectionChange with snap when snap clicked', async () => {
      const onSectionChange = vi.fn();
      const user = userEvent.setup();

      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={onSectionChange}
        />
      ));

      await user.click(screen.getByRole('button', { name: /^snap$/i }));
      expect(onSectionChange).toHaveBeenCalledWith('snap');
    });

    it('calls onSectionChange with shortcuts when shortcuts clicked', async () => {
      const onSectionChange = vi.fn();
      const user = userEvent.setup();

      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={onSectionChange}
        />
      ));

      await user.click(screen.getByRole('button', { name: /keyboard shortcuts/i }));
      expect(onSectionChange).toHaveBeenCalledWith('shortcuts');
    });

    it('calls onSectionChange for all sections', async () => {
      const onSectionChange = vi.fn();
      const user = userEvent.setup();

      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={onSectionChange}
        />
      ));

      const sections: Array<{ name: RegExp; id: PreferencesSection }> = [
        { name: /grid/i, id: 'grid' },
        { name: /^snap$/i, id: 'snap' },
        { name: /smart guides/i, id: 'smartGuides' },
        { name: /custom guides/i, id: 'customGuides' },
        { name: /theme/i, id: 'theme' },
        { name: /keyboard shortcuts/i, id: 'shortcuts' },
      ];

      for (const section of sections) {
        await user.click(screen.getByRole('button', { name: section.name }));
        expect(onSectionChange).toHaveBeenCalledWith(section.id);
      }
    });
  });

  describe('keyboard navigation', () => {
    it('sections are focusable', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={() => {}}
        />
      ));

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('activates section on Enter key', async () => {
      const onSectionChange = vi.fn();
      const user = userEvent.setup();

      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={onSectionChange}
        />
      ));

      const snapButton = screen.getByRole('button', { name: /^snap$/i });
      snapButton.focus();
      await user.keyboard('{Enter}');

      expect(onSectionChange).toHaveBeenCalledWith('snap');
    });

    it('activates section on Space key', async () => {
      const onSectionChange = vi.fn();
      const user = userEvent.setup();

      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={onSectionChange}
        />
      ));

      const themeButton = screen.getByRole('button', { name: /theme/i });
      themeButton.focus();
      await user.keyboard(' ');

      expect(onSectionChange).toHaveBeenCalledWith('theme');
    });
  });

  describe('accessibility', () => {
    it('has navigation role', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={() => {}}
        />
      ));

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('has accessible label', () => {
      render(() => (
        <PreferencesSidebar
          activeSection="grid"
          onSectionChange={() => {}}
        />
      ));

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Preferences sections');
    });
  });
});
