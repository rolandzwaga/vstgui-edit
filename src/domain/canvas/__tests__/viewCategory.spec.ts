import { describe, expect, it } from 'vitest';
import {
  CONTAINER_CLASSES,
  CONTROL_CLASSES,
  DISPLAY_CLASSES,
  getViewCategory,
} from '../viewCategory';

describe('getViewCategory', () => {
  describe('Given container class names', () => {
    it('should return "container" for CViewContainer', () => {
      expect(getViewCategory('CViewContainer')).toBe('container');
    });

    it('should return "container" for CView', () => {
      expect(getViewCategory('CView')).toBe('container');
    });

    it('should return "container" for CScrollView', () => {
      expect(getViewCategory('CScrollView')).toBe('container');
    });

    it('should return "container" for CLayeredViewContainer', () => {
      expect(getViewCategory('CLayeredViewContainer')).toBe('container');
    });

    it('should return "container" for all CONTAINER_CLASSES', () => {
      for (const className of CONTAINER_CLASSES) {
        expect(getViewCategory(className)).toBe('container');
      }
    });
  });

  describe('Given control class names', () => {
    it('should return "control" for CTextButton', () => {
      expect(getViewCategory('CTextButton')).toBe('control');
    });

    it('should return "control" for CSlider', () => {
      expect(getViewCategory('CSlider')).toBe('control');
    });

    it('should return "control" for CKnob', () => {
      expect(getViewCategory('CKnob')).toBe('control');
    });

    it('should return "control" for CCheckBox', () => {
      expect(getViewCategory('CCheckBox')).toBe('control');
    });

    it('should return "control" for all CONTROL_CLASSES', () => {
      for (const className of CONTROL_CLASSES) {
        expect(getViewCategory(className)).toBe('control');
      }
    });
  });

  describe('Given display class names', () => {
    it('should return "display" for CTextLabel', () => {
      expect(getViewCategory('CTextLabel')).toBe('display');
    });

    it('should return "display" for CParamDisplay', () => {
      expect(getViewCategory('CParamDisplay')).toBe('display');
    });

    it('should return "display" for CVuMeter', () => {
      expect(getViewCategory('CVuMeter')).toBe('display');
    });

    it('should return "display" for all DISPLAY_CLASSES', () => {
      for (const className of DISPLAY_CLASSES) {
        expect(getViewCategory(className)).toBe('display');
      }
    });
  });

  describe('Given custom/unknown class names', () => {
    it('should return "custom" for undefined', () => {
      expect(getViewCategory(undefined)).toBe('custom');
    });

    it('should return "custom" for unknown class name', () => {
      expect(getViewCategory('MyCustomView')).toBe('custom');
    });

    it('should return "custom" for empty string', () => {
      expect(getViewCategory('')).toBe('custom');
    });

    it('should return "custom" for class name not in any set', () => {
      expect(getViewCategory('CUnknownClass')).toBe('custom');
    });
  });
});
