import { describe, expect, test } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  initializeViewMode,
  resetViewModeStore,
  setViewMode,
  toggleViewMode,
  viewModeStore,
} from '../viewModeStore';

describe('viewModeStore', () => {
  describe('initial state', () => {
    test('mode is "wireframe" by default', () => {
      testInRoot(() => {
        resetViewModeStore();
        expect(viewModeStore.mode).toBe('wireframe');
      });
    });
  });

  describe('setViewMode', () => {
    test('sets mode to styled', () => {
      testInRoot(() => {
        resetViewModeStore();
        setViewMode('styled');
        expect(viewModeStore.mode).toBe('styled');
      });
    });

    test('sets mode to wireframe', () => {
      testInRoot(() => {
        resetViewModeStore();
        setViewMode('styled');
        setViewMode('wireframe');
        expect(viewModeStore.mode).toBe('wireframe');
      });
    });

    test('allows setting same mode multiple times', () => {
      testInRoot(() => {
        resetViewModeStore();
        setViewMode('styled');
        setViewMode('styled');
        expect(viewModeStore.mode).toBe('styled');
      });
    });
  });

  describe('toggleViewMode', () => {
    test('toggles from wireframe to styled', () => {
      testInRoot(() => {
        resetViewModeStore();
        expect(viewModeStore.mode).toBe('wireframe');
        toggleViewMode();
        expect(viewModeStore.mode).toBe('styled');
      });
    });

    test('toggles from styled to wireframe', () => {
      testInRoot(() => {
        resetViewModeStore();
        setViewMode('styled');
        toggleViewMode();
        expect(viewModeStore.mode).toBe('wireframe');
      });
    });

    test('handles multiple toggles', () => {
      testInRoot(() => {
        resetViewModeStore();
        toggleViewMode(); // wireframe -> styled
        expect(viewModeStore.mode).toBe('styled');
        toggleViewMode(); // styled -> wireframe
        expect(viewModeStore.mode).toBe('wireframe');
        toggleViewMode(); // wireframe -> styled
        expect(viewModeStore.mode).toBe('styled');
      });
    });
  });

  describe('resetViewModeStore', () => {
    test('resets mode to wireframe', () => {
      testInRoot(() => {
        setViewMode('styled');
        resetViewModeStore();
        expect(viewModeStore.mode).toBe('wireframe');
      });
    });

    test('can be called multiple times safely', () => {
      testInRoot(() => {
        setViewMode('styled');
        resetViewModeStore();
        resetViewModeStore();
        expect(viewModeStore.mode).toBe('wireframe');
      });
    });
  });

  describe('initializeViewMode', () => {
    test('initializes mode from preferences to styled', () => {
      testInRoot(() => {
        resetViewModeStore();
        initializeViewMode('styled');
        expect(viewModeStore.mode).toBe('styled');
      });
    });

    test('initializes mode from preferences to wireframe', () => {
      testInRoot(() => {
        setViewMode('styled');
        initializeViewMode('wireframe');
        expect(viewModeStore.mode).toBe('wireframe');
      });
    });

    test('can be called after setViewMode', () => {
      testInRoot(() => {
        resetViewModeStore();
        setViewMode('styled');
        initializeViewMode('wireframe');
        expect(viewModeStore.mode).toBe('wireframe');
      });
    });
  });

  describe('reactivity', () => {
    test('store reflects latest mode after multiple operations', () => {
      testInRoot(() => {
        resetViewModeStore();
        setViewMode('styled');
        expect(viewModeStore.mode).toBe('styled');
        toggleViewMode();
        expect(viewModeStore.mode).toBe('wireframe');
        setViewMode('styled');
        expect(viewModeStore.mode).toBe('styled');
        resetViewModeStore();
        expect(viewModeStore.mode).toBe('wireframe');
      });
    });
  });
});
