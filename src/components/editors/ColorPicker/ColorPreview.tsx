/**
 * ColorPreview Component
 *
 * Shows old vs new color comparison with click-to-revert functionality.
 */

import type { Component, JSX } from 'solid-js';
import styles from './ColorPicker.module.css';

export interface ColorPreviewProps {
  /** Original color in hex format (#RRGGBBAA) */
  originalColor: string;
  /** Current/new color in hex format (#RRGGBBAA) */
  currentColor: string;
  /** Called when user clicks original color to revert */
  onRevert: () => void;
}

/**
 * Convert 8-digit hex to rgba CSS string
 */
function hexToRgba(hex: string): string {
  // Remove # prefix if present
  const h = hex.startsWith('#') ? hex.slice(1) : hex;

  // Parse components
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const ColorPreview: Component<ColorPreviewProps> = (props) => {
  // Handle click on original color to revert
  const handleRevertClick = () => {
    props.onRevert();
  };

  // Handle keyboard interaction
  const handleKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      props.onRevert();
    }
  };

  return (
    <div class={styles.previewContainer}>
      {/* Old/Original Color */}
      <div class={styles.previewColumn}>
        <span class={styles.previewLabel}>Old</span>
        <div
          class={`${styles.previewSwatchContainer} ${styles.previewOld}`}
          data-testid="preview-old-container"
          role="button"
          tabIndex={0}
          aria-label="Click to revert to original color"
          onClick={handleRevertClick}
          onKeyDown={handleKeyDown}
          style={{ cursor: 'pointer' }}
        >
          <div
            class={styles.previewSwatch}
            data-testid="preview-old"
            style={{ 'background-color': hexToRgba(props.originalColor) }}
          />
        </div>
      </div>

      {/* New/Current Color */}
      <div class={styles.previewColumn}>
        <span class={styles.previewLabel}>New</span>
        <div
          class={styles.previewSwatchContainer}
          data-testid="preview-new-container"
        >
          <div
            class={styles.previewSwatch}
            data-testid="preview-new"
            style={{ 'background-color': hexToRgba(props.currentColor) }}
          />
        </div>
      </div>
    </div>
  );
};
