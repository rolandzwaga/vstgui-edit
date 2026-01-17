import { describe, expect, test } from 'vitest';
import type { ColorsDefinition, ViewAttributes } from '../../../types/uidesc';
import {
  buildStyledViewProps,
  buildStyledViewPropsMap,
  parseFrameWidth,
  parseOpacity,
  parseTransparent,
  shouldUseWireframeFallback,
} from '../styledViewProps';

describe('styledViewProps', () => {
  const documentColors: ColorsDefinition = {
    background: '#2D2D2DFF',
    accent: '#FF5500FF',
    frame: '#808080FF',
  };

  describe('parseFrameWidth', () => {
    test('returns default 1 for undefined', () => {
      expect(parseFrameWidth(undefined)).toBe(1);
    });

    test('parses valid integer string', () => {
      expect(parseFrameWidth('2')).toBe(2);
    });

    test('parses valid float string', () => {
      expect(parseFrameWidth('1.5')).toBe(1.5);
    });

    test('returns 0 for "0"', () => {
      expect(parseFrameWidth('0')).toBe(0);
    });

    test('returns 0 for negative value', () => {
      expect(parseFrameWidth('-1')).toBe(0);
    });

    test('returns default 1 for empty string', () => {
      expect(parseFrameWidth('')).toBe(1);
    });

    test('returns default 1 for non-numeric string', () => {
      expect(parseFrameWidth('abc')).toBe(1);
    });

    test('parses large values', () => {
      expect(parseFrameWidth('10')).toBe(10);
    });
  });

  describe('parseOpacity', () => {
    test('returns default 1.0 for undefined', () => {
      expect(parseOpacity(undefined)).toBe(1.0);
    });

    test('parses valid opacity value', () => {
      expect(parseOpacity('0.5')).toBe(0.5);
    });

    test('clamps value above 1.0 to 1.0', () => {
      expect(parseOpacity('1.5')).toBe(1.0);
    });

    test('clamps negative value to 0.0', () => {
      expect(parseOpacity('-0.5')).toBe(0.0);
    });

    test('parses "0" as 0.0', () => {
      expect(parseOpacity('0')).toBe(0.0);
    });

    test('parses "1" as 1.0', () => {
      expect(parseOpacity('1')).toBe(1.0);
    });

    test('returns default 1.0 for empty string', () => {
      expect(parseOpacity('')).toBe(1.0);
    });

    test('returns default 1.0 for non-numeric string', () => {
      expect(parseOpacity('abc')).toBe(1.0);
    });
  });

  describe('parseTransparent', () => {
    test('returns false for undefined', () => {
      expect(parseTransparent(undefined)).toBe(false);
    });

    test('returns true for "true"', () => {
      expect(parseTransparent('true')).toBe(true);
    });

    test('returns false for "false"', () => {
      expect(parseTransparent('false')).toBe(false);
    });

    test('returns false for empty string', () => {
      expect(parseTransparent('')).toBe(false);
    });

    test('returns false for any other value', () => {
      expect(parseTransparent('yes')).toBe(false);
      expect(parseTransparent('1')).toBe(false);
    });
  });

  describe('shouldUseWireframeFallback', () => {
    test('returns true when backgroundColor is null and not transparent', () => {
      expect(shouldUseWireframeFallback(null, false)).toBe(true);
    });

    test('returns false when backgroundColor is resolved', () => {
      expect(shouldUseWireframeFallback('rgba(255, 0, 0, 1.00)', false)).toBe(false);
    });

    test('returns false when view is transparent (has intentional no fill)', () => {
      expect(shouldUseWireframeFallback(null, true)).toBe(false);
    });

    test('returns false when backgroundColor is resolved and transparent', () => {
      // Transparent takes precedence - the background is intentionally transparent
      expect(shouldUseWireframeFallback('rgba(255, 0, 0, 1.00)', true)).toBe(false);
    });
  });

  describe('buildStyledViewProps', () => {
    describe('background color resolution', () => {
      test('resolves direct hex background-color', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          'background-color': '#FF0000FF',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.backgroundColor).toBe('rgba(255, 0, 0, 1.00)');
        expect(props.useWireframeFallback).toBe(false);
      });

      test('resolves document color reference', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          'background-color': 'background',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.backgroundColor).toBe('rgba(45, 45, 45, 1.00)');
        expect(props.useWireframeFallback).toBe(false);
      });

      test('resolves predefined color reference', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          'background-color': '~ BlackCColor',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.backgroundColor).toBe('rgba(0, 0, 0, 1.00)');
      });

      test('returns null for unresolvable reference', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          'background-color': 'nonexistent',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.backgroundColor).toBeNull();
        expect(props.useWireframeFallback).toBe(true);
      });

      test('handles missing background-color attribute', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.backgroundColor).toBeNull();
        expect(props.useWireframeFallback).toBe(true);
      });
    });

    describe('frame color resolution', () => {
      test('resolves direct hex frame-color', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          'frame-color': '#00FF00FF',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.frameColor).toBe('rgba(0, 255, 0, 1.00)');
      });

      test('resolves document color reference for frame-color', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          'frame-color': 'frame',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.frameColor).toBe('rgba(128, 128, 128, 1.00)');
      });

      test('handles missing frame-color attribute', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.frameColor).toBeNull();
      });
    });

    describe('frame width parsing', () => {
      test('parses frame-width attribute', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          'frame-width': '2',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.frameWidth).toBe(2);
      });

      test('uses default frame-width of 1 when not specified', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.frameWidth).toBe(1);
      });

      test('frame-width applied even in wireframe fallback', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          'frame-width': '3',
          // no background-color, so wireframe fallback
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.useWireframeFallback).toBe(true);
        expect(props.frameWidth).toBe(3);
      });
    });

    describe('transparency handling', () => {
      test('sets isTransparent true for transparent="true"', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          transparent: 'true',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.isTransparent).toBe(true);
        expect(props.useWireframeFallback).toBe(false);
      });

      test('sets isTransparent false for transparent="false"', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          transparent: 'false',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.isTransparent).toBe(false);
      });

      test('transparent view does not use wireframe fallback', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          transparent: 'true',
          // no background-color
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.useWireframeFallback).toBe(false);
      });
    });

    describe('opacity parsing', () => {
      test('parses opacity attribute', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          opacity: '0.5',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.opacity).toBe(0.5);
      });

      test('uses default opacity of 1.0 when not specified', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.opacity).toBe(1.0);
      });
    });

    describe('complete view scenarios', () => {
      test('view with all styled properties', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          'background-color': '#FF0000FF',
          'frame-color': '#00FF00FF',
          'frame-width': '2',
          opacity: '0.8',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.backgroundColor).toBe('rgba(255, 0, 0, 1.00)');
        expect(props.frameColor).toBe('rgba(0, 255, 0, 1.00)');
        expect(props.frameWidth).toBe(2);
        expect(props.opacity).toBe(0.8);
        expect(props.isTransparent).toBe(false);
        expect(props.useWireframeFallback).toBe(false);
      });

      test('view with no styled properties uses wireframe fallback', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.backgroundColor).toBeNull();
        expect(props.frameColor).toBeNull();
        expect(props.useWireframeFallback).toBe(true);
      });

      test('view with only frame-color still uses wireframe fallback', () => {
        const attrs: ViewAttributes = {
          class: 'CViewContainer',
          'frame-color': '#00FF00FF',
        };
        const props = buildStyledViewProps(attrs, documentColors);
        expect(props.frameColor).toBe('rgba(0, 255, 0, 1.00)');
        expect(props.useWireframeFallback).toBe(true);
      });
    });
  });

  describe('buildStyledViewPropsMap', () => {
    test('builds map for multiple views', () => {
      const views = [
        { id: 'view1', attributes: { class: 'CViewContainer', 'background-color': '#FF0000FF' } },
        { id: 'view2', attributes: { class: 'CViewContainer', 'background-color': 'background' } },
        { id: 'view3', attributes: { class: 'CViewContainer' } },
      ];
      const map = buildStyledViewPropsMap(views, documentColors);

      expect(map.size).toBe(3);
      expect(map.get('view1')?.backgroundColor).toBe('rgba(255, 0, 0, 1.00)');
      expect(map.get('view2')?.backgroundColor).toBe('rgba(45, 45, 45, 1.00)');
      expect(map.get('view3')?.useWireframeFallback).toBe(true);
    });

    test('handles empty views array', () => {
      const map = buildStyledViewPropsMap([], documentColors);
      expect(map.size).toBe(0);
    });

    test('handles undefined document colors', () => {
      const views = [
        { id: 'view1', attributes: { class: 'CViewContainer', 'background-color': '#FF0000FF' } },
      ];
      const map = buildStyledViewPropsMap(views, undefined);

      expect(map.get('view1')?.backgroundColor).toBe('rgba(255, 0, 0, 1.00)');
    });
  });
});
