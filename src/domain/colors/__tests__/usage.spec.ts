import { describe, expect, it } from 'vitest';
import type { VSTGUIUIDescription } from '../../../types/uidesc';
import { type ColorUsage, findColorUsages } from '../usage';

describe('findColorUsages', () => {
  describe('given no document', () => {
    it('should return empty array', () => {
      const result = findColorUsages('Primary', null);
      expect(result).toEqual([]);
    });
  });

  describe('given document with no templates', () => {
    it('should return empty array', () => {
      const doc: VSTGUIUIDescription = {
        'vstgui-ui-description': {
          version: '1',
        },
      };
      const result = findColorUsages('Primary', doc);
      expect(result).toEqual([]);
    });
  });

  describe('given color not used', () => {
    it('should return empty array', () => {
      const doc: VSTGUIUIDescription = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer', size: '400, 300' },
            },
          },
        },
      };
      const result = findColorUsages('Primary', doc);
      expect(result).toEqual([]);
    });
  });

  describe('given color used in background-color', () => {
    it('should find usage', () => {
      const doc: VSTGUIUIDescription = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                size: '400, 300',
                'background-color': '~ Primary',
              },
            },
          },
        },
      };
      const result = findColorUsages('Primary', doc);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        viewId: 'MainView',
        viewClass: 'CViewContainer',
        attribute: 'background-color',
      });
    });
  });

  describe('given color used in font-color', () => {
    it('should find usage', () => {
      const doc: VSTGUIUIDescription = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CTextLabel',
                'font-color': '~ Primary',
              },
            },
          },
        },
      };
      const result = findColorUsages('Primary', doc);
      expect(result).toHaveLength(1);
      expect(result[0].attribute).toBe('font-color');
    });
  });

  describe('given color used in nested views', () => {
    it('should find all usages', () => {
      const doc: VSTGUIUIDescription = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                'background-color': '~ Primary',
              },
              children: {
                button: {
                  attributes: {
                    class: 'CTextButton',
                    'font-color': '~ Primary',
                  },
                },
                label: {
                  attributes: {
                    class: 'CTextLabel',
                    'back-color': '~ Primary',
                  },
                },
              },
            },
          },
        },
      };
      const result = findColorUsages('Primary', doc);
      expect(result).toHaveLength(3);
    });
  });

  describe('given color referenced by direct name (no tilde)', () => {
    it('should find usage when color name matches directly', () => {
      const doc: VSTGUIUIDescription = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                'background-color': 'Primary',
              },
            },
          },
        },
      };
      const result = findColorUsages('Primary', doc);
      expect(result).toHaveLength(1);
      expect(result[0].attribute).toBe('background-color');
    });
  });

  describe('given both direct and tilde prefix references', () => {
    it('should find all usages regardless of format', () => {
      const doc: VSTGUIUIDescription = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                'background-color': 'Primary',
                'frame-color': '~ Primary',
              },
            },
          },
        },
      };
      const result = findColorUsages('Primary', doc);
      expect(result).toHaveLength(2);
    });
  });

  describe('given multiple colors', () => {
    it('should only find usages of specified color', () => {
      const doc: VSTGUIUIDescription = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: {
                class: 'CViewContainer',
                'background-color': '~ Primary',
                'frame-color': '~ Secondary',
              },
            },
          },
        },
      };
      const result = findColorUsages('Primary', doc);
      expect(result).toHaveLength(1);
      expect(result[0].attribute).toBe('background-color');
    });
  });
});
