import type { Component } from 'solid-js';
import {
  GRID_SIZE_PRESETS,
  gridStore,
  setGridSize,
  setGridStyle,
  toggleVisibility,
} from '../../stores/gridStore';
import type { GridSizePreset, GridStyle } from '../../types/grid';
import styles from './GridToolbar.module.css';

/**
 * GridToolbar - Provides controls for grid visibility, size, and style.
 *
 * Features:
 * - Toggle grid visibility button
 * - Size dropdown with presets (5, 8, 10, 12, 16, 20px)
 * - Style dropdown (lines, dots, crosshairs)
 */
export const GridToolbar: Component = () => {
  /**
   * Handle size selection change.
   */
  const handleSizeChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const size = Number.parseInt(target.value, 10) as GridSizePreset;
    setGridSize(size);
  };

  /**
   * Handle style selection change.
   */
  const handleStyleChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setGridStyle(target.value as GridStyle);
  };

  return (
    <div class={styles.toolbar} role="toolbar" aria-label="Grid controls">
      <button
        type="button"
        class={styles.button}
        classList={{
          [styles.buttonActive]: gridStore.isVisible,
        }}
        onClick={() => toggleVisibility()}
        aria-label="Toggle grid visibility"
        aria-pressed={gridStore.isVisible}
      >
        #
      </button>

      <div class={styles.separator} />

      <select
        class={styles.select}
        value={gridStore.size}
        onChange={handleSizeChange}
        aria-label="Grid size"
      >
        {GRID_SIZE_PRESETS.map((size) => (
          <option value={size}>{size}px</option>
        ))}
      </select>

      <select
        class={styles.select}
        value={gridStore.style}
        onChange={handleStyleChange}
        aria-label="Grid style"
      >
        <option value="lines">Lines</option>
        <option value="dots">Dots</option>
        <option value="crosshairs">Crosshairs</option>
      </select>
    </div>
  );
};
