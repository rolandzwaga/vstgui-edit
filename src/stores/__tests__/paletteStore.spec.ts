import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import { VIEW_CLASSES } from '../../domain/views/viewClasses';
import {
	clearSearch,
	collapseAllCategories,
	collapseCategory,
	expandAllCategories,
	expandCategory,
	isCategoryExpanded,
	paletteStore,
	resetPalette,
	setSearchQuery,
	toggleCategory,
} from '../paletteStore';

describe('paletteStore', () => {
	beforeEach(() => {
		testInRoot(() => {
			resetPalette();
		});
	});

	describe('initial state', () => {
		it('should have all categories expanded by default', () => {
			testInRoot(() => {
				expect(paletteStore.expandedCategories.has('containers')).toBe(true);
				expect(paletteStore.expandedCategories.has('controls')).toBe(true);
				expect(paletteStore.expandedCategories.has('displays')).toBe(true);
				expect(paletteStore.expandedCategories.has('text-input')).toBe(true);
				expect(paletteStore.expandedCategories.has('animation')).toBe(true);
			});
		});

		it('should have empty search query', () => {
			testInRoot(() => {
				expect(paletteStore.searchQuery).toBe('');
			});
		});

		it('should show all view classes when no search', () => {
			testInRoot(() => {
				const allClassCount = Object.keys(VIEW_CLASSES).length;
				expect(paletteStore.filteredClasses.length).toBe(allClassCount);
			});
		});
	});

	describe('toggleCategory', () => {
		it('should collapse an expanded category', () => {
			testInRoot(() => {
				toggleCategory('containers');
				expect(paletteStore.expandedCategories.has('containers')).toBe(false);
			});
		});

		it('should expand a collapsed category', () => {
			testInRoot(() => {
				toggleCategory('containers');
				toggleCategory('containers');
				expect(paletteStore.expandedCategories.has('containers')).toBe(true);
			});
		});

		it('should not affect other categories', () => {
			testInRoot(() => {
				toggleCategory('containers');
				expect(paletteStore.expandedCategories.has('controls')).toBe(true);
				expect(paletteStore.expandedCategories.has('displays')).toBe(true);
			});
		});
	});

	describe('expandCategory', () => {
		it('should expand a collapsed category', () => {
			testInRoot(() => {
				collapseCategory('containers');
				expandCategory('containers');
				expect(paletteStore.expandedCategories.has('containers')).toBe(true);
			});
		});

		it('should do nothing if already expanded', () => {
			testInRoot(() => {
				expandCategory('containers');
				expect(paletteStore.expandedCategories.has('containers')).toBe(true);
			});
		});
	});

	describe('collapseCategory', () => {
		it('should collapse an expanded category', () => {
			testInRoot(() => {
				collapseCategory('controls');
				expect(paletteStore.expandedCategories.has('controls')).toBe(false);
			});
		});

		it('should do nothing if already collapsed', () => {
			testInRoot(() => {
				collapseCategory('controls');
				collapseCategory('controls');
				expect(paletteStore.expandedCategories.has('controls')).toBe(false);
			});
		});
	});

	describe('expandAllCategories', () => {
		it('should expand all categories', () => {
			testInRoot(() => {
				collapseAllCategories();
				expandAllCategories();
				expect(paletteStore.expandedCategories.size).toBe(5);
			});
		});
	});

	describe('collapseAllCategories', () => {
		it('should collapse all categories', () => {
			testInRoot(() => {
				collapseAllCategories();
				expect(paletteStore.expandedCategories.size).toBe(0);
			});
		});
	});

	describe('isCategoryExpanded', () => {
		it('should return true for expanded category', () => {
			testInRoot(() => {
				expect(isCategoryExpanded('containers')).toBe(true);
			});
		});

		it('should return false for collapsed category', () => {
			testInRoot(() => {
				collapseCategory('containers');
				expect(isCategoryExpanded('containers')).toBe(false);
			});
		});
	});

	describe('setSearchQuery', () => {
		it('should update search query', () => {
			testInRoot(() => {
				setSearchQuery('button');
				expect(paletteStore.searchQuery).toBe('button');
			});
		});

		it('should filter classes by query', () => {
			testInRoot(() => {
				setSearchQuery('Button');
				const filtered = paletteStore.filteredClasses;
				expect(filtered).toContain('CTextButton');
				expect(filtered).toContain('CKickButton');
				expect(filtered).toContain('COnOffButton');
				expect(filtered).toContain('CSegmentButton');
				expect(filtered).toContain('CMovieButton');
				expect(filtered).not.toContain('CSlider');
				expect(filtered).not.toContain('CKnob');
			});
		});

		it('should be case insensitive', () => {
			testInRoot(() => {
				setSearchQuery('knob');
				expect(paletteStore.filteredClasses).toContain('CKnob');
				expect(paletteStore.filteredClasses).toContain('CAnimKnob');
			});
		});

		it('should return empty array for no matches', () => {
			testInRoot(() => {
				setSearchQuery('xyz123nonexistent');
				expect(paletteStore.filteredClasses.length).toBe(0);
			});
		});

		it('should trim whitespace from query', () => {
			testInRoot(() => {
				setSearchQuery('  Knob  ');
				expect(paletteStore.filteredClasses).toContain('CKnob');
			});
		});
	});

	describe('clearSearch', () => {
		it('should clear search query', () => {
			testInRoot(() => {
				setSearchQuery('button');
				clearSearch();
				expect(paletteStore.searchQuery).toBe('');
			});
		});

		it('should show all classes after clearing', () => {
			testInRoot(() => {
				setSearchQuery('button');
				clearSearch();
				const allClassCount = Object.keys(VIEW_CLASSES).length;
				expect(paletteStore.filteredClasses.length).toBe(allClassCount);
			});
		});
	});

	describe('resetPalette', () => {
		it('should reset to initial state', () => {
			testInRoot(() => {
				collapseAllCategories();
				setSearchQuery('test');

				resetPalette();

				expect(paletteStore.expandedCategories.size).toBe(5);
				expect(paletteStore.searchQuery).toBe('');
			});
		});
	});
});
