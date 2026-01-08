import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { VSTGUIUIDescription } from '../../types/uidesc';
import {
  addControlTag,
  deleteControlTag,
  getControlTags,
  reset,
  restoreControlTagReference,
  setDocumentForTest,
  updateControlTagId,
  updateControlTagName,
} from '../documentStore';

function createTestDocument(): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      'control-tags': {
        Volume: '0',
        Pan: '1',
        Bypass: '2',
      },
      templates: {
        MainView: {
          attributes: {
            class: 'CViewContainer',
            origin: '0, 0',
            size: '400, 300',
          },
          children: {
            slider1: {
              attributes: {
                class: 'CSlider',
                'control-tag': 'Volume',
              },
            },
            knob1: {
              attributes: {
                class: 'CKnob',
                'control-tag': 'Pan',
              },
            },
          },
        },
      },
    },
  };
}

function createDocumentWithoutControlTags(): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      templates: {
        MainView: {
          attributes: {
            class: 'CViewContainer',
            origin: '0, 0',
            size: '400, 300',
          },
        },
      },
    },
  };
}

describe('documentStore - getControlTags', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return undefined', () => {
      testInRoot(() => {
        const result = getControlTags();
        expect(result).toBeUndefined();
      });
    });
  });

  describe('Given document with control-tags', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should return all control tags', () => {
      testInRoot(() => {
        const tags = getControlTags();
        expect(tags).toEqual({
          Volume: '0',
          Pan: '1',
          Bypass: '2',
        });
      });
    });
  });

  describe('Given document without control-tags section', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createDocumentWithoutControlTags());
      });
    });

    it('should return undefined', () => {
      testInRoot(() => {
        const tags = getControlTags();
        expect(tags).toBeUndefined();
      });
    });
  });
});

describe('documentStore - addControlTag', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return false', () => {
      testInRoot(() => {
        const result = addControlTag('NewTag', '10');
        expect(result).toBe(false);
      });
    });
  });

  describe('Given document with control-tags', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should add new control tag', () => {
      testInRoot(() => {
        const result = addControlTag('NewTag', '10');
        expect(result).toBe(true);

        const tags = getControlTags();
        expect(tags?.NewTag).toBe('10');
      });
    });

    it('should preserve existing tags', () => {
      testInRoot(() => {
        addControlTag('NewTag', '10');

        const tags = getControlTags();
        expect(tags?.Volume).toBe('0');
        expect(tags?.Pan).toBe('1');
        expect(tags?.Bypass).toBe('2');
      });
    });
  });

  describe('Given document without control-tags section', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createDocumentWithoutControlTags());
      });
    });

    it('should create control-tags section and add tag', () => {
      testInRoot(() => {
        const result = addControlTag('NewTag', '0');
        expect(result).toBe(true);

        const tags = getControlTags();
        expect(tags?.NewTag).toBe('0');
      });
    });
  });
});

describe('documentStore - updateControlTagName', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return false', () => {
      testInRoot(() => {
        const result = updateControlTagName('Volume', 'MainVolume');
        expect(result).toBe(false);
      });
    });
  });

  describe('Given document with control-tags', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should rename existing tag', () => {
      testInRoot(() => {
        const result = updateControlTagName('Volume', 'MainVolume');
        expect(result).toBe(true);

        const tags = getControlTags();
        expect(tags?.MainVolume).toBe('0');
        expect(tags?.Volume).toBeUndefined();
      });
    });

    it('should preserve tag ID when renaming', () => {
      testInRoot(() => {
        updateControlTagName('Volume', 'MainVolume');

        const tags = getControlTags();
        expect(tags?.MainVolume).toBe('0');
      });
    });

    it('should return false for non-existent tag', () => {
      testInRoot(() => {
        const result = updateControlTagName('NonExistent', 'NewName');
        expect(result).toBe(false);
      });
    });
  });
});

describe('documentStore - updateControlTagId', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return null', () => {
      testInRoot(() => {
        const result = updateControlTagId('Volume', '10');
        expect(result).toBeNull();
      });
    });
  });

  describe('Given document with control-tags', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should update tag ID and return old ID', () => {
      testInRoot(() => {
        const oldId = updateControlTagId('Volume', '10');
        expect(oldId).toBe('0');

        const tags = getControlTags();
        expect(tags?.Volume).toBe('10');
      });
    });

    it('should return null for non-existent tag', () => {
      testInRoot(() => {
        const result = updateControlTagId('NonExistent', '10');
        expect(result).toBeNull();
      });
    });

    it('should allow ID 0', () => {
      testInRoot(() => {
        updateControlTagId('Volume', '0');

        const tags = getControlTags();
        expect(tags?.Volume).toBe('0');
      });
    });
  });
});

describe('documentStore - deleteControlTag', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return null', () => {
      testInRoot(() => {
        const result = deleteControlTag('Volume');
        expect(result).toBeNull();
      });
    });
  });

  describe('Given document with control-tags', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should delete unused tag', () => {
      testInRoot(() => {
        const result = deleteControlTag('Bypass');
        expect(result).not.toBeNull();
        expect(result?.tagId).toBe('2');
        expect(result?.removedReferences).toHaveLength(0);

        const tags = getControlTags();
        expect(tags?.Bypass).toBeUndefined();
      });
    });

    it('should delete tag and remove references', () => {
      testInRoot(() => {
        const result = deleteControlTag('Volume');
        expect(result).not.toBeNull();
        expect(result?.tagId).toBe('0');
        expect(result?.removedReferences).toHaveLength(1);
        expect(result?.removedReferences[0].viewId).toBe('MainView-slider1');
      });
    });

    it('should return null for non-existent tag', () => {
      testInRoot(() => {
        const result = deleteControlTag('NonExistent');
        expect(result).toBeNull();
      });
    });
  });
});

describe('documentStore - restoreControlTagReference', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return false', () => {
      testInRoot(() => {
        const result = restoreControlTagReference('MainView-slider1', 'Volume');
        expect(result).toBe(false);
      });
    });
  });

  describe('Given document with templates', () => {
    beforeEach(() => {
      testInRoot(() => {
        const doc = createTestDocument();
        if (doc['vstgui-ui-description'].templates?.MainView.children?.slider1) {
          delete doc['vstgui-ui-description'].templates.MainView.children.slider1.attributes[
            'control-tag'
          ];
        }
        setDocumentForTest(doc);
      });
    });

    it('should restore control-tag attribute', () => {
      testInRoot(() => {
        const result = restoreControlTagReference('MainView-slider1', 'Volume');
        expect(result).toBe(true);
      });
    });

    it('should return false for non-existent view', () => {
      testInRoot(() => {
        const result = restoreControlTagReference('NonExistent', 'Volume');
        expect(result).toBe(false);
      });
    });
  });
});
