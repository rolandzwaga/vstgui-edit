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
} from '../../../domain/colorPicker';
import { GradientArea } from './GradientArea';
import { HueSlider } from './HueSlider';
import { AlphaSlider } from './AlphaSlider';
import { HexInput } from './HexInput';
import { ColorSwatches } from './ColorSwatches';
import styles from './ColorPicker.module.css';

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

export const ColorPickerCore: Component<ColorPickerCoreProps> = (props) => {
  const [format, setFormat] = createSignal<ColorFormat>('hex');

  // Get current hex value
  const currentHex = createMemo(() =>
    rgbaToHex(props.value.r, props.value.g, props.value.b, props.value.a)
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
    // For document colors and predefined colors, pass through the value
    // For hex colors, parse and update
    if (source === 'document-color' || source === 'predefined-color') {
      // These are passed through as-is
      // The parent component handles document color resolution
    } else {
      // Recent colors are hex values
      const parsed = parseHexToColorValue(value);
      if (parsed) {
        props.onChange(parsed, source);
        props.onCommit();
      }
    }
  };

  // Handle commit - add to recent colors
  const handleCommit = () => {
    const hex = currentHex();
    addRecentColor(hex);
    props.onCommit();
  };

  return (
    <div class={styles.inlineContainer}>
      {/* Gradient Area (Saturation-Brightness) */}
      <GradientArea
        hue={props.value.h}
        saturation={props.value.s}
        brightness={props.value.v}
        onChange={handleGradientChange}
        onCommit={handleCommit}
        disabled={props.disabled}
      />

      {/* Hue Slider */}
      <HueSlider
        value={props.value.h}
        onChange={handleHueChange}
        onCommit={handleCommit}
        disabled={props.disabled}
      />

      {/* Alpha Slider */}
      <AlphaSlider
        value={props.value.a}
        color={{ r: props.value.r, g: props.value.g, b: props.value.b }}
        onChange={handleAlphaChange}
        onCommit={handleCommit}
        disabled={props.disabled}
      />

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
          onCommit={handleCommit}
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

      {/* Color Swatches */}
      <ColorSwatches
        documentColors={props.documentColors}
        documentColorValues={props.documentColorValues}
        selectedValue={currentHex()}
        onSelect={handleSwatchSelect}
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
