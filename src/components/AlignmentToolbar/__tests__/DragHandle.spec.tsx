import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import { DragHandle } from '../DragHandle';

describe('DragHandle', () => {
  it('renders drag handle with dots', () => {
    render(() => <DragHandle />);
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
  });

  it('has correct tooltip', () => {
    render(() => <DragHandle />);
    expect(screen.getByTitle('Drag to undock toolbar')).toBeInTheDocument();
  });

  describe('drag threshold', () => {
    it('does not trigger onUndock for small drag (< 20px)', () => {
      const onUndock = vi.fn();
      render(() => <DragHandle onUndock={onUndock} />);

      const handle = screen.getByTestId('drag-handle');

      // Start drag at (100, 100)
      fireEvent.mouseDown(handle, { clientX: 100, clientY: 100, button: 0 });

      // Move only 10px (< 20px threshold)
      fireEvent.mouseMove(document, { clientX: 110, clientY: 100 });
      expect(onUndock).not.toHaveBeenCalled();

      // Move 15px diagonal (still < 20px)
      fireEvent.mouseMove(document, { clientX: 110, clientY: 110 });
      // Distance = sqrt(10^2 + 10^2) = ~14.14 < 20
      expect(onUndock).not.toHaveBeenCalled();

      fireEvent.mouseUp(document);
      expect(onUndock).not.toHaveBeenCalled();
    });

    it('triggers onUndock when drag exceeds 20px', () => {
      const onUndock = vi.fn();
      render(() => <DragHandle onUndock={onUndock} />);

      const handle = screen.getByTestId('drag-handle');

      // Start drag at (100, 100)
      fireEvent.mouseDown(handle, { clientX: 100, clientY: 100, button: 0 });

      // Move exactly 20px horizontally
      fireEvent.mouseMove(document, { clientX: 120, clientY: 100 });
      expect(onUndock).toHaveBeenCalledTimes(1);
      expect(onUndock).toHaveBeenCalledWith({ x: 70, y: 90 }); // offset for panel
    });

    it('triggers onUndock when diagonal drag exceeds 20px', () => {
      const onUndock = vi.fn();
      render(() => <DragHandle onUndock={onUndock} />);

      const handle = screen.getByTestId('drag-handle');

      // Start drag at (100, 100)
      fireEvent.mouseDown(handle, { clientX: 100, clientY: 100, button: 0 });

      // Move diagonally ~21.2px (15, 15)
      fireEvent.mouseMove(document, { clientX: 115, clientY: 115 });
      // Distance = sqrt(15^2 + 15^2) = ~21.2 >= 20
      expect(onUndock).toHaveBeenCalledTimes(1);
    });

    it('does not respond to right-click', () => {
      const onUndock = vi.fn();
      render(() => <DragHandle onUndock={onUndock} />);

      const handle = screen.getByTestId('drag-handle');

      // Right-click (button: 2)
      fireEvent.mouseDown(handle, { clientX: 100, clientY: 100, button: 2 });
      fireEvent.mouseMove(document, { clientX: 150, clientY: 100 });
      fireEvent.mouseUp(document);

      expect(onUndock).not.toHaveBeenCalled();
    });

    it('cleans up listeners on mouseUp before threshold', () => {
      const onUndock = vi.fn();
      render(() => <DragHandle onUndock={onUndock} />);

      const handle = screen.getByTestId('drag-handle');

      // Start drag
      fireEvent.mouseDown(handle, { clientX: 100, clientY: 100, button: 0 });
      // Release before threshold
      fireEvent.mouseUp(document);

      // Further moves should not trigger
      fireEvent.mouseMove(document, { clientX: 200, clientY: 100 });
      expect(onUndock).not.toHaveBeenCalled();
    });
  });
});
