import { describe, expect, it } from 'vitest';
import { detectFormat } from '../formatDetector';

describe('detectFormat', () => {
  describe('JSON detection (FR-001)', () => {
    it('should detect JSON starting with {', () => {
      const result = detectFormat('{"key": "value"}');
      expect(result).toBe('json');
    });

    it('should detect JSON starting with [', () => {
      const result = detectFormat('[1, 2, 3]');
      expect(result).toBe('json');
    });

    it('should detect JSON object with vstgui-ui-description', () => {
      const content = '{"vstgui-ui-description": {"version": "1"}}';
      const result = detectFormat(content);
      expect(result).toBe('json');
    });
  });

  describe('XML detection (FR-001)', () => {
    it('should detect XML starting with <', () => {
      const result = detectFormat('<root></root>');
      expect(result).toBe('xml');
    });

    it('should detect XML starting with <?xml declaration', () => {
      const result = detectFormat('<?xml version="1.0"?><root></root>');
      expect(result).toBe('xml');
    });

    it('should detect XML vstgui-ui-description', () => {
      const content = '<vstgui-ui-description version="1"></vstgui-ui-description>';
      const result = detectFormat(content);
      expect(result).toBe('xml');
    });
  });

  describe('leading whitespace handling (FR-002)', () => {
    it('should detect JSON with leading spaces', () => {
      const result = detectFormat('   {"key": "value"}');
      expect(result).toBe('json');
    });

    it('should detect JSON with leading newlines', () => {
      const result = detectFormat('\n\n{"key": "value"}');
      expect(result).toBe('json');
    });

    it('should detect JSON with leading tabs', () => {
      const result = detectFormat('\t\t{"key": "value"}');
      expect(result).toBe('json');
    });

    it('should detect XML with leading spaces', () => {
      const result = detectFormat('   <root></root>');
      expect(result).toBe('xml');
    });

    it('should detect XML with leading newlines and tabs', () => {
      const result = detectFormat('\n\t<?xml version="1.0"?><root/>');
      expect(result).toBe('xml');
    });

    it('should detect JSON array with leading whitespace', () => {
      const result = detectFormat('  \n  [1, 2, 3]');
      expect(result).toBe('json');
    });
  });

  describe('unknown format detection (FR-003)', () => {
    it('should return unknown for empty string', () => {
      const result = detectFormat('');
      expect(result).toBe('unknown');
    });

    it('should return unknown for whitespace only', () => {
      const result = detectFormat('   \n\t  ');
      expect(result).toBe('unknown');
    });

    it('should return unknown for plain text', () => {
      const result = detectFormat('hello world');
      expect(result).toBe('unknown');
    });

    it('should return unknown for content starting with number', () => {
      const result = detectFormat('123');
      expect(result).toBe('unknown');
    });

    it('should return unknown for content starting with letter', () => {
      const result = detectFormat('abc');
      expect(result).toBe('unknown');
    });
  });

  describe('edge cases', () => {
    it('should handle BOM character before JSON', () => {
      const bom = '\uFEFF';
      const result = detectFormat(bom + '{"key": "value"}');
      expect(result).toBe('json');
    });

    it('should handle BOM character before XML', () => {
      const bom = '\uFEFF';
      const result = detectFormat(bom + '<?xml version="1.0"?>');
      expect(result).toBe('xml');
    });

    it('should handle carriage return + newline', () => {
      const result = detectFormat('\r\n{"key": "value"}');
      expect(result).toBe('json');
    });
  });
});
