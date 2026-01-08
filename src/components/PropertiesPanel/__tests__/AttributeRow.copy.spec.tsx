import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { AttributeRow } from '../AttributeRow';
import type { AttributeEntry } from '../../../types/properties';

describe('AttributeRow - Copy functionality', () => {
  const createEntry = (overrides: Partial<AttributeEntry> = {}): AttributeEntry => ({
    name: 'origin',
    value: '10, 20',
    isMixed: false,
    isCopyable: true,
    isUnset: false,
    editorType: 'text',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('copyable values', () => {
    it('should call onCopy when copyable value is clicked', () => {
      const onCopy = vi.fn();
      render(() => <AttributeRow entry={createEntry({ value: '#FF5500FF' })} onCopy={onCopy} />);

      const valueElement = screen.getByTestId('attribute-value');
      fireEvent.click(valueElement);

      expect(onCopy).toHaveBeenCalledWith('#FF5500FF');
    });

    it('should copy the exact value string', () => {
      const onCopy = vi.fn();
      render(() => <AttributeRow entry={createEntry({ value: '100, 200' })} onCopy={onCopy} />);

      const valueElement = screen.getByTestId('attribute-value');
      fireEvent.click(valueElement);

      expect(onCopy).toHaveBeenCalledWith('100, 200');
    });

    it('should have cursor pointer style for copyable values', () => {
      render(() => <AttributeRow entry={createEntry({ isCopyable: true })} />);

      const valueElement = screen.getByTestId('attribute-value');
      expect(valueElement).toHaveClass(/copyable/);
    });
  });

  describe('non-copyable values', () => {
    it('should not call onCopy when mixed value is clicked', () => {
      const onCopy = vi.fn();
      render(() => (
        <AttributeRow entry={createEntry({ isMixed: true, value: null, isCopyable: false })} onCopy={onCopy} />
      ));

      const valueElement = screen.getByTestId('attribute-value');
      fireEvent.click(valueElement);

      expect(onCopy).not.toHaveBeenCalled();
    });

    it('should not call onCopy when empty value is clicked', () => {
      const onCopy = vi.fn();
      render(() => (
        <AttributeRow entry={createEntry({ value: '', isCopyable: false })} onCopy={onCopy} />
      ));

      const valueElement = screen.getByTestId('attribute-value');
      fireEvent.click(valueElement);

      expect(onCopy).not.toHaveBeenCalled();
    });

    it('should not have copyable class for mixed values', () => {
      render(() => (
        <AttributeRow entry={createEntry({ isMixed: true, value: null, isCopyable: false })} />
      ));

      const valueElement = screen.getByTestId('attribute-value');
      expect(valueElement).not.toHaveClass(/copyable/);
    });

    it('should not have copyable class for empty values', () => {
      render(() => <AttributeRow entry={createEntry({ value: '', isCopyable: false })} />);

      const valueElement = screen.getByTestId('attribute-value');
      expect(valueElement).not.toHaveClass(/copyable/);
    });
  });

  describe('no onCopy handler', () => {
    it('should not throw when clicked without onCopy handler', () => {
      render(() => <AttributeRow entry={createEntry()} />);

      const valueElement = screen.getByTestId('attribute-value');
      expect(() => fireEvent.click(valueElement)).not.toThrow();
    });
  });
});
