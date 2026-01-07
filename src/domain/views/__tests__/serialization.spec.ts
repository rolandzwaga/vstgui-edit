import { describe, expect, it } from 'vitest';
import { createMockContainer, createMockView } from '../../../__tests__/helpers/fixtures';
import {
  applyOffsetToSerialized,
  collectOriginsFromSerialized,
  deserializeView,
  extractOrigin,
  serializeView,
} from '../serialization';

describe('serialization', () => {
  describe('serializeView', () => {
    it('should serialize a simple view', () => {
      const view = createMockView({ class: 'CTextLabel', origin: '10, 20', size: '100, 30' });
      const serialized = serializeView('MainView-0', view);

      expect(serialized.originalId).toBe('MainView-0');
      expect(serialized.class).toBe('CTextLabel');
      expect(serialized.attributes.origin).toBe('10, 20');
      expect(serialized.attributes.size).toBe('100, 30');
      expect(serialized.children).toBeUndefined();
    });

    it('should serialize a container with children', () => {
      const container = createMockContainer(
        { origin: '0, 0', size: '200, 200' },
        {
          '0': createMockView({ class: 'CTextLabel', origin: '10, 10' }),
          '1': createMockView({ class: 'CTextButton', origin: '10, 50' }),
        }
      );
      const serialized = serializeView('MainView-0', container);

      expect(serialized.originalId).toBe('MainView-0');
      expect(serialized.class).toBe('CViewContainer');
      expect(serialized.children).toHaveLength(2);
      expect(serialized.children?.[0].originalId).toBe('MainView-0-0');
      expect(serialized.children?.[0].class).toBe('CTextLabel');
      expect(serialized.children?.[1].originalId).toBe('MainView-0-1');
      expect(serialized.children?.[1].class).toBe('CTextButton');
    });

    it('should serialize nested containers', () => {
      const nestedContainer = createMockContainer(
        { origin: '0, 0' },
        {
          '0': createMockContainer(
            { origin: '10, 10' },
            {
              '0': createMockView({ class: 'CSlider' }),
            }
          ),
        }
      );
      const serialized = serializeView('MainView-0', nestedContainer);

      expect(serialized.children).toHaveLength(1);
      expect(serialized.children?.[0].children).toHaveLength(1);
      expect(serialized.children?.[0].children?.[0].originalId).toBe('MainView-0-0-0');
      expect(serialized.children?.[0].children?.[0].class).toBe('CSlider');
    });
  });

  describe('deserializeView', () => {
    it('should deserialize a simple view', () => {
      const serialized = {
        originalId: 'MainView-0',
        class: 'CTextLabel',
        attributes: { class: 'CTextLabel', origin: '10, 20', size: '100, 30' },
      };
      const view = deserializeView(serialized);

      expect(view.attributes.class).toBe('CTextLabel');
      expect(view.attributes.origin).toBe('10, 20');
      expect(view.attributes.size).toBe('100, 30');
      expect(view.children).toBeUndefined();
    });

    it('should deserialize a container with children', () => {
      const serialized = {
        originalId: 'MainView-0',
        class: 'CViewContainer',
        attributes: { class: 'CViewContainer', origin: '0, 0' },
        children: [
          { originalId: 'MainView-0-0', class: 'CTextLabel', attributes: { class: 'CTextLabel', origin: '10, 10' } },
          { originalId: 'MainView-0-1', class: 'CTextButton', attributes: { class: 'CTextButton', origin: '20, 20' } },
        ],
      };
      const view = deserializeView(serialized);

      expect(view.children).toBeDefined();
      expect(Object.keys(view.children ?? {})).toHaveLength(2);
      expect(view.children?.['0']?.attributes.class).toBe('CTextLabel');
      expect(view.children?.['1']?.attributes.class).toBe('CTextButton');
    });

    it('should roundtrip serialize and deserialize', () => {
      const original = createMockContainer(
        { origin: '50, 50', size: '300, 300' },
        {
          '0': createMockView({ class: 'CKnob', origin: '10, 10', size: '50, 50' }),
          '1': createMockContainer(
            { origin: '100, 10', size: '100, 100' },
            {
              '0': createMockView({ class: 'CSlider' }),
            }
          ),
        }
      );

      const serialized = serializeView('test-view', original);
      const deserialized = deserializeView(serialized);

      expect(deserialized.attributes.class).toBe('CViewContainer');
      expect(deserialized.attributes.origin).toBe('50, 50');
      expect(deserialized.children?.['0']?.attributes.class).toBe('CKnob');
      expect(deserialized.children?.['1']?.children?.['0']?.attributes.class).toBe('CSlider');
    });
  });

  describe('extractOrigin', () => {
    it('should extract origin from serialized view', () => {
      const serialized = {
        originalId: 'test',
        class: 'CView',
        attributes: { class: 'CView', origin: '100, 200' },
      };
      const origin = extractOrigin(serialized);

      expect(origin.x).toBe(100);
      expect(origin.y).toBe(200);
    });

    it('should return 0, 0 for missing origin', () => {
      const serialized = {
        originalId: 'test',
        class: 'CView',
        attributes: { class: 'CView' },
      };
      const origin = extractOrigin(serialized);

      expect(origin.x).toBe(0);
      expect(origin.y).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const serialized = {
        originalId: 'test',
        class: 'CView',
        attributes: { class: 'CView', origin: '-50, -100' },
      };
      const origin = extractOrigin(serialized);

      expect(origin.x).toBe(-50);
      expect(origin.y).toBe(-100);
    });
  });

  describe('applyOffsetToSerialized', () => {
    it('should apply offset to origin', () => {
      const serialized = {
        originalId: 'test',
        class: 'CView',
        attributes: { class: 'CView', origin: '100, 100' },
      };
      const result = applyOffsetToSerialized(serialized, { x: 10, y: 20 });

      expect(result.attributes.origin).toBe('110, 120');
    });

    it('should handle negative offset', () => {
      const serialized = {
        originalId: 'test',
        class: 'CView',
        attributes: { class: 'CView', origin: '100, 100' },
      };
      const result = applyOffsetToSerialized(serialized, { x: -30, y: -50 });

      expect(result.attributes.origin).toBe('70, 50');
    });

    it('should not modify child origins (offset is only for root)', () => {
      const serialized = {
        originalId: 'test',
        class: 'CViewContainer',
        attributes: { class: 'CViewContainer', origin: '50, 50' },
        children: [
          { originalId: 'test-0', class: 'CTextLabel', attributes: { class: 'CTextLabel', origin: '10, 10' } },
        ],
      };
      const result = applyOffsetToSerialized(serialized, { x: 20, y: 20 });

      expect(result.attributes.origin).toBe('70, 70');
      expect(result.children?.[0].attributes.origin).toBe('10, 10');
    });

    it('should preserve other attributes', () => {
      const serialized = {
        originalId: 'test',
        class: 'CTextLabel',
        attributes: { class: 'CTextLabel', origin: '0, 0', size: '100, 30', title: 'Hello' },
      };
      const result = applyOffsetToSerialized(serialized, { x: 10, y: 10 });

      expect(result.attributes.size).toBe('100, 30');
      expect(result.attributes.title).toBe('Hello');
      expect(result.class).toBe('CTextLabel');
      expect(result.originalId).toBe('test');
    });
  });

  describe('collectOriginsFromSerialized', () => {
    it('should collect origins from multiple views', () => {
      const views = [
        { originalId: 'view-1', class: 'CView', attributes: { class: 'CView', origin: '10, 20' } },
        { originalId: 'view-2', class: 'CView', attributes: { class: 'CView', origin: '30, 40' } },
        { originalId: 'view-3', class: 'CView', attributes: { class: 'CView', origin: '50, 60' } },
      ];
      const origins = collectOriginsFromSerialized(views);

      expect(origins['view-1']).toEqual({ x: 10, y: 20 });
      expect(origins['view-2']).toEqual({ x: 30, y: 40 });
      expect(origins['view-3']).toEqual({ x: 50, y: 60 });
    });

    it('should return empty object for empty array', () => {
      const origins = collectOriginsFromSerialized([]);
      expect(origins).toEqual({});
    });
  });
});
