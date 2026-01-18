/**
 * Type definitions for VSTGUI UI Description files
 * Based on vstgui-uidesc.schema.json
 */

/** Color value: hex (#RRGGBBAA), color name, or predefined (~BlackCColor) */
export type ColorValue = string;

/** Point value: 'x, y' coordinates */
export type PointValue = string;

/** Size value: 'width, height' */
export type SizeValue = string;

/** Boolean value as string */
export type BooleanValue = 'true' | 'false';

/** Numeric value (integer or float) as string */
export type NumericValue = string;

/** Autosize anchors */
export type AutosizeValue = string;

/** Color definitions map */
export type ColorsDefinition = Record<string, ColorValue>;

/** Font definition */
export interface FontDefinition {
  'font-name': string;
  size: NumericValue;
  bold?: BooleanValue;
  italic?: BooleanValue;
  underline?: BooleanValue;
  'strike-through'?: BooleanValue;
  'alternative-font-names'?: string;
}

/** Fonts definitions map */
export type FontsDefinition = Record<string, FontDefinition>;

/** Embedded bitmap data */
export interface BitmapData {
  encoding: 'base64';
  data: string;
}

/** Base bitmap definition with common properties */
export interface BaseBitmapDefinition {
  path: string;
  'scale-factor'?: string;
  data?: BitmapData;
}

/** Standard bitmap - no special tiling or animation properties */
export interface StandardBitmapDefinition extends BaseBitmapDefinition {
  'nineparttiled-offsets'?: never;
  'multiframe-num-frames'?: never;
  'multiframe-size'?: never;
  'mulitframe-frames-per-row'?: never;
}

/** Nine-part tiled bitmap for resizable UI elements */
export interface NinePartBitmapDefinition extends BaseBitmapDefinition {
  /** Nine-part tiling offsets: "top, left, bottom, right" */
  'nineparttiled-offsets': string;
  'multiframe-num-frames'?: never;
  'multiframe-size'?: never;
  'mulitframe-frames-per-row'?: never;
}

/** Multi-frame bitmap for animations and sprite sheets */
export interface MultiframeBitmapDefinition extends BaseBitmapDefinition {
  'nineparttiled-offsets'?: never;
  /** Total number of frames in the bitmap */
  'multiframe-num-frames': string;
  /** Size of each frame: "width, height" */
  'multiframe-size': string;
  /**
   * Number of frames per row (for grid layouts).
   * Note: typo 'mulitframe' matches VSTGUI's actual attribute name.
   */
  'mulitframe-frames-per-row'?: string;
}

/** Discriminated union of all bitmap definition types */
export type BitmapDefinition =
  | StandardBitmapDefinition
  | NinePartBitmapDefinition
  | MultiframeBitmapDefinition;

/** Type guard: checks if bitmap is a nine-part tiled bitmap */
export function isNinePartBitmap(
  bitmap: BitmapDefinition | string
): bitmap is NinePartBitmapDefinition {
  return (
    typeof bitmap === 'object' &&
    'nineparttiled-offsets' in bitmap &&
    typeof bitmap['nineparttiled-offsets'] === 'string'
  );
}

/** Type guard: checks if bitmap is a multi-frame bitmap */
export function isMultiframeBitmap(
  bitmap: BitmapDefinition | string
): bitmap is MultiframeBitmapDefinition {
  return (
    typeof bitmap === 'object' && 'multiframe-num-frames' in bitmap && 'multiframe-size' in bitmap
  );
}

/** Type guard: checks if bitmap is a standard bitmap (no special properties) */
export function isStandardBitmap(
  bitmap: BitmapDefinition | string
): bitmap is StandardBitmapDefinition {
  if (typeof bitmap === 'string') return false;
  return !isNinePartBitmap(bitmap) && !isMultiframeBitmap(bitmap);
}

/** Bitmap type identifier */
export type BitmapType = 'standard' | 'ninepart' | 'multiframe';

/** Detects the bitmap type from a bitmap definition */
export function getBitmapType(bitmap: BitmapDefinition | string): BitmapType {
  if (typeof bitmap === 'string') return 'standard';
  if (isNinePartBitmap(bitmap)) return 'ninepart';
  if (isMultiframeBitmap(bitmap)) return 'multiframe';
  return 'standard';
}

/** Bitmaps definitions map */
export type BitmapsDefinition = Record<string, string | BitmapDefinition>;

/** Gradient color stop */
export interface GradientColorStop {
  rgba: string;
  start: string;
}

/** Gradients definitions map */
export type GradientsDefinition = Record<string, GradientColorStop[]>;

/** Control tags map */
export type ControlTagsDefinition = Record<string, string>;

/** Variables map */
export type VariablesDefinition = Record<string, string>;

/** View attributes (common across all view types) */
export interface ViewAttributes {
  class: string;
  origin?: PointValue;
  size?: SizeValue;
  'background-color'?: ColorValue;
  transparent?: BooleanValue;
  'mouse-enabled'?: BooleanValue;
  autosize?: AutosizeValue;
  bitmap?: string;
  tooltip?: string;
  'custom-view-name'?: string;
  'sub-controller'?: string;
  opacity?: NumericValue;
  'want-focus'?: BooleanValue;
  [key: string]: string | undefined;
}

/** View node in the hierarchy */
export interface ViewNode {
  attributes: ViewAttributes;
  children?: Record<string, ViewNode>;
}

export type ViewDefinition = ViewNode;

/** Template definition (root view with name) */
export interface TemplateDefinition extends ViewNode {
  attributes: ViewAttributes;
}

/** Templates map */
export type TemplatesDefinition = Record<string, TemplateDefinition>;

/** Custom section for editor metadata */
export type CustomDefinition = Record<string, unknown>;

/** Main vstgui-ui-description object */
export interface VSTGUIUIDescriptionContent {
  version: '1';
  colors?: ColorsDefinition;
  fonts?: FontsDefinition;
  bitmaps?: BitmapsDefinition;
  gradients?: GradientsDefinition;
  'control-tags'?: ControlTagsDefinition;
  variables?: VariablesDefinition;
  templates?: TemplatesDefinition;
  custom?: CustomDefinition;
}

/** Root document type */
export interface VSTGUIUIDescription {
  'vstgui-ui-description': VSTGUIUIDescriptionContent;
}
