import { createSignal } from 'solid-js';
import { PALETTE_CATEGORIES, VIEW_CLASSES } from '../domain/views/viewClasses';
import type { PaletteCategoryId } from '../types/views';

const ALL_CATEGORY_IDS: PaletteCategoryId[] = PALETTE_CATEGORIES.map(c => c.id);

const [expandedCategories, setExpandedCategories] = createSignal<Set<PaletteCategoryId>>(
  new Set(ALL_CATEGORY_IDS)
);
const [searchQuery, setSearchQuerySignal] = createSignal('');

function getFilteredClasses(): string[] {
  const query = searchQuery().toLowerCase().trim();
  if (!query) {
    return Object.keys(VIEW_CLASSES);
  }
  return Object.keys(VIEW_CLASSES).filter(className => className.toLowerCase().includes(query));
}

export const paletteStore = {
  get expandedCategories() {
    return expandedCategories();
  },
  get searchQuery() {
    return searchQuery();
  },
  get filteredClasses() {
    return getFilteredClasses();
  },
};

export function toggleCategory(category: PaletteCategoryId): void {
  const current = expandedCategories();
  const newSet = new Set(current);

  if (newSet.has(category)) {
    newSet.delete(category);
  } else {
    newSet.add(category);
  }

  setExpandedCategories(newSet);
}

export function expandCategory(category: PaletteCategoryId): void {
  const current = expandedCategories();
  if (!current.has(category)) {
    const newSet = new Set(current);
    newSet.add(category);
    setExpandedCategories(newSet);
  }
}

export function collapseCategory(category: PaletteCategoryId): void {
  const current = expandedCategories();
  if (current.has(category)) {
    const newSet = new Set(current);
    newSet.delete(category);
    setExpandedCategories(newSet);
  }
}

export function expandAllCategories(): void {
  setExpandedCategories(new Set(ALL_CATEGORY_IDS));
}

export function collapseAllCategories(): void {
  setExpandedCategories(new Set<PaletteCategoryId>());
}

export function setSearchQuery(query: string): void {
  setSearchQuerySignal(query);
}

export function clearSearch(): void {
  setSearchQuerySignal('');
}

export function isCategoryExpanded(category: PaletteCategoryId): boolean {
  return expandedCategories().has(category);
}

export function resetPalette(): void {
  setExpandedCategories(new Set(ALL_CATEGORY_IDS));
  setSearchQuerySignal('');
}
