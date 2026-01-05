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
});
