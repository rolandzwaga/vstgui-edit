/**
 * Tests for keyboard shortcuts data
 */

import { describe, expect, it } from 'vitest';
import { KEYBOARD_SHORTCUTS } from '../keyboardShortcuts';

describe('KEYBOARD_SHORTCUTS', () => {
  describe('structure', () => {
    it('exports an array of categories', () => {
      expect(Array.isArray(KEYBOARD_SHORTCUTS)).toBe(true);
    });

    it('has exactly 5 categories', () => {
      expect(KEYBOARD_SHORTCUTS).toHaveLength(5);
    });

    it('each category has name and shortcuts array', () => {
      KEYBOARD_SHORTCUTS.forEach(category => {
        expect(category).toHaveProperty('name');
        expect(typeof category.name).toBe('string');
        expect(category).toHaveProperty('shortcuts');
        expect(Array.isArray(category.shortcuts)).toBe(true);
      });
    });

    it('each shortcut has keys and description', () => {
      KEYBOARD_SHORTCUTS.forEach(category => {
        category.shortcuts.forEach(shortcut => {
          expect(shortcut).toHaveProperty('keys');
          expect(typeof shortcut.keys).toBe('string');
          expect(shortcut.keys.length).toBeGreaterThan(0);
          expect(shortcut).toHaveProperty('description');
          expect(typeof shortcut.description).toBe('string');
          expect(shortcut.description.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('categories', () => {
    it('includes Canvas Navigation category', () => {
      const category = KEYBOARD_SHORTCUTS.find(c => c.name === 'Canvas Navigation');
      expect(category).toBeDefined();
    });

    it('includes Selection category', () => {
      const category = KEYBOARD_SHORTCUTS.find(c => c.name === 'Selection');
      expect(category).toBeDefined();
    });

    it('includes Editing category', () => {
      const category = KEYBOARD_SHORTCUTS.find(c => c.name === 'Editing');
      expect(category).toBeDefined();
    });

    it('includes Alignment category', () => {
      const category = KEYBOARD_SHORTCUTS.find(c => c.name === 'Alignment');
      expect(category).toBeDefined();
    });

    it('includes View Management category', () => {
      const category = KEYBOARD_SHORTCUTS.find(c => c.name === 'View Management');
      expect(category).toBeDefined();
    });
  });

  describe('total shortcuts count', () => {
    it('has exactly 23 shortcuts across all categories', () => {
      const totalShortcuts = KEYBOARD_SHORTCUTS.reduce(
        (sum, category) => sum + category.shortcuts.length,
        0
      );
      expect(totalShortcuts).toBe(23);
    });
  });

  describe('Canvas Navigation shortcuts (8)', () => {
    let canvasCategory: typeof KEYBOARD_SHORTCUTS[0];

    beforeAll(() => {
      canvasCategory = KEYBOARD_SHORTCUTS.find(c => c.name === 'Canvas Navigation')!;
    });

    it('has 8 shortcuts', () => {
      expect(canvasCategory.shortcuts).toHaveLength(8);
    });

    it('includes Zoom In shortcut', () => {
      const shortcut = canvasCategory.shortcuts.find(s => s.description === 'Zoom In');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toContain('+');
    });

    it('includes Zoom Out shortcut', () => {
      const shortcut = canvasCategory.shortcuts.find(s => s.description === 'Zoom Out');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('-');
    });

    it('includes Reset Zoom shortcut', () => {
      const shortcut = canvasCategory.shortcuts.find(s => s.description === 'Reset Zoom');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('0');
    });

    it('includes Fit to View shortcut', () => {
      const shortcut = canvasCategory.shortcuts.find(s => s.description === 'Fit to View');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('F');
    });

    it('includes Toggle Grid Visibility shortcut', () => {
      const shortcut = canvasCategory.shortcuts.find(s => s.description === 'Toggle Grid Visibility');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('G');
    });

    it('includes Toggle Snap to Grid shortcut', () => {
      const shortcut = canvasCategory.shortcuts.find(s => s.description === 'Toggle Snap to Grid');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Shift+G');
    });

    it('includes Toggle Smart Guides shortcut', () => {
      const shortcut = canvasCategory.shortcuts.find(s => s.description === 'Toggle Smart Guides');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('S');
    });

    it('includes Toggle Custom Guides Visibility shortcut', () => {
      const shortcut = canvasCategory.shortcuts.find(s => s.description === 'Toggle Custom Guides Visibility');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+;');
    });
  });

  describe('Selection shortcuts (2)', () => {
    let selectionCategory: typeof KEYBOARD_SHORTCUTS[0];

    beforeAll(() => {
      selectionCategory = KEYBOARD_SHORTCUTS.find(c => c.name === 'Selection')!;
    });

    it('has 2 shortcuts', () => {
      expect(selectionCategory.shortcuts).toHaveLength(2);
    });

    it('includes Select All shortcut', () => {
      const shortcut = selectionCategory.shortcuts.find(s => s.description === 'Select All');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+A');
    });

    it('includes Clear Selection / Cancel Operation shortcut', () => {
      const shortcut = selectionCategory.shortcuts.find(s => s.description.includes('Clear Selection'));
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Escape');
    });
  });

  describe('Editing shortcuts (4)', () => {
    let editingCategory: typeof KEYBOARD_SHORTCUTS[0];

    beforeAll(() => {
      editingCategory = KEYBOARD_SHORTCUTS.find(c => c.name === 'Editing')!;
    });

    it('has 4 shortcuts', () => {
      expect(editingCategory.shortcuts).toHaveLength(4);
    });

    it('includes Undo shortcut', () => {
      const shortcut = editingCategory.shortcuts.find(s => s.description === 'Undo');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+Z');
    });

    it('includes Redo shortcut', () => {
      const shortcut = editingCategory.shortcuts.find(s => s.description === 'Redo');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toContain('Ctrl+Y');
    });

    it('includes Nudge shortcut', () => {
      const shortcut = editingCategory.shortcuts.find(s => s.description.includes('Nudge') && !s.description.includes('Fast'));
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Arrow Keys');
    });

    it('includes Nudge Fast shortcut', () => {
      const shortcut = editingCategory.shortcuts.find(s => s.description.includes('Nudge Fast'));
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Shift+Arrow Keys');
    });
  });

  describe('Alignment shortcuts (6)', () => {
    let alignmentCategory: typeof KEYBOARD_SHORTCUTS[0];

    beforeAll(() => {
      alignmentCategory = KEYBOARD_SHORTCUTS.find(c => c.name === 'Alignment')!;
    });

    it('has 6 shortcuts', () => {
      expect(alignmentCategory.shortcuts).toHaveLength(6);
    });

    it('includes Align Left shortcut', () => {
      const shortcut = alignmentCategory.shortcuts.find(s => s.description === 'Align Left');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+Shift+L');
    });

    it('includes Align Center shortcut', () => {
      const shortcut = alignmentCategory.shortcuts.find(s => s.description === 'Align Center');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+Shift+C');
    });

    it('includes Align Right shortcut', () => {
      const shortcut = alignmentCategory.shortcuts.find(s => s.description === 'Align Right');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+Shift+R');
    });

    it('includes Align Top shortcut', () => {
      const shortcut = alignmentCategory.shortcuts.find(s => s.description === 'Align Top');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+Shift+T');
    });

    it('includes Align Middle shortcut', () => {
      const shortcut = alignmentCategory.shortcuts.find(s => s.description === 'Align Middle');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+Shift+M');
    });

    it('includes Align Bottom shortcut', () => {
      const shortcut = alignmentCategory.shortcuts.find(s => s.description === 'Align Bottom');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+Shift+B');
    });
  });

  describe('View Management shortcuts (3)', () => {
    let viewCategory: typeof KEYBOARD_SHORTCUTS[0];

    beforeAll(() => {
      viewCategory = KEYBOARD_SHORTCUTS.find(c => c.name === 'View Management')!;
    });

    it('has 3 shortcuts', () => {
      expect(viewCategory.shortcuts).toHaveLength(3);
    });

    it('includes Lock/Unlock Selected shortcut', () => {
      const shortcut = viewCategory.shortcuts.find(s => s.description.includes('Lock'));
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+L');
    });

    it('includes Hide/Show Selected shortcut', () => {
      const shortcut = viewCategory.shortcuts.find(s => s.description === 'Hide/Show Selected');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+H');
    });

    it('includes Show All Hidden shortcut', () => {
      const shortcut = viewCategory.shortcuts.find(s => s.description === 'Show All Hidden');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+Shift+H');
    });
  });
});

// Use beforeAll instead of describe-level setup
import { beforeAll } from 'vitest';
