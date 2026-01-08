import { type Component, For } from 'solid-js';
import { PALETTE_CATEGORIES } from '../../domain/views/viewClasses';
import { paletteStore, setSearchQuery } from '../../stores/paletteStore';
import { CollapsibleSection } from '../CollapsibleSection';
import { PaletteCategory } from './PaletteCategory';
import styles from './ViewPalette.module.css';

export const ViewPalette: Component = () => {
  const handleSearchInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setSearchQuery(target.value);
  };

  return (
    <div class={styles.panel} data-testid="view-palette">
      <CollapsibleSection title="Views" defaultExpanded={false}>
        <div class={styles.searchContainer}>
          <input
            type="text"
            class={styles.searchInput}
            data-testid="palette-search"
            placeholder="Search views..."
            value={paletteStore.searchQuery}
            onInput={handleSearchInput}
          />
        </div>
        <div class={styles.categories}>
          <For each={PALETTE_CATEGORIES}>
            {(category) => <PaletteCategory category={category} />}
          </For>
        </div>
      </CollapsibleSection>
    </div>
  );
};
