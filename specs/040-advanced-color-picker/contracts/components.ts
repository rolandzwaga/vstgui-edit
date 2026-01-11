/**
 * Component Interface Contracts
 *
 * Defines the public API for all Advanced Color Picker components.
 *
 * NOTE: Core types (ColorValue, ColorFormat, ColorSource, PickerMode) are
 * canonically defined in ColorPicker.api.ts. These are re-exported here
 * for component prop definitions.
 */

import type { Component, JSX } from 'solid-js';

// =============================================================================
// Shared Types (re-exported from ColorPicker.api.ts)
// =============================================================================

// Implementation should import from src/types/colorPicker.ts
export type { ColorFormat, ColorSource, PickerMode, ColorValue } from './ColorPicker.api';

// =============================================================================
// AdvancedColorPicker (Main Component)
// =============================================================================

/**
 * Props for the main AdvancedColorPicker component.
 * Maintains backward compatibility with existing ColorPickerProps.
 */
export interface AdvancedColorPickerProps {
  /** Current value (hex color, document color name, or predefined color ref) */
  value: string;

  /** Called on every value change (for live preview) */
  onChange: (newValue: string) => void;

  /** Called when edit is committed (Enter, blur, selection) */
  onCommit: () => void;

  /** Called when edit is cancelled (Escape) */
  onCancel: () => void;

  /** Whether the picker is disabled */
  disabled?: boolean;

  /** Validation error message to display */
  error?: string | null;

  /** Placeholder text */
  placeholder?: string;

  /** Available color names from document colors */
  documentColors: string[];

  /** Resolved hex values for document colors (for swatch preview) */
  documentColorValues?: Record<string, string>;

  /** Display mode (default: 'popup') */
  mode?: PickerMode;
}

/**
 * AdvancedColorPicker Component
 *
 * Replaces the existing ColorPicker with full visual color selection.
 *
 * @example
 * <AdvancedColorPicker
 *   value={color()}
 *   onChange={setColor}
 *   onCommit={commitToHistory}
 *   onCancel={revert}
 *   documentColors={['Background', 'Accent']}
 * />
 */
export const AdvancedColorPicker: Component<AdvancedColorPickerProps>;

// =============================================================================
// SaturationBrightnessGradient
// =============================================================================

/**
 * Props for the saturation-brightness gradient picker area.
 */
export interface SaturationBrightnessGradientProps {
  /** Current hue value (0-360) for gradient color */
  hue: number;

  /** Current saturation value (0-100) */
  saturation: number;

  /** Current brightness/value (0-100) */
  brightness: number;

  /** Called when saturation changes */
  onSaturationChange: (value: number) => void;

  /** Called when brightness changes */
  onBrightnessChange: (value: number) => void;

  /** Called when drag ends (for commit) */
  onCommit: () => void;

  /** Disabled state */
  disabled?: boolean;
}

/**
 * SaturationBrightnessGradient Component
 *
 * A 2D gradient area where:
 * - X-axis controls saturation (0 left, 100 right)
 * - Y-axis controls brightness (100 top, 0 bottom)
 *
 * @example
 * <SaturationBrightnessGradient
 *   hue={hue()}
 *   saturation={saturation()}
 *   brightness={brightness()}
 *   onSaturationChange={setSaturation}
 *   onBrightnessChange={setBrightness}
 *   onCommit={commit}
 * />
 */
export const SaturationBrightnessGradient: Component<SaturationBrightnessGradientProps>;

// =============================================================================
// HueSlider
// =============================================================================

/**
 * Props for the hue slider.
 */
export interface HueSliderProps {
  /** Current hue value (0-360) */
  value: number;

  /** Called when hue changes */
  onChange: (value: number) => void;

  /** Called when drag ends (for commit) */
  onCommit: () => void;

  /** Disabled state */
  disabled?: boolean;
}

/**
 * HueSlider Component
 *
 * A horizontal slider with a rainbow gradient background.
 *
 * @example
 * <HueSlider
 *   value={hue()}
 *   onChange={setHue}
 *   onCommit={commit}
 * />
 */
export const HueSlider: Component<HueSliderProps>;

// =============================================================================
// AlphaSlider
// =============================================================================

/**
 * Props for the alpha/opacity slider.
 */
export interface AlphaSliderProps {
  /** Current alpha value (0-255) */
  value: number;

  /** Current RGB color (for gradient preview) */
  color: { r: number; g: number; b: number };

  /** Called when alpha changes */
  onChange: (value: number) => void;

  /** Called when drag ends (for commit) */
  onCommit: () => void;

  /** Disabled state */
  disabled?: boolean;
}

/**
 * AlphaSlider Component
 *
 * A horizontal slider with a checkerboard + color gradient background.
 *
 * @example
 * <AlphaSlider
 *   value={alpha()}
 *   color={{ r: red(), g: green(), b: blue() }}
 *   onChange={setAlpha}
 *   onCommit={commit}
 * />
 */
