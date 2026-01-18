import { fireEvent, render, screen } from '@solidjs/testing-library';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MultiframeEditor } from '../MultiframeEditor';

describe('MultiframeEditor', () => {
  const mockOnNumFramesChange = vi.fn();
  const mockOnFrameSizeChange = vi.fn();
  const mockOnFramesPerRowChange = vi.fn();
  const mockOnCommit = vi.fn();

  const defaultProps = {
    numFrames: '128',
    frameSize: '50, 50',
    framesPerRow: '16',
    onNumFramesChange: mockOnNumFramesChange,
    onFrameSizeChange: mockOnFrameSizeChange,
    onFramesPerRowChange: mockOnFramesPerRowChange,
    onCommit: mockOnCommit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders container', () => {
      render(() => <MultiframeEditor {...defaultProps} />);
      expect(screen.getByTestId('multiframe-editor')).toBeInTheDocument();
    });

    test('renders all three input fields', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      expect(screen.getByTestId('multiframe-num-frames')).toBeInTheDocument();
      expect(screen.getByTestId('multiframe-size')).toBeInTheDocument();
      expect(screen.getByTestId('multiframe-frames-per-row')).toBeInTheDocument();
    });

    test('renders labels', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      expect(screen.getByText('Frames')).toBeInTheDocument();
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.getByText('Per Row')).toBeInTheDocument();
    });

    test('displays initial values', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      expect(screen.getByTestId('multiframe-num-frames')).toHaveValue(128);
      expect(screen.getByTestId('multiframe-size')).toHaveValue('50, 50');
      expect(screen.getByTestId('multiframe-frames-per-row')).toHaveValue(16);
    });

    test('has correct aria-labels', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      expect(screen.getByTestId('multiframe-num-frames')).toHaveAttribute(
        'aria-label',
        'Number of frames'
      );
      expect(screen.getByTestId('multiframe-size')).toHaveAttribute(
        'aria-label',
        'Frame size (width, height)'
      );
      expect(screen.getByTestId('multiframe-frames-per-row')).toHaveAttribute(
        'aria-label',
        'Frames per row'
      );
    });
  });

  describe('numFrames input', () => {
    test('calls onNumFramesChange on valid input', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      const input = screen.getByTestId('multiframe-num-frames');
      fireEvent.input(input, { target: { value: '64' } });

      expect(mockOnNumFramesChange).toHaveBeenCalledWith('64');
    });

    test('does not call onNumFramesChange on invalid input', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      const input = screen.getByTestId('multiframe-num-frames');
      fireEvent.input(input, { target: { value: '0' } });

      expect(mockOnNumFramesChange).not.toHaveBeenCalled();
    });

    test('marks input as invalid for zero', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      const input = screen.getByTestId('multiframe-num-frames');
      fireEvent.input(input, { target: { value: '0' } });

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('frameSize input', () => {
    test('calls onFrameSizeChange on valid input', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      const input = screen.getByTestId('multiframe-size');
      fireEvent.input(input, { target: { value: '100, 75' } });

      expect(mockOnFrameSizeChange).toHaveBeenCalledWith('100, 75');
    });

    test('does not call onFrameSizeChange on invalid format', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      const input = screen.getByTestId('multiframe-size');
      fireEvent.input(input, { target: { value: '100' } });

      expect(mockOnFrameSizeChange).not.toHaveBeenCalled();
    });

    test('marks input as invalid for single value', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      const input = screen.getByTestId('multiframe-size');
      fireEvent.input(input, { target: { value: '100' } });

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('framesPerRow input', () => {
    test('calls onFramesPerRowChange on valid input', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      const input = screen.getByTestId('multiframe-frames-per-row');
      fireEvent.input(input, { target: { value: '8' } });

      expect(mockOnFramesPerRowChange).toHaveBeenCalledWith('8');
    });

    test('calls onFramesPerRowChange with empty (optional field)', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      const input = screen.getByTestId('multiframe-frames-per-row');
      fireEvent.input(input, { target: { value: '' } });

      expect(mockOnFramesPerRowChange).toHaveBeenCalledWith('');
    });

    test('does not call onFramesPerRowChange on invalid input', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      const input = screen.getByTestId('multiframe-frames-per-row');
      fireEvent.input(input, { target: { value: '0' } });

      expect(mockOnFramesPerRowChange).not.toHaveBeenCalled();
    });
  });

  describe('commit behavior', () => {
    test('calls onCommit on blur', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      const input = screen.getByTestId('multiframe-num-frames');
      fireEvent.blur(input);

      expect(mockOnCommit).toHaveBeenCalledTimes(1);
    });

    test('calls onCommit on Enter key', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      const input = screen.getByTestId('multiframe-size');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnCommit).toHaveBeenCalledTimes(1);
    });

    test('does not call onCommit on other keys', () => {
      render(() => <MultiframeEditor {...defaultProps} />);

      const input = screen.getByTestId('multiframe-num-frames');
      fireEvent.keyDown(input, { key: 'Tab' });

      expect(mockOnCommit).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    test('disables all inputs when disabled', () => {
      render(() => <MultiframeEditor {...defaultProps} disabled />);

      expect(screen.getByTestId('multiframe-num-frames')).toBeDisabled();
      expect(screen.getByTestId('multiframe-size')).toBeDisabled();
      expect(screen.getByTestId('multiframe-frames-per-row')).toBeDisabled();
    });
  });

  describe('empty initial values', () => {
    test('renders with empty values', () => {
      render(() => (
        <MultiframeEditor
          {...defaultProps}
          numFrames=""
          frameSize=""
          framesPerRow=""
        />
      ));

      expect(screen.getByTestId('multiframe-num-frames')).toHaveValue(null);
      expect(screen.getByTestId('multiframe-size')).toHaveValue('');
      expect(screen.getByTestId('multiframe-frames-per-row')).toHaveValue(null);
    });
  });
});
