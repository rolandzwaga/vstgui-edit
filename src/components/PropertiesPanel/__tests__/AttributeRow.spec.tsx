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

    // T014: verify editing does NOT call onValueChange during typing (only on commit)
    it('should not call onValueChange during typing - only propagate on commit', () => {
      const onValueChange = vi.fn();
      const onValueCommit = vi.fn();
      render(() => (
        <AttributeRow
          entry={createEntry({ isMixed: true, value: null, editorType: 'text' })}
          editable={true}
          onValueChange={onValueChange}
          onValueCommit={onValueCommit}
        />
      ));

      const valueElement = screen.getByTestId('attribute-value');
      fireEvent.dblClick(valueElement);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'new value' } });
      fireEvent.change(input, { target: { value: 'new value' } });

      // onValueChange should NOT be called during typing
      expect(onValueChange).not.toHaveBeenCalled();
      expect(onValueCommit).not.toHaveBeenCalled();

      // Press Enter to commit - BOTH onValueChange AND onValueCommit should be called
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onValueChange).toHaveBeenCalledWith('origin', 'new value');
      expect(onValueCommit).toHaveBeenCalledWith('origin', 'new value', '__MIXED__');
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
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onValueCommit).toHaveBeenCalledWith('origin', 'new value', '__MIXED__');
    });

    // T027: verify "Mixed" placeholder shown in text input when isMixed=true
    it('should show Mixed placeholder in text input for mixed attributes', () => {
      render(() => (
        <AttributeRow
          entry={createEntry({ isMixed: true, value: null, editorType: 'text' })}
          editable={true}
        />
      ));

      const valueElement = screen.getByTestId('attribute-value');
      fireEvent.dblClick(valueElement);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Mixed');
      expect(input).toHaveValue(''); // Empty value, not "Mixed"
    });

    // T028: verify placeholder clears on focus (field starts empty)
    it('should start with empty field when editing mixed attribute', () => {
      render(() => (
        <AttributeRow
          entry={createEntry({ isMixed: true, value: null, editorType: 'text' })}
          editable={true}
        />
      ));

      const valueElement = screen.getByTestId('attribute-value');
      fireEvent.dblClick(valueElement);

      const input = screen.getByRole('textbox');
      // Value should be empty (placeholder visible until user types)
      expect(input).toHaveValue('');
    });

    // T029: verify Escape cancels edit without propagating (FR-011)
    it('should cancel edit on Escape without calling any callbacks', () => {
      const onValueChange = vi.fn();
      const onValueCommit = vi.fn();
      render(() => (
        <AttributeRow
          entry={createEntry({ isMixed: true, value: null, editorType: 'text' })}
          editable={true}
          onValueChange={onValueChange}
          onValueCommit={onValueCommit}
        />
      ));

      const valueElement = screen.getByTestId('attribute-value');
      fireEvent.dblClick(valueElement);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'new value' } });
      fireEvent.change(input, { target: { value: 'new value' } });

      // Press Escape
      fireEvent.keyDown(input, { key: 'Escape' });

      // Should NOT call any callbacks - just close the editor
      expect(onValueChange).not.toHaveBeenCalled();
      expect(onValueCommit).not.toHaveBeenCalled();

      // Editor should be closed (textbox gone, Mixed indicator back)
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText('Mixed')).toBeInTheDocument();
    });

    // T041: verify boolean editor batch edit with mixed values
    it('should pass __MIXED__ marker for boolean editor with mixed values', () => {
      const onValueCommit = vi.fn();
      render(() => (
        <AttributeRow
          entry={createEntry({
            name: 'transparent',
            isMixed: true,
            value: null,
            editorType: 'boolean',
          })}
          editable={true}
          onValueCommit={onValueCommit}
        />
      ));

      // Boolean editor is always shown (no double-click needed)
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onValueCommit).toHaveBeenCalledWith('transparent', 'true', '__MIXED__');
    });

    // T042: verify enum editor batch edit with mixed values
    it('should pass __MIXED__ marker for enum editor with mixed values', () => {
      const onValueCommit = vi.fn();
      render(() => (
        <AttributeRow
          entry={createEntry({
            name: 'autosize',
            isMixed: true,
            value: null,
            editorType: 'enum',
            enumValues: ['none', 'left', 'right'],
          })}
          editable={true}
          onValueCommit={onValueCommit}
        />
      ));

      // Enum editor is a custom button dropdown
      const combobox = screen.getByRole('combobox');
      fireEvent.click(combobox); // Open dropdown

      // Click on an option
      const option = screen.getByRole('option', { name: 'left' });
      fireEvent.click(option);

      expect(onValueCommit).toHaveBeenCalledWith('autosize', 'left', '__MIXED__');
    });

    // T043: verify color picker batch edit with mixed values
    it('should pass __MIXED__ marker for color picker with mixed values', () => {
      const onValueCommit = vi.fn();
      render(() => (
        <AttributeRow
          entry={createEntry({
            name: 'background-color',
            isMixed: true,
            value: null,
            editorType: 'color',
          })}
          editable={true}
          documentColors={['MyRed', 'MyBlue']}
          onValueCommit={onValueCommit}
        />
      ));

      // Color picker is a custom button dropdown
      const combobox = screen.getByRole('combobox');
      fireEvent.click(combobox); // Open dropdown

      // Click on a color option
      const option = screen.getByRole('option', { name: 'MyRed' });
      fireEvent.click(option);

      expect(onValueCommit).toHaveBeenCalledWith('background-color', 'MyRed', '__MIXED__');
    });

    // T044: verify font picker batch edit with mixed values
    it('should pass __MIXED__ marker for font picker with mixed values', () => {
      const onValueCommit = vi.fn();
      render(() => (
        <AttributeRow
          entry={createEntry({
            name: 'font',
            isMixed: true,
            value: null,
            editorType: 'font',
          })}
          editable={true}
          documentFonts={['Arial', 'Helvetica']}
          onValueCommit={onValueCommit}
        />
      ));

      // Font picker is a custom button dropdown
      const combobox = screen.getByRole('combobox');
      fireEvent.click(combobox); // Open dropdown

      // Click on a font option
      const option = screen.getByRole('option', { name: 'Arial' });
      fireEvent.click(option);

      expect(onValueCommit).toHaveBeenCalledWith('font', 'Arial', '__MIXED__');
    });

    // T045: verify bitmap picker batch edit with mixed values
    it('should pass __MIXED__ marker for bitmap picker with mixed values', () => {
      const onValueCommit = vi.fn();
      render(() => (
        <AttributeRow
          entry={createEntry({
            name: 'bitmap',
            isMixed: true,
            value: null,
            editorType: 'bitmap',
          })}
          editable={true}
          documentBitmaps={['icon1', 'icon2']}
          onValueCommit={onValueCommit}
        />
      ));

      // Bitmap picker is a custom button dropdown
      const combobox = screen.getByRole('combobox');
      fireEvent.click(combobox); // Open dropdown

      // Click on a bitmap option
      const option = screen.getByRole('option', { name: 'icon1' });
      fireEvent.click(option);

      expect(onValueCommit).toHaveBeenCalledWith('bitmap', 'icon1', '__MIXED__');
    });

    // T047b: verify class attribute remains non-editable with multiple views selected
    it('should keep class attribute non-editable even with isMixed', () => {
      render(() => (
        <AttributeRow
          entry={createEntry({
            name: 'class',
            isMixed: true,
            value: null,
            editorType: 'text',
          })}
          editable={true}
        />
      ));

      const valueElement = screen.getByTestId('attribute-value');
      // Should not have editable class (class is readonly)
      expect(valueElement).not.toHaveClass(/editable/);
    });
  });
});
