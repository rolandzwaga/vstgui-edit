/**
 * ThemeSection Component
 *
 * Theme settings section for preferences panel.
 * Allows users to select Light, Dark, or System theme mode.
 * Theme changes are applied immediately to the document.
 */

import type { Component } from 'solid-js';
import {
  preferencesStore,
  setThemeModePreference,
} from '../../../stores/preferencesStore';
import { SettingSelect } from '../controls';
import type { SelectOption } from '../controls/SettingSelect';
import type { ThemeMode } from '../../../types/preferences';
import styles from './sections.module.css';

const THEME_OPTIONS: SelectOption<ThemeMode>[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export const ThemeSection: Component = () => {
  return (
    <section class={styles.section}>
      <h3 class={styles.sectionHeading}>Theme</h3>
      <p class={styles.sectionDescription}>
        Choose the visual theme for the editor. System mode automatically follows your
        operating system's appearance settings.
      </p>

      <div class={styles.settingGroup}>
        <SettingSelect
          id="theme-mode"
          label="Theme"
          value={preferencesStore.preferences.theme.mode}
          options={THEME_OPTIONS}
          onChange={(value) => setThemeModePreference(value as ThemeMode)}
        />
      </div>
    </section>
  );
};
