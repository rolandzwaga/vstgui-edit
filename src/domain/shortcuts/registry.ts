/**
 * Keyboard Shortcuts Registry
 *
 * Centralized registry of all keyboard shortcuts with query functions.
 */

import type {
  ShortcutCategoryId,
  ShortcutCategoryMeta,
  ShortcutDefinition,
} from '../../types/shortcuts';

/**
 * All shortcut categories with display metadata.
 * Ordered for display in the shortcuts panel.
 */
export const SHORTCUT_CATEGORIES: ShortcutCategoryMeta[] = [
  { id: 'canvas', name: 'Canvas Navigation', order: 1 },
  { id: 'selection', name: 'Selection', order: 2 },
  { id: 'editing', name: 'Editing', order: 3 },
  { id: 'clipboard', name: 'Clipboard', order: 4 },
  { id: 'alignment', name: 'Alignment', order: 5 },
  { id: 'viewManagement', name: 'View Management', order: 6 },
  { id: 'grouping', name: 'Grouping', order: 7 },
  { id: 'findReplace', name: 'Find/Replace', order: 8 },
  { id: 'file', name: 'File', order: 9 },
  { id: 'general', name: 'General', order: 10 },
];

/**
 * Complete registry of all keyboard shortcuts.
 * Single source of truth for all shortcut definitions.
 *
 * Total: 45 shortcuts across 10 categories
 */
export const SHORTCUT_REGISTRY: ShortcutDefinition[] = [
  // Canvas Navigation (10)
  { id: 'canvas-space-drag', keys: 'Space+Drag', description: 'Pan canvas', category: 'canvas' },
  {
    id: 'canvas-middle-drag',
    keys: 'Middle-mouse Drag',
    description: 'Pan canvas',
    category: 'canvas',
  },
  {
    id: 'canvas-ctrl-drag',
    keys: 'Ctrl+Drag',
    description: 'Pan canvas (alternative)',
    category: 'canvas',
  },
  { id: 'canvas-scroll', keys: 'Scroll Wheel', description: 'Zoom in/out', category: 'canvas' },
  { id: 'canvas-zoom-in', keys: '+/=', description: 'Zoom In', category: 'canvas' },
  { id: 'canvas-zoom-out', keys: '-', description: 'Zoom Out', category: 'canvas' },
  { id: 'canvas-zoom-reset', keys: '0', description: 'Reset Zoom (100%)', category: 'canvas' },
  { id: 'canvas-fit', keys: 'F', description: 'Fit to View', category: 'canvas' },
  { id: 'canvas-grid', keys: 'G', description: 'Toggle Grid Visibility', category: 'canvas' },
  { id: 'canvas-snap', keys: 'Shift+G', description: 'Toggle Snap to Grid', category: 'canvas' },

  // Selection (3)
  { id: 'select-click', keys: 'Click', description: 'Select view', category: 'selection' },
  {
    id: 'select-shift-click',
    keys: 'Shift+Click',
    description: 'Add to / Toggle selection',
    category: 'selection',
  },
  { id: 'select-all', keys: 'Ctrl+A', description: 'Select All', category: 'selection' },

  // Editing (6)
  { id: 'edit-undo', keys: 'Ctrl+Z', description: 'Undo', category: 'editing' },
  { id: 'edit-redo', keys: 'Ctrl+Y', description: 'Redo', category: 'editing' },
  {
    id: 'edit-redo-alt',
    keys: 'Ctrl+Shift+Z',
    description: 'Redo (alternative)',
    category: 'editing',
  },
  {
    id: 'edit-nudge',
    keys: 'Arrow Keys',
    description: 'Nudge 1px',
    category: 'editing',
    context: 'when views selected',
  },
  {
    id: 'edit-nudge-fast',
    keys: 'Shift+Arrow Keys',
    description: 'Nudge 10px',
    category: 'editing',
    context: 'when views selected',
  },
  {
    id: 'edit-delete',
    keys: 'Delete / Backspace',
    description: 'Delete selected views',
    category: 'editing',
    context: 'when views selected',
  },

  // Clipboard (4)
  {
    id: 'clipboard-copy',
    keys: 'Ctrl+C',
    description: 'Copy',
    category: 'clipboard',
    context: 'when views selected',
  },
  {
    id: 'clipboard-cut',
    keys: 'Ctrl+X',
    description: 'Cut',
    category: 'clipboard',
    context: 'when views selected',
  },
  { id: 'clipboard-paste', keys: 'Ctrl+V', description: 'Paste', category: 'clipboard' },
  {
    id: 'clipboard-duplicate',
    keys: 'Ctrl+D',
    description: 'Duplicate',
    category: 'clipboard',
    context: 'when views selected',
  },

  // Alignment (6)
  {
    id: 'align-left',
    keys: 'Ctrl+Shift+L',
    description: 'Align Left',
    category: 'alignment',
    context: 'when views selected',
  },
  {
    id: 'align-center',
    keys: 'Ctrl+Shift+C',
    description: 'Align Center',
    category: 'alignment',
    context: 'when views selected',
  },
  {
    id: 'align-right',
    keys: 'Ctrl+Shift+R',
    description: 'Align Right',
    category: 'alignment',
    context: 'when views selected',
  },
  {
    id: 'align-top',
    keys: 'Ctrl+Shift+T',
    description: 'Align Top',
    category: 'alignment',
    context: 'when views selected',
  },
  {
    id: 'align-middle',
    keys: 'Ctrl+Shift+M',
    description: 'Align Middle',
    category: 'alignment',
    context: 'when views selected',
  },
  {
    id: 'align-bottom',
    keys: 'Ctrl+Shift+B',
    description: 'Align Bottom',
    category: 'alignment',
    context: 'when views selected',
  },

  // View Management (6)
  {
    id: 'view-mode-toggle',
    keys: 'P',
    description: 'Toggle Wireframe/Styled View Mode',
    category: 'viewManagement',
  },
  {
    id: 'view-smart-guides',
    keys: 'S',
    description: 'Toggle Smart Guides',
    category: 'viewManagement',
  },
  {
    id: 'view-custom-guides',
    keys: 'Ctrl+;',
    description: 'Toggle Custom Guides Visibility',
    category: 'viewManagement',
  },
  {
    id: 'view-lock',
    keys: 'Ctrl+L',
    description: 'Lock/Unlock Selected',
    category: 'viewManagement',
    context: 'when views selected',
  },
  {
    id: 'view-hide',
    keys: 'Ctrl+H',
    description: 'Hide/Show Selected',
    category: 'viewManagement',
    context: 'when views selected',
  },
  {
    id: 'view-show-all',
    keys: 'Ctrl+Shift+H',
    description: 'Show All Hidden',
    category: 'viewManagement',
  },

  // Grouping (2)
  {
    id: 'group-create',
    keys: 'Ctrl+G',
    description: 'Group selected views',
    category: 'grouping',
    context: 'when 2+ views selected',
  },
  {
    id: 'group-ungroup',
    keys: 'Ctrl+Shift+G',
    description: 'Ungroup container',
    category: 'grouping',
    context: 'when container selected',
  },

  // Find/Replace (4)
  { id: 'find-open', keys: 'Ctrl+F', description: 'Open Find panel', category: 'findReplace' },
  {
    id: 'find-replace-open',
    keys: 'Ctrl+Shift+F',
    description: 'Open Find/Replace panel',
    category: 'findReplace',
  },
  { id: 'find-next', keys: 'F3', description: 'Find Next', category: 'findReplace' },
  { id: 'find-prev', keys: 'Shift+F3', description: 'Find Previous', category: 'findReplace' },

  // File (2)
  { id: 'file-save', keys: 'Ctrl+S', description: 'Save', category: 'file' },
  { id: 'file-preferences', keys: 'Ctrl+,', description: 'Open Preferences', category: 'file' },

  // General (2)
  {
    id: 'general-escape',
    keys: 'Escape',
    description: 'Cancel operation / Clear selection / Close panel',
    category: 'general',
  },
  {
    id: 'general-shortcuts',
    keys: '? / Ctrl+/',
    description: 'Open Keyboard Shortcuts panel',
    category: 'general',
  },
];

