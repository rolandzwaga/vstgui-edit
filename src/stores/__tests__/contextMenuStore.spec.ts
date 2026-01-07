import { beforeEach, describe, expect, test } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  contextMenuStore,
  hideContextMenu,
  resetContextMenu,
  showContextMenu,
} from '../contextMenuStore';

describe('contextMenuStore', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetContextMenu();
    });
  });

  describe('initial state', () => {
    test('isOpen is false by default', () => {
      testInRoot(() => {
        resetContextMenu();
        expect(contextMenuStore.isOpen).toBe(false);
      });
    });

    test('position is { x: 0, y: 0 } by default', () => {
      testInRoot(() => {
        resetContextMenu();
        expect(contextMenuStore.position).toEqual({ x: 0, y: 0 });
      });
    });
  });

  describe('showContextMenu', () => {
    test('sets isOpen to true', () => {
      testInRoot(() => {
        resetContextMenu();
        showContextMenu(100, 200);
        expect(contextMenuStore.isOpen).toBe(true);
      });
    });

    test('sets position to provided coordinates', () => {
      testInRoot(() => {
        resetContextMenu();
        showContextMenu(150, 250);
        expect(contextMenuStore.position).toEqual({ x: 150, y: 250 });
      });
    });

    test('updates position when called multiple times', () => {
      testInRoot(() => {
        resetContextMenu();
        showContextMenu(100, 100);
        showContextMenu(200, 300);
        expect(contextMenuStore.position).toEqual({ x: 200, y: 300 });
      });
    });
  });

  describe('hideContextMenu', () => {
    test('sets isOpen to false', () => {
      testInRoot(() => {
        resetContextMenu();
        showContextMenu(100, 200);
        expect(contextMenuStore.isOpen).toBe(true);
        hideContextMenu();
        expect(contextMenuStore.isOpen).toBe(false);
      });
    });

    test('preserves position when hiding', () => {
      testInRoot(() => {
        resetContextMenu();
        showContextMenu(100, 200);
        hideContextMenu();
        expect(contextMenuStore.position).toEqual({ x: 100, y: 200 });
      });
    });

    test('can be called when already hidden', () => {
      testInRoot(() => {
        resetContextMenu();
        hideContextMenu();
        expect(contextMenuStore.isOpen).toBe(false);
      });
    });
  });

  describe('resetContextMenu', () => {
    test('resets isOpen to false', () => {
      testInRoot(() => {
        showContextMenu(100, 200);
        resetContextMenu();
        expect(contextMenuStore.isOpen).toBe(false);
      });
    });

    test('resets position to { x: 0, y: 0 }', () => {
      testInRoot(() => {
        showContextMenu(100, 200);
        resetContextMenu();
        expect(contextMenuStore.position).toEqual({ x: 0, y: 0 });
      });
    });

    test('can be called multiple times safely', () => {
      testInRoot(() => {
        showContextMenu(100, 200);
        resetContextMenu();
        resetContextMenu();
        resetContextMenu();
        expect(contextMenuStore.isOpen).toBe(false);
        expect(contextMenuStore.position).toEqual({ x: 0, y: 0 });
      });
    });
  });

  describe('combined operations', () => {
    test('show then hide then show works correctly', () => {
      testInRoot(() => {
        resetContextMenu();

        showContextMenu(50, 50);
        expect(contextMenuStore.isOpen).toBe(true);
        expect(contextMenuStore.position).toEqual({ x: 50, y: 50 });

        hideContextMenu();
        expect(contextMenuStore.isOpen).toBe(false);
        expect(contextMenuStore.position).toEqual({ x: 50, y: 50 });

        showContextMenu(100, 100);
        expect(contextMenuStore.isOpen).toBe(true);
        expect(contextMenuStore.position).toEqual({ x: 100, y: 100 });
      });
    });
  });
});
