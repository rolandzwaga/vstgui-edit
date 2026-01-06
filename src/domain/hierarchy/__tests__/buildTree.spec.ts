import { describe, expect, it } from 'vitest';
import type { ViewNode } from '../../../types/uidesc';
import { buildTree, getContainerIds } from '../buildTree';

describe('buildTree', () => {
  describe('given a root view with class attribute', () => {
    it('should create a TreeNode with correct label and id', () => {
      const view: ViewNode = {
        attributes: { class: 'CViewContainer', origin: '0, 0', size: '400, 300' },
      };

      const result = buildTree(view, 'root');

      expect(result.id).toBe('root');
      expect(result.label).toBe('CViewContainer');
      expect(result.depth).toBe(0);
    });
  });

  describe('given a view with missing class attribute', () => {
    it('should return "Unknown" as label', () => {
      const view: ViewNode = {
        attributes: {} as ViewNode['attributes'],
      };

      const result = buildTree(view, 'root');

      expect(result.label).toBe('Unknown');
    });
  });

  describe('given a view with empty class attribute', () => {
    it('should return "Unknown" as label', () => {
      const view: ViewNode = {
        attributes: { class: '' },
      };

      const result = buildTree(view, 'root');

      expect(result.label).toBe('Unknown');
    });
  });

  describe('given a container view class', () => {
    it('should set category to container', () => {
      const view: ViewNode = {
        attributes: { class: 'CViewContainer' },
      };

      const result = buildTree(view, 'root');

      expect(result.category).toBe('container');
    });
  });

  describe('given a control view class', () => {
    it('should set category to control', () => {
      const view: ViewNode = {
        attributes: { class: 'CTextButton' },
      };

      const result = buildTree(view, 'root');

      expect(result.category).toBe('control');
    });
  });

  describe('given a display view class', () => {
    it('should set category to display', () => {
      const view: ViewNode = {
        attributes: { class: 'CTextLabel' },
      };

      const result = buildTree(view, 'root');

      expect(result.category).toBe('display');
    });
  });

  describe('given an unknown view class', () => {
    it('should set category to custom', () => {
      const view: ViewNode = {
        attributes: { class: 'MyCustomView' },
      };

      const result = buildTree(view, 'root');

      expect(result.category).toBe('custom');
    });
  });

  describe('given a view with no children', () => {
    it('should set hasChildren to false and children to empty array', () => {
      const view: ViewNode = {
        attributes: { class: 'CTextLabel' },
      };

      const result = buildTree(view, 'root');

      expect(result.hasChildren).toBe(false);
      expect(result.children).toEqual([]);
    });
  });

  describe('given a view with empty children object', () => {
    it('should set hasChildren to false', () => {
      const view: ViewNode = {
        attributes: { class: 'CViewContainer' },
        children: {},
      };

      const result = buildTree(view, 'root');

      expect(result.hasChildren).toBe(false);
      expect(result.children).toEqual([]);
    });
  });

  describe('given a view with children', () => {
    it('should set hasChildren to true and build child nodes', () => {
      const view: ViewNode = {
        attributes: { class: 'CViewContainer' },
        children: {
          button: { attributes: { class: 'CTextButton' } },
          label: { attributes: { class: 'CTextLabel' } },
        },
      };

      const result = buildTree(view, 'root');

      expect(result.hasChildren).toBe(true);
      expect(result.children).toHaveLength(2);
    });

    it('should build child nodes with incremented depth', () => {
      const view: ViewNode = {
        attributes: { class: 'CViewContainer' },
        children: {
          child: { attributes: { class: 'CTextButton' } },
        },
      };

      const result = buildTree(view, 'root');

      expect(result.children[0].depth).toBe(1);
    });

    it('should build child node ids with parent id prefix', () => {
      const view: ViewNode = {
        attributes: { class: 'CViewContainer' },
        children: {
          button: { attributes: { class: 'CTextButton' } },
        },
      };

      const result = buildTree(view, 'root');

      expect(result.children[0].id).toBe('root-button');
    });
  });

  describe('given a deeply nested hierarchy', () => {
    it('should correctly build all levels with proper depth', () => {
      const view: ViewNode = {
        attributes: { class: 'CViewContainer' },
        children: {
          level1: {
            attributes: { class: 'CViewContainer' },
            children: {
              level2: {
                attributes: { class: 'CViewContainer' },
                children: {
                  leaf: { attributes: { class: 'CTextLabel' } },
                },
              },
            },
          },
        },
      };

      const result = buildTree(view, 'root');

      expect(result.depth).toBe(0);
      expect(result.children[0].depth).toBe(1);
      expect(result.children[0].children[0].depth).toBe(2);
      expect(result.children[0].children[0].children[0].depth).toBe(3);
    });

    it('should build correct ids through hierarchy', () => {
      const view: ViewNode = {
        attributes: { class: 'CViewContainer' },
        children: {
          panel: {
            attributes: { class: 'CViewContainer' },
            children: {
              button: { attributes: { class: 'CTextButton' } },
            },
          },
        },
      };

      const result = buildTree(view, 'MainView');

      expect(result.id).toBe('MainView');
      expect(result.children[0].id).toBe('MainView-panel');
      expect(result.children[0].children[0].id).toBe('MainView-panel-button');
    });
  });

  describe('given an empty template (root with no children)', () => {
    it('should return a valid TreeNode with empty children array', () => {
      const view: ViewNode = {
        attributes: { class: 'CViewContainer', size: '800, 600' },
      };

      const result = buildTree(view, 'EmptyTemplate');

      expect(result.id).toBe('EmptyTemplate');
      expect(result.label).toBe('CViewContainer');
      expect(result.hasChildren).toBe(false);
      expect(result.children).toEqual([]);
      expect(result.depth).toBe(0);
      expect(result.category).toBe('container');
    });
  });
});

describe('getContainerIds', () => {
  describe('given a flat tree with no children', () => {
    it('should return empty array', () => {
      const view: ViewNode = {
        attributes: { class: 'CTextLabel' },
      };
      const tree = buildTree(view, 'root');

      const result = getContainerIds(tree);

      expect(result).toEqual([]);
    });
  });

  describe('given a tree with containers', () => {
    it('should return ids of nodes with children', () => {
      const view: ViewNode = {
        attributes: { class: 'CViewContainer' },
        children: {
          panel: {
            attributes: { class: 'CViewContainer' },
            children: {
              button: { attributes: { class: 'CTextButton' } },
            },
          },
          label: { attributes: { class: 'CTextLabel' } },
        },
      };
      const tree = buildTree(view, 'root');

      const result = getContainerIds(tree);

      expect(result).toContain('root');
      expect(result).toContain('root-panel');
      expect(result).not.toContain('root-panel-button');
      expect(result).not.toContain('root-label');
    });
  });

  describe('given a deeply nested hierarchy', () => {
    it('should collect all container ids at all levels', () => {
      const view: ViewNode = {
        attributes: { class: 'CViewContainer' },
        children: {
          level1: {
            attributes: { class: 'CViewContainer' },
            children: {
              level2: {
                attributes: { class: 'CViewContainer' },
                children: {
                  leaf: { attributes: { class: 'CTextLabel' } },
                },
              },
            },
          },
        },
      };
      const tree = buildTree(view, 'root');

      const result = getContainerIds(tree);

      expect(result).toContain('root');
      expect(result).toContain('root-level1');
      expect(result).toContain('root-level1-level2');
      expect(result).toHaveLength(3);
    });
  });
});
