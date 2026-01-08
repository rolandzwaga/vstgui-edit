import { describe, it, expect } from 'vitest';
import {
  isValidTemplateName,
  generateUniqueTemplateName,
  generateDuplicateName,
} from '../validation';

describe('template validation', () => {
  describe('isValidTemplateName', () => {
    it('should return true for valid names starting with letter', () => {
      expect(isValidTemplateName('MainView')).toBe(true);
      expect(isValidTemplateName('settingsPanel')).toBe(true);
      expect(isValidTemplateName('View1')).toBe(true);
    });

    it('should return true for names starting with underscore', () => {
      expect(isValidTemplateName('_privateView')).toBe(true);
      expect(isValidTemplateName('_123')).toBe(true);
    });

    it('should return true for names with hyphens', () => {
      expect(isValidTemplateName('main-view')).toBe(true);
      expect(isValidTemplateName('settings-panel-v2')).toBe(true);
    });

    it('should return true for names with underscores', () => {
      expect(isValidTemplateName('main_view')).toBe(true);
      expect(isValidTemplateName('settings_panel_v2')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidTemplateName('')).toBe(false);
    });

    it('should return false for names starting with number', () => {
      expect(isValidTemplateName('1View')).toBe(false);
      expect(isValidTemplateName('123')).toBe(false);
    });

    it('should return false for names starting with hyphen', () => {
      expect(isValidTemplateName('-view')).toBe(false);
    });

    it('should return false for names with spaces', () => {
      expect(isValidTemplateName('main view')).toBe(false);
      expect(isValidTemplateName('Main View')).toBe(false);
    });

    it('should return false for names with special characters', () => {
      expect(isValidTemplateName('main@view')).toBe(false);
      expect(isValidTemplateName('view!')).toBe(false);
      expect(isValidTemplateName('view.name')).toBe(false);
    });
  });

  describe('generateUniqueTemplateName', () => {
    it('should return default name when no templates exist', () => {
      expect(generateUniqueTemplateName([])).toBe('NewTemplate');
    });

    it('should return default name when it does not conflict', () => {
      expect(generateUniqueTemplateName(['MainView', 'Settings'])).toBe('NewTemplate');
    });

    it('should append number when default name conflicts', () => {
      expect(generateUniqueTemplateName(['NewTemplate'])).toBe('NewTemplate2');
    });

    it('should find next available number', () => {
      expect(generateUniqueTemplateName(['NewTemplate', 'NewTemplate2'])).toBe('NewTemplate3');
    });

    it('should use custom base name when provided', () => {
      expect(generateUniqueTemplateName([], 'Custom')).toBe('Custom');
    });

    it('should append number to custom base name when it conflicts', () => {
      expect(generateUniqueTemplateName(['Custom'], 'Custom')).toBe('Custom2');
    });
  });

  describe('generateDuplicateName', () => {
    it('should append Copy to source name', () => {
      expect(generateDuplicateName(['MainView'], 'MainView')).toBe('MainViewCopy');
    });

    it('should append number when Copy already exists', () => {
      expect(generateDuplicateName(['MainView', 'MainViewCopy'], 'MainView')).toBe('MainViewCopy2');
    });

    it('should find next available copy number', () => {
      expect(
        generateDuplicateName(['MainView', 'MainViewCopy', 'MainViewCopy2'], 'MainView')
      ).toBe('MainViewCopy3');
    });

    it('should handle source name with Copy suffix', () => {
      expect(generateDuplicateName(['ViewCopy'], 'ViewCopy')).toBe('ViewCopyCopy');
    });
  });
});
