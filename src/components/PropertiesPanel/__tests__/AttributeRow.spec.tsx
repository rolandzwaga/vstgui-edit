import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { AttributeRow } from '../AttributeRow';
import type { AttributeEntry } from '../../../types/properties';

describe('AttributeRow', () => {
  const createEntry = (overrides: Partial<AttributeEntry> = {}): AttributeEntry => ({
    name: 'origin',
    value: '10, 20',
    isMixed: false,
    isCopyable: true,
    isUnset: false,
    editorType: 'text',
    ...overrides,
  });

  describe('basic rendering', () => {
    it('should render attribute name', () => {
      render(() => <AttributeRow entry={createEntry({ name: 'background-color' })} />);

      expect(screen.getByText('background-color')).toBeInTheDocument();
    });

    it('should render attribute value', () => {
      render(() => <AttributeRow entry={createEntry({ value: '#FF5500FF' })} />);

      expect(screen.getByText('#FF5500FF')).toBeInTheDocument();
    });

    it('should have attribute-row test id', () => {
      render(() => <AttributeRow entry={createEntry()} />);

      expect(screen.getByTestId('attribute-row')).toBeInTheDocument();
    });
  });

  describe('mixed values', () => {
    it('should render Mixed indicator when isMixed is true', () => {
      render(() => <AttributeRow entry={createEntry({ isMixed: true, value: null })} />);

      expect(screen.getByText('Mixed')).toBeInTheDocument();
    });

    it('should apply mixed styling class', () => {
      render(() => <AttributeRow entry={createEntry({ isMixed: true, value: null })} />);

      const mixedIndicator = screen.getByText('Mixed');
      expect(mixedIndicator).toHaveClass(/mixed/);
    });
  });

  describe('empty values', () => {
    it('should render empty placeholder for empty value', () => {
      render(() => <AttributeRow entry={createEntry({ value: '', isCopyable: false })} />);

      expect(screen.getByText('(empty)')).toBeInTheDocument();
    });
  });

  describe('copyable indicator', () => {
    it('should have copyable styling for copyable values', () => {
      render(() => <AttributeRow entry={createEntry({ isCopyable: true })} />);

      const valueElement = screen.getByTestId('attribute-value');
      expect(valueElement).toHaveClass(/copyable/);
    });

    it('should not have copyable styling for non-copyable values', () => {
      render(() => <AttributeRow entry={createEntry({ isCopyable: false, value: '' })} />);

      const valueElement = screen.getByTestId('attribute-value');
      expect(valueElement).not.toHaveClass(/copyable/);
    });
  });

  describe('unset values', () => {
    it('should render (not set) placeholder for unset attribute', () => {
      render(() => <AttributeRow entry={createEntry({ isUnset: true, value: null, isCopyable: false })} />);

      expect(screen.getByText('(not set)')).toBeInTheDocument();
    });

    it('should apply unset styling class to placeholder', () => {
      render(() => <AttributeRow entry={createEntry({ isUnset: true, value: null })} />);

      const unsetIndicator = screen.getByText('(not set)');
      expect(unsetIndicator).toHaveClass(/unset/);
    });

    it('should apply unsetRow styling to row when unset', () => {
      render(() => <AttributeRow entry={createEntry({ isUnset: true, value: null })} />);

      const row = screen.getByTestId('attribute-row');
      expect(row).toHaveClass(/unsetRow/);
    });

    it('should not apply unsetRow styling when value is set', () => {
      render(() => <AttributeRow entry={createEntry({ isUnset: false, value: 'some value' })} />);

      const row = screen.getByTestId('attribute-row');
      expect(row).not.toHaveClass(/unsetRow/);
    });

    it('should show unset even when isMixed is false', () => {
      render(() => <AttributeRow entry={createEntry({ isUnset: true, isMixed: false, value: null })} />);

      expect(screen.getByText('(not set)')).toBeInTheDocument();
      expect(screen.queryByText('Mixed')).not.toBeInTheDocument();
    });

    it('should allow editing unset properties when editable', () => {
      render(() => (
        <AttributeRow
          entry={createEntry({ isUnset: true, isMixed: false, value: null, editorType: 'text' })}
          editable={true}
        />
      ));

      const row = screen.getByTestId('attribute-row');
      expect(row).toHaveClass(/unsetRow/);

      const valueElement = screen.getByTestId('attribute-value');
      expect(valueElement).toHaveClass(/editable/);
    });
  });

  describe('batch editing (mixed values)', () => {
    // T012: verify canEdit() returns true for mixed attributes when editable=true
    it('should allow editing mixed attributes when editable', () => {
      render(() => (
        <AttributeRow
          entry={createEntry({ isMixed: true, value: null, editorType: 'text' })}
          editable={true}
        />
      ));

      const valueElement = screen.getByTestId('attribute-value');
      // Should have editable class even though isMixed is true
      expect(valueElement).toHaveClass(/editable/);
    });

    // T013: verify double-click on mixed attribute enables editing mode
    it('should enable editing mode on double-click for mixed attribute', () => {
      render(() => (
        <AttributeRow
          entry={createEntry({ isMixed: true, value: null, editorType: 'text' })}
          editable={true}
        />
      ));

      const valueElement = screen.getByTestId('attribute-value');
      fireEvent.dblClick(valueElement);

      // Should show text input (editing mode)
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    // T014: verify editing mixed value calls onValueChange with new value
    it('should call onValueChange when editing mixed attribute', () => {
      const onValueChange = vi.fn();
      render(() => (
        <AttributeRow
          entry={createEntry({ isMixed: true, value: null, editorType: 'text' })}
          editable={true}
          onValueChange={onValueChange}
        />
      ));

      const valueElement = screen.getByTestId('attribute-value');
      fireEvent.dblClick(valueElement);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'new value' } });
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(onValueChange).toHaveBeenCalledWith('origin', 'new value');
    });

    // T015: verify committing mixed value calls onValueCommit with '__MIXED__' marker
    it('should call onValueCommit with __MIXED__ marker when committing mixed attribute', () => {
      const onValueCommit = vi.fn();
      render(() => (
        <AttributeRow
          entry={createEntry({ isMixed: true, value: null, editorType: 'text' })}
          editable={true}
          onValueCommit={onValueCommit}
        />
      ));

      const valueElement = screen.getByTestId('attribute-value');
      fireEvent.dblClick(valueElement);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'new value' } });
      fireEvent.change(input, { target: { value: 'new value' } });
      fireEvent.blur(input);

      expect(onValueCommit).toHaveBeenCalledWith('origin', 'new value', '__MIXED__');
    });
  });
});
