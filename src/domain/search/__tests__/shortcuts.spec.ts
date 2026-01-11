/**
 * Tests for search shortcuts
 * Keyboard shortcut handlers for Find/Replace feature.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import {
  openFindPanel,
  resetSearchStore,
  searchStore,
  setSearchResults,
} from '../../../stores/searchStore';
import type { SearchResult } from '../../../types/search';
import { handleSearchShortcut } from '../shortcuts';

const mockResults: SearchResult[] = [
  { viewId: 'view-1', className: 'CKnob', category: 'control', displayPath: 'Root' },
  { viewId: 'view-2', className: 'CSlider', category: 'control', displayPath: 'Root' },
];

function createKeyboardEvent(
  key: string,
  options: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
  } = {}
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    ctrlKey: options.ctrlKey ?? false,
    metaKey: options.metaKey ?? false,
    shiftKey: options.shiftKey ?? false,
    bubbles: true,
  });
  vi.spyOn(event, 'preventDefault');
  return event;
}

describe('search shortcuts', () => {
  beforeEach(() => {
    resetSearchStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetSearchStore();
  });

  describe('Ctrl+F', () => {
    it('should open find panel on Ctrl+F', () => {
      testInRoot(() => {
        const event = createKeyboardEvent('f', { ctrlKey: true });
        const handled = handleSearchShortcut(event);

        expect(handled).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(searchStore.isOpen).toBe(true);
        expect(searchStore.mode).toBe('find');
      });
    });

    it('should open find panel on Cmd+F (Mac)', () => {
      testInRoot(() => {
        const event = createKeyboardEvent('f', { metaKey: true });
        const handled = handleSearchShortcut(event);

        expect(handled).toBe(true);
        expect(searchStore.isOpen).toBe(true);
      });
    });
  });

  describe('Ctrl+Shift+F', () => {
    it('should open replace panel on Ctrl+Shift+F', () => {
      testInRoot(() => {
        const event = createKeyboardEvent('F', { ctrlKey: true, shiftKey: true });
        const handled = handleSearchShortcut(event);

        expect(handled).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(searchStore.isOpen).toBe(true);
        expect(searchStore.mode).toBe('replace');
      });
    });

    it('should open replace panel on Cmd+Shift+F (Mac)', () => {
      testInRoot(() => {
        const event = createKeyboardEvent('F', { metaKey: true, shiftKey: true });
        const handled = handleSearchShortcut(event);

        expect(handled).toBe(true);
        expect(searchStore.mode).toBe('replace');
      });
    });
  });

  describe('F3 navigation', () => {
    it('should navigate to next result on F3', () => {
      testInRoot(() => {
        openFindPanel();
        setSearchResults(mockResults);
        expect(searchStore.currentIndex).toBe(0);

        const event = createKeyboardEvent('F3');
        const handled = handleSearchShortcut(event);

        expect(handled).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(searchStore.currentIndex).toBe(1);
      });
    });

    it('should navigate to previous result on Shift+F3', () => {
      testInRoot(() => {
        openFindPanel();
        setSearchResults(mockResults);
        expect(searchStore.currentIndex).toBe(0);

        const event = createKeyboardEvent('F3', { shiftKey: true });
        const handled = handleSearchShortcut(event);

        expect(handled).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(searchStore.currentIndex).toBe(1); // Wraps to last
      });
    });

    it('should navigate even if panel is closed', () => {
      testInRoot(() => {
        setSearchResults(mockResults);
        expect(searchStore.isOpen).toBe(false);
        expect(searchStore.currentIndex).toBe(0);

        const event = createKeyboardEvent('F3');
        handleSearchShortcut(event);

        expect(searchStore.currentIndex).toBe(1);
      });
    });

    it('should not navigate when no results', () => {
      testInRoot(() => {
        const event = createKeyboardEvent('F3');
        handleSearchShortcut(event);

        expect(searchStore.currentIndex).toBe(-1);
      });
    });
  });

  describe('Escape', () => {
    it('should close panel on Escape when open', () => {
      testInRoot(() => {
        openFindPanel();
        expect(searchStore.isOpen).toBe(true);

        const event = createKeyboardEvent('Escape');
        const handled = handleSearchShortcut(event);

        expect(handled).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(searchStore.isOpen).toBe(false);
      });
    });

    it('should not handle Escape when panel is closed', () => {
      testInRoot(() => {
        expect(searchStore.isOpen).toBe(false);

        const event = createKeyboardEvent('Escape');
        const handled = handleSearchShortcut(event);

        expect(handled).toBe(false);
        expect(event.preventDefault).not.toHaveBeenCalled();
      });
    });
  });

  describe('unhandled keys', () => {
    it('should return false for unhandled keys', () => {
      testInRoot(() => {
        const event = createKeyboardEvent('a');
        const handled = handleSearchShortcut(event);

        expect(handled).toBe(false);
        expect(event.preventDefault).not.toHaveBeenCalled();
      });
    });

    it('should return false for Ctrl+other keys', () => {
      testInRoot(() => {
        const event = createKeyboardEvent('s', { ctrlKey: true });
        const handled = handleSearchShortcut(event);

        expect(handled).toBe(false);
      });
    });
  });
});
