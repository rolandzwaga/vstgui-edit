import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { BooleanEditor } from '../BooleanEditor';

describe('BooleanEditor', () => {
  const defaultProps = {
    value: 'true',
    onChange: vi.fn(),
    onCommit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render checked checkbox when value is "true"', () => {
      render(() => <BooleanEditor {...defaultProps} value="true" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should render unchecked checkbox when value is "false"', () => {
      render(() => <BooleanEditor {...defaultProps} value="false" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should render unchecked checkbox for empty value', () => {
      render(() => <BooleanEditor {...defaultProps} value="" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should render disabled checkbox when disabled prop is true', () => {
      render(() => <BooleanEditor {...defaultProps} disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });
  });

  describe('change handling', () => {
    it('should call onChange with "false" when checked checkbox is clicked', () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      render(() => (
        <BooleanEditor {...defaultProps} value="true" onChange={onChange} onCommit={onCommit} />
      ));

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onChange).toHaveBeenCalledWith('false');
      expect(onCommit).toHaveBeenCalled();
    });

    it('should call onChange with "true" when unchecked checkbox is clicked', () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      render(() => (
        <BooleanEditor {...defaultProps} value="false" onChange={onChange} onCommit={onCommit} />
      ));

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onChange).toHaveBeenCalledWith('true');
      expect(onCommit).toHaveBeenCalled();
    });

    it('should commit immediately on change (no need for Enter)', () => {
      const onCommit = vi.fn();
      render(() => <BooleanEditor {...defaultProps} onCommit={onCommit} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onCommit).toHaveBeenCalled();
    });
  });

  describe('keyboard handling', () => {
    it('should toggle when Space key is pressed', () => {
      const onChange = vi.fn();
      render(() => <BooleanEditor {...defaultProps} value="false" onChange={onChange} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.keyDown(checkbox, { key: ' ' });
      fireEvent.click(checkbox);

      expect(onChange).toHaveBeenCalledWith('true');
    });
  });
});
