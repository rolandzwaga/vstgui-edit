/**
 * SmartGuidesSection Component
 *
 * Smart guides settings section for preferences panel.
 */

import type { Component } from 'solid-js';
import {
  preferencesStore,
  setSmartGuidesEnabledByDefaultPreference,
} from '../../../stores/preferencesStore';
import { SettingToggle } from '../controls';
import styles from './sections.module.css';

export const SmartGuidesSection: Component = () => {
  return (
    <section class={styles.section}>
      <h3 class={styles.sectionHeading}>Smart Guides</h3>
      <p class={styles.sectionDescription}>
        Configure smart alignment guides that appear when dragging views.
      </p>

      <div class={styles.settingGroup}>
        <SettingToggle
          id="smart-guides-enabled-default"
          label="Enabled by default"
          description="Show smart guides when opening a document"
          value={preferencesStore.preferences.smartGuides.enabledByDefault}
          onChange={setSmartGuidesEnabledByDefaultPreference}
        />
      </div>
    </section>
  );
};
