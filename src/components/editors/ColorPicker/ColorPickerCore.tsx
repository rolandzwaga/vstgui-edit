/**
 * ColorPickerCore Component
 *
 * The main picker UI containing gradient, sliders, inputs, and swatches.
 * Used internally by ColorPicker for both popup and inline modes.
 */

import type { Component, JSX } from 'solid-js';
import { createSignal, createMemo, Show } from 'solid-js';
import type { ColorValue, ColorFormat, ColorSource } from '../../../types/colorPicker';
import {
  createColorValue,
  createColorValueFromHsv,
  rgbaToHex,
  addRecentColor,
  parseHexToRgba,
  VSTGUI_PREDEFINED_COLORS,
} from '../../../domain/colorPicker';
import { GradientArea } from './GradientArea';
import { HueSlider } from './HueSlider';
import { AlphaSlider } from './AlphaSlider';
import { HexInput } from './HexInput';
import { ColorSwatches } from './ColorSwatches';
import { ColorPreview } from './ColorPreview';
import { EyeDropperButton } from './EyeDropperButton';
import styles from './ColorPicker.module.css';

export interface ColorPickerCoreProps {
  /** Current color value */
  value: ColorValue;
  /** Original color value (for preview comparison) */
  originalValue: ColorValue;
  /** Called when color changes. originalString is set for document/predefined colors. */
  onChange: (value: ColorValue, source: ColorSource, originalString?: string) => void;
  /** Called when edit is committed */
  onCommit: () => void;
  /** Document color names */
  documentColors: string[];
  /** Resolved document color values */
  documentColorValues?: Record<string, string>;
  /** Disabled state */
  disabled?: boolean;
}

