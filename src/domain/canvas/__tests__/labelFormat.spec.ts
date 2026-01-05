import { describe, expect, it } from 'vitest';
import { formatLabel } from '../labelFormat';

describe('formatLabel', () => {
  describe('Given a standard VSTGUI class name', () => {
    it('should return the class name as-is for CViewContainer', () => {
      const result = formatLabel('CViewContainer');

      expect(result).toBe('CViewContainer');
    });

    it('should return the class name as-is for CTextButton', () => {
      const result = formatLabel('CTextButton');

      expect(result).toBe('CTextButton');
    });

    it('should return the class name as-is for CSlider', () => {
      const result = formatLabel('CSlider');

      expect(result).toBe('CSlider');
    });
  });

  describe('Given an undefined class name', () => {
    it('should return "Unknown"', () => {
      const result = formatLabel(undefined);

      expect(result).toBe('Unknown');
    });
  });

  describe('Given an empty class name', () => {
    it('should return "Unknown"', () => {
      const result = formatLabel('');

      expect(result).toBe('Unknown');
    });
  });

  describe('Given a whitespace-only class name', () => {
    it('should return "Unknown"', () => {
      const result = formatLabel('   ');

      expect(result).toBe('Unknown');
    });
  });

  describe('Given a custom category view (US4 - [Custom] indicator)', () => {
    it('should add [Custom] suffix for custom category with valid class name', () => {
      const result = formatLabel('MyCustomView', 'custom');

      expect(result).toBe('MyCustomView [Custom]');
    });

    it('should not add [Custom] suffix for container category', () => {
      const result = formatLabel('CViewContainer', 'container');

      expect(result).toBe('CViewContainer');
    });

    it('should not add [Custom] suffix for control category', () => {
      const result = formatLabel('CTextButton', 'control');

      expect(result).toBe('CTextButton');
    });

    it('should not add [Custom] suffix for display category', () => {
      const result = formatLabel('CTextLabel', 'display');

      expect(result).toBe('CTextLabel');
    });

    it('should return "Unknown" for undefined class even with custom category', () => {
      const result = formatLabel(undefined, 'custom');

      expect(result).toBe('Unknown');
    });

    it('should not add [Custom] suffix when category is not provided', () => {
      const result = formatLabel('MyCustomView');

      expect(result).toBe('MyCustomView');
    });
  });
});
