import { describe, expect, it, vi } from 'vitest';
import type { AlignmentResult } from '../../../types/alignment';
import {
  createAlignmentOperation,
  getAlignmentDescription,
  getDistributionDescription,
} from '../historyOperations';

describe('getAlignmentDescription', () => {
  describe('multi-view alignment', () => {
    it('generates correct text for left alignment', () => {
      expect(getAlignmentDescription(3, 'left', false)).toBe('Align 3 views left');
    });

    it('generates correct text for center alignment', () => {
      expect(getAlignmentDescription(2, 'center', false)).toBe('Align 2 views center');
    });

    it('generates correct text for right alignment', () => {
      expect(getAlignmentDescription(5, 'right', false)).toBe('Align 5 views right');
    });

    it('generates correct text for top alignment', () => {
      expect(getAlignmentDescription(4, 'top', false)).toBe('Align 4 views top');
    });

    it('generates correct text for middle alignment', () => {
      expect(getAlignmentDescription(2, 'middle', false)).toBe('Align 2 views middle');
    });

    it('generates correct text for bottom alignment', () => {
      expect(getAlignmentDescription(3, 'bottom', false)).toBe('Align 3 views bottom');
    });
  });

  describe('single-view alignment to parent', () => {
    it('generates correct text for parent left alignment', () => {
      expect(getAlignmentDescription(1, 'left', true)).toBe('Align view to parent left');
    });

    it('generates correct text for parent center alignment', () => {
      expect(getAlignmentDescription(1, 'center', true)).toBe('Align view to parent center');
    });

    it('generates correct text for parent right alignment', () => {
      expect(getAlignmentDescription(1, 'right', true)).toBe('Align view to parent right');
    });

    it('generates correct text for parent top alignment', () => {
      expect(getAlignmentDescription(1, 'top', true)).toBe('Align view to parent top');
    });

    it('generates correct text for parent middle alignment', () => {
      expect(getAlignmentDescription(1, 'middle', true)).toBe('Align view to parent middle');
    });

    it('generates correct text for parent bottom alignment', () => {
      expect(getAlignmentDescription(1, 'bottom', true)).toBe('Align view to parent bottom');
    });
  });
});

describe('getDistributionDescription', () => {
  it('generates correct text for horizontal distribution', () => {
    expect(getDistributionDescription(5, 'horizontal')).toBe('Distribute 5 views horizontally');
  });

  it('generates correct text for vertical distribution', () => {
    expect(getDistributionDescription(4, 'vertical')).toBe('Distribute 4 views vertically');
  });

  it('handles 3 views (minimum for distribution)', () => {
    expect(getDistributionDescription(3, 'horizontal')).toBe('Distribute 3 views horizontally');
  });
});

describe('createAlignmentOperation', () => {
  const results: AlignmentResult[] = [
    {
      viewId: 'view1',
      originalOrigin: { x: 100, y: 50 },
      newOrigin: { x: 10, y: 50 },
    },
    {
      viewId: 'view2',
      originalOrigin: { x: 200, y: 80 },
      newOrigin: { x: 10, y: 80 },
    },
  ];

  it('creates valid undo/redo operation', () => {
    const updateViewOrigin = vi.fn();
    const operation = createAlignmentOperation(results, 'Align 2 views left', updateViewOrigin);

    expect(operation.type).toBe('move');
    expect(operation.description).toBe('Align 2 views left');
    expect(operation.timestamp).toBeGreaterThan(0);
    expect(typeof operation.undo).toBe('function');
    expect(typeof operation.redo).toBe('function');
  });

  it('undo restores original positions', () => {
    const updateViewOrigin = vi.fn();
    const operation = createAlignmentOperation(results, 'Align 2 views left', updateViewOrigin);

    operation.undo();

    expect(updateViewOrigin).toHaveBeenCalledTimes(2);
    expect(updateViewOrigin).toHaveBeenCalledWith('view1', { x: 100, y: 50 });
    expect(updateViewOrigin).toHaveBeenCalledWith('view2', { x: 200, y: 80 });
  });

  it('redo reapplies new positions', () => {
    const updateViewOrigin = vi.fn();
    const operation = createAlignmentOperation(results, 'Align 2 views left', updateViewOrigin);

    operation.redo();

    expect(updateViewOrigin).toHaveBeenCalledTimes(2);
    expect(updateViewOrigin).toHaveBeenCalledWith('view1', { x: 10, y: 50 });
    expect(updateViewOrigin).toHaveBeenCalledWith('view2', { x: 10, y: 80 });
  });

  it('undo then redo sequence works correctly', () => {
    const updateViewOrigin = vi.fn();
    const operation = createAlignmentOperation(results, 'Align 2 views left', updateViewOrigin);

    // Undo
    operation.undo();
    expect(updateViewOrigin).toHaveBeenCalledWith('view1', { x: 100, y: 50 });
    expect(updateViewOrigin).toHaveBeenCalledWith('view2', { x: 200, y: 80 });

    updateViewOrigin.mockClear();

    // Redo
    operation.redo();
    expect(updateViewOrigin).toHaveBeenCalledWith('view1', { x: 10, y: 50 });
    expect(updateViewOrigin).toHaveBeenCalledWith('view2', { x: 10, y: 80 });
  });

  it('handles single result', () => {
    const singleResult: AlignmentResult[] = [
      {
        viewId: 'view1',
        originalOrigin: { x: 50, y: 50 },
        newOrigin: { x: 0, y: 50 },
      },
    ];

    const updateViewOrigin = vi.fn();
    const operation = createAlignmentOperation(
      singleResult,
      'Align view to parent left',
      updateViewOrigin
    );

    operation.undo();
    expect(updateViewOrigin).toHaveBeenCalledWith('view1', { x: 50, y: 50 });

    updateViewOrigin.mockClear();

    operation.redo();
    expect(updateViewOrigin).toHaveBeenCalledWith('view1', { x: 0, y: 50 });
  });
});
