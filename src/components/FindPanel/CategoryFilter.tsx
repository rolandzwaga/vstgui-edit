/**
 * CategoryFilter Component
 * Category checkboxes for filtering search results by view type.
 */

import { For, Show } from 'solid-js';
import type { CategoryFilters } from '../../types/search';
import styles from './FindPanel.module.css';

const CATEGORIES = [
  { key: 'container' as const, label: 'Container' },
  { key: 'control' as const, label: 'Control' },
  { key: 'display' as const, label: 'Display' },
  { key: 'custom' as const, label: 'Custom' },
] as const;

export interface CategoryFilterProps {
  /** Current filter state */
  filters: CategoryFilters;
  /** Called when a single filter is toggled */
  onFilterChange: (category: keyof CategoryFilters, enabled: boolean) => void;
  /** Called when All/None button is clicked */
  onToggleAll?: (enabled: boolean) => void;
}

export function CategoryFilter(props: CategoryFilterProps) {
  return (
    <div
      class={styles.categoryFilter}
      role="group"
      aria-label="Category filters"
    >
      <div class={styles.categoryFilterLabel}>Categories</div>
      <div class={styles.categoryFilterOptions}>
        <For each={CATEGORIES}>
          {(category) => (
            <label class={styles.categoryCheckbox}>
              <input
                type="checkbox"
                checked={props.filters[category.key]}
                onChange={(e) =>
                  props.onFilterChange(category.key, e.currentTarget.checked)
                }
              />
              {category.label}
            </label>
          )}
        </For>
        <Show when={props.onToggleAll}>
          <button
            type="button"
            class={styles.filterToggleButton}
            onClick={() => props.onToggleAll?.(true)}
          >
            All
          </button>
          <button
            type="button"
            class={styles.filterToggleButton}
            onClick={() => props.onToggleAll?.(false)}
          >
            None
          </button>
        </Show>
      </div>
    </div>
  );
}
