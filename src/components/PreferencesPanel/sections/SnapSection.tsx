/**
 * SnapSection Component
 *
 * Snap settings section for preferences panel.
 */

import type { Component } from 'solid-js';
import {
  preferencesStore,
  setSnapEnabledByDefaultPreference,
  setSnapThresholdPreference,
} from '../../../stores/preferencesStore';
import { SettingToggle, SettingSlider } from '../controls';
import styles from './sections.module.css';

export const SnapSection: Component = () => {
  return (
    <section class={styles.section}>
      <h3 class={styles.sectionHeading}>Snap</h3>
      <p class={styles.sectionDescription}>
        Configure snap-to-grid behavior for precise alignment.
      </p>

      <div class={styles.settingGroup}>
        <SettingToggle
          id="snap-enabled-default"
          label="Enabled by default"
          description="Enable snap-to-grid when opening a document"
          value={preferencesStore.preferences.snap.enabledByDefault}
          onChange={setSnapEnabledByDefaultPreference}
        />

        <SettingSlider
          id="snap-threshold"
          label="Snap Threshold"
          value={preferencesStore.preferences.snap.threshold}
          min={1}
          max={20}
          unit="px"
          onChange={setSnapThresholdPreference}
        />
      </div>
    </section>
  );
};
