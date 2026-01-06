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

    it('should use class name as className field', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CTextButton',
          origin: '0, 0',
          size: '100, 30',
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result[0].className).toBe('CTextButton');
    });

    it('should extract title attribute when present', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CTextLabel',
          origin: '0, 0',
          size: '100, 30',
          title: 'Hello World',
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result[0].title).toBe('Hello World');
    });

    it('should not include title when attribute is missing', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CTextButton',
          origin: '0, 0',
          size: '100, 30',
        },
      };

      const result = flattenHierarchy(view, 'root');

      expect(result[0].title).toBeUndefined();
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

    it('should use "Unknown" className when class is missing', () => {
      const view = {
        attributes: {
          origin: '0, 0',
          size: '100, 100',
        },
      } as ViewDefinition;

      const result = flattenHierarchy(view, 'root');

      expect(result[0].className).toBe('Unknown');
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

    it('should use path-based id for children', () => {
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

      // Child ID is parent ID + child key for uniqueness
      expect(result[1].id).toBe('root-myButton');
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
      expect(result[1].id).toBe('root-panel');
      expect(result[2].id).toBe('root-panel-button');
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

  describe('Given multiple containers with same-named children (unique IDs)', () => {
    it('should generate unique IDs for children with same key in different parents', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '400, 300',
        },
        children: {
          panelA: {
            attributes: {
              class: 'CViewContainer',
              origin: '0, 0',
              size: '200, 150',
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
          panelB: {
            attributes: {
              class: 'CViewContainer',
              origin: '200, 0',
              size: '200, 150',
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

      // Extract all IDs
      const ids = result.map((v) => v.id);

      // All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // Should have 5 views: root, panelA, panelA/button, panelB, panelB/button
      expect(result).toHaveLength(5);
    });

    it('should generate path-based IDs for nested children', () => {
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

      // Root ID should be 'root'
      expect(result[0].id).toBe('root');

      // Panel ID should include root path
      expect(result[1].id).toContain('panel');

      // Button ID should include both root and panel path
      expect(result[2].id).toContain('button');

      // All IDs should be unique
      const ids = result.map((v) => v.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Given font and color options (font styling)', () => {
    it('should resolve fontSize from fonts definition', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CTextLabel',
          origin: '0, 0',
          size: '100, 30',
          title: 'Test',
          font: 'myFont',
        },
      };

      const result = flattenHierarchy(view, 'root', {
        fonts: {
          myFont: { 'font-name': 'Arial', size: '14' },
        },
      });

      expect(result[0].fontSize).toBe(14);
    });

    it('should resolve fontColor from colors definition', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CTextLabel',
          origin: '0, 0',
          size: '100, 30',
          title: 'Test',
          'font-color': 'myColor',
        },
      };

      const result = flattenHierarchy(view, 'root', {
        colors: {
          myColor: '#FF0000',
        },
      });

      expect(result[0].fontColor).toBe('#FF0000');
    });

    it('should convert #RRGGBBAA to rgba format', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CTextLabel',
          origin: '0, 0',
          size: '100, 30',
          title: 'Test',
          'font-color': '#FF000080',
        },
      };

      const result = flattenHierarchy(view, 'root', {});

      expect(result[0].fontColor).toMatch(/rgba\(255, 0, 0, 0\.50\)/);
    });

    it('should resolve predefined VSTGUI colors', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CTextLabel',
          origin: '0, 0',
          size: '100, 30',
          title: 'Test',
          'font-color': '~ WhiteCColor',
        },
      };

      const result = flattenHierarchy(view, 'root', {});

      expect(result[0].fontColor).toBe('#FFFFFF');
    });

    it('should resolve color reference chains', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CTextLabel',
          origin: '0, 0',
          size: '100, 30',
          title: 'Test',
          'font-color': 'textColor',
        },
      };

      const result = flattenHierarchy(view, 'root', {
        colors: {
          textColor: 'primaryColor',
          primaryColor: '#0000FF',
        },
      });

      expect(result[0].fontColor).toBe('#0000FF');
    });

    it('should not set fontSize when font is not found', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CTextLabel',
          origin: '0, 0',
          size: '100, 30',
          title: 'Test',
          font: 'unknownFont',
        },
      };

      const result = flattenHierarchy(view, 'root', {
        fonts: {},
      });

      expect(result[0].fontSize).toBeUndefined();
    });

    it('should not set fontColor when color is not found', () => {
      const view: ViewDefinition = {
        attributes: {
          class: 'CTextLabel',
          origin: '0, 0',
          size: '100, 30',
          title: 'Test',
          'font-color': 'unknownColor',
        },
      };

      const result = flattenHierarchy(view, 'root', {
        colors: {},
      });

      expect(result[0].fontColor).toBeUndefined();
    });
  });
});
