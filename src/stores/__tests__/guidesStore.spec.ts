/**
 * Tests for guidesStore
 */
import { describe, expect, test, beforeEach, vi } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  guidesStore,
  addGuide,
  deleteGuide,
  repositionGuide,
  clearAllGuides,
  addGuideWithHistory,
  deleteGuideWithHistory,
  repositionGuideWithHistory,
  clearAllGuidesWithHistory,
  toggleGuidesVisibility,
  setGuidesVisibility,
  toggleGuidesSnap,
  setGuidesSnap,
  startCreationDrag,
  updateCreationDrag,
  completeCreationDrag,
  cancelCreationDrag,
  startRepositionDrag,
  updateRepositionDrag,
  completeRepositionDrag,
  cancelRepositionDrag,
  resetGuidesStore,
} from '../guidesStore';
import { historyStore, clearHistory, undo } from '../historyStore';

describe('guidesStore', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetGuidesStore();
      clearHistory();
    });
  });

  describe('initial state', () => {
    test('guides is empty by default', () => {
      testInRoot(() => {
        resetGuidesStore();
        expect(guidesStore.guides).toHaveLength(0);
      });
    });

    test('isVisible is true by default', () => {
      testInRoot(() => {
        resetGuidesStore();
        expect(guidesStore.isVisible).toBe(true);
      });
    });

    test('isSnapEnabled is true by default', () => {
      testInRoot(() => {
        resetGuidesStore();
        expect(guidesStore.isSnapEnabled).toBe(true);
      });
    });

    test('creationDrag is null by default', () => {
      testInRoot(() => {
        resetGuidesStore();
        expect(guidesStore.creationDrag).toBeNull();
      });
    });

    test('repositionDrag is null by default', () => {
      testInRoot(() => {
        resetGuidesStore();
        expect(guidesStore.repositionDrag).toBeNull();
      });
    });
  });

  describe('CRUD actions', () => {
    describe('addGuide', () => {
      test('adds a horizontal guide', () => {
        testInRoot(() => {
          resetGuidesStore();
          const guide = addGuide('horizontal', 100);
          expect(guide).not.toBeNull();
          expect(guide?.orientation).toBe('horizontal');
          expect(guide?.position).toBe(100);
          expect(guidesStore.guides).toHaveLength(1);
        });
      });

      test('adds a vertical guide', () => {
        testInRoot(() => {
          resetGuidesStore();
          const guide = addGuide('vertical', 200);
          expect(guide).not.toBeNull();
          expect(guide?.orientation).toBe('vertical');
          expect(guide?.position).toBe(200);
        });
      });

      test('returns null for duplicate position+orientation', () => {
        testInRoot(() => {
          resetGuidesStore();
          addGuide('horizontal', 100);
          const dup = addGuide('horizontal', 100);
          expect(dup).toBeNull();
          expect(guidesStore.guides).toHaveLength(1);
        });
      });

      test('allows same position with different orientation', () => {
        testInRoot(() => {
          resetGuidesStore();
          addGuide('horizontal', 100);
          const vertical = addGuide('vertical', 100);
          expect(vertical).not.toBeNull();
          expect(guidesStore.guides).toHaveLength(2);
        });
      });
    });

    describe('deleteGuide', () => {
      test('deletes guide by ID', () => {
        testInRoot(() => {
          resetGuidesStore();
          const guide = addGuide('horizontal', 100);
          expect(guidesStore.guides).toHaveLength(1);
          const deleted = deleteGuide(guide!.id);
          expect(deleted).toEqual(guide);
          expect(guidesStore.guides).toHaveLength(0);
        });
      });

      test('returns null if guide not found', () => {
        testInRoot(() => {
          resetGuidesStore();
          const deleted = deleteGuide('nonexistent');
          expect(deleted).toBeNull();
        });
      });
    });

    describe('repositionGuide', () => {
      test('repositions guide to new position', () => {
        testInRoot(() => {
          resetGuidesStore();
          const guide = addGuide('horizontal', 100);
          const success = repositionGuide(guide!.id, 150);
          expect(success).toBe(true);
          expect(guidesStore.guides[0].position).toBe(150);
        });
      });

      test('returns false if guide not found', () => {
        testInRoot(() => {
          resetGuidesStore();
          const success = repositionGuide('nonexistent', 150);
          expect(success).toBe(false);
        });
      });

      test('returns false if position unchanged', () => {
        testInRoot(() => {
          resetGuidesStore();
          const guide = addGuide('horizontal', 100);
          const success = repositionGuide(guide!.id, 100);
          expect(success).toBe(false);
        });
      });
    });

    describe('clearAllGuides', () => {
      test('removes all guides', () => {
        testInRoot(() => {
          resetGuidesStore();
          addGuide('horizontal', 100);
          addGuide('vertical', 200);
          addGuide('horizontal', 300);
          expect(guidesStore.guides).toHaveLength(3);
          const cleared = clearAllGuides();
          expect(cleared).toHaveLength(3);
          expect(guidesStore.guides).toHaveLength(0);
        });
      });

      test('returns empty array when no guides', () => {
        testInRoot(() => {
          resetGuidesStore();
          const cleared = clearAllGuides();
          expect(cleared).toHaveLength(0);
        });
      });
    });

    describe('getGuideById', () => {
      test('returns guide by ID', () => {
        testInRoot(() => {
          resetGuidesStore();
          const guide = addGuide('horizontal', 100);
          const found = guidesStore.getGuideById(guide!.id);
          expect(found).toEqual(guide);
        });
      });

      test('returns undefined if not found', () => {
        testInRoot(() => {
          resetGuidesStore();
          const found = guidesStore.getGuideById('nonexistent');
          expect(found).toBeUndefined();
        });
      });
    });
  });

  describe('history-enabled CRUD', () => {
    describe('addGuideWithHistory', () => {
      test('adds guide and pushes to history', () => {
        testInRoot(() => {
          resetGuidesStore();
          clearHistory();
          const guide = addGuideWithHistory('horizontal', 100);
          expect(guide).not.toBeNull();
          expect(historyStore.canUndo).toBe(true);
          expect(historyStore.undoDescription).toContain('horizontal');
        });
      });
    });

    describe('deleteGuideWithHistory', () => {
      test('deletes guide and pushes to history', () => {
        testInRoot(() => {
          resetGuidesStore();
          clearHistory();
          const guide = addGuide('horizontal', 100);
          const success = deleteGuideWithHistory(guide!.id);
          expect(success).toBe(true);
          expect(guidesStore.guides).toHaveLength(0);
          expect(historyStore.canUndo).toBe(true);
        });
      });

      test('returns false if guide not found', () => {
        testInRoot(() => {
          resetGuidesStore();
          clearHistory();
          const success = deleteGuideWithHistory('nonexistent');
          expect(success).toBe(false);
          expect(historyStore.canUndo).toBe(false);
        });
      });
    });

    describe('repositionGuideWithHistory', () => {
      test('repositions and pushes to history', () => {
        testInRoot(() => {
          resetGuidesStore();
          clearHistory();
          const guide = addGuide('horizontal', 100);
          const success = repositionGuideWithHistory(guide!.id, 150);
          expect(success).toBe(true);
          expect(guidesStore.guides[0].position).toBe(150);
          expect(historyStore.canUndo).toBe(true);
        });
      });
    });

    describe('clearAllGuidesWithHistory', () => {
      test('clears all and pushes to history', () => {
        testInRoot(() => {
          resetGuidesStore();
          clearHistory();
          addGuide('horizontal', 100);
          addGuide('vertical', 200);
          clearAllGuidesWithHistory();
          expect(guidesStore.guides).toHaveLength(0);
          expect(historyStore.canUndo).toBe(true);
        });
      });

      test('does not push to history when no guides', () => {
        testInRoot(() => {
          resetGuidesStore();
          clearHistory();
          clearAllGuidesWithHistory();
          expect(historyStore.canUndo).toBe(false);
        });
      });

      test('undo restores all cleared guides (FR-022)', () => {
        testInRoot(() => {
          resetGuidesStore();
          clearHistory();

          // Add multiple guides
          addGuide('horizontal', 100);
          addGuide('vertical', 200);
          addGuide('horizontal', 300);
          expect(guidesStore.guides).toHaveLength(3);

          // Clear all guides
          clearAllGuidesWithHistory();
          expect(guidesStore.guides).toHaveLength(0);

          // Undo should restore all guides
          undo();
          expect(guidesStore.guides).toHaveLength(3);

          // Verify guide data is restored correctly
          const positions = guidesStore.guides.map(g => g.position).sort((a, b) => a - b);
          expect(positions).toEqual([100, 200, 300]);
        });
      });

      test('ready for new guides after clearing', () => {
        testInRoot(() => {
          resetGuidesStore();
          clearHistory();

          // Add and clear guides
          addGuide('horizontal', 100);
          clearAllGuidesWithHistory();
          expect(guidesStore.guides).toHaveLength(0);

          // Should be able to add new guides
          addGuide('vertical', 250);
          expect(guidesStore.guides).toHaveLength(1);
          expect(guidesStore.guides[0].orientation).toBe('vertical');
          expect(guidesStore.guides[0].position).toBe(250);
        });
      });
    });
  });

  describe('visibility and snap toggles', () => {
    describe('toggleGuidesVisibility', () => {
      test('toggles isVisible from true to false', () => {
        testInRoot(() => {
          resetGuidesStore();
          expect(guidesStore.isVisible).toBe(true);
          toggleGuidesVisibility();
          expect(guidesStore.isVisible).toBe(false);
        });
      });

      test('toggles isVisible from false to true', () => {
        testInRoot(() => {
          resetGuidesStore();
          toggleGuidesVisibility();
          toggleGuidesVisibility();
          expect(guidesStore.isVisible).toBe(true);
        });
      });
    });

    describe('setGuidesVisibility', () => {
      test('sets isVisible explicitly', () => {
        testInRoot(() => {
          resetGuidesStore();
          setGuidesVisibility(false);
          expect(guidesStore.isVisible).toBe(false);
          setGuidesVisibility(true);
          expect(guidesStore.isVisible).toBe(true);
        });
      });
    });

    describe('toggleGuidesSnap', () => {
      test('toggles isSnapEnabled', () => {
        testInRoot(() => {
          resetGuidesStore();
          expect(guidesStore.isSnapEnabled).toBe(true);
          toggleGuidesSnap();
          expect(guidesStore.isSnapEnabled).toBe(false);
        });
      });
    });

    describe('setGuidesSnap', () => {
      test('sets isSnapEnabled explicitly', () => {
        testInRoot(() => {
          resetGuidesStore();
          setGuidesSnap(false);
          expect(guidesStore.isSnapEnabled).toBe(false);
          setGuidesSnap(true);
          expect(guidesStore.isSnapEnabled).toBe(true);
        });
      });
    });

    describe('isSnapEnabled returns false when hidden', () => {
      test('isSnapEnabled is false when guides hidden', () => {
        testInRoot(() => {
          resetGuidesStore();
          setGuidesSnap(true);
          setGuidesVisibility(false);
          // isSnapEnabled should be false because guides are hidden
          expect(guidesStore.isSnapEnabled).toBe(false);
        });
      });
    });
  });

  describe('creation drag lifecycle', () => {
    describe('startCreationDrag', () => {
      test('starts creation drag with orientation and position', () => {
        testInRoot(() => {
          resetGuidesStore();
          startCreationDrag('horizontal', 50);
          expect(guidesStore.creationDrag).not.toBeNull();
          expect(guidesStore.creationDrag?.orientation).toBe('horizontal');
          expect(guidesStore.creationDrag?.currentPosition).toBe(50);
          expect(guidesStore.creationDrag?.isOverCanvas).toBe(false);
        });
      });
    });

    describe('updateCreationDrag', () => {
      test('updates position and isOverCanvas', () => {
        testInRoot(() => {
          resetGuidesStore();
          startCreationDrag('horizontal', 50);
          updateCreationDrag(100, true);
          expect(guidesStore.creationDrag?.currentPosition).toBe(100);
          expect(guidesStore.creationDrag?.isOverCanvas).toBe(true);
        });
      });

      test('does nothing if no active drag', () => {
        testInRoot(() => {
          resetGuidesStore();
          updateCreationDrag(100, true);
          expect(guidesStore.creationDrag).toBeNull();
        });
      });
    });

    describe('completeCreationDrag', () => {
      test('creates guide when over canvas', () => {
        testInRoot(() => {
          resetGuidesStore();
          startCreationDrag('horizontal', 50);
          updateCreationDrag(100, true);
          const guide = completeCreationDrag();
          expect(guide).not.toBeNull();
          expect(guide?.position).toBe(100);
          expect(guidesStore.guides).toHaveLength(1);
          expect(guidesStore.creationDrag).toBeNull();
        });
      });

      test('does not create guide when not over canvas', () => {
        testInRoot(() => {
          resetGuidesStore();
          startCreationDrag('horizontal', 50);
          updateCreationDrag(100, false);
          const guide = completeCreationDrag();
          expect(guide).toBeNull();
          expect(guidesStore.guides).toHaveLength(0);
          expect(guidesStore.creationDrag).toBeNull();
        });
      });

      test('returns null if no active drag', () => {
        testInRoot(() => {
          resetGuidesStore();
          const guide = completeCreationDrag();
          expect(guide).toBeNull();
        });
      });
    });

    describe('cancelCreationDrag', () => {
      test('cancels creation drag without creating guide', () => {
        testInRoot(() => {
          resetGuidesStore();
          startCreationDrag('horizontal', 50);
          updateCreationDrag(100, true);
          cancelCreationDrag();
          expect(guidesStore.creationDrag).toBeNull();
          expect(guidesStore.guides).toHaveLength(0);
        });
      });
    });
  });

  describe('reposition drag lifecycle', () => {
    describe('startRepositionDrag', () => {
      test('starts reposition drag for existing guide', () => {
        testInRoot(() => {
          resetGuidesStore();
          const guide = addGuide('horizontal', 100);
          startRepositionDrag(guide!.id, 100);
          expect(guidesStore.repositionDrag).not.toBeNull();
          expect(guidesStore.repositionDrag?.guideId).toBe(guide!.id);
          expect(guidesStore.repositionDrag?.originalPosition).toBe(100);
          expect(guidesStore.repositionDrag?.currentPosition).toBe(100);
          expect(guidesStore.repositionDrag?.isOverRuler).toBe(false);
        });
      });
    });

    describe('updateRepositionDrag', () => {
      test('updates position and isOverRuler', () => {
        testInRoot(() => {
          resetGuidesStore();
          const guide = addGuide('horizontal', 100);
          startRepositionDrag(guide!.id, 100);
          updateRepositionDrag(150, false);
          expect(guidesStore.repositionDrag?.currentPosition).toBe(150);
          expect(guidesStore.repositionDrag?.isOverRuler).toBe(false);
        });
      });
    });

    describe('completeRepositionDrag', () => {
      test('repositions guide when not over ruler', () => {
        testInRoot(() => {
          resetGuidesStore();
          const guide = addGuide('horizontal', 100);
          startRepositionDrag(guide!.id, 100);
          updateRepositionDrag(150, false);
          const result = completeRepositionDrag();
          expect(result).toBe('repositioned');
          expect(guidesStore.guides[0].position).toBe(150);
          expect(guidesStore.repositionDrag).toBeNull();
        });
      });

      test('deletes guide when over ruler', () => {
        testInRoot(() => {
          resetGuidesStore();
          const guide = addGuide('horizontal', 100);
          startRepositionDrag(guide!.id, 100);
          updateRepositionDrag(50, true);
          const result = completeRepositionDrag();
          expect(result).toBe('deleted');
          expect(guidesStore.guides).toHaveLength(0);
          expect(guidesStore.repositionDrag).toBeNull();
        });
      });

      test('returns cancelled if no active drag', () => {
        testInRoot(() => {
          resetGuidesStore();
          const result = completeRepositionDrag();
          expect(result).toBe('cancelled');
        });
      });
    });

    describe('cancelRepositionDrag', () => {
      test('restores original position on cancel', () => {
        testInRoot(() => {
          resetGuidesStore();
          const guide = addGuide('horizontal', 100);
          startRepositionDrag(guide!.id, 100);
          updateRepositionDrag(150, false);
          // Position is updated during drag
          repositionGuide(guide!.id, 150);
          cancelRepositionDrag();
          expect(guidesStore.repositionDrag).toBeNull();
          expect(guidesStore.guides[0].position).toBe(100);
        });
      });
    });
  });

  describe('convenience accessors', () => {
    describe('horizontalGuides', () => {
      test('filters to horizontal guides only', () => {
        testInRoot(() => {
          resetGuidesStore();
          addGuide('horizontal', 100);
          addGuide('vertical', 200);
          addGuide('horizontal', 300);
          expect(guidesStore.horizontalGuides).toHaveLength(2);
          expect(guidesStore.horizontalGuides.every((g) => g.orientation === 'horizontal')).toBe(
            true
          );
        });
      });
    });

    describe('verticalGuides', () => {
      test('filters to vertical guides only', () => {
        testInRoot(() => {
          resetGuidesStore();
          addGuide('horizontal', 100);
          addGuide('vertical', 200);
          addGuide('vertical', 300);
          expect(guidesStore.verticalGuides).toHaveLength(2);
          expect(guidesStore.verticalGuides.every((g) => g.orientation === 'vertical')).toBe(true);
        });
      });
    });
  });

  describe('resetGuidesStore', () => {
    test('clears all state', () => {
      testInRoot(() => {
        addGuide('horizontal', 100);
        addGuide('vertical', 200);
        setGuidesVisibility(false);
        setGuidesSnap(false);
        startCreationDrag('horizontal', 50);

        resetGuidesStore();

        expect(guidesStore.guides).toHaveLength(0);
        expect(guidesStore.isVisible).toBe(true);
        expect(guidesStore.isSnapEnabled).toBe(true);
        expect(guidesStore.creationDrag).toBeNull();
        expect(guidesStore.repositionDrag).toBeNull();
      });
    });
  });
});
