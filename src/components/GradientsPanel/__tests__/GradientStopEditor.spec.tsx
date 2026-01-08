import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import type { GradientColorStop } from '../../../types/uidesc';
import { GradientStopEditor } from '../GradientStopEditor';

describe('GradientStopEditor', () => {
  const defaultStops: GradientColorStop[] = [
    { rgba: '#000000FF', start: '0.00' },
    { rgba: '#FFFFFFFF', start: '1.00' },
  ];

  const defaultProps = {
    stops: defaultStops,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('given basic rendering', () => {
    it('should render gradient bar', () => {
      render(() => <GradientStopEditor {...defaultProps} />);

      expect(screen.getByTestId('gradient-stop-editor')).toBeInTheDocument();
      expect(screen.getByTestId('gradient-bar')).toBeInTheDocument();
    });

    it('should render stop handles for each stop', () => {
      render(() => <GradientStopEditor {...defaultProps} />);

      const handles = screen.getAllByTestId('stop-handle');
      expect(handles).toHaveLength(2);
    });

    it('should render handles at correct positions', () => {
      render(() => <GradientStopEditor {...defaultProps} />);

      const handles = screen.getAllByTestId('stop-handle');
      // First stop at 0%
      expect(handles[0]).toHaveStyle({ left: '0%' });
      // Second stop at 100%
      expect(handles[1]).toHaveStyle({ left: '100%' });
    });

    it('should render stop colors on handles', () => {
      render(() => <GradientStopEditor {...defaultProps} />);

      const handles = screen.getAllByTestId('stop-handle');
      // Check that handle contains color indicator
      expect(handles[0].querySelector('[data-testid="stop-color"]')).toBeInTheDocument();
      expect(handles[1].querySelector('[data-testid="stop-color"]')).toBeInTheDocument();
    });
  });

  describe('given multiple stops', () => {
    it('should render all stop handles', () => {
      const stops: GradientColorStop[] = [
        { rgba: '#FF0000FF', start: '0.00' },
        { rgba: '#00FF00FF', start: '0.50' },
        { rgba: '#0000FFFF', start: '1.00' },
      ];

      render(() => <GradientStopEditor {...defaultProps} stops={stops} />);

      const handles = screen.getAllByTestId('stop-handle');
      expect(handles).toHaveLength(3);
    });

    it('should position middle stop at 50%', () => {
      const stops: GradientColorStop[] = [
        { rgba: '#FF0000FF', start: '0.00' },
        { rgba: '#00FF00FF', start: '0.50' },
        { rgba: '#0000FFFF', start: '1.00' },
      ];

      render(() => <GradientStopEditor {...defaultProps} stops={stops} />);

      const handles = screen.getAllByTestId('stop-handle');
      expect(handles[1]).toHaveStyle({ left: '50%' });
    });
  });

  describe('given stop selection', () => {
    it('should select stop on click', async () => {
      const user = userEvent.setup();
      render(() => <GradientStopEditor {...defaultProps} />);

      const handles = screen.getAllByTestId('stop-handle');
      await user.click(handles[0]);

      expect(handles[0]).toHaveAttribute('data-selected', 'true');
    });

    it('should show color picker when stop is selected', async () => {
      const user = userEvent.setup();
      render(() => <GradientStopEditor {...defaultProps} />);

      const handles = screen.getAllByTestId('stop-handle');
      await user.click(handles[0]);

      expect(screen.getByTestId('stop-color-input')).toBeInTheDocument();
    });

    it('should deselect when clicking elsewhere', async () => {
      const user = userEvent.setup();
      render(() => <GradientStopEditor {...defaultProps} />);

      const handles = screen.getAllByTestId('stop-handle');
      await user.click(handles[0]);
      expect(handles[0]).toHaveAttribute('data-selected', 'true');

      // Click on the gradient bar (not a handle)
      const bar = screen.getByTestId('gradient-bar');
      await user.click(bar);

      // Clicking on bar adds a new stop, so we need to check the original handle
      // is no longer selected (new stop is selected)
      expect(handles[0]).not.toHaveAttribute('data-selected', 'true');
    });
  });

  describe('given color editing', () => {
    it('should update color when input changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(() => <GradientStopEditor {...defaultProps} onChange={onChange} />);

      const handles = screen.getAllByTestId('stop-handle');
      await user.click(handles[0]);

      const colorInput = screen.getByTestId('stop-color-input');
      fireEvent.input(colorInput, { target: { value: '#FF0000FF' } });

      expect(onChange).toHaveBeenCalledWith([
        { rgba: '#FF0000FF', start: '0.00' },
        { rgba: '#FFFFFFFF', start: '1.00' },
      ]);
    });

    it('should show position input for selected stop', async () => {
      const user = userEvent.setup();
      render(() => <GradientStopEditor {...defaultProps} />);

      const handles = screen.getAllByTestId('stop-handle');
      await user.click(handles[0]);

      expect(screen.getByTestId('stop-position-input')).toBeInTheDocument();
    });

    it('should update position when input changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(() => <GradientStopEditor {...defaultProps} onChange={onChange} />);

      const handles = screen.getAllByTestId('stop-handle');
      await user.click(handles[0]);

      const positionInput = screen.getByTestId('stop-position-input');
      await user.clear(positionInput);
      await user.type(positionInput, '25');
      fireEvent.blur(positionInput);

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall[0].start).toBe('0.25');
    });
  });

  describe('given stop dragging', () => {
    it('should update position on drag', () => {
      const onChange = vi.fn();
      render(() => <GradientStopEditor {...defaultProps} onChange={onChange} />);

      const handles = screen.getAllByTestId('stop-handle');
      const handle = handles[0];

      // Simulate drag
      fireEvent.mouseDown(handle, { clientX: 0 });
      fireEvent.mouseMove(document, { clientX: 50 });
      fireEvent.mouseUp(document);

      expect(onChange).toHaveBeenCalled();
    });

    it('should clamp position between 0 and 1', () => {
      const onChange = vi.fn();
      render(() => <GradientStopEditor {...defaultProps} onChange={onChange} />);

      const handles = screen.getAllByTestId('stop-handle');
      const handle = handles[0];

      // Simulate drag beyond bounds
      fireEvent.mouseDown(handle, { clientX: 0 });
      fireEvent.mouseMove(document, { clientX: -100 }); // Negative position
      fireEvent.mouseUp(document);

      // Position should be clamped to 0
      expect(onChange).toHaveBeenCalled();
      const calls = onChange.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      const movedStop = lastCall.find((s: GradientColorStop) => s.rgba === '#000000FF');
      expect(parseFloat(movedStop.start)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('given add stop functionality', () => {
    it('should add stop when clicking on gradient bar', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(() => <GradientStopEditor {...defaultProps} onChange={onChange} />);

      const bar = screen.getByTestId('gradient-bar');
      
      // Click in the middle of the bar
      const rect = { left: 0, width: 200 };
      vi.spyOn(bar, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);
      
      fireEvent.click(bar, { clientX: 100 }); // Middle of bar

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall).toHaveLength(3); // Original 2 + new 1
    });
  });

  describe('given delete stop functionality', () => {
    it('should show delete button for selected stop', async () => {
      const user = userEvent.setup();
      const stops: GradientColorStop[] = [
        { rgba: '#FF0000FF', start: '0.00' },
        { rgba: '#00FF00FF', start: '0.50' },
        { rgba: '#0000FFFF', start: '1.00' },
      ];

      render(() => <GradientStopEditor {...defaultProps} stops={stops} />);

      const handles = screen.getAllByTestId('stop-handle');
      await user.click(handles[1]); // Select middle stop

      expect(screen.getByTestId('delete-stop-button')).toBeInTheDocument();
    });

    it('should delete stop when delete button clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const stops: GradientColorStop[] = [
        { rgba: '#FF0000FF', start: '0.00' },
        { rgba: '#00FF00FF', start: '0.50' },
        { rgba: '#0000FFFF', start: '1.00' },
      ];

      render(() => <GradientStopEditor {...defaultProps} stops={stops} onChange={onChange} />);

      const handles = screen.getAllByTestId('stop-handle');
      await user.click(handles[1]); // Select middle stop

      const deleteButton = screen.getByTestId('delete-stop-button');
      await user.click(deleteButton);

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall).toHaveLength(2);
    });

    it('should not show delete button when only 2 stops remain', async () => {
      const user = userEvent.setup();
      render(() => <GradientStopEditor {...defaultProps} />);

      const handles = screen.getAllByTestId('stop-handle');
      await user.click(handles[0]);

      expect(screen.queryByTestId('delete-stop-button')).not.toBeInTheDocument();
    });
  });
});