export const ColorPickerCore: Component<ColorPickerCoreProps> = (props) => {
  const [format, setFormat] = createSignal<ColorFormat>('hex');

  // Get current hex value
  const currentHex = createMemo(() =>
    rgbaToHex(props.value.r, props.value.g, props.value.b, props.value.a)
  );

  // Get original hex value
  const originalHex = createMemo(() =>
    rgbaToHex(
      props.originalValue.r,
      props.originalValue.g,
      props.originalValue.b,
      props.originalValue.a
    )
  );

  // Handle gradient area changes
  const handleGradientChange = (saturation: number, brightness: number) => {
    const newColor = createColorValueFromHsv(props.value.h, saturation, brightness, props.value.a);
    props.onChange(newColor, 'visual-picker');
  };

  // Handle hue slider changes
  const handleHueChange = (hue: number) => {
    const newColor = createColorValueFromHsv(hue, props.value.s, props.value.v, props.value.a);
    props.onChange(newColor, 'visual-picker');
  };

  // Handle alpha slider changes
  const handleAlphaChange = (alpha: number) => {
    const newColor = createColorValue(props.value.r, props.value.g, props.value.b, alpha);
    props.onChange(newColor, 'visual-picker');
  };

  // Handle hex input changes
  const handleHexChange = (hex: string) => {
    // Parse hex and update color
    const parsed = parseHexToColorValue(hex);
    if (parsed) {
      props.onChange(parsed, 'hex-input');
    }
  };

  // Handle swatch selection
  const handleSwatchSelect = (value: string, source: ColorSource) => {
    if (source === 'document-color') {
      // For document colors, resolve the hex value for preview but preserve the name
      const hexValue = props.documentColorValues?.[value];
      const parsed = hexValue
        ? parseHexToColorValue(hexValue)
        : createColorValue(128, 128, 128, 255); // Gray fallback if no hex available
      if (parsed) {
        props.onChange(parsed, source, value); // Pass the color name as originalString
        props.onCommit();
      }
    } else if (source === 'predefined-color') {
      // For predefined colors, look up the hex value from the predefined list
      const colorName = value.replace('~ ', ''); // Remove the "~ " prefix
      const predefined = VSTGUI_PREDEFINED_COLORS.find((c) => c.name === colorName);
      if (predefined) {
        const parsed = parseHexToColorValue(predefined.value);
        if (parsed) {
          props.onChange(parsed, source, value); // Pass the "~ Name" format as originalString
          props.onCommit();
        }
      }
    } else {
      // Recent colors are hex values
      const parsed = parseHexToColorValue(value);
      if (parsed) {
        props.onChange(parsed, source);
        props.onCommit();
      }
    }
  };

  // Handle commit from gradient area - commits and closes the picker
  const handleGradientCommit = () => {
    const hex = currentHex();
    addRecentColor(hex);
    props.onCommit();
  };

  // Handle commit from sliders - just adds to recent colors, does NOT close picker
  const handleSliderCommit = () => {
    const hex = currentHex();
    addRecentColor(hex);
    // Don't call props.onCommit() - sliders shouldn't close the picker
  };

  // Handle revert to original color
  const handleRevert = () => {
    props.onChange(props.originalValue, 'visual-picker');
  };

  // Handle eyedropper color pick
  const handleEyedropperPick = (hex: string) => {
    const parsed = parseHexToColorValue(hex);
    if (parsed) {
      props.onChange(parsed, 'visual-picker');
      handleGradientCommit();
    }
  };

  return (
    <div class={styles.inlineContainer}>
      {/* Gradient Area (Saturation-Brightness) */}
      <GradientArea
        hue={props.value.h}
        saturation={props.value.s}
        brightness={props.value.v}
        onChange={handleGradientChange}
        onCommit={handleGradientCommit}
        disabled={props.disabled}
      />

      {/* Hue Slider */}
      <HueSlider
        value={props.value.h}
        onChange={handleHueChange}
        onCommit={handleSliderCommit}
        disabled={props.disabled}
      />

      {/* Alpha Slider */}
      <AlphaSlider
        value={props.value.a}
        color={{ r: props.value.r, g: props.value.g, b: props.value.b }}
        onChange={handleAlphaChange}
        onCommit={handleSliderCommit}
        disabled={props.disabled}
      />

      {/* Color Preview + Eyedropper Row */}
      <div class={styles.previewRow}>
        <ColorPreview
          originalColor={originalHex()}
          currentColor={currentHex()}
          onRevert={handleRevert}
        />
        <EyeDropperButton
          onColorPick={handleEyedropperPick}
          disabled={props.disabled}
        />
      </div>

      {/* Input Tabs */}
      <div class={styles.inputTabs}>
        <button
          type="button"
          class={`${styles.tab} ${format() === 'hex' ? styles.tabActive : ''}`}
          onClick={() => setFormat('hex')}
          disabled={props.disabled}
        >
          HEX
        </button>
        <button
          type="button"
          class={`${styles.tab} ${format() === 'rgb' ? styles.tabActive : ''}`}
          onClick={() => setFormat('rgb')}
          disabled={props.disabled}
        >
          RGB
        </button>
        <button
          type="button"
          class={`${styles.tab} ${format() === 'hsl' ? styles.tabActive : ''}`}
          onClick={() => setFormat('hsl')}
          disabled={props.disabled}
        >
          HSL
        </button>
      </div>

      {/* HEX Input */}
      <Show when={format() === 'hex'}>
        <HexInput
          value={currentHex()}
          onChange={handleHexChange}
          onCommit={handleGradientCommit}
          disabled={props.disabled}
        />
      </Show>

      {/* RGB Input - Placeholder for now */}
      <Show when={format() === 'rgb'}>
        <div class={styles.inputPanel}>
          <div class={styles.rgbInputs}>
            <div class={styles.fieldGroup}>
              <span class={styles.fieldLabel}>R</span>
              <input
                type="number"
                class={styles.fieldInput}
                value={props.value.r}
                min={0}
                max={255}
                disabled={props.disabled}
              />
            </div>
            <div class={styles.fieldGroup}>
              <span class={styles.fieldLabel}>G</span>
              <input
                type="number"
                class={styles.fieldInput}
                value={props.value.g}
                min={0}
                max={255}
                disabled={props.disabled}
              />
            </div>
            <div class={styles.fieldGroup}>
              <span class={styles.fieldLabel}>B</span>
              <input
                type="number"
                class={styles.fieldInput}
                value={props.value.b}
                min={0}
                max={255}
                disabled={props.disabled}
              />
            </div>
            <div class={styles.fieldGroup}>
              <span class={styles.fieldLabel}>A</span>
              <input
                type="number"
                class={styles.fieldInput}
                value={props.value.a}
                min={0}
                max={255}
                disabled={props.disabled}
              />
            </div>
          </div>
        </div>
      </Show>

      {/* HSL Input - Placeholder for now */}
      <Show when={format() === 'hsl'}>
        <div class={styles.inputPanel}>
          <div class={styles.hslInputs}>
            <div class={styles.fieldGroup}>
              <span class={styles.fieldLabel}>H</span>
              <input
                type="number"
                class={styles.fieldInput}
                value={props.value.h}
                min={0}
                max={360}
                disabled={props.disabled}
              />
            </div>
            <div class={styles.fieldGroup}>
              <span class={styles.fieldLabel}>S</span>
              <input
                type="number"
                class={styles.fieldInput}
                value={props.value.hslS}
                min={0}
                max={100}
                disabled={props.disabled}
              />
            </div>
            <div class={styles.fieldGroup}>
              <span class={styles.fieldLabel}>L</span>
              <input
                type="number"
                class={styles.fieldInput}
                value={props.value.l}
                min={0}
                max={100}
                disabled={props.disabled}
              />
            </div>
            <div class={styles.fieldGroup}>
              <span class={styles.fieldLabel}>A</span>
              <input
                type="number"
                class={styles.fieldInput}
                value={Math.round((props.value.a / 255) * 100)}
                min={0}
                max={100}
                disabled={props.disabled}
              />
            </div>
          </div>
        </div>
      </Show>

      {/* Color Swatches - hide document colors since they're in the simple dropdown */}
      <ColorSwatches
        documentColors={props.documentColors}
        documentColorValues={props.documentColorValues}
        selectedValue={currentHex()}
        onSelect={handleSwatchSelect}
        showDocument={false}
      />
    </div>
  );
};

// Helper function
function parseHexToColorValue(hex: string): ColorValue | null {
  const rgba = parseHexToRgba(hex);
  if (!rgba) return null;
  return createColorValue(rgba.r, rgba.g, rgba.b, rgba.a);
}
