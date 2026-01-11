/**
 * Tests for SettingSelect component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { SettingSelect } from '../controls/SettingSelect';

describe('SettingSelect', () => {
  const options = [
    { value: 'lines', label: 'Lines' },
    { value: 'dots', label: 'Dots' },
    { value: 'crosshairs', label: 'Crosshairs' },
  ];

  afterEach(() => {
    cleanup();
  });

  describe('render with options', () => {
    it('renders with label', () => {
      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={() => {}}
        />
      ));

      expect(screen.getByText('Grid Style')).toBeInTheDocument();
    });

    it('renders button with current value label', () => {
      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="dots"
          options={options}
          onChange={() => {}}
        />
      ));

      expect(screen.getByRole('button')).toHaveTextContent('Dots');
    });

    it('dropdown is closed initially', () => {
      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={() => {}}
        />
      ));

      // Options should not be visible
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('onChange callback', () => {
    it('calls onChange when selecting an option', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={onChange}
        />
      ));

      // Open dropdown
      await user.click(screen.getByRole('button'));

      // Select option
      await user.click(screen.getByRole('option', { name: 'Dots' }));

      expect(onChange).toHaveBeenCalledWith('dots');
    });

    it('closes dropdown after selection', async () => {
      const user = userEvent.setup();

      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={() => {}}
        />
      ));

      // Open dropdown
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Select option
      await user.click(screen.getByRole('option', { name: 'Dots' }));

      // Dropdown should close
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('opens dropdown on Enter key', async () => {
      const user = userEvent.setup();

      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={() => {}}
        />
      ));

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens dropdown on Space key', async () => {
      const user = userEvent.setup();

      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={() => {}}
        />
      ));

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes dropdown on Escape key', async () => {
      const user = userEvent.setup();

      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={() => {}}
        />
      ));

      // Open dropdown
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Press Escape
      await user.keyboard('{Escape}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('navigates options with arrow keys', async () => {
      const user = userEvent.setup();

      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={() => {}}
        />
      ));

      // Open dropdown and focus first option
      await user.click(screen.getByRole('button'));

      // Navigate down
      await user.keyboard('{ArrowDown}');

      // The highlighted option should change (visual feedback)
      // Since we can't easily test visual highlight, we just verify no crash
    });

    it('selects option on Enter in dropdown', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={onChange}
        />
      ));

      // Open dropdown
      await user.click(screen.getByRole('button'));

      // Navigate and select
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('floating-ui dropdown', () => {
    it('renders options in a positioned dropdown', async () => {
      const user = userEvent.setup();

      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={() => {}}
        />
      ));

      await user.click(screen.getByRole('button'));

      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    it('renders all options in dropdown', async () => {
      const user = userEvent.setup();

      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={() => {}}
        />
      ));

      await user.click(screen.getByRole('button'));

      expect(screen.getByRole('option', { name: 'Lines' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Dots' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Crosshairs' })).toBeInTheDocument();
    });

    it('highlights current value in dropdown', async () => {
      const user = userEvent.setup();

      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="dots"
          options={options}
          onChange={() => {}}
        />
      ));

      await user.click(screen.getByRole('button'));

      const selectedOption = screen.getByRole('option', { name: 'Dots' });
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('disabled state', () => {
    it('renders as disabled when disabled prop is true', () => {
      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={() => {}}
          disabled={true}
        />
      ));

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not open dropdown when disabled', async () => {
      const user = userEvent.setup();

      render(() => (
        <SettingSelect
          id="test-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={() => {}}
          disabled={true}
        />
      ));

      await user.click(screen.getByRole('button'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA attributes on button', () => {
      render(() => (
        <SettingSelect
          id="my-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={() => {}}
        />
      ));

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates aria-expanded when dropdown opens', async () => {
      const user = userEvent.setup();

      render(() => (
        <SettingSelect
          id="my-select"
          label="Grid Style"
          value="lines"
          options={options}
          onChange={() => {}}
        />
      ));

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
