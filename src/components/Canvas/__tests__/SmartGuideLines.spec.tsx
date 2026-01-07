import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@solidjs/testing-library';
import type { JSX } from 'solid-js';
import { SmartGuideLines } from '../SmartGuideLines';
import { setActiveGuides, resetSmartGuides } from '../../../stores/smartGuidesStore';
import type { SmartGuide } from '../../../types/smartGuides';

describe('SmartGuideLines', () => {
  beforeEach(() => {
    resetSmartGuides();
  });

  afterEach(() => {
    cleanup();
  });

  const renderInSvg = (component: () => JSX.Element) => {
    return render(() => (
      <svg data-testid="canvas-svg" width="800" height="600">
        {component()}
      </svg>
    ));
  };

  describe('when no guides are active', () => {
    test('renders nothing', () => {
      renderInSvg(() => <SmartGuideLines />);
      const lines = screen.queryAllByTestId(/^smart-guide-/);
      expect(lines).toHaveLength(0);
    });
  });

  describe('vertical guides', () => {
    test('renders a vertical line for vertical guide', () => {
      const guide: SmartGuide = {
        id: 'v-guide-1',
        orientation: 'vertical',
        position: 100,
        type: 'edge',
        participatingViewIds: ['view-1', 'view-2'],
      };
      setActiveGuides([guide]);

      renderInSvg(() => <SmartGuideLines />);
      const line = screen.getByTestId('smart-guide-v-guide-1');
      expect(line).toBeInTheDocument();
      expect(line.getAttribute('x1')).toBe('100');
      expect(line.getAttribute('x2')).toBe('100');
    });

    test('vertical line extends full canvas height', () => {
      const guide: SmartGuide = {
        id: 'v-guide-1',
        orientation: 'vertical',
        position: 150,
        type: 'edge',
        participatingViewIds: ['view-1'],
      };
      setActiveGuides([guide]);

      renderInSvg(() => <SmartGuideLines />);
      const line = screen.getByTestId('smart-guide-v-guide-1');
      expect(line.getAttribute('y1')).toBe('0');
      expect(line.getAttribute('y2')).toBe('100%');
    });
  });

  describe('horizontal guides', () => {
    test('renders a horizontal line for horizontal guide', () => {
      const guide: SmartGuide = {
        id: 'h-guide-1',
        orientation: 'horizontal',
        position: 200,
        type: 'center',
        participatingViewIds: ['view-1', 'view-2'],
      };
      setActiveGuides([guide]);

      renderInSvg(() => <SmartGuideLines />);
      const line = screen.getByTestId('smart-guide-h-guide-1');
      expect(line).toBeInTheDocument();
      expect(line.getAttribute('y1')).toBe('200');
      expect(line.getAttribute('y2')).toBe('200');
    });

    test('horizontal line extends full canvas width', () => {
      const guide: SmartGuide = {
        id: 'h-guide-1',
        orientation: 'horizontal',
        position: 75,
        type: 'center',
        participatingViewIds: ['view-1'],
      };
      setActiveGuides([guide]);

      renderInSvg(() => <SmartGuideLines />);
      const line = screen.getByTestId('smart-guide-h-guide-1');
      expect(line.getAttribute('x1')).toBe('0');
      expect(line.getAttribute('x2')).toBe('100%');
    });
  });

  describe('multiple guides', () => {
    test('renders all active guides', () => {
      const guides: SmartGuide[] = [
        {
          id: 'guide-1',
          orientation: 'vertical',
          position: 100,
          type: 'edge',
          participatingViewIds: ['view-1'],
        },
        {
          id: 'guide-2',
          orientation: 'horizontal',
          position: 200,
          type: 'center',
          participatingViewIds: ['view-2'],
        },
        {
          id: 'guide-3',
          orientation: 'vertical',
          position: 300,
          type: 'edge',
          participatingViewIds: ['view-3'],
        },
      ];
      setActiveGuides(guides);

      renderInSvg(() => <SmartGuideLines />);
      expect(screen.getByTestId('smart-guide-guide-1')).toBeInTheDocument();
      expect(screen.getByTestId('smart-guide-guide-2')).toBeInTheDocument();
      expect(screen.getByTestId('smart-guide-guide-3')).toBeInTheDocument();
    });
  });

  describe('guide styling', () => {
    test('line has correct stroke color (magenta)', () => {
      const guide: SmartGuide = {
        id: 'styled-guide',
        orientation: 'vertical',
        position: 100,
        type: 'edge',
        participatingViewIds: ['view-1'],
      };
      setActiveGuides([guide]);

      renderInSvg(() => <SmartGuideLines />);
      const line = screen.getByTestId('smart-guide-styled-guide');
      expect(line.getAttribute('stroke')).toBe('var(--color-smart-guide)');
    });

    test('line has 1px stroke width', () => {
      const guide: SmartGuide = {
        id: 'styled-guide',
        orientation: 'vertical',
        position: 100,
        type: 'edge',
        participatingViewIds: ['view-1'],
      };
      setActiveGuides([guide]);

      renderInSvg(() => <SmartGuideLines />);
      const line = screen.getByTestId('smart-guide-styled-guide');
      expect(line.getAttribute('stroke-width')).toBe('1');
    });
  });

  describe('guide types', () => {
    test('renders edge type guides', () => {
      const guide: SmartGuide = {
        id: 'edge-guide',
        orientation: 'vertical',
        position: 100,
        type: 'edge',
        participatingViewIds: ['view-1'],
      };
      setActiveGuides([guide]);

      renderInSvg(() => <SmartGuideLines />);
      const line = screen.getByTestId('smart-guide-edge-guide');
      expect(line).toBeInTheDocument();
    });

    test('renders center type guides', () => {
      const guide: SmartGuide = {
        id: 'center-guide',
        orientation: 'horizontal',
        position: 150,
        type: 'center',
        participatingViewIds: ['view-1'],
      };
      setActiveGuides([guide]);

      renderInSvg(() => <SmartGuideLines />);
      const line = screen.getByTestId('smart-guide-center-guide');
      expect(line).toBeInTheDocument();
    });

    test('renders parent-center type guides', () => {
      const guide: SmartGuide = {
        id: 'parent-center-guide',
        orientation: 'vertical',
        position: 200,
        type: 'parent-center',
        participatingViewIds: ['view-1', 'parent'],
      };
      setActiveGuides([guide]);

      renderInSvg(() => <SmartGuideLines />);
      const line = screen.getByTestId('smart-guide-parent-center-guide');
      expect(line).toBeInTheDocument();
    });
  });

  describe('reactivity', () => {
    test('updates when guides change', () => {
      const guide1: SmartGuide = {
        id: 'guide-1',
        orientation: 'vertical',
        position: 100,
        type: 'edge',
        participatingViewIds: ['view-1'],
      };
      setActiveGuides([guide1]);

      renderInSvg(() => <SmartGuideLines />);
      expect(screen.getByTestId('smart-guide-guide-1')).toBeInTheDocument();

      const guide2: SmartGuide = {
        id: 'guide-2',
        orientation: 'horizontal',
        position: 200,
        type: 'center',
        participatingViewIds: ['view-2'],
      };
      setActiveGuides([guide2]);

      expect(screen.queryByTestId('smart-guide-guide-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('smart-guide-guide-2')).toBeInTheDocument();
    });

    test('removes guides when cleared', () => {
      const guide: SmartGuide = {
        id: 'guide-1',
        orientation: 'vertical',
        position: 100,
        type: 'edge',
        participatingViewIds: ['view-1'],
      };
      setActiveGuides([guide]);

      renderInSvg(() => <SmartGuideLines />);
      expect(screen.getByTestId('smart-guide-guide-1')).toBeInTheDocument();

      setActiveGuides([]);
      expect(screen.queryByTestId('smart-guide-guide-1')).not.toBeInTheDocument();
    });
  });
});
