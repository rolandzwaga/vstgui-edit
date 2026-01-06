import { describe, expect, it } from 'vitest';
import {
  AXIS_LOCK_THRESHOLD,
  constrainDelta,
  determineConstraintAxis,
} from '../constrainAxis';

describe('AXIS_LOCK_THRESHOLD', () => {
  it('should be 5 pixels as per FR-011', () => {
    expect(AXIS_LOCK_THRESHOLD).toBe(5);
  });
});

describe('determineConstraintAxis', () => {
  describe('Given delta below threshold', () => {
    it('should return null for small horizontal movement', () => {
      const result = determineConstraintAxis({ x: 3, y: 1 });
      expect(result).toBeNull();
    });

    it('should return null for small vertical movement', () => {
      const result = determineConstraintAxis({ x: 1, y: 4 });
      expect(result).toBeNull();
    });

    it('should return null for zero delta', () => {
      const result = determineConstraintAxis({ x: 0, y: 0 });
      expect(result).toBeNull();
    });
  });

  describe('Given horizontal-dominant movement exceeds threshold', () => {
    it('should return horizontal when x exceeds threshold and is greater than y', () => {
      const result = determineConstraintAxis({ x: 10, y: 2 });
      expect(result).toBe('horizontal');
    });

    it('should return horizontal for negative x movement', () => {
      const result = determineConstraintAxis({ x: -8, y: 3 });
      expect(result).toBe('horizontal');
    });

    it('should return horizontal at exact threshold', () => {
      const result = determineConstraintAxis({ x: 5, y: 2 });
      expect(result).toBe('horizontal');
    });
  });

  describe('Given vertical-dominant movement exceeds threshold', () => {
    it('should return vertical when y exceeds threshold and is greater than x', () => {
      const result = determineConstraintAxis({ x: 2, y: 10 });
      expect(result).toBe('vertical');
    });

    it('should return vertical for negative y movement', () => {
      const result = determineConstraintAxis({ x: 3, y: -8 });
      expect(result).toBe('vertical');
    });

    it('should return vertical at exact threshold', () => {
      const result = determineConstraintAxis({ x: 2, y: 5 });
      expect(result).toBe('vertical');
    });
  });

  describe('Given equal horizontal and vertical movement', () => {
    it('should return horizontal when both are equal and above threshold', () => {
      const result = determineConstraintAxis({ x: 10, y: 10 });
      expect(result).toBe('horizontal');
    });

    it('should return horizontal for equal negative movement', () => {
      const result = determineConstraintAxis({ x: -7, y: -7 });
      expect(result).toBe('horizontal');
    });
  });
});

describe('constrainDelta', () => {
  describe('Given null axis constraint', () => {
    it('should return delta unchanged', () => {
      const result = constrainDelta({ x: 30, y: 50 }, null);
      expect(result).toEqual({ x: 30, y: 50 });
    });

    it('should preserve negative values', () => {
      const result = constrainDelta({ x: -20, y: -40 }, null);
      expect(result).toEqual({ x: -20, y: -40 });
    });
  });

  describe('Given horizontal axis constraint', () => {
    it('should zero out y component', () => {
      const result = constrainDelta({ x: 50, y: 30 }, 'horizontal');
      expect(result).toEqual({ x: 50, y: 0 });
    });

    it('should preserve negative x', () => {
      const result = constrainDelta({ x: -25, y: 100 }, 'horizontal');
      expect(result).toEqual({ x: -25, y: 0 });
    });
  });

  describe('Given vertical axis constraint', () => {
    it('should zero out x component', () => {
      const result = constrainDelta({ x: 30, y: 50 }, 'vertical');
      expect(result).toEqual({ x: 0, y: 50 });
    });

    it('should preserve negative y', () => {
      const result = constrainDelta({ x: 100, y: -25 }, 'vertical');
      expect(result).toEqual({ x: 0, y: -25 });
    });
  });
});
