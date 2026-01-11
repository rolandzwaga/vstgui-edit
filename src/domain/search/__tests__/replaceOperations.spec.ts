/**
 * Tests for replaceOperations.ts
 * Replace operations for Find/Replace feature.
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  validateReplaceValue,
  READ_ONLY_ATTRIBUTES,
} from '../replaceOperations';

describe('replaceOperations', () => {
  describe('READ_ONLY_ATTRIBUTES', () => {
    it('should include class attribute', () => {
      expect(READ_ONLY_ATTRIBUTES.has('class')).toBe(true);
    });
  });

  describe('validateReplaceValue', () => {
    it('should return error for read-only class attribute', () => {
      const error = validateReplaceValue('class', 'CSlider');

      expect(error).not.toBeNull();
      expect(error?.type).toBe('read-only-attribute');
      expect(error?.message).toContain('class');
    });

    it('should return null for valid attribute', () => {
      const error = validateReplaceValue('background-color', '#FF0000');

      expect(error).toBeNull();
    });

    it('should return null for origin attribute', () => {
      const error = validateReplaceValue('origin', '10, 20');

      expect(error).toBeNull();
    });

    it('should return null for title attribute', () => {
      const error = validateReplaceValue('title', 'Volume');

      expect(error).toBeNull();
    });
  });
});
