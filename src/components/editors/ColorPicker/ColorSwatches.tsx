/**
 * ColorSwatches Component
 *
 * Displays clickable color swatches organized by category:
 * - Document colors (user-defined)
 * - Predefined colors (VSTGUI system colors)
 * - Recent colors (from localStorage)
 */

import type { Component, JSX } from 'solid-js';
import { createMemo, For, Show } from 'solid-js';
import type { ColorSource } from '../../../types/colorPicker';
import {
  VSTGUI_PREDEFINED_COLORS,
  formatPredefinedColorRef,
  getRecentColors,
} from '../../../domain/colorPicker';
import styles from './ColorPicker.module.css';

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

export const ColorSwatches: Component<ColorSwatchesProps> = (props) => {
  // Get recent colors from localStorage
  const recentColors = createMemo(() => getRecentColors());

  // Check if a value is selected
  const isSelected = (value: string): boolean => props.selectedValue === value;

  // Handle swatch click/keydown
  const handleSelect = (
    value: string,
    source: ColorSource,
    e?: JSX.EventHandler<HTMLDivElement, MouseEvent | KeyboardEvent>
  ) => {
    props.onSelect(value, source);
  };

  // Handle keyboard for swatch activation
  const handleKeyDown = (
    value: string,
    source: ColorSource
  ): JSX.EventHandler<HTMLDivElement, KeyboardEvent> => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(value, source);
    }
  };

  // Show document section (default: true)
  const showDocumentSection = () => props.showDocument !== false && props.documentColors.length > 0;

  // Show predefined section (default: true)
  const showPredefinedSection = () => props.showPredefined !== false;

  // Show recent section (default: true, but only if there are recent colors)
  const showRecentSection = () => props.showRecent !== false && recentColors().length > 0;

  return (
    <div class={styles.swatchesSection}>
      {/* Document Colors */}
      <Show when={showDocumentSection()}>
        <div class={styles.swatchesHeader}>Document Colors</div>
        <div class={styles.swatchGrid}>
          <For each={props.documentColors}>
            {(colorName) => {
              const hexValue = () => props.documentColorValues?.[colorName];
              const isMissing = () => !hexValue();
              const selected = () => isSelected(colorName);

              return (
                <div
                  data-testid={`swatch-doc-${colorName}`}
                  class={`${styles.swatch} ${selected() ? styles.swatchSelected : ''} ${isMissing() ? styles.swatchMissing : ''}`}
                  role="button"
                  tabindex={0}
                  aria-label={`Document color: ${colorName}`}
                  aria-pressed={selected()}
                  style={{ 'background-color': hexValue() }}
                  onClick={() => handleSelect(colorName, 'document-color')}
                  onKeyDown={handleKeyDown(colorName, 'document-color')}
                  title={colorName}
                />
              );
            }}
          </For>
        </div>
      </Show>

      {/* Predefined Colors */}
      <Show when={showPredefinedSection()}>
        <div class={styles.swatchesHeader}>Predefined Colors</div>
        <div class={styles.swatchGrid}>
          <For each={VSTGUI_PREDEFINED_COLORS}>
            {(color) => {
              const refValue = formatPredefinedColorRef(color.name);
              const selected = () => isSelected(refValue);

              return (
                <div
                  data-testid={`swatch-predefined-${color.name}`}
                  class={`${styles.swatch} ${selected() ? styles.swatchSelected : ''}`}
                  role="button"
                  tabindex={0}
                  aria-label={`Predefined color: ${color.displayName}`}
                  aria-pressed={selected()}
                  style={{ 'background-color': color.value }}
                  onClick={() => handleSelect(refValue, 'predefined-color')}
                  onKeyDown={handleKeyDown(refValue, 'predefined-color')}
                  title={color.displayName}
                />
              );
            }}
          </For>
        </div>
      </Show>

      {/* Recent Colors */}
      <Show when={showRecentSection()}>
        <div data-testid="recent-header" class={styles.swatchesHeader}>Recent Colors</div>
        <div class={styles.swatchGrid}>
          <For each={recentColors()}>
            {(hex, index) => {
              const selected = () => isSelected(hex);

              return (
                <div
                  data-testid={`swatch-recent-${index()}`}
                  class={`${styles.swatch} ${selected() ? styles.swatchSelected : ''}`}
                  role="button"
                  tabindex={0}
                  aria-label={`Recent color: ${hex}`}
                  aria-pressed={selected()}
                  style={{ 'background-color': hex }}
                  onClick={() => handleSelect(hex, 'recent-color')}
                  onKeyDown={handleKeyDown(hex, 'recent-color')}
                  title={hex}
                />
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
};
