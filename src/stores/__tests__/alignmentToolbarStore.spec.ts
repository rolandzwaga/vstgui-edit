import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  alignmentToolbarStore,
  dock,
  loadAlignmentToolbarState,
  resetAlignmentToolbarStore,
  STORAGE_KEY,
  saveAlignmentToolbarState,
  undock,
  updateFloatingPosition,
} from '../alignmentToolbarStore';

describe('alignmentToolbarStore', () => {
  beforeEach(() => {
    resetAlignmentToolbarStore();
    localStorage.clear();
  });

  afterEach(() => {
    resetAlignmentToolbarStore();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('starts in docked state', () => {
      testInRoot(() => {
        expect(alignmentToolbarStore.isDocked).toBe(true);
        expect(alignmentToolbarStore.floatingPosition).toBeNull();
      });
    });
  });

  describe('dock', () => {
    it('sets isDocked to true', () => {
      testInRoot(() => {
        // First undock
        undock({ x: 100, y: 200 });
        expect(alignmentToolbarStore.isDocked).toBe(false);

        // Then dock
        dock();
        expect(alignmentToolbarStore.isDocked).toBe(true);
      });
    });

    it('clears floating position', () => {
      testInRoot(() => {
        undock({ x: 100, y: 200 });
        dock();
        expect(alignmentToolbarStore.floatingPosition).toBeNull();
      });
    });
  });

  describe('undock', () => {
    it('sets isDocked to false with position', () => {
      testInRoot(() => {
        undock({ x: 150, y: 250 });
        expect(alignmentToolbarStore.isDocked).toBe(false);
        expect(alignmentToolbarStore.floatingPosition).toEqual({ x: 150, y: 250 });
      });
    });
  });

  describe('updateFloatingPosition', () => {
    it('updates position when floating', () => {
      testInRoot(() => {
        undock({ x: 100, y: 100 });
        updateFloatingPosition({ x: 200, y: 300 });
        expect(alignmentToolbarStore.floatingPosition).toEqual({ x: 200, y: 300 });
      });
    });

    it('updates position even when docked', () => {
      testInRoot(() => {
        // Even when docked, we should be able to set a position
        // (for when we undock later)
        updateFloatingPosition({ x: 400, y: 100 });
        expect(alignmentToolbarStore.floatingPosition).toEqual({ x: 400, y: 100 });
      });
    });
  });

  describe('loadAlignmentToolbarState', () => {
    it('loads docked state from localStorage', () => {
      testInRoot(() => {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ isDocked: true, floatingPosition: null })
        );

        loadAlignmentToolbarState();

        expect(alignmentToolbarStore.isDocked).toBe(true);
        expect(alignmentToolbarStore.floatingPosition).toBeNull();
      });
    });

    it('loads floating state from localStorage', () => {
      testInRoot(() => {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ isDocked: false, floatingPosition: { x: 400, y: 100 } })
        );

        loadAlignmentToolbarState();

        expect(alignmentToolbarStore.isDocked).toBe(false);
        expect(alignmentToolbarStore.floatingPosition).toEqual({ x: 400, y: 100 });
      });
    });

    it('restores floating position (400, 100) from localStorage after simulated reload', () => {
      testInRoot(() => {
        // Simulate saving state
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ isDocked: false, floatingPosition: { x: 400, y: 100 } })
        );

        // Simulate page reload by resetting and loading
        resetAlignmentToolbarStore();
        loadAlignmentToolbarState();

        expect(alignmentToolbarStore.isDocked).toBe(false);
        expect(alignmentToolbarStore.floatingPosition).toEqual({ x: 400, y: 100 });
      });
    });

    it('falls back to default state if localStorage is empty', () => {
      testInRoot(() => {
        loadAlignmentToolbarState();

        expect(alignmentToolbarStore.isDocked).toBe(true);
        expect(alignmentToolbarStore.floatingPosition).toBeNull();
      });
    });

    it('falls back to default state if localStorage has invalid JSON', () => {
      testInRoot(() => {
        localStorage.setItem(STORAGE_KEY, 'not valid json');

        loadAlignmentToolbarState();

        expect(alignmentToolbarStore.isDocked).toBe(true);
        expect(alignmentToolbarStore.floatingPosition).toBeNull();
      });
    });
  });

  describe('saveAlignmentToolbarState', () => {
    it('saves docked state to localStorage', () => {
      testInRoot(() => {
        saveAlignmentToolbarState();

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
        expect(saved.isDocked).toBe(true);
        expect(saved.floatingPosition).toBeNull();
      });
    });

    it('saves floating state to localStorage', () => {
      testInRoot(() => {
        undock({ x: 300, y: 150 });
        saveAlignmentToolbarState();

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
        expect(saved.isDocked).toBe(false);
        expect(saved.floatingPosition).toEqual({ x: 300, y: 150 });
      });
    });
  });

  describe('resetAlignmentToolbarStore', () => {
    it('resets to initial docked state', () => {
      testInRoot(() => {
        undock({ x: 500, y: 300 });
        expect(alignmentToolbarStore.isDocked).toBe(false);

        resetAlignmentToolbarStore();

        expect(alignmentToolbarStore.isDocked).toBe(true);
        expect(alignmentToolbarStore.floatingPosition).toBeNull();
      });
    });
  });
});
