import { describe, expect, it } from 'vitest';
import type { ViewDefinition } from '../../../types/uidesc';
import { flattenHierarchy } from '../flattenHierarchy';

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

  // US2 - Recursive Hierarchy Tests
  describe('Given a view with children (US2 - hierarchy)', () => {
    it('should include children in the result array', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '400, 300',
        },
        children: {
          button1: {
            attributes: {
              class: 'CTextButton',
              origin: '10, 10',
              size: '100, 30',
            },
          },
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result).toHaveLength(2);
    });

    it('should include multiple children in order', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '400, 300',
        },
        children: {
          button1: {
            attributes: {
              class: 'CTextButton',
              origin: '10, 10',
              size: '100, 30',
            },
          },
          slider1: {
            attributes: {
              class: 'CSlider',
              origin: '10, 50',
              size: '100, 20',
            },
          },
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result).toHaveLength(3);
    });

    it('should use child key as id', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '400, 300',
        },
        children: {
          myButton: {
            attributes: {
              class: 'CTextButton',
              origin: '10, 10',
              size: '100, 30',
            },
          },
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result[1].id).toBe('myButton');
    });
  });

  describe('Given nested children (US2 - absolute positions)', () => {
    it('should calculate absolute position by adding parent and child origins', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '50, 50',
          size: '400, 300',
        },
        children: {
          button1: {
            attributes: {
              class: 'CTextButton',
              origin: '10, 10',
              size: '100, 30',
            },
          },
        },
      };

      const result = flattenHierarchy(view, 'root');

      // Child absolute position = parent (50, 50) + child (10, 10) = (60, 60)
      expect(result[1].absoluteX).toBe(60);
      expect(result[1].absoluteY).toBe(60);
    });

    it('should calculate absolute position for deeply nested children', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '100, 100',
          size: '400, 300',
        },
        children: {
          panel: {
            attributes: {
              class: 'CViewContainer',
              origin: '50, 50',
              size: '200, 200',
            },
            children: {
              button: {
                attributes: {
                  class: 'CTextButton',
                  origin: '10, 10',
                  size: '80, 30',
                },
              },
            },
          },
        },
      };

      const result = flattenHierarchy(view, 'root');

      // Button absolute = (100, 100) + (50, 50) + (10, 10) = (160, 160)
      expect(result).toHaveLength(3);
      expect(result[2].absoluteX).toBe(160);
      expect(result[2].absoluteY).toBe(160);
    });
  });

  describe('Given children at various levels (US2 - z-ordering)', () => {
    it('should assign increasing zIndex for children', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '400, 300',
        },
        children: {
          button1: {
            attributes: {
              class: 'CTextButton',
              origin: '10, 10',
              size: '100, 30',
            },
          },
          button2: {
            attributes: {
              class: 'CTextButton',
              origin: '20, 20',
              size: '100, 30',
            },
          },
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result[0].zIndex).toBe(0); // root
      expect(result[1].zIndex).toBe(1); // button1
      expect(result[2].zIndex).toBe(2); // button2
    });

    it('should return views in render order (parents before children)', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '400, 300',
        },
        children: {
          panel: {
            attributes: {
              class: 'CViewContainer',
              origin: '10, 10',
              size: '200, 200',
            },
            children: {
              button: {
                attributes: {
                  class: 'CTextButton',
                  origin: '5, 5',
                  size: '80, 30',
                },
              },
            },
          },
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result[0].id).toBe('root');
      expect(result[1].id).toBe('panel');
      expect(result[2].id).toBe('button');
    });

    it('should ensure children have higher zIndex than parent', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '400, 300',
        },
        children: {
          panel: {
            attributes: {
              class: 'CViewContainer',
              origin: '10, 10',
              size: '200, 200',
            },
            children: {
              button: {
                attributes: {
                  class: 'CTextButton',
                  origin: '5, 5',
                  size: '80, 30',
                },
              },
            },
          },
        },
      };

      const result = flattenHierarchy(view, 'root');

      const rootZIndex = result[0].zIndex;
      const panelZIndex = result[1].zIndex;
      const buttonZIndex = result[2].zIndex;

      expect(panelZIndex).toBeGreaterThan(rootZIndex);
      expect(buttonZIndex).toBeGreaterThan(panelZIndex);
    });
  });
});
