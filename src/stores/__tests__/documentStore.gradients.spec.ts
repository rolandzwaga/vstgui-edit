import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { GradientColorStop, VSTGUIUIDescription } from '../../types/uidesc';
import {
  addGradient,
  deleteGradient,
  getGradients,
  reset,
  restoreGradientReference,
  setDocumentForTest,
  updateGradientName,
  updateGradientStops,
} from '../documentStore';

function createTestDocument(): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      gradients: {
        'Background Gradient': [
          { rgba: '#000000FF', start: '0.00' },
          { rgba: '#FFFFFFFF', start: '1.00' },
        ],
        'Highlight Gradient': [
          { rgba: '#FF0000FF', start: '0.00' },
          { rgba: '#00FF00FF', start: '0.50' },
          { rgba: '#0000FFFF', start: '1.00' },
        ],
      },
      templates: {
        MainView: {
          attributes: {
            class: 'CViewContainer',
            origin: '0, 0',
            size: '400, 300',
          },
          children: {
            gradientView: {
              attributes: {
                class: 'CGradientView',
                gradient: 'Background Gradient',
              },
            },
          },
        },
      },
    },
  };
}

function createDocumentWithoutGradients(): VSTGUIUIDescription {
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

describe('documentStore - getGradients', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return undefined', () => {
      testInRoot(() => {
        const result = getGradients();
        expect(result).toBeUndefined();
      });
    });
  });

  describe('Given document with gradients', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should return all gradients', () => {
      testInRoot(() => {
        const gradients = getGradients();
        expect(gradients).toBeDefined();
        expect(Object.keys(gradients!)).toHaveLength(2);
        expect(gradients!['Background Gradient']).toHaveLength(2);
        expect(gradients!['Highlight Gradient']).toHaveLength(3);
      });
    });
  });

  describe('Given document without gradients', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createDocumentWithoutGradients());
      });
    });

    it('should return undefined', () => {
      testInRoot(() => {
        const gradients = getGradients();
        expect(gradients).toBeUndefined();
      });
    });
  });
});

describe('documentStore - addGradient', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return false', () => {
      testInRoot(() => {
        const stops: GradientColorStop[] = [
          { rgba: '#000000FF', start: '0.00' },
          { rgba: '#FFFFFFFF', start: '1.00' },
        ];
        const result = addGradient('New Gradient', stops);
        expect(result).toBe(false);
      });
    });
  });

  describe('Given document without gradients section', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createDocumentWithoutGradients());
      });
    });

    it('should create gradients section and add gradient', () => {
      testInRoot(() => {
        const stops: GradientColorStop[] = [
          { rgba: '#000000FF', start: '0.00' },
          { rgba: '#FFFFFFFF', start: '1.00' },
        ];
        const result = addGradient('New Gradient', stops);
        expect(result).toBe(true);

        const gradients = getGradients();
        expect(gradients).toBeDefined();
        expect(gradients!['New Gradient']).toEqual(stops);
      });
    });
  });

  describe('Given document with existing gradients', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should add new gradient', () => {
      testInRoot(() => {
        const stops: GradientColorStop[] = [
          { rgba: '#AABBCCDD', start: '0.00' },
          { rgba: '#EEFF0011', start: '1.00' },
        ];
        const result = addGradient('New Gradient', stops);
        expect(result).toBe(true);

        const gradients = getGradients();
        expect(Object.keys(gradients!)).toHaveLength(3);
        expect(gradients!['New Gradient']).toEqual(stops);
      });
    });
  });
});

describe('documentStore - updateGradientName', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return false', () => {
      testInRoot(() => {
        const result = updateGradientName('Background Gradient', 'Renamed Gradient');
        expect(result).toBe(false);
      });
    });
  });

  describe('Given document with gradients', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should rename existing gradient', () => {
      testInRoot(() => {
        const result = updateGradientName('Background Gradient', 'Renamed Gradient');
        expect(result).toBe(true);

        const gradients = getGradients();
        expect(gradients!['Background Gradient']).toBeUndefined();
        expect(gradients!['Renamed Gradient']).toBeDefined();
        expect(gradients!['Renamed Gradient']).toHaveLength(2);
      });
    });

    it('should return false for non-existent gradient', () => {
      testInRoot(() => {
        const result = updateGradientName('NonExistent', 'Renamed');
        expect(result).toBe(false);
      });
    });
  });
});

