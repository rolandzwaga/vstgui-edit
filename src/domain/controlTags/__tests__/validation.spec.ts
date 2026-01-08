import { describe, expect, it } from 'vitest';
import {
  generateUniqueTagName,
  getNextAvailableTagId,
  validateTagId,
  validateTagName,
} from '../validation';

describe('validateTagName', () => {
  it('should accept valid non-empty name', () => {
    const result = validateTagName('Volume', []);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject empty name', () => {
    const result = validateTagName('', []);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('should reject whitespace-only name', () => {
    const result = validateTagName('   ', []);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('should trim whitespace from name', () => {
    const result = validateTagName('  Volume  ', []);
    expect(result.valid).toBe(true);
  });

  it('should reject duplicate name', () => {
    const result = validateTagName('Volume', ['Volume', 'Pan']);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exists');
  });

  it('should allow duplicate when editing self', () => {
    const result = validateTagName('Volume', ['Volume', 'Pan'], 'Volume');
    expect(result.valid).toBe(true);
  });

  it('should reject duplicate when editing to another existing name', () => {
    const result = validateTagName('Pan', ['Volume', 'Pan'], 'Volume');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exists');
  });

  it('should be case-sensitive for duplicates', () => {
    const result = validateTagName('volume', ['Volume']);
    expect(result.valid).toBe(true);
  });
});

describe('validateTagId', () => {
  it('should accept valid positive integer', () => {
    const result = validateTagId('42', []);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept zero', () => {
    const result = validateTagId('0', []);
    expect(result.valid).toBe(true);
  });

  it('should reject negative integer', () => {
    const result = validateTagId('-1', []);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('non-negative');
  });

  it('should accept large positive integer', () => {
    const result = validateTagId('999999', []);
    expect(result.valid).toBe(true);
  });

  it('should reject large negative integer', () => {
    const result = validateTagId('-999999', []);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('non-negative');
  });

  it('should reject empty string', () => {
    const result = validateTagId('', []);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('integer');
  });

  it('should reject floating point', () => {
    const result = validateTagId('1.5', []);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('integer');
  });

  it('should reject non-numeric string', () => {
    const result = validateTagId('abc', []);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('integer');
  });

  it('should reject mixed alphanumeric', () => {
    const result = validateTagId('12abc', []);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('integer');
  });

  it('should trim whitespace', () => {
    const result = validateTagId('  42  ', []);
    expect(result.valid).toBe(true);
  });

  it('should reject duplicate ID', () => {
    const result = validateTagId('0', ['0', '1']);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('in use');
  });

  it('should allow duplicate when editing self', () => {
    const result = validateTagId('0', ['0', '1'], '0');
    expect(result.valid).toBe(true);
  });

  it('should reject duplicate when editing to another existing ID', () => {
    const result = validateTagId('1', ['0', '1'], '0');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('in use');
  });

  it('should normalize IDs for comparison (leading zeros)', () => {
    const result = validateTagId('007', ['7']);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('in use');
  });
});

describe('generateUniqueTagName', () => {
  it('should return "New Tag" when no tags exist', () => {
    const name = generateUniqueTagName({});
    expect(name).toBe('New Tag');
  });

  it('should return "New Tag" when name is available', () => {
    const name = generateUniqueTagName({ Volume: '0', Pan: '1' });
    expect(name).toBe('New Tag');
  });

  it('should return "New Tag 2" when "New Tag" exists', () => {
    const name = generateUniqueTagName({ 'New Tag': '0' });
    expect(name).toBe('New Tag 2');
  });

  it('should increment counter until unique name found', () => {
    const name = generateUniqueTagName({
      'New Tag': '0',
      'New Tag 2': '1',
      'New Tag 3': '2',
    });
    expect(name).toBe('New Tag 4');
  });

  it('should fill gaps in numbering', () => {
    const name = generateUniqueTagName({
      'New Tag': '0',
      'New Tag 3': '2',
    });
    expect(name).toBe('New Tag 2');
  });
});

describe('getNextAvailableTagId', () => {
  it('should return "0" when no tags exist', () => {
    const id = getNextAvailableTagId({});
    expect(id).toBe('0');
  });

  it('should return "1" when 0 is used', () => {
    const id = getNextAvailableTagId({ Volume: '0' });
    expect(id).toBe('1');
  });

  it('should fill gaps in ID sequence', () => {
    const id = getNextAvailableTagId({
      Volume: '0',
      Bypass: '2',
    });
    expect(id).toBe('1');
  });

  it('should return next after highest when no gaps', () => {
    const id = getNextAvailableTagId({
      Volume: '0',
      Pan: '1',
      Bypass: '2',
    });
    expect(id).toBe('3');
  });

  it('should ignore negative IDs for gap filling', () => {
    const id = getNextAvailableTagId({
      Special: '-1',
      Volume: '0',
    });
    expect(id).toBe('1');
  });

  it('should handle non-sequential IDs', () => {
    const id = getNextAvailableTagId({
      A: '5',
      B: '10',
      C: '100',
    });
    expect(id).toBe('0');
  });

  it('should handle all negative IDs', () => {
    const id = getNextAvailableTagId({
      A: '-1',
      B: '-2',
      C: '-100',
    });
    expect(id).toBe('0');
  });
});
