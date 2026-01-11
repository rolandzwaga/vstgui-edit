/**
 * Tests for SettingToggle component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { SettingToggle } from '../controls/SettingToggle';

describe('SettingToggle', () => {
  describe('render with label', () => {
    it('renders with label', () => {
      render(() => (
        <SettingToggle
          id="test-toggle"
          label="Enable Feature"
          value={false}
          onChange={() => {}}
        />
      ));

      expect(screen.getByLabelText('Enable Feature')).toBeInTheDocument();
    });

    it('renders as checkbox input', () => {
      render(() => (
        <SettingToggle
          id="test-toggle"
          label="Enable Feature"
          value={false}
          onChange={() => {}}
        />
      ));

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders checked when value is true', () => {
      render(() => (
        <SettingToggle
          id="test-toggle"
          label="Enable Feature"
          value={true}
          onChange={() => {}}
        />
      ));

      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('renders unchecked when value is false', () => {
      render(() => (
        <SettingToggle
          id="test-toggle"
          label="Enable Feature"
          value={false}
          onChange={() => {}}
        />
      ));

      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });
  });

  describe('onChange callback', () => {
    it('calls onChange with true when toggled from unchecked', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(() => (
        <SettingToggle
          id="test-toggle"
          label="Enable Feature"
          value={false}
          onChange={onChange}
        />
      ));

      await user.click(screen.getByRole('checkbox'));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('calls onChange with false when toggled from checked', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(() => (
        <SettingToggle
          id="test-toggle"
          label="Enable Feature"
          value={true}
          onChange={onChange}
        />
      ));

      await user.click(screen.getByRole('checkbox'));
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('calls onChange when clicking the label', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(() => (
        <SettingToggle
          id="test-toggle"
          label="Enable Feature"
          value={false}
          onChange={onChange}
        />
      ));

      await user.click(screen.getByText('Enable Feature'));
      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  describe('disabled state', () => {
    it('renders as disabled when disabled prop is true', () => {
      render(() => (
        <SettingToggle
          id="test-toggle"
          label="Enable Feature"
          value={false}
          onChange={() => {}}
          disabled={true}
        />
      ));

      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('does not call onChange when disabled', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(() => (
        <SettingToggle
          id="test-toggle"
          label="Enable Feature"
          value={false}
          onChange={onChange}
          disabled={true}
        />
      ));

      await user.click(screen.getByRole('checkbox'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('description', () => {
    it('renders description when provided', () => {
      render(() => (
        <SettingToggle
          id="test-toggle"
          label="Enable Feature"
          value={false}
          onChange={() => {}}
          description="This feature does something useful"
        />
      ));

      expect(screen.getByText('This feature does something useful')).toBeInTheDocument();
    });

    it('does not render description when not provided', () => {
      render(() => (
        <SettingToggle
          id="test-toggle"
          label="Enable Feature"
          value={false}
          onChange={() => {}}
        />
      ));

      // Should only have the label text
      expect(screen.queryByText(/This feature/)).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has correct id for label association', () => {
      render(() => (
        <SettingToggle
          id="my-toggle"
          label="Enable Feature"
          value={false}
          onChange={() => {}}
        />
      ));

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'my-toggle');
    });
  });
});
