/**
 * Tests for ScopeFilter component
 * Search scope radio buttons.
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { ScopeFilter } from '../ScopeFilter';

describe('ScopeFilter', () => {
  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render "All views" option', () => {
      render(() => (
        <ScopeFilter
          scope="all"
          hasContainerSelection={false}
          onScopeChange={vi.fn()}
        />
      ));

      expect(screen.getByLabelText('All views')).toBeInTheDocument();
    });

    it('should render "Within selection" option', () => {
      render(() => (
        <ScopeFilter
          scope="all"
          hasContainerSelection={false}
          onScopeChange={vi.fn()}
        />
      ));

      expect(screen.getByLabelText('Within selection')).toBeInTheDocument();
    });

    it('should display container name when selected', () => {
      render(() => (
        <ScopeFilter
          scope="selection"
          hasContainerSelection={true}
          selectedContainerName="MainPanel"
          onScopeChange={vi.fn()}
        />
      ));

      expect(screen.getByLabelText('Within MainPanel')).toBeInTheDocument();
    });
  });

  describe('scope selection', () => {
    it('should have "All views" selected when scope is all', () => {
      render(() => (
        <ScopeFilter
          scope="all"
          hasContainerSelection={true}
          onScopeChange={vi.fn()}
        />
      ));

      const allRadio = screen.getByLabelText('All views');
      expect(allRadio).toBeChecked();
    });

    it('should have "Within selection" selected when scope is selection', () => {
      render(() => (
        <ScopeFilter
          scope="selection"
          hasContainerSelection={true}
          selectedContainerName="Panel"
          onScopeChange={vi.fn()}
        />
      ));

      const selectionRadio = screen.getByLabelText('Within Panel');
      expect(selectionRadio).toBeChecked();
    });

    it('should call onScopeChange when All views is selected', () => {
      const onScopeChange = vi.fn();
      render(() => (
        <ScopeFilter
          scope="selection"
          hasContainerSelection={true}
          selectedContainerName="Panel"
          onScopeChange={onScopeChange}
        />
      ));

      fireEvent.click(screen.getByLabelText('All views'));

      expect(onScopeChange).toHaveBeenCalledWith('all');
    });

    it('should call onScopeChange when Within selection is selected', () => {
      const onScopeChange = vi.fn();
      render(() => (
        <ScopeFilter
          scope="all"
          hasContainerSelection={true}
          onScopeChange={onScopeChange}
        />
      ));

      fireEvent.click(screen.getByLabelText('Within selection'));

      expect(onScopeChange).toHaveBeenCalledWith('selection');
    });

    it('should not call onScopeChange when clicking already selected scope', () => {
      const onScopeChange = vi.fn();
      render(() => (
        <ScopeFilter
          scope="all"
          hasContainerSelection={true}
          onScopeChange={onScopeChange}
        />
      ));

      fireEvent.click(screen.getByLabelText('All views'));

      expect(onScopeChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should disable "Within selection" when no container selection', () => {
      render(() => (
        <ScopeFilter
          scope="all"
          hasContainerSelection={false}
          onScopeChange={vi.fn()}
        />
      ));

      const selectionRadio = screen.getByLabelText('Within selection');
      expect(selectionRadio).toBeDisabled();
    });

    it('should enable "Within selection" when container is selected', () => {
      render(() => (
        <ScopeFilter
          scope="all"
          hasContainerSelection={true}
          onScopeChange={vi.fn()}
        />
      ));

      const selectionRadio = screen.getByLabelText('Within selection');
      expect(selectionRadio).not.toBeDisabled();
    });

    it('should apply disabled styling when no selection', () => {
      const { container } = render(() => (
        <ScopeFilter
          scope="all"
          hasContainerSelection={false}
          onScopeChange={vi.fn()}
        />
      ));

      const labels = container.querySelectorAll('label');
      // Second label (Within selection) should have disabled class
      expect(labels[1].className).toContain('Disabled');
    });

    it('should not call onScopeChange when clicking disabled option', () => {
      const onScopeChange = vi.fn();
      render(() => (
        <ScopeFilter
          scope="all"
          hasContainerSelection={false}
          onScopeChange={onScopeChange}
        />
      ));

      const selectionRadio = screen.getByLabelText('Within selection');
      fireEvent.click(selectionRadio);

      expect(onScopeChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have radio group with shared name', () => {
      render(() => (
        <ScopeFilter
          scope="all"
          hasContainerSelection={true}
          onScopeChange={vi.fn()}
        />
      ));

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(2);
      expect(radios[0]).toHaveAttribute('name', 'searchScope');
      expect(radios[1]).toHaveAttribute('name', 'searchScope');
    });
  });
});
