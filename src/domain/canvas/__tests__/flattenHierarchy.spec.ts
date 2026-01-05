import { describe, it, expect } from 'vitest';
import { flattenHierarchy } from '../flattenHierarchy';
import type { ViewDefinition } from '../../../types/uidesc';

describe('flattenHierarchy', () => {
  describe('Given a single view with no children (US1 - basic)', () => {
    it('should return array with one RenderableView', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '50, 100',
          size: '200, 80',
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result).toHaveLength(1);
    });

    it('should set correct id from rootId parameter', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CTextButton',
          origin: '10, 20',
          size: '100, 50',
        },
      };

      const result = flattenHierarchy(view, 'my-button');

      expect(result[0].id).toBe('my-button');
    });

    it('should parse origin to absoluteX and absoluteY', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '50, 100',
          size: '200, 80',
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result[0].absoluteX).toBe(50);
      expect(result[0].absoluteY).toBe(100);
    });

    it('should parse size to width and height', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '200, 80',
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result[0].width).toBe(200);
      expect(result[0].height).toBe(80);
    });

    it('should use class name as label', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CTextButton',
          origin: '0, 0',
          size: '100, 30',
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result[0].label).toBe('CTextButton');
    });

    it('should assign zIndex of 0 to root view', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '400, 300',
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result[0].zIndex).toBe(0);
    });

    it('should assign category based on class name', () => {
      const containerView: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '100, 100',
        },
      };

      const result = flattenHierarchy(containerView, 'root');

      expect(result[0].category).toBe('container');
    });
  });

  describe('Given a view with missing attributes', () => {
    it('should use default origin (0, 0) when origin is missing', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          size: '200, 80',
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result[0].absoluteX).toBe(0);
      expect(result[0].absoluteY).toBe(0);
    });

    it('should use default size (20, 20) when size is missing', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '50, 50',
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result[0].width).toBe(20);
      expect(result[0].height).toBe(20);
    });

    it('should use "Unknown" label when class is missing', () => {
      const view: ViewDefinition = {
        attributes: {
          origin: '0, 0',
          size: '100, 100',
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result[0].label).toBe('Unknown');
    });
  });

  describe('Given a view with no rootId', () => {
    it('should generate a default id', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '100, 100',
        },
      };

      const result = flattenHierarchy(view);

      expect(result[0].id).toBe('view-0');
    });
  });
});
