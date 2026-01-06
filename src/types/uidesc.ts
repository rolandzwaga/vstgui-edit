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
}

/** Fonts definitions map */
export type FontsDefinition = Record<string, FontDefinition>;

/** Bitmap definition */
export interface BitmapDefinition {
  path: string;
  'nine-part-tiled-offsets'?: string;
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