describe('documentStore - updateGradientStops', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return null', () => {
      testInRoot(() => {
        const newStops: GradientColorStop[] = [
          { rgba: '#FF0000FF', start: '0.00' },
          { rgba: '#00FF00FF', start: '1.00' },
        ];
        const result = updateGradientStops('Background Gradient', newStops);
        expect(result).toBeNull();
      });
    });
  });

  describe('Given document with gradients', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should update stops and return previous stops', () => {
      testInRoot(() => {
        const newStops: GradientColorStop[] = [
          { rgba: '#FF0000FF', start: '0.00' },
          { rgba: '#00FF00FF', start: '0.50' },
          { rgba: '#0000FFFF', start: '1.00' },
        ];
        const previousStops = updateGradientStops('Background Gradient', newStops);

        expect(previousStops).toBeDefined();
        expect(previousStops).toHaveLength(2);
        expect(previousStops![0].rgba).toBe('#000000FF');

        const gradients = getGradients();
        expect(gradients!['Background Gradient']).toEqual(newStops);
      });
    });

    it('should return null for non-existent gradient', () => {
      testInRoot(() => {
        const newStops: GradientColorStop[] = [
          { rgba: '#FF0000FF', start: '0.00' },
          { rgba: '#00FF00FF', start: '1.00' },
        ];
        const result = updateGradientStops('NonExistent', newStops);
        expect(result).toBeNull();
      });
    });
  });
});

describe('documentStore - deleteGradient', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given no document loaded', () => {
    it('should return null', () => {
      testInRoot(() => {
        const result = deleteGradient('Background Gradient');
        expect(result).toBeNull();
      });
    });
  });

  describe('Given document with gradients', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
      });
    });

    it('should delete gradient and return stops and references', () => {
      testInRoot(() => {
        const result = deleteGradient('Background Gradient');

        expect(result).toBeDefined();
        expect(result!.stops).toHaveLength(2);
        expect(result!.removedReferences).toHaveLength(1);
        expect(result!.removedReferences[0]).toEqual({
          viewId: 'MainView-gradientView',
          attribute: 'gradient',
          value: 'Background Gradient',
        });

        const gradients = getGradients();
        expect(gradients!['Background Gradient']).toBeUndefined();
        expect(Object.keys(gradients!)).toHaveLength(1);
      });
    });

    it('should return null for non-existent gradient', () => {
      testInRoot(() => {
        const result = deleteGradient('NonExistent');
        expect(result).toBeNull();
      });
    });

    it('should clear gradient references from views', () => {
      testInRoot(() => {
        deleteGradient('Background Gradient');

        const gradients = getGradients();
        expect(gradients!['Background Gradient']).toBeUndefined();
      });
    });
  });
});

describe('documentStore - restoreGradientReference', () => {
  beforeEach(() => {
    reset();
  });

  describe('Given document with gradient deleted', () => {
    beforeEach(() => {
      testInRoot(() => {
        setDocumentForTest(createTestDocument());
        deleteGradient('Background Gradient');
      });
    });

    it('should restore gradient reference to view', () => {
      testInRoot(() => {
        const stops: GradientColorStop[] = [
          { rgba: '#000000FF', start: '0.00' },
          { rgba: '#FFFFFFFF', start: '1.00' },
        ];
        addGradient('Background Gradient', stops);
        restoreGradientReference('MainView-gradientView', 'gradient', 'Background Gradient');

        const gradients = getGradients();
        expect(gradients!['Background Gradient']).toBeDefined();
      });
    });
  });
});
