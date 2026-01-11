/**
 * GridSection Component
 *
 * Grid settings section for preferences panel.
 */

import type { Component } from 'solid-js';
import {
  preferencesStore,
  setGridSizePreference,
  setGridStylePreference,
  setGridVisibleByDefaultPreference,
} from '../../../stores/preferencesStore';
import { SettingSelect, SettingToggle } from '../controls';
import type { SelectOption } from '../controls/SettingSelect';
import type { GridSizePreset, GridStyle } from '../../../types/preferences';
import styles from './sections.module.css';

const SIZE_OPTIONS: SelectOption<GridSizePreset>[] = [
  { value: 5, label: '5 px' },
  { value: 8, label: '8 px' },
  { value: 10, label: '10 px' },
  { value: 12, label: '12 px' },
  { value: 16, label: '16 px' },
  { value: 20, label: '20 px' },
];

const STYLE_OPTIONS: SelectOption<GridStyle>[] = [
  { value: 'lines', label: 'Lines' },
  { value: 'dots', label: 'Dots' },
  { value: 'crosshairs', label: 'Crosshairs' },
];

export const GridSection: Component = () => {
  return (
    <section class={styles.section}>
      <h3 class={styles.sectionHeading}>Grid</h3>
      <p class={styles.sectionDescription}>
        Configure the grid overlay appearance and default visibility.
      </p>

      <div class={styles.settingGroup}>
        <SettingSelect
          id="grid-size"
          label="Grid Size"
          value={preferencesStore.preferences.grid.size}
          options={SIZE_OPTIONS}
          onChange={(value) => setGridSizePreference(value as GridSizePreset)}
        />

        <SettingSelect
          id="grid-style"
          label="Grid Style"
          value={preferencesStore.preferences.grid.style}
          options={STYLE_OPTIONS}
          onChange={(value) => setGridStylePreference(value as GridStyle)}
        />

        <SettingToggle
          id="grid-visible-default"
          label="Visible by default"
          description="Show grid when opening a document"
          value={preferencesStore.preferences.grid.visibleByDefault}
          onChange={setGridVisibleByDefaultPreference}
        />
      </div>
    </section>
  );
};
