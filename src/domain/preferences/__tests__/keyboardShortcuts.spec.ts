/**
 * Tests for keyboard shortcuts data (deprecated module)
 *
 * This module is deprecated. See domain/shortcuts/__tests__ for the main tests.
 * These tests verify backward compatibility of the re-exported KEYBOARD_SHORTCUTS.
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { KEYBOARD_SHORTCUTS } from '../keyboardShortcuts';

describe('KEYBOARD_SHORTCUTS (deprecated)', () => {
  describe('structure', () => {
    it('exports an array of categories', () => {
      expect(Array.isArray(KEYBOARD_SHORTCUTS)).toBe(true);
    });

    it('has 10 categories (from new registry)', () => {
      expect(KEYBOARD_SHORTCUTS).toHaveLength(10);
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

  describe('categories (all 10 from new registry)', () => {
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

    it('includes Clipboard category', () => {
      const category = KEYBOARD_SHORTCUTS.find(c => c.name === 'Clipboard');
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

    it('includes Grouping category', () => {
      const category = KEYBOARD_SHORTCUTS.find(c => c.name === 'Grouping');
      expect(category).toBeDefined();
    });

    it('includes Find/Replace category', () => {
      const category = KEYBOARD_SHORTCUTS.find(c => c.name === 'Find/Replace');
      expect(category).toBeDefined();
    });

    it('includes File category', () => {
      const category = KEYBOARD_SHORTCUTS.find(c => c.name === 'File');
      expect(category).toBeDefined();
    });

    it('includes General category', () => {
      const category = KEYBOARD_SHORTCUTS.find(c => c.name === 'General');
      expect(category).toBeDefined();
    });
  });

  describe('total shortcuts count', () => {
    it('has 44 shortcuts across all categories', () => {
      const totalShortcuts = KEYBOARD_SHORTCUTS.reduce(
        (sum, category) => sum + category.shortcuts.length,
        0
      );
      expect(totalShortcuts).toBe(44);
    });
  });

  describe('Canvas Navigation shortcuts (10)', () => {
    let canvasCategory: (typeof KEYBOARD_SHORTCUTS)[0];

    beforeAll(() => {
      canvasCategory = KEYBOARD_SHORTCUTS.find(c => c.name === 'Canvas Navigation')!;
    });

    it('has 10 shortcuts', () => {
      expect(canvasCategory.shortcuts).toHaveLength(10);
    });

    it('includes Zoom In shortcut', () => {
      const shortcut = canvasCategory.shortcuts.find(s => s.description === 'Zoom In');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toContain('+');
    });

    it('includes Toggle Grid Visibility shortcut', () => {
      const shortcut = canvasCategory.shortcuts.find(
        s => s.description === 'Toggle Grid Visibility'
      );
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('G');
    });
  });

  describe('Selection shortcuts (3)', () => {
    let selectionCategory: (typeof KEYBOARD_SHORTCUTS)[0];

    beforeAll(() => {
      selectionCategory = KEYBOARD_SHORTCUTS.find(c => c.name === 'Selection')!;
    });

    it('has 3 shortcuts', () => {
      expect(selectionCategory.shortcuts).toHaveLength(3);
    });

    it('includes Select All shortcut', () => {
      const shortcut = selectionCategory.shortcuts.find(s => s.description === 'Select All');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+A');
    });
  });

  describe('Editing shortcuts (6)', () => {
    let editingCategory: (typeof KEYBOARD_SHORTCUTS)[0];

    beforeAll(() => {
      editingCategory = KEYBOARD_SHORTCUTS.find(c => c.name === 'Editing')!;
    });

    it('has 6 shortcuts', () => {
      expect(editingCategory.shortcuts).toHaveLength(6);
    });

    it('includes Undo shortcut', () => {
      const shortcut = editingCategory.shortcuts.find(s => s.description === 'Undo');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+Z');
    });

    it('includes Redo shortcut', () => {
      const shortcut = editingCategory.shortcuts.find(s => s.description === 'Redo');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+Y');
    });

    it('includes Nudge shortcut', () => {
      const shortcut = editingCategory.shortcuts.find(s => s.description === 'Nudge 1px');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Arrow Keys');
    });

    it('includes Nudge Fast shortcut', () => {
      const shortcut = editingCategory.shortcuts.find(s => s.description === 'Nudge 10px');
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Shift+Arrow Keys');
    });
  });

  describe('Alignment shortcuts (6)', () => {
    let alignmentCategory: (typeof KEYBOARD_SHORTCUTS)[0];

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
  });

  describe('View Management shortcuts (5)', () => {
    let viewCategory: (typeof KEYBOARD_SHORTCUTS)[0];

    beforeAll(() => {
      viewCategory = KEYBOARD_SHORTCUTS.find(c => c.name === 'View Management')!;
    });

    it('has 5 shortcuts', () => {
      expect(viewCategory.shortcuts).toHaveLength(5);
    });

    it('includes Lock/Unlock Selected shortcut', () => {
      const shortcut = viewCategory.shortcuts.find(s => s.description.includes('Lock'));
      expect(shortcut).toBeDefined();
      expect(shortcut?.keys).toBe('Ctrl+L');
    });
  });
});
