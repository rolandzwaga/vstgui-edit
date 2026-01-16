import type { AttributeTypeConfig } from '../../types/editors';

export const ATTRIBUTE_TYPE_MAP: Record<string, AttributeTypeConfig> = {
  // Identity (readonly)
  class: { editorType: 'readonly' },

  // Geometry (point)
  origin: { editorType: 'point' },
  size: { editorType: 'point' },
  'min-size': { editorType: 'point' },
  'max-size': { editorType: 'point' },
  'text-inset': { editorType: 'point' },
  'shadow-offset': { editorType: 'point' },
  margin: { editorType: 'point' },

  // Numbers
  opacity: { editorType: 'number', min: 0, max: 1, step: 0.1 },
  'wheel-inc-value': { editorType: 'number', min: 0, step: 0.01 },
  'frame-width': { editorType: 'number', min: 0, step: 1 },
  'round-rect-radius': { editorType: 'number', min: 0, step: 1 },
  spacing: { editorType: 'number', min: 0, step: 1 },
  'z-index': { editorType: 'number', step: 1 },
  'default-value': { editorType: 'number', min: 0, max: 1, step: 0.01 },
  'min-value': { editorType: 'number', step: 0.01 },
  'max-value': { editorType: 'number', step: 0.01 },

  // Booleans
  'mouse-enabled': { editorType: 'boolean' },
  transparent: { editorType: 'boolean' },
  'wants-focus': { editorType: 'boolean' },
  visible: { editorType: 'boolean' },
  bordered: { editorType: 'boolean' },
  'draw-antialiased': { editorType: 'boolean' },
  'font-antialias': { editorType: 'boolean' },
  'style-3D-in': { editorType: 'boolean' },
  'style-3D-out': { editorType: 'boolean' },
  'style-no-frame': { editorType: 'boolean' },
  'style-no-text': { editorType: 'boolean' },
  'style-no-draw': { editorType: 'boolean' },
  'style-round-rect': { editorType: 'boolean' },
  'style-shadow-text': { editorType: 'boolean' },

  // Enums
  'text-alignment': {
    editorType: 'enum',
    options: ['left', 'center', 'right'],
  },
  'background-color-draw-style': {
    editorType: 'enum',
    options: ['filled', 'stroked', 'filled and stroked'],
  },
  'truncate-mode': {
    editorType: 'enum',
    options: ['head', 'tail', 'none'],
  },
  orientation: {
    editorType: 'enum',
    options: ['horizontal', 'vertical'],
  },
  'line-layout': {
    editorType: 'enum',
    options: ['clip', 'truncate', 'wrap'],
  },

  // Autosize (visual anchor diagram)
  autosize: {
    editorType: 'autosize',
    flags: ['left', 'right', 'top', 'bottom', 'row', 'column'],
  },

  // Colors
  'background-color': { editorType: 'color' },
  'font-color': { editorType: 'color' },
  'font-color-selected': { editorType: 'color' },
  'frame-color': { editorType: 'color' },
  'frame-color-highlighted': { editorType: 'color' },
  'shadow-color': { editorType: 'color' },
  'back-color': { editorType: 'color' },
  'back-color-selected': { editorType: 'color' },
  'text-color': { editorType: 'color' },
  'text-color-highlighted': { editorType: 'color' },
  'scrollbar-background-color': { editorType: 'color' },
  'scrollbar-frame-color': { editorType: 'color' },
  'scrollbar-scroller-color': { editorType: 'color' },
  'boxframe-color': { editorType: 'color' },
  'boxfill-color': { editorType: 'color' },
  'checkmark-color': { editorType: 'color' },
  'corona-color': { editorType: 'color' },
  'handle-color': { editorType: 'color' },
  'handle-shadow-color': { editorType: 'color' },
  'draw-frame-color': { editorType: 'color' },
  'draw-back-color': { editorType: 'color' },
  'draw-value-color': { editorType: 'color' },
  'hover-color': { editorType: 'color' },
  'line-color': { editorType: 'color' },
  'value-color': { editorType: 'color' },

  // Fonts
  font: { editorType: 'font' },

  // Bitmaps
  bitmap: { editorType: 'bitmap' },

  // Text
  title: { editorType: 'text' },
  tooltip: { editorType: 'text' },
  'uidesc-label': { editorType: 'text' },
  'custom-view-name': { editorType: 'text' },
  'sub-controller': { editorType: 'text' },
  'control-tag': { editorType: 'control-tag' },
};

export function getAttributeConfig(attrName: string): AttributeTypeConfig {
  return ATTRIBUTE_TYPE_MAP[attrName] ?? { editorType: 'text' };
}

export const ENUM_OPTIONS: Record<string, string[]> = {
  'text-alignment': ['left', 'center', 'right'],
  'background-color-draw-style': ['filled', 'stroked', 'filled and stroked'],
  'truncate-mode': ['head', 'tail', 'none'],
  orientation: ['horizontal', 'vertical'],
  'line-layout': ['clip', 'truncate', 'wrap'],
};

export const AUTOSIZE_FLAGS = ['left', 'right', 'top', 'bottom', 'row', 'column'];
