import { describe, expect, test } from 'vitest';
import {
  truncateFontName,
  formatFontSize,
  summarizeFontProperties,
} from '../formatting';
import type { FontDefinition } from '../../../types/uidesc';

describe('truncateFontName', () => {
  test('returns name unchanged if under max length', () => {
    expect(truncateFontName('ShortName')).toBe('ShortName');
  });

  test('returns name unchanged if exactly at max length', () => {
    const name = 'A'.repeat(30);
    expect(truncateFontName(name)).toBe(name);
  });

  test('truncates name over max length with ellipsis', () => {
    const name = 'A'.repeat(35);
    const result = truncateFontName(name);
    expect(result).toHaveLength(30);
    expect(result.endsWith('…')).toBe(true);
  });

  test('respects custom max length', () => {
    const name = 'VeryLongFontName';
    const result = truncateFontName(name, 10);
    expect(result).toHaveLength(10);
    expect(result.endsWith('…')).toBe(true);
  });

  test('handles empty string', () => {
    expect(truncateFontName('')).toBe('');
  });
});

describe('formatFontSize', () => {
  test('adds pt suffix to integer', () => {
    expect(formatFontSize('12')).toBe('12pt');
  });

  test('adds pt suffix to decimal', () => {
    expect(formatFontSize('10.5')).toBe('10.5pt');
  });

  test('handles empty string', () => {
    expect(formatFontSize('')).toBe('pt');
  });
});

describe('summarizeFontProperties', () => {
  test('returns font-name and size for basic font', () => {
    const font: FontDefinition = {
      'font-name': 'Arial',
      size: '12',
    };
    expect(summarizeFontProperties(font)).toBe('Arial 12pt');
  });

  test('includes B indicator for bold font', () => {
    const font: FontDefinition = {
      'font-name': 'Arial',
      size: '12',
      bold: 'true',
    };
    expect(summarizeFontProperties(font)).toBe('Arial 12pt B');
  });

  test('includes I indicator for italic font', () => {
    const font: FontDefinition = {
      'font-name': 'Arial',
      size: '12',
      italic: 'true',
    };
    expect(summarizeFontProperties(font)).toBe('Arial 12pt I');
  });

  test('includes both B and I for bold italic font', () => {
    const font: FontDefinition = {
      'font-name': 'Arial',
      size: '12',
      bold: 'true',
      italic: 'true',
    };
    expect(summarizeFontProperties(font)).toBe('Arial 12pt B I');
  });

  test('includes U indicator for underline', () => {
    const font: FontDefinition = {
      'font-name': 'Arial',
      size: '12',
      underline: 'true',
    };
    expect(summarizeFontProperties(font)).toBe('Arial 12pt U');
  });

  test('includes S indicator for strike-through', () => {
    const font: FontDefinition = {
      'font-name': 'Arial',
      size: '12',
      'strike-through': 'true',
    };
    expect(summarizeFontProperties(font)).toBe('Arial 12pt S');
  });

  test('includes all style indicators when all enabled', () => {
    const font: FontDefinition = {
      'font-name': 'Arial',
      size: '12',
      bold: 'true',
      italic: 'true',
      underline: 'true',
      'strike-through': 'true',
    };
    expect(summarizeFontProperties(font)).toBe('Arial 12pt B I U S');
  });

  test('does not include indicators for false values', () => {
    const font: FontDefinition = {
      'font-name': 'Arial',
      size: '12',
      bold: 'false',
      italic: 'false',
    };
    expect(summarizeFontProperties(font)).toBe('Arial 12pt');
  });
});
