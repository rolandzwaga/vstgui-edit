/**
 * Keyboard Shortcuts Data
 *
 * Read-only reference of all implemented keyboard shortcuts.
 */

import type { ShortcutCategory } from './types';

/**
 * All keyboard shortcuts organized by category.
 *
 * Total: 23 shortcuts across 5 categories
 */
export const KEYBOARD_SHORTCUTS: ShortcutCategory[] = [
  {
    name: 'Canvas Navigation',
    shortcuts: [
      { keys: '+/=', description: 'Zoom In' },
      { keys: '-', description: 'Zoom Out' },
      { keys: '0', description: 'Reset Zoom' },
      { keys: 'F', description: 'Fit to View' },
      { keys: 'G', description: 'Toggle Grid Visibility' },
      { keys: 'Shift+G', description: 'Toggle Snap to Grid' },
      { keys: 'S', description: 'Toggle Smart Guides' },
      { keys: 'Ctrl+;', description: 'Toggle Custom Guides Visibility' },
    ],
  },
  {
    name: 'Selection',
    shortcuts: [
      { keys: 'Ctrl+A', description: 'Select All' },
      { keys: 'Escape', description: 'Clear Selection / Cancel Operation' },
    ],
  },
  {
    name: 'Editing',
    shortcuts: [
      { keys: 'Ctrl+Z', description: 'Undo' },
      { keys: 'Ctrl+Y / Ctrl+Shift+Z', description: 'Redo' },
      { keys: 'Arrow Keys', description: 'Nudge (1px)' },
      { keys: 'Shift+Arrow Keys', description: 'Nudge Fast (10px)' },
    ],
  },
  {
    name: 'Alignment',
    shortcuts: [
      { keys: 'Ctrl+Shift+L', description: 'Align Left' },
      { keys: 'Ctrl+Shift+C', description: 'Align Center' },
      { keys: 'Ctrl+Shift+R', description: 'Align Right' },
      { keys: 'Ctrl+Shift+T', description: 'Align Top' },
      { keys: 'Ctrl+Shift+M', description: 'Align Middle' },
      { keys: 'Ctrl+Shift+B', description: 'Align Bottom' },
    ],
  },
  {
    name: 'View Management',
    shortcuts: [
      { keys: 'Ctrl+L', description: 'Lock/Unlock Selected' },
      { keys: 'Ctrl+H', description: 'Hide/Show Selected' },
      { keys: 'Ctrl+Shift+H', description: 'Show All Hidden' },
    ],
  },
];
