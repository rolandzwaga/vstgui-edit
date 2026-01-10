/**
 * Tests for GuideLine component
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@solidjs/testing-library';
import { GuideLine } from '../GuideLine';
import { resetCanvas, setZoom } from '../../../../stores/canvasStore';
import {
  guidesStore,
  resetGuidesStore,
  addGuide,
  deleteGuideWithHistory,
  startRepositionDrag,
  updateRepositionDrag,
  completeRepositionDrag,
} from '../../../../stores/guidesStore';
import { testInRoot } from '../../../../__tests__/helpers/solidjs';
import type { CustomGuide } from '../../../../types/guides';

describe('GuideLine', () => {
  beforeEach(() => {
    resetCanvas();
    testInRoot(() => {
      resetGuidesStore();
    });
    cleanup();
  });

  const horizontalGuide: CustomGuide = {
    id: 'guide-h1',
    orientation: 'horizontal',
    position: 100,
  };

  const verticalGuide: CustomGuide = {
    id: 'guide-v1',
    orientation: 'vertical',
    position: 200,
  };

  describe('horizontal guide rendering', () => {
    test('renders horizontal line spanning full canvas width', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const guide = screen.getByTestId('guide-guide-h1');
      expect(guide).toBeInTheDocument();

      const line = guide.querySelector('line');
      expect(line).toBeInTheDocument();
      expect(line?.getAttribute('x1')).toBe('0');
      expect(line?.getAttribute('x2')).toBe('800');
      expect(line?.getAttribute('y1')).toBe('100');
      expect(line?.getAttribute('y2')).toBe('100');
    });
  });

  describe('vertical guide rendering', () => {
    test('renders vertical line spanning full canvas height', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={verticalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const guide = screen.getByTestId('guide-guide-v1');
      expect(guide).toBeInTheDocument();

      const line = guide.querySelector('line');
      expect(line).toBeInTheDocument();
      expect(line?.getAttribute('x1')).toBe('200');
      expect(line?.getAttribute('x2')).toBe('200');
      expect(line?.getAttribute('y1')).toBe('0');
      expect(line?.getAttribute('y2')).toBe('600');
    });
  });

  describe('visual styling', () => {
    test('uses cyan color from design token', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const line = screen.getByTestId('guide-guide-h1').querySelector('line');
      const stroke = line?.getAttribute('stroke');
      // Should use the design token variable or its value
      expect(stroke).toContain('--color-custom-guide');
    });

    test('uses dashed stroke pattern', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const line = screen.getByTestId('guide-guide-h1').querySelector('line');
      expect(line?.getAttribute('stroke-dasharray')).toBeTruthy();
    });
  });

  describe('data-testid', () => {
    test('includes guide ID in testid', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      expect(screen.getByTestId('guide-guide-h1')).toBeInTheDocument();
    });

    test('unique testid for each guide', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
          <GuideLine guide={verticalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      expect(screen.getByTestId('guide-guide-h1')).toBeInTheDocument();
      expect(screen.getByTestId('guide-guide-v1')).toBeInTheDocument();
    });
  });

  describe('zoom-invariant stroke', () => {
    test('stroke-width inversely scales with zoom at 100%', () => {
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const line = screen.getByTestId('guide-guide-h1').querySelector('line');
      // At 100% zoom (zoomLevel = 1), stroke-width should be 1
      const strokeWidth = parseFloat(line?.getAttribute('stroke-width') ?? '0');
      expect(strokeWidth).toBe(1);
    });

    test('stroke-width scales with zoom at 200%', () => {
      setZoom(2.0);
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const line = screen.getByTestId('guide-guide-h1').querySelector('line');
      // At 200% zoom, stroke-width should be 0.5 (1/2)
      const strokeWidth = parseFloat(line?.getAttribute('stroke-width') ?? '0');
      expect(strokeWidth).toBe(0.5);
    });

    test('stroke-width scales with zoom at 50%', () => {
      setZoom(0.5);
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const line = screen.getByTestId('guide-guide-h1').querySelector('line');
      // At 50% zoom, stroke-width should be 2 (1/0.5)
      const strokeWidth = parseFloat(line?.getAttribute('stroke-width') ?? '0');
      expect(strokeWidth).toBe(2);
    });

    test('dash array scales with zoom', () => {
      setZoom(2.0);
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine guide={horizontalGuide} canvasWidth={800} canvasHeight={600} />
        </svg>
      ));

      const line = screen.getByTestId('guide-guide-h1').querySelector('line');
      const dashArray = line?.getAttribute('stroke-dasharray');
      // Dash array should be smaller at higher zoom
      expect(dashArray).toBeTruthy();
      const dashes = dashArray?.split(' ').map(Number);
      // At 200% zoom, dashes should be half size
      expect(dashes?.[0]).toBe(2); // 4/2
    });
  });

  describe('double-click delete (FR-014)', () => {
    test('double-click calls onDblClick callback', () => {
      const onDblClick = vi.fn();
      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine
            guide={horizontalGuide}
            canvasWidth={800}
            canvasHeight={600}
            onDblClick={onDblClick}
          />
        </svg>
      ));

      const guide = screen.getByTestId('guide-guide-h1');
      fireEvent.dblClick(guide);

      expect(onDblClick).toHaveBeenCalledWith('guide-h1');
    });

    test('double-click on guide removes it from store', () => {
      // Add a guide to the store
      testInRoot(() => {
        addGuide('horizontal', 100);
      });

      let guideId: string | undefined;
      testInRoot(() => {
        guideId = guidesStore.guides[0]?.id;
        expect(guidesStore.guides.length).toBe(1);
      });

      const guide: CustomGuide = {
        id: guideId!,
        orientation: 'horizontal',
        position: 100,
      };

      const handleDblClick = (id: string) => {
        deleteGuideWithHistory(id);
      };

      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine
            guide={guide}
            canvasWidth={800}
            canvasHeight={600}
            onDblClick={handleDblClick}
          />
        </svg>
      ));

      const guideElement = screen.getByTestId(`guide-${guideId}`);
      fireEvent.dblClick(guideElement);

      testInRoot(() => {
        expect(guidesStore.guides.length).toBe(0);
      });
    });

    test('double-click only deletes the targeted guide', () => {
      // Add multiple guides to the store
      testInRoot(() => {
        addGuide('horizontal', 100);
        addGuide('vertical', 200);
        addGuide('horizontal', 300);
      });

      let guideIds: string[] = [];
      testInRoot(() => {
        guideIds = guidesStore.guides.map(g => g.id);
        expect(guidesStore.guides.length).toBe(3);
      });

      const targetGuide: CustomGuide = {
        id: guideIds[1],
        orientation: 'vertical',
        position: 200,
      };

      const handleDblClick = (id: string) => {
        deleteGuideWithHistory(id);
      };

      render(() => (
        <svg data-testid="canvas" width={800} height={600}>
          <GuideLine
            guide={targetGuide}
            canvasWidth={800}
            canvasHeight={600}
            onDblClick={handleDblClick}
          />
        </svg>
      ));

      const guideElement = screen.getByTestId(`guide-${guideIds[1]}`);
      fireEvent.dblClick(guideElement);

      testInRoot(() => {
        // Only 2 guides should remain
        expect(guidesStore.guides.length).toBe(2);
        // The deleted guide should not be in the store
        expect(guidesStore.guides.find(g => g.id === guideIds[1])).toBeUndefined();
        // Other guides should still exist
        expect(guidesStore.guides.find(g => g.id === guideIds[0])).toBeDefined();
        expect(guidesStore.guides.find(g => g.id === guideIds[2])).toBeDefined();
      });
    });
  });

  describe('drag-to-ruler delete (FR-015)', () => {
    test('dragging guide to ruler triggers deletion during reposition', () => {
      // Add a guide to the store
      testInRoot(() => {
        addGuide('horizontal', 100);
      });

      let guideId: string | undefined;
      testInRoot(() => {
        guideId = guidesStore.guides[0]?.id;
        expect(guidesStore.guides.length).toBe(1);
      });

      // Simulate the reposition drag lifecycle
      testInRoot(() => {
        // Start reposition drag
        startRepositionDrag(guideId!, 100);
        expect(guidesStore.repositionDrag).not.toBeNull();

        // Update drag position - over ruler (isOverRuler = true triggers delete)
        updateRepositionDrag(50, true);

        // Complete the drag - should delete the guide
        const result = completeRepositionDrag();
        expect(result).toBe('deleted');
        expect(guidesStore.guides.length).toBe(0);
      });
    });

    test('dragging guide within canvas repositions but does not delete', () => {
      // Add a guide to the store
      testInRoot(() => {
        addGuide('vertical', 200);
      });

      let guideId: string | undefined;
      testInRoot(() => {
        guideId = guidesStore.guides[0]?.id;
        expect(guidesStore.guides.length).toBe(1);
      });

      // Simulate the reposition drag lifecycle
      testInRoot(() => {
        // Start reposition drag
        startRepositionDrag(guideId!, 200);
        expect(guidesStore.repositionDrag).not.toBeNull();

        // Update drag position - NOT over ruler
        updateRepositionDrag(300, false);

        // Complete the drag - should reposition, not delete
        const result = completeRepositionDrag();
        expect(result).toBe('repositioned');
        expect(guidesStore.guides.length).toBe(1);
        expect(guidesStore.guides[0].position).toBe(300);
      });
    });

    test('only targeted guide deleted when dragged to ruler with multiple guides', () => {
      // Add multiple guides to the store
      testInRoot(() => {
        addGuide('horizontal', 100);
        addGuide('vertical', 200);
        addGuide('horizontal', 300);
      });

      let guideIds: string[] = [];
      testInRoot(() => {
        guideIds = guidesStore.guides.map(g => g.id);
        expect(guidesStore.guides.length).toBe(3);
      });

      // Simulate the reposition drag lifecycle for the middle guide
      testInRoot(() => {
        // Start reposition drag for vertical guide
        startRepositionDrag(guideIds[1], 200);

        // Update drag position - over ruler
        updateRepositionDrag(50, true);

        // Complete the drag - should delete only that guide
        const result = completeRepositionDrag();
        expect(result).toBe('deleted');
        expect(guidesStore.guides.length).toBe(2);
        // The deleted guide should not be in the store
        expect(guidesStore.guides.find(g => g.id === guideIds[1])).toBeUndefined();
        // Other guides should remain
        expect(guidesStore.guides.find(g => g.id === guideIds[0])).toBeDefined();
        expect(guidesStore.guides.find(g => g.id === guideIds[2])).toBeDefined();
      });
    });
  });
});
