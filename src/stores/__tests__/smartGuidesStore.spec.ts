import { beforeEach, describe, expect, test } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { SmartGuide } from '../../types/smartGuides';
import {
  clearActiveGuides,
  DEFAULT_GUIDES_ENABLED,
  resetSmartGuides,
  setActiveGuides,
  smartGuidesStore,
  toggleSmartGuides,
} from '../smartGuidesStore';

describe('smartGuidesStore', () => {
  beforeEach(() => {
    resetSmartGuides();
  });

  describe('initial state', () => {
    test('isEnabled defaults to true', () =>
      testInRoot(() => {
        expect(smartGuidesStore.isEnabled).toBe(true);
      }));

    test('activeGuides defaults to empty array', () =>
      testInRoot(() => {
        expect(smartGuidesStore.activeGuides).toEqual([]);
      }));

    test('DEFAULT_GUIDES_ENABLED is true', () => {
      expect(DEFAULT_GUIDES_ENABLED).toBe(true);
    });
  });

  describe('toggleSmartGuides', () => {
    test('toggles from enabled to disabled', () =>
      testInRoot(() => {
        expect(smartGuidesStore.isEnabled).toBe(true);
        toggleSmartGuides();
        expect(smartGuidesStore.isEnabled).toBe(false);
      }));

    test('toggles from disabled to enabled', () =>
      testInRoot(() => {
        toggleSmartGuides();
        expect(smartGuidesStore.isEnabled).toBe(false);
        toggleSmartGuides();
        expect(smartGuidesStore.isEnabled).toBe(true);
      }));

    test('multiple toggles work correctly', () =>
      testInRoot(() => {
        expect(smartGuidesStore.isEnabled).toBe(true);
        toggleSmartGuides();
        toggleSmartGuides();
        toggleSmartGuides();
        expect(smartGuidesStore.isEnabled).toBe(false);
      }));
  });

  describe('setActiveGuides', () => {
    const mockGuide: SmartGuide = {
      id: 'guide-1',
      orientation: 'vertical',
      position: 100,
      type: 'edge',
      participatingViewIds: ['view-1', 'view-2'],
    };

    test('sets a single guide', () =>
      testInRoot(() => {
        setActiveGuides([mockGuide]);
        expect(smartGuidesStore.activeGuides).toHaveLength(1);
        expect(smartGuidesStore.activeGuides[0]).toEqual(mockGuide);
      }));

    test('sets multiple guides', () =>
      testInRoot(() => {
        const guides: SmartGuide[] = [
          mockGuide,
          { ...mockGuide, id: 'guide-2', position: 200 },
          { ...mockGuide, id: 'guide-3', orientation: 'horizontal', position: 50 },
        ];
        setActiveGuides(guides);
        expect(smartGuidesStore.activeGuides).toHaveLength(3);
      }));

    test('replaces existing guides', () =>
      testInRoot(() => {
        setActiveGuides([mockGuide]);
        const newGuide: SmartGuide = {
          id: 'guide-new',
          orientation: 'horizontal',
          position: 300,
          type: 'center',
          participatingViewIds: ['view-3'],
        };
        setActiveGuides([newGuide]);
        expect(smartGuidesStore.activeGuides).toHaveLength(1);
        expect(smartGuidesStore.activeGuides[0].id).toBe('guide-new');
      }));

    test('accepts empty array', () =>
      testInRoot(() => {
        setActiveGuides([mockGuide]);
        setActiveGuides([]);
        expect(smartGuidesStore.activeGuides).toHaveLength(0);
      }));
  });

  describe('clearActiveGuides', () => {
    const mockGuide: SmartGuide = {
      id: 'guide-1',
      orientation: 'vertical',
      position: 100,
      type: 'edge',
      participatingViewIds: ['view-1'],
    };

    test('clears all guides when guides exist', () =>
      testInRoot(() => {
        setActiveGuides([mockGuide]);
        expect(smartGuidesStore.activeGuides).toHaveLength(1);
        clearActiveGuides();
        expect(smartGuidesStore.activeGuides).toHaveLength(0);
      }));

    test('is safe to call when no guides exist', () =>
      testInRoot(() => {
        clearActiveGuides();
        expect(smartGuidesStore.activeGuides).toHaveLength(0);
      }));
  });

  describe('resetSmartGuides', () => {
    test('resets isEnabled to default', () =>
      testInRoot(() => {
        toggleSmartGuides();
        expect(smartGuidesStore.isEnabled).toBe(false);
        resetSmartGuides();
        expect(smartGuidesStore.isEnabled).toBe(true);
      }));

    test('clears active guides', () =>
      testInRoot(() => {
        const mockGuide: SmartGuide = {
          id: 'guide-1',
          orientation: 'vertical',
          position: 100,
          type: 'edge',
          participatingViewIds: ['view-1'],
        };
        setActiveGuides([mockGuide]);
        resetSmartGuides();
        expect(smartGuidesStore.activeGuides).toHaveLength(0);
      }));

    test('resets all state to defaults', () =>
      testInRoot(() => {
        toggleSmartGuides();
        setActiveGuides([
          {
            id: 'guide-1',
            orientation: 'vertical',
            position: 100,
            type: 'edge',
            participatingViewIds: ['view-1'],
          },
        ]);
        resetSmartGuides();
        expect(smartGuidesStore.isEnabled).toBe(true);
        expect(smartGuidesStore.activeGuides).toHaveLength(0);
      }));
  });

  describe('guide types', () => {
    test('supports edge guides', () =>
      testInRoot(() => {
        const guide: SmartGuide = {
          id: 'edge-guide',
          orientation: 'vertical',
          position: 100,
          type: 'edge',
          participatingViewIds: ['view-1'],
        };
        setActiveGuides([guide]);
        expect(smartGuidesStore.activeGuides[0].type).toBe('edge');
      }));

    test('supports center guides', () =>
      testInRoot(() => {
        const guide: SmartGuide = {
          id: 'center-guide',
          orientation: 'horizontal',
          position: 150,
          type: 'center',
          participatingViewIds: ['view-1'],
        };
        setActiveGuides([guide]);
        expect(smartGuidesStore.activeGuides[0].type).toBe('center');
      }));

    test('supports parent-center guides', () =>
      testInRoot(() => {
        const guide: SmartGuide = {
          id: 'parent-center-guide',
          orientation: 'vertical',
          position: 200,
          type: 'parent-center',
          participatingViewIds: ['view-1', 'parent-1'],
        };
        setActiveGuides([guide]);
        expect(smartGuidesStore.activeGuides[0].type).toBe('parent-center');
      }));

    test('supports spacing guides', () =>
      testInRoot(() => {
        const guide: SmartGuide = {
          id: 'spacing-guide',
          orientation: 'horizontal',
          position: 100,
          type: 'spacing',
          participatingViewIds: ['view-1', 'view-2', 'view-3'],
        };
        setActiveGuides([guide]);
        expect(smartGuidesStore.activeGuides[0].type).toBe('spacing');
      }));
  });
});
