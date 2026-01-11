/**
 * CustomGuidesSection Component
 *
 * Custom guides settings section for preferences panel.
 */

import type { Component } from 'solid-js';
import {
  preferencesStore,
  setCustomGuidesSnapEnabledByDefaultPreference,
} from '../../../stores/preferencesStore';
import { SettingToggle } from '../controls';
import styles from './sections.module.css';

export const CustomGuidesSection: Component = () => {
  return (
    <section class={styles.section}>
      <h3 class={styles.sectionHeading}>Custom Guides</h3>
      <p class={styles.sectionDescription}>
        Configure snap behavior for custom ruler guides.
      </p>

      <div class={styles.settingGroup}>
        <SettingToggle
          id="custom-guides-snap-enabled-default"
          label="Snap to guides by default"
          description="Enable snap-to-guides when opening a document"
          value={preferencesStore.preferences.customGuides.snapEnabledByDefault}
          onChange={setCustomGuidesSnapEnabledByDefaultPreference}
        />
      </div>
    </section>
  );
};