/**
 * Gets all shortcuts for a specific category.
 *
 * @param category - The category ID to filter by
 * @returns Array of shortcuts in the category (may be empty)
 */
export function getShortcutsByCategory(category: ShortcutCategoryId): ShortcutDefinition[] {
  return SHORTCUT_REGISTRY.filter(s => s.category === category);
}

/**
 * Gets a shortcut by its unique ID.
 *
 * @param id - The shortcut ID
 * @returns The shortcut definition or undefined if not found
 */
export function getShortcutById(id: string): ShortcutDefinition | undefined {
  return SHORTCUT_REGISTRY.find(s => s.id === id);
}

/**
 * Gets shortcuts grouped by category for display.
 * Categories are sorted by their defined order.
 *
 * @returns Map of category ID to array of shortcuts
 */
export function getShortcutsGroupedByCategory(): Map<ShortcutCategoryId, ShortcutDefinition[]> {
  const grouped = new Map<ShortcutCategoryId, ShortcutDefinition[]>();

  // Initialize with empty arrays in category order
  const sortedCategories = [...SHORTCUT_CATEGORIES].sort((a, b) => a.order - b.order);
  for (const category of sortedCategories) {
    grouped.set(category.id, []);
  }

  // Populate with shortcuts
  for (const shortcut of SHORTCUT_REGISTRY) {
    const list = grouped.get(shortcut.category);
    if (list) {
      list.push(shortcut);
    }
  }

  return grouped;
}

/**
 * Gets total count of registered shortcuts.
 */
export function getShortcutCount(): number {
  return SHORTCUT_REGISTRY.length;
}

/**
 * Gets count of shortcuts per category.
 */
export function getCategoryStats(): Map<ShortcutCategoryId, number> {
  const stats = new Map<ShortcutCategoryId, number>();

  // Initialize with zeros
  for (const category of SHORTCUT_CATEGORIES) {
    stats.set(category.id, 0);
  }

  // Count shortcuts
  for (const shortcut of SHORTCUT_REGISTRY) {
    const count = stats.get(shortcut.category) ?? 0;
    stats.set(shortcut.category, count + 1);
  }

  return stats;
}
