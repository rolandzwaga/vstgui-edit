/**
 * Tests for guideOperations domain functions
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { CustomGuide } from '../../../types/guides';
import {
  addGuideToCollection,
  canAddGuide,
  createGuide,
  findGuideByPosition,
  generateGuideId,
  getHorizontalGuides,
  getVerticalGuides,
  guideExistsAtPosition,
  MAX_GUIDES,
  removeGuideFromCollection,
  roundGuidePosition,
  sortGuidesByPosition,
  updateGuidePosition,
} from '../guideOperations';

describe('guideOperations', () => {
  describe('generateGuideId', () => {
    test('generates unique IDs', () => {
      const id1 = generateGuideId();
      const id2 = generateGuideId();
      expect(id1).not.toBe(id2);
    });

    test('ID has expected format guide-{timestamp}-{random}', () => {
      const id = generateGuideId();
      expect(id).toMatch(/^guide-\d+-[a-z0-9]+$/);
    });
  });

  describe('createGuide', () => {
    test('creates guide with generated ID', () => {
      const guide = createGuide('horizontal', 100);
      expect(guide.id).toMatch(/^guide-\d+-[a-z0-9]+$/);
    });

    test('creates guide with correct orientation', () => {
      const horizontal = createGuide('horizontal', 100);
      const vertical = createGuide('vertical', 200);
      expect(horizontal.orientation).toBe('horizontal');
      expect(vertical.orientation).toBe('vertical');
    });

    test('creates guide with correct position', () => {
      const guide = createGuide('horizontal', 150);
      expect(guide.position).toBe(150);
    });

    test('rounds position to integer', () => {
      const guide = createGuide('vertical', 100.7);
      expect(guide.position).toBe(101);
    });
  });

  describe('guideExistsAtPosition', () => {
    const guides: CustomGuide[] = [
      { id: 'g1', orientation: 'horizontal', position: 100 },
      { id: 'g2', orientation: 'vertical', position: 200 },
    ];

    test('returns true when guide exists at exact position', () => {
      expect(guideExistsAtPosition(guides, 'horizontal', 100)).toBe(true);
    });

    test('returns false when no guide at position', () => {
      expect(guideExistsAtPosition(guides, 'horizontal', 101)).toBe(false);
    });

    test('returns false when different orientation at position', () => {
      expect(guideExistsAtPosition(guides, 'vertical', 100)).toBe(false);
    });

    test('returns false for empty guides array', () => {
      expect(guideExistsAtPosition([], 'horizontal', 100)).toBe(false);
    });
  });

  describe('findGuideByPosition', () => {
    const guides: CustomGuide[] = [
      { id: 'g1', orientation: 'horizontal', position: 100 },
      { id: 'g2', orientation: 'vertical', position: 200 },
    ];

    test('returns guide when found at exact position', () => {
      const guide = findGuideByPosition(guides, 'horizontal', 100);
      expect(guide).toEqual({ id: 'g1', orientation: 'horizontal', position: 100 });
    });

    test('returns undefined when no guide at position', () => {
      const guide = findGuideByPosition(guides, 'horizontal', 101);
      expect(guide).toBeUndefined();
    });

    test('returns undefined when different orientation at position', () => {
      const guide = findGuideByPosition(guides, 'vertical', 100);
      expect(guide).toBeUndefined();
    });
  });

  describe('addGuideToCollection', () => {
    test('adds new guide to collection', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
      ];
      const [newGuides, created] = addGuideToCollection(guides, 'vertical', 200);

      expect(newGuides).toHaveLength(2);
      expect(created).not.toBeNull();
      expect(created?.orientation).toBe('vertical');
      expect(created?.position).toBe(200);
    });

    test('returns null for duplicate position+orientation', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
      ];
      const [newGuides, created] = addGuideToCollection(guides, 'horizontal', 100);

      expect(newGuides).toBe(guides);
      expect(created).toBeNull();
    });

    test('allows same position with different orientation', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
      ];
      const [newGuides, created] = addGuideToCollection(guides, 'vertical', 100);

      expect(newGuides).toHaveLength(2);
      expect(created).not.toBeNull();
    });

    test('adds to empty collection', () => {
      const [newGuides, created] = addGuideToCollection([], 'horizontal', 50);

      expect(newGuides).toHaveLength(1);
      expect(created?.position).toBe(50);
    });
  });

  describe('removeGuideFromCollection', () => {
    test('removes guide by ID', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
        { id: 'g2', orientation: 'vertical', position: 200 },
      ];
      const [newGuides, removed] = removeGuideFromCollection(guides, 'g1');

      expect(newGuides).toHaveLength(1);
      expect(newGuides[0].id).toBe('g2');
      expect(removed).toEqual({ id: 'g1', orientation: 'horizontal', position: 100 });
    });

    test('returns null if guide not found', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
      ];
      const [newGuides, removed] = removeGuideFromCollection(guides, 'nonexistent');

      expect(newGuides).toBe(guides);
      expect(removed).toBeNull();
    });

    test('handles empty collection', () => {
      const [newGuides, removed] = removeGuideFromCollection([], 'g1');

      expect(newGuides).toHaveLength(0);
      expect(removed).toBeNull();
    });
  });

  describe('updateGuidePosition', () => {
    test('updates position successfully', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
      ];
      const [newGuides, success] = updateGuidePosition(guides, 'g1', 150);

      expect(success).toBe(true);
      expect(newGuides[0].position).toBe(150);
    });

    test('returns false if guide not found', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
      ];
      const [newGuides, success] = updateGuidePosition(guides, 'nonexistent', 150);

      expect(success).toBe(false);
      expect(newGuides).toBe(guides);
    });

    test('returns false if position unchanged', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
      ];
      const [newGuides, success] = updateGuidePosition(guides, 'g1', 100);

      expect(success).toBe(false);
      expect(newGuides).toBe(guides);
    });

    test('rounds position to integer', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
      ];
      const [newGuides, success] = updateGuidePosition(guides, 'g1', 150.7);

      expect(success).toBe(true);
      expect(newGuides[0].position).toBe(151);
    });
  });

  describe('canAddGuide', () => {
    test('returns valid:true for new guide', () => {
      const guides: CustomGuide[] = [];
      const result = canAddGuide(guides, 'horizontal', 100);

      expect(result).toEqual({ valid: true, reason: 'ok' });
    });

    test('returns duplicate reason for existing position+orientation', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
      ];
      const result = canAddGuide(guides, 'horizontal', 100);

      expect(result).toEqual({ valid: false, reason: 'duplicate' });
    });

    test('returns max-guides-exceeded when at limit', () => {
      const guides: CustomGuide[] = Array.from({ length: MAX_GUIDES }, (_, i) => ({
        id: `g${i}`,
        orientation: 'horizontal' as const,
        position: i,
      }));
      const result = canAddGuide(guides, 'vertical', 999);

      expect(result).toEqual({ valid: false, reason: 'max-guides-exceeded' });
    });
  });

  describe('roundGuidePosition', () => {
    test('rounds down for values < 0.5', () => {
      expect(roundGuidePosition(100.4)).toBe(100);
    });

    test('rounds up for values >= 0.5', () => {
      expect(roundGuidePosition(100.5)).toBe(101);
    });

    test('handles negative values', () => {
      expect(roundGuidePosition(-50.7)).toBe(-51);
    });

    test('handles integers unchanged', () => {
      expect(roundGuidePosition(100)).toBe(100);
    });
  });

  describe('getHorizontalGuides', () => {
    test('filters to horizontal guides only', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
        { id: 'g2', orientation: 'vertical', position: 200 },
        { id: 'g3', orientation: 'horizontal', position: 150 },
      ];
      const result = getHorizontalGuides(guides);

      expect(result).toHaveLength(2);
      expect(result.every((g) => g.orientation === 'horizontal')).toBe(true);
    });

    test('returns empty array when no horizontal guides', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'vertical', position: 100 },
      ];
      const result = getHorizontalGuides(guides);

      expect(result).toHaveLength(0);
    });
  });

  describe('getVerticalGuides', () => {
    test('filters to vertical guides only', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
        { id: 'g2', orientation: 'vertical', position: 200 },
        { id: 'g3', orientation: 'vertical', position: 250 },
      ];
      const result = getVerticalGuides(guides);

      expect(result).toHaveLength(2);
      expect(result.every((g) => g.orientation === 'vertical')).toBe(true);
    });

    test('returns empty array when no vertical guides', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 100 },
      ];
      const result = getVerticalGuides(guides);

      expect(result).toHaveLength(0);
    });
  });

  describe('sortGuidesByPosition', () => {
    test('sorts guides by position ascending', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 300 },
        { id: 'g2', orientation: 'vertical', position: 100 },
        { id: 'g3', orientation: 'horizontal', position: 200 },
      ];
      const result = sortGuidesByPosition(guides);

      expect(result.map((g) => g.position)).toEqual([100, 200, 300]);
    });

    test('does not mutate original array', () => {
      const guides: CustomGuide[] = [
        { id: 'g1', orientation: 'horizontal', position: 200 },
        { id: 'g2', orientation: 'vertical', position: 100 },
      ];
      const result = sortGuidesByPosition(guides);

      expect(result).not.toBe(guides);
      expect(guides[0].position).toBe(200);
    });

    test('handles empty array', () => {
      const result = sortGuidesByPosition([]);
      expect(result).toEqual([]);
    });
  });
});
