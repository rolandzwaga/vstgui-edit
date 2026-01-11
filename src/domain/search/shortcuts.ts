/**
 * Keyboard Shortcuts for Find/Replace
 * Handlers for Ctrl+F, F3, Shift+F3, etc.
 */

import {
  closeFindPanel,
  navigateToNext,
  navigateToPrevious,
  openFindPanel,
  openReplacePanel,
  searchStore,
} from '../../stores/searchStore';

/**
 * Handle global keyboard shortcuts for Find/Replace.
 *
 * Shortcuts:
 * - Ctrl+F / Cmd+F: Open find panel
 * - Ctrl+Shift+F / Cmd+Shift+F: Open replace panel
 * - F3: Navigate to next result
 * - Shift+F3: Navigate to previous result
 * - Escape: Close panel (when open)
 *
 * @param event - Keyboard event
 * @returns true if event was handled
 */
export function handleSearchShortcut(event: KeyboardEvent): boolean {
  // Accept both Ctrl and Cmd for cross-platform support
  const ctrlOrCmd = event.ctrlKey || event.metaKey;

  // Ctrl+F / Cmd+F - Open find panel
  if (ctrlOrCmd && event.key === 'f') {
    event.preventDefault();
    openFindPanel();
    return true;
  }

  // Ctrl+Shift+F / Cmd+Shift+F - Open replace panel
  if (ctrlOrCmd && event.shiftKey && event.key === 'F') {
    event.preventDefault();
    openReplacePanel();
    return true;
  }

  // F3 - Navigate to next result
  if (event.key === 'F3' && !event.shiftKey) {
    event.preventDefault();
    if (searchStore.isOpen && searchStore.hasResults) {
      navigateToNext();
    } else if (searchStore.hasResults) {
      // If panel is closed but has results, still navigate
      navigateToNext();
    }
    return true;
  }

  // Shift+F3 - Navigate to previous result
  if (event.key === 'F3' && event.shiftKey) {
    event.preventDefault();
    if (searchStore.isOpen && searchStore.hasResults) {
      navigateToPrevious();
    } else if (searchStore.hasResults) {
      // If panel is closed but has results, still navigate
      navigateToPrevious();
    }
    return true;
  }

  // Escape - Close panel (only if panel is open)
  if (event.key === 'Escape' && searchStore.isOpen) {
    event.preventDefault();
    closeFindPanel();
    return true;
  }

  return false;
}
