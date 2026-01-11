/**
 * PreferencesSidebar Component
 *
 * Navigation sidebar for preferences panel sections.
 */

import type { Component, JSX } from 'solid-js';
import { For } from 'solid-js';
import type { PreferencesSection, PreferencesSectionInfo } from '../../types/preferences';
import styles from './PreferencesSidebar.module.css';

/**
 * Section definitions with icons.
 * Using inline SVG icons instead of FontAwesome for simplicity.
 */
const PREFERENCES_SECTIONS: PreferencesSectionInfo[] = [
  { id: 'grid', label: 'Grid', icon: 'grid' },
  { id: 'snap', label: 'Snap', icon: 'magnet' },
  { id: 'smartGuides', label: 'Smart Guides', icon: 'alignLeft' },
  { id: 'customGuides', label: 'Custom Guides', icon: 'ruler' },
  { id: 'theme', label: 'Theme', icon: 'palette' },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: 'keyboard' },
];

/**
 * Simple SVG icons for sidebar navigation.
 */
const icons: Record<string, JSX.Element> = {
  grid: (
    <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  magnet: (
    <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 15V9a6 6 0 0 1 12 0v6" />
      <path d="M6 15h2v4H6z" />
      <path d="M16 15h2v4h-2z" />
    </svg>
  ),
  alignLeft: (
    <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="18" y2="18" />
    </svg>
  ),
  ruler: (
    <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 5h18v14H3z" />
      <path d="M6 5v4" />
      <path d="M10 5v2" />
      <path d="M14 5v4" />
      <path d="M18 5v2" />
    </svg>
  ),
  palette: (
    <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      <circle cx="15" cy="10" r="1.5" fill="currentColor" />
      <circle cx="10" cy="15" r="1.5" fill="currentColor" />
    </svg>
  ),
  keyboard: (
    <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <line x1="6" y1="10" x2="6" y2="10" stroke-linecap="round" />
      <line x1="10" y1="10" x2="10" y2="10" stroke-linecap="round" />
      <line x1="14" y1="10" x2="14" y2="10" stroke-linecap="round" />
      <line x1="18" y1="10" x2="18" y2="10" stroke-linecap="round" />
      <line x1="8" y1="14" x2="16" y2="14" />
    </svg>
  ),
};

export interface PreferencesSidebarProps {
  /** Currently active section */
  activeSection: PreferencesSection;

  /** Section change handler */
  onSectionChange: (section: PreferencesSection) => void;
}

export const PreferencesSidebar: Component<PreferencesSidebarProps> = (props) => {
  return (
    <nav class={styles.sidebar} aria-label="Preferences sections">
      <ul class={styles.navList}>
        <For each={PREFERENCES_SECTIONS}>
          {(section) => (
            <li>
              <button
                type="button"
                class={`${styles.navItem} ${
                  props.activeSection === section.id ? styles.navItemActive : ''
                }`}
                aria-selected={props.activeSection === section.id}
                aria-current={props.activeSection === section.id ? 'page' : undefined}
                onClick={() => props.onSectionChange(section.id)}
              >
                {icons[section.icon]}
                {section.label}
              </button>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
};
