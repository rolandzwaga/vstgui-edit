import { type Component, For, Show, createMemo } from 'solid-js';
import type { PaletteCategory as PaletteCategoryType } from '../../types/views';
import { paletteStore, toggleCategory, isCategoryExpanded } from '../../stores/paletteStore';
import { PaletteItem } from './PaletteItem';
import styles from './PaletteCategory.module.css';

export interface PaletteCategoryProps {
  category: PaletteCategoryType;
}

export const PaletteCategory: Component<PaletteCategoryProps> = (props) => {
  const expanded = () => isCategoryExpanded(props.category.id);

  const visibleClasses = createMemo(() => {
    const filtered = paletteStore.filteredClasses;
    return props.category.viewClasses.filter((c) => filtered.includes(c));
  });

  const handleToggle = () => {
    toggleCategory(props.category.id);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <Show when={visibleClasses().length > 0}>
      <div class={styles.category} data-testid={`palette-category-${props.category.id}`}>
        <div
          class={styles.header}
          role="button"
          tabIndex={0}
          aria-expanded={expanded()}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
        >
          <span class={expanded() ? styles.chevronDown : styles.chevronRight}>▶</span>
          <span class={styles.label}>{props.category.label}</span>
          <span class={styles.count}>({visibleClasses().length})</span>
        </div>
        <Show when={expanded()}>
          <div class={styles.items} role="group">
            <For each={visibleClasses()}>
              {(className) => <PaletteItem className={className} />}
            </For>
          </div>
        </Show>
      </div>
    </Show>
  );
};
