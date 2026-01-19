/**
 * ControlTypeTabs Component
 *
 * Tab bar for switching between control types (Knob, Slider, etc.)
 * in the Control Designer modal.
 */

import { For } from 'solid-js';
import type { Component, JSX } from 'solid-js';
import type { ControlTypeId, ControlTypePlugin } from '../../types/controlDesigner';
import styles from './ControlTypeTabs.module.css';

// ============================================================================
// Icons
// ============================================================================

/**
 * Knob icon for the tab bar.
 */
const KnobIcon: Component = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="8" />
    <line x1="12" y1="12" x2="12" y2="6" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

/**
 * Slider icon for the tab bar.
 */
const SliderIcon: Component = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="4" y="10" width="16" height="4" rx="2" />
    <circle cx="10" cy="12" r="3" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * Get icon component for a control type.
 */
function getIconForControlType(id: ControlTypeId): Component {
  switch (id) {
    case 'knob':
      return KnobIcon;
    case 'slider':
      return SliderIcon;
    default:
      return KnobIcon;
  }
}

// ============================================================================
// Props Interface
// ============================================================================

export interface ControlTypeTabsProps {
  /** Currently active control type */
  activeType: ControlTypeId;

  /** List of registered plugins to show as tabs */
  plugins: ControlTypePlugin[];

  /** Callback when a tab is clicked */
  onTabChange: (controlType: ControlTypeId) => void;

  /** Optional additional CSS classes */
  class?: string;
}

// ============================================================================
// Component
// ============================================================================

export const ControlTypeTabs: Component<ControlTypeTabsProps> = (props) => {
  return (
    <div
      class={`${styles.container} ${props.class ?? ''}`}
      role="tablist"
      aria-label="Control type selection"
    >
      <For each={props.plugins}>
        {(plugin) => {
          const Icon = getIconForControlType(plugin.id);
          const isActive = () => props.activeType === plugin.id;

          return (
            <button
              type="button"
              role="tab"
              id={`control-type-tab-${plugin.id}`}
              aria-selected={isActive()}
              aria-controls={`control-type-panel-${plugin.id}`}
              class={`${styles.tab} ${isActive() ? styles.tabActive : ''}`}
              onClick={() => props.onTabChange(plugin.id)}
            >
              <span class={styles.tabIcon}>
                <Icon />
              </span>
              <span class={styles.tabLabel}>{plugin.label}</span>
            </button>
          );
        }}
      </For>
    </div>
  );
};

// ============================================================================
// Exports
// ============================================================================

export { KnobIcon, SliderIcon };