export const AlphaSlider: Component<AlphaSliderProps>;

// =============================================================================
// ColorInputs
// =============================================================================

/**
 * Props for the color input tabs (HEX/RGB/HSL).
 */
export interface ColorInputsProps {
  /** Current color value */
  value: ColorValue;

  /** Active format tab */
  format: ColorFormat;

  /** Called when format tab changes */
  onFormatChange: (format: ColorFormat) => void;

  /** Called when color value changes */
  onChange: (value: ColorValue, source: ColorSource) => void;

  /** Called when input is committed (Enter key) */
  onCommit: () => void;

  /** Document colors for validation */
  documentColors: string[];

  /** Disabled state */
  disabled?: boolean;
}

/**
 * ColorInputs Component
 *
 * Tabbed input for HEX, RGB, and HSL color formats.
 *
 * @example
 * <ColorInputs
 *   value={colorValue()}
 *   format={format()}
 *   onFormatChange={setFormat}
 *   onChange={setColorValue}
 *   onCommit={commit}
 *   documentColors={['Background', 'Accent']}
 * />
 */
export const ColorInputs: Component<ColorInputsProps>;

// =============================================================================
// ColorSwatches
// =============================================================================

/**
 * Props for the color swatches section.
 */
export interface ColorSwatchesProps {
  /** Document color names */
  documentColors: string[];

  /** Resolved document color hex values */
  documentColorValues?: Record<string, string>;

  /** Currently selected color value (for highlighting) */
  selectedValue: string | null;

  /** Called when a swatch is clicked */
  onSelect: (value: string, source: ColorSource) => void;

  /** Show document colors section (default: true) */
  showDocument?: boolean;

  /** Show predefined colors section (default: true) */
  showPredefined?: boolean;

  /** Show recent colors section (default: true) */
  showRecent?: boolean;
}

/**
 * ColorSwatches Component
 *
 * Displays clickable color swatches organized by category.
 *
 * @example
 * <ColorSwatches
 *   documentColors={['Background', 'Accent']}
 *   documentColorValues={{ Background: '#2D2D2DFF', Accent: '#FF5500FF' }}
 *   selectedValue={currentValue()}
 *   onSelect={handleSelect}
 * />
 */
export const ColorSwatches: Component<ColorSwatchesProps>;

// =============================================================================
// ColorPreview
// =============================================================================

/**
 * Props for the color preview comparison.
 */
export interface ColorPreviewProps {
  /** Original/old color value */
  original: ColorValue;

  /** Current/new color value */
  current: ColorValue;

  /** Called when clicking original to revert */
  onRevert?: () => void;
}

/**
 * ColorPreview Component
 *
 * Displays old and new colors side by side for comparison.
 *
 * @example
 * <ColorPreview
 *   original={originalColor()}
 *   current={currentColor()}
 *   onRevert={handleRevert}
 * />
 */
export const ColorPreview: Component<ColorPreviewProps>;

// =============================================================================
// EyeDropperButton
// =============================================================================

/**
 * Props for the eye dropper button.
 */
export interface EyeDropperButtonProps {
  /** Called when a color is successfully picked */
  onColorPick: (hexColor: string) => void;

  /** Disabled state */
  disabled?: boolean;
}

/**
 * EyeDropperButton Component
 *
 * Button that activates the browser's EyeDropper API.
 * Hidden when API is not available.
 *
 * @example
 * <EyeDropperButton
 *   onColorPick={handleColorPick}
 *   disabled={disabled()}
 * />
 */
export const EyeDropperButton: Component<EyeDropperButtonProps>;

// =============================================================================
// ColorPickerCore
// =============================================================================

/**
 * Props for the core picker content (used by both popup and inline modes).
 */
export interface ColorPickerCoreProps {
  /** Current color value */
  value: ColorValue;

  /** Original color value (for preview comparison) */
  originalValue: ColorValue;

  /** Called when color changes */
  onChange: (value: ColorValue, source: ColorSource) => void;

  /** Called when edit is committed */
  onCommit: () => void;

  /** Document color names */
  documentColors: string[];

  /** Resolved document color values */
  documentColorValues?: Record<string, string>;

  /** Disabled state */
  disabled?: boolean;
}

/**
 * ColorPickerCore Component
 *
 * The main picker UI containing gradient, sliders, inputs, and swatches.
 * Used internally by AdvancedColorPicker for both modes.
 *
 * @example
 * <ColorPickerCore
 *   value={colorValue()}
 *   originalValue={originalColor()}
 *   onChange={setColorValue}
 *   onCommit={commit}
 *   documentColors={['Background']}
 * />
 */
export const ColorPickerCore: Component<ColorPickerCoreProps>;
