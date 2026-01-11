/**
 * Tests for searchQuery.ts
 * Query parsing functions for Find/Replace feature.
 */

import { describe, expect, it } from 'vitest';
import {
  parseSearchQuery,
  isClassNameLike,
  escapeSearchTerm,
  unescapeValue,
  CLASS_PREFIXES,
} from '../searchQuery';

describe('searchQuery', () => {
  describe('CLASS_PREFIXES', () => {
    it('should include C and UI prefixes', () => {
      expect(CLASS_PREFIXES).toContain('C');
      expect(CLASS_PREFIXES).toContain('UI');
    });
  });

  describe('isClassNameLike', () => {
    it('should return true for CKnob', () => {
      expect(isClassNameLike('CKnob')).toBe(true);
    });

    it('should return true for CViewContainer', () => {
      expect(isClassNameLike('CViewContainer')).toBe(true);
    });

    it('should return true for UIViewSwitchContainer', () => {
      expect(isClassNameLike('UIViewSwitchContainer')).toBe(true);
    });

    it('should return true for CAnimKnob', () => {
      expect(isClassNameLike('CAnimKnob')).toBe(true);
    });

    it('should return false for background-color', () => {
      expect(isClassNameLike('background-color')).toBe(false);
    });

    it('should return false for short strings', () => {
      expect(isClassNameLike('C')).toBe(false);
      expect(isClassNameLike('a')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isClassNameLike('')).toBe(false);
    });

    it('should return false for lowercase after prefix', () => {
      expect(isClassNameLike('Cknob')).toBe(false);
    });

    it('should return false for numbers after prefix', () => {
      expect(isClassNameLike('C123')).toBe(false);
    });

    it('should return false for arbitrary strings', () => {
      expect(isClassNameLike('red')).toBe(false);
      expect(isClassNameLike('#FF0000')).toBe(false);
      expect(isClassNameLike('10, 20')).toBe(false);
    });
  });

  describe('parseSearchQuery', () => {
    describe('empty input', () => {
      it('should return global query with empty term for empty string', () => {
        const result = parseSearchQuery('');
        expect(result.type).toBe('global');
        expect(result.term).toBe('');
      });

      it('should return global query with empty term for whitespace', () => {
        const result = parseSearchQuery('   ');
        expect(result.type).toBe('global');
        expect(result.term).toBe('');
      });
    });

    describe('class search', () => {
      it('should detect CKnob as class search', () => {
        const result = parseSearchQuery('CKnob');
        expect(result.type).toBe('class');
        expect(result.term).toBe('CKnob');
      });

      it('should detect CViewContainer as class search', () => {
        const result = parseSearchQuery('CViewContainer');
        expect(result.type).toBe('class');
        expect(result.term).toBe('CViewContainer');
      });

      it('should detect UIViewSwitchContainer as class search', () => {
        const result = parseSearchQuery('UIViewSwitchContainer');
        expect(result.type).toBe('class');
        expect(result.term).toBe('UIViewSwitchContainer');
      });
    });

    describe('attribute search', () => {
      it('should parse background-color:#FF0000 as attribute search', () => {
        const result = parseSearchQuery('background-color:#FF0000');
        expect(result.type).toBe('attribute');
        expect(result.term).toBe('background-color:#FF0000');
        expect(result.attributeName).toBe('background-color');
        expect(result.value).toBe('#FF0000');
      });

      it('should parse origin:10, 20 as attribute search', () => {
        const result = parseSearchQuery('origin:10, 20');
        expect(result.type).toBe('attribute');
        expect(result.attributeName).toBe('origin');
        expect(result.value).toBe('10, 20');
      });

      it('should parse font:MyFont as attribute search', () => {
        const result = parseSearchQuery('font:MyFont');
        expect(result.type).toBe('attribute');
        expect(result.attributeName).toBe('font');
        expect(result.value).toBe('MyFont');
      });

      it('should handle multiple colons (first colon is delimiter)', () => {
        const result = parseSearchQuery('url:http://example.com');
        expect(result.type).toBe('attribute');
        expect(result.attributeName).toBe('url');
        expect(result.value).toBe('http://example.com');
      });

      it('should handle empty value after colon', () => {
        const result = parseSearchQuery('title:');
        expect(result.type).toBe('attribute');
        expect(result.attributeName).toBe('title');
        expect(result.value).toBe('');
      });
    });

    describe('escaped colon handling', () => {
      it('should not treat escaped colon as attribute delimiter', () => {
        const result = parseSearchQuery('time\\:12\\:30');
        expect(result.type).toBe('global');
        expect(result.term).toBe('time\\:12\\:30');
      });

      it('should unescape colons in attribute values', () => {
        const result = parseSearchQuery('value:foo\\:bar');
        expect(result.type).toBe('attribute');
        expect(result.attributeName).toBe('value');
        expect(result.value).toBe('foo:bar');
      });
    });

    describe('global search', () => {
      it('should detect red as global search', () => {
        const result = parseSearchQuery('red');
        expect(result.type).toBe('global');
        expect(result.term).toBe('red');
      });

      it('should detect #FF0000 as global search', () => {
        const result = parseSearchQuery('#FF0000');
        expect(result.type).toBe('global');
        expect(result.term).toBe('#FF0000');
      });

      it('should detect numeric value as global search', () => {
        const result = parseSearchQuery('100');
        expect(result.type).toBe('global');
        expect(result.term).toBe('100');
      });

      it('should trim whitespace', () => {
        const result = parseSearchQuery('  red  ');
        expect(result.type).toBe('global');
        expect(result.term).toBe('red');
      });
    });
  });

  describe('escapeSearchTerm', () => {
    it('should escape colons', () => {
      expect(escapeSearchTerm('time:12:30')).toBe('time\\:12\\:30');
    });

    it('should escape backslashes', () => {
      expect(escapeSearchTerm('path\\to\\file')).toBe('path\\\\to\\\\file');
    });

    it('should escape both colons and backslashes', () => {
      expect(escapeSearchTerm('a:b\\c')).toBe('a\\:b\\\\c');
    });

    it('should return unchanged string if no special chars', () => {
      expect(escapeSearchTerm('normal text')).toBe('normal text');
    });
  });

  describe('unescapeValue', () => {
    it('should unescape colons', () => {
      expect(unescapeValue('time\\:12\\:30')).toBe('time:12:30');
    });

    it('should unescape backslashes', () => {
      expect(unescapeValue('path\\\\to\\\\file')).toBe('path\\to\\file');
    });

    it('should unescape both colons and backslashes', () => {
      expect(unescapeValue('a\\:b\\\\c')).toBe('a:b\\c');
    });

    it('should return unchanged string if no escape sequences', () => {
      expect(unescapeValue('normal text')).toBe('normal text');
    });
  });
});
