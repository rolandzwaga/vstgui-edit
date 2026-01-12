import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@solidjs/testing-library';
import { ControlTagPicker } from '../ControlTagPicker';

describe('ControlTagPicker', () => {
  const defaultProps = {
    value: 'VolumeTag',
    documentControlTags: ['VolumeTag', 'PanTag', 'MuteTag'],
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
    it('should render a button with current value', () => {
      render(() => <ControlTagPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');
      expect(button).toHaveTextContent('VolumeTag');
    });

    it('should render disabled button when disabled prop is true', () => {
      render(() => <ControlTagPicker {...defaultProps} disabled />);
      const button = screen.getByRole('combobox');
      expect(button).toBeDisabled();
    });

    it('should not show dropdown initially', () => {
      render(() => <ControlTagPicker {...defaultProps} />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('dropdown interaction', () => {
    it('should show dropdown when button is clicked', async () => {
      render(() => <ControlTagPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should show document control tags as options', async () => {
      render(() => <ControlTagPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /VolumeTag/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /PanTag/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /MuteTag/i })).toBeInTheDocument();
      });
    });

    it('should mark current value as selected', async () => {
      render(() => <ControlTagPicker {...defaultProps} value="PanTag" />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        const panOption = screen.getByRole('option', { name: /PanTag/i });
        expect(panOption).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should call onChange and onCommit when control tag is selected', async () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      render(() => <ControlTagPicker {...defaultProps} onChange={onChange} onCommit={onCommit} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const panOption = screen.getByRole('option', { name: /PanTag/i });
      fireEvent.click(panOption);

      expect(onChange).toHaveBeenCalledWith('PanTag');
      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it('should close dropdown after selection', async () => {
      render(() => <ControlTagPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const panOption = screen.getByRole('option', { name: /PanTag/i });
      fireEvent.click(panOption);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should not call onChange when same control tag is selected', async () => {
      const onChange = vi.fn();
      render(() => <ControlTagPicker {...defaultProps} value="VolumeTag" onChange={onChange} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const volumeOption = screen.getByRole('option', { name: /VolumeTag/i });
      fireEvent.click(volumeOption);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard handling', () => {
    it('should open dropdown on Enter key', async () => {
      render(() => <ControlTagPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should close dropdown on Escape key', async () => {
      render(() => <ControlTagPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(button, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should call onCancel when Escape pressed with dropdown closed', () => {
      const onCancel = vi.fn();
      render(() => <ControlTagPicker {...defaultProps} onCancel={onCancel} />);
      const button = screen.getByRole('combobox');

      fireEvent.keyDown(button, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should navigate options with ArrowDown', async () => {
      render(() => <ControlTagPicker {...defaultProps} value="VolumeTag" />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(button, { key: 'ArrowDown' });

      await waitFor(() => {
        const panOption = screen.getByRole('option', { name: /PanTag/i });
        expect(panOption.className).toContain('highlighted');
      });
    });

    it('should select highlighted option on Enter', async () => {
      const onChange = vi.fn();
      const onCommit = vi.fn();
      render(() => (
        <ControlTagPicker {...defaultProps} value="VolumeTag" onChange={onChange} onCommit={onCommit} />
      ));
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(button, { key: 'ArrowDown' });
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith('PanTag');
      expect(onCommit).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have aria-expanded attribute', () => {
      render(() => <ControlTagPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      render(() => <ControlTagPicker {...defaultProps} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('empty document control tags', () => {
    it('should render empty state when no document control tags', async () => {
      render(() => <ControlTagPicker {...defaultProps} documentControlTags={[]} />);
      const button = screen.getByRole('combobox');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/no control tags defined/i)).toBeInTheDocument();
      });
    });
  });
});
