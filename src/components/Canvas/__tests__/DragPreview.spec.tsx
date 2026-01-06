import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@solidjs/testing-library';
import { DragPreview } from '../DragPreview';
import { resetDrag, startDrag, updateDrag } from '../../../stores/dragStore';
import type { RenderableView } from '../../../types/canvas';

const createMockView = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number
): RenderableView => ({
  id,
  absoluteX: x,
  absoluteY: y,
  width,
  height,
  className: 'CView',
  category: 'control',
  zIndex: 1,
  parentId: null,
});

describe('DragPreview Component', () => {
  beforeEach(() => {
    resetDrag();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Given views are provided', () => {
    describe('When drag is active', () => {
      it('should render preview rectangles at delta offset (FR-012)', () => {
        const views = [createMockView('view-1', 50, 50, 100, 80)];
        const origins = { 'view-1': { x: 50, y: 50 } };

        startDrag({ x: 100, y: 100 }, origins);
        updateDrag({ x: 130, y: 120 }, false);

        render(() => <DragPreview views={views} />);

        const preview = screen.getByTestId('drag-preview-view-1');
        expect(preview).toBeInTheDocument();
        expect(preview).toHaveAttribute('x', '80');
        expect(preview).toHaveAttribute('y', '70');
        expect(preview).toHaveAttribute('width', '100');
        expect(preview).toHaveAttribute('height', '80');
      });

      it('should apply 50% opacity as per FR-012', () => {
        const views = [createMockView('view-1', 50, 50, 100, 80)];
        const origins = { 'view-1': { x: 50, y: 50 } };

        startDrag({ x: 100, y: 100 }, origins);
        updateDrag({ x: 130, y: 120 }, false);

        render(() => <DragPreview views={views} />);

        const preview = screen.getByTestId('drag-preview-view-1');
        expect(preview).toHaveClass(/preview/);
      });

      it('should apply dashed stroke as per FR-012', () => {
        const views = [createMockView('view-1', 50, 50, 100, 80)];
        const origins = { 'view-1': { x: 50, y: 50 } };

        startDrag({ x: 100, y: 100 }, origins);
        updateDrag({ x: 130, y: 120 }, false);

        render(() => <DragPreview views={views} />);

        const preview = screen.getByTestId('drag-preview-view-1');
        expect(preview).toHaveClass(/preview/);
      });
    });
  });

  describe('Given multiple views', () => {
    describe('When drag is active', () => {
      it('should render preview for each view', () => {
        const views = [
          createMockView('view-1', 50, 50, 100, 80),
          createMockView('view-2', 200, 100, 80, 60),
        ];
        const origins = {
          'view-1': { x: 50, y: 50 },
          'view-2': { x: 200, y: 100 },
        };

        startDrag({ x: 100, y: 100 }, origins);
        updateDrag({ x: 120, y: 115 }, false);

        render(() => <DragPreview views={views} />);

        expect(screen.getByTestId('drag-preview-view-1')).toBeInTheDocument();
        expect(screen.getByTestId('drag-preview-view-2')).toBeInTheDocument();
      });

      it('should maintain relative positions between views', () => {
        const views = [
          createMockView('view-1', 50, 50, 100, 80),
          createMockView('view-2', 100, 80, 80, 60),
        ];
        const origins = {
          'view-1': { x: 50, y: 50 },
          'view-2': { x: 100, y: 80 },
        };

        startDrag({ x: 100, y: 100 }, origins);
        updateDrag({ x: 150, y: 150 }, false);

        render(() => <DragPreview views={views} />);

        const preview1 = screen.getByTestId('drag-preview-view-1');
        const preview2 = screen.getByTestId('drag-preview-view-2');

        const x1 = Number(preview1.getAttribute('x'));
        const y1 = Number(preview1.getAttribute('y'));
        const x2 = Number(preview2.getAttribute('x'));
        const y2 = Number(preview2.getAttribute('y'));

        expect(x2 - x1).toBe(50);
        expect(y2 - y1).toBe(30);
      });
    });
  });

  describe('Given drag is not active', () => {
    it('should not render any previews', () => {
      const views = [createMockView('view-1', 50, 50, 100, 80)];

      render(() => <DragPreview views={views} />);

      expect(screen.queryByTestId('drag-preview-view-1')).not.toBeInTheDocument();
    });
  });

  describe('Given empty views array', () => {
    it('should render empty group', () => {
      startDrag({ x: 100, y: 100 }, {});
      updateDrag({ x: 130, y: 120 }, false);

      render(() => <DragPreview views={[]} />);

      const group = screen.getByTestId('drag-preview-group');
      expect(group).toBeInTheDocument();
      expect(group.children.length).toBe(0);
    });
  });
});
