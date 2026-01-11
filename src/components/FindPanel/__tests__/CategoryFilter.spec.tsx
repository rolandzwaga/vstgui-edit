/**
 * Tests for CategoryFilter component
 * Category checkboxes for filtering search results.
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { CategoryFilter } from '../CategoryFilter';
import type { CategoryFilters } from '../../../types/search';

describe('CategoryFilter', () => {
  const defaultFilters: CategoryFilters = {
    container: true,
    control: true,
    display: true,
    custom: true,
  };

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render all category checkboxes', () => {
      render(() => (
        <CategoryFilter filters={defaultFilters} onFilterChange={vi.fn()} />
      ));

      expect(screen.getByLabelText('Container')).toBeInTheDocument();
      expect(screen.getByLabelText('Control')).toBeInTheDocument();
      expect(screen.getByLabelText('Display')).toBeInTheDocument();
      expect(screen.getByLabelText('Custom')).toBeInTheDocument();
    });

    it('should check enabled filters', () => {
      render(() => (
        <CategoryFilter filters={defaultFilters} onFilterChange={vi.fn()} />
      ));

      expect(screen.getByLabelText('Container')).toBeChecked();
      expect(screen.getByLabelText('Control')).toBeChecked();
      expect(screen.getByLabelText('Display')).toBeChecked();
      expect(screen.getByLabelText('Custom')).toBeChecked();
    });

    it('should uncheck disabled filters', () => {
      const filters: CategoryFilters = {
        container: false,
        control: true,
        display: false,
        custom: true,
      };
      render(() => (
        <CategoryFilter filters={filters} onFilterChange={vi.fn()} />
      ));

      expect(screen.getByLabelText('Container')).not.toBeChecked();
      expect(screen.getByLabelText('Control')).toBeChecked();
      expect(screen.getByLabelText('Display')).not.toBeChecked();
      expect(screen.getByLabelText('Custom')).toBeChecked();
    });
  });

  describe('filter toggle', () => {
    it('should call onFilterChange when container is toggled', () => {
      const onFilterChange = vi.fn();
      render(() => (
        <CategoryFilter filters={defaultFilters} onFilterChange={onFilterChange} />
      ));

      fireEvent.click(screen.getByLabelText('Container'));

      expect(onFilterChange).toHaveBeenCalledWith('container', false);
    });

    it('should call onFilterChange when control is toggled', () => {
      const onFilterChange = vi.fn();
      render(() => (
        <CategoryFilter filters={defaultFilters} onFilterChange={onFilterChange} />
      ));

      fireEvent.click(screen.getByLabelText('Control'));

      expect(onFilterChange).toHaveBeenCalledWith('control', false);
    });

    it('should call onFilterChange when display is toggled', () => {
      const onFilterChange = vi.fn();
      render(() => (
        <CategoryFilter filters={defaultFilters} onFilterChange={onFilterChange} />
      ));

      fireEvent.click(screen.getByLabelText('Display'));

      expect(onFilterChange).toHaveBeenCalledWith('display', false);
    });

    it('should call onFilterChange when custom is toggled', () => {
      const onFilterChange = vi.fn();
      render(() => (
        <CategoryFilter filters={defaultFilters} onFilterChange={onFilterChange} />
      ));

      fireEvent.click(screen.getByLabelText('Custom'));

      expect(onFilterChange).toHaveBeenCalledWith('custom', false);
    });

    it('should toggle filter from disabled to enabled', () => {
      const onFilterChange = vi.fn();
      const filters: CategoryFilters = {
        ...defaultFilters,
        container: false,
      };
      render(() => (
        <CategoryFilter filters={filters} onFilterChange={onFilterChange} />
      ));

      fireEvent.click(screen.getByLabelText('Container'));

      expect(onFilterChange).toHaveBeenCalledWith('container', true);
    });
  });

  describe('all/none toggle', () => {
    it('should render All button', () => {
      render(() => (
        <CategoryFilter
          filters={defaultFilters}
          onFilterChange={vi.fn()}
          onToggleAll={vi.fn()}
        />
      ));

      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    });

    it('should render None button', () => {
      render(() => (
        <CategoryFilter
          filters={defaultFilters}
          onFilterChange={vi.fn()}
          onToggleAll={vi.fn()}
        />
      ));

      expect(screen.getByRole('button', { name: 'None' })).toBeInTheDocument();
    });

    it('should call onToggleAll with true when All is clicked', () => {
      const onToggleAll = vi.fn();
      render(() => (
        <CategoryFilter
          filters={defaultFilters}
          onFilterChange={vi.fn()}
          onToggleAll={onToggleAll}
        />
      ));

      fireEvent.click(screen.getByRole('button', { name: 'All' }));

      expect(onToggleAll).toHaveBeenCalledWith(true);
    });

    it('should call onToggleAll with false when None is clicked', () => {
      const onToggleAll = vi.fn();
      render(() => (
        <CategoryFilter
          filters={defaultFilters}
          onFilterChange={vi.fn()}
          onToggleAll={onToggleAll}
        />
      ));

      fireEvent.click(screen.getByRole('button', { name: 'None' }));

      expect(onToggleAll).toHaveBeenCalledWith(false);
    });

    it('should not render All/None buttons when onToggleAll not provided', () => {
      render(() => (
        <CategoryFilter
          filters={defaultFilters}
          onFilterChange={vi.fn()}
        />
      ));

      expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'None' })).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper role for filter group', () => {
      render(() => (
        <CategoryFilter filters={defaultFilters} onFilterChange={vi.fn()} />
      ));

      expect(screen.getByRole('group', { name: 'Category filters' })).toBeInTheDocument();
    });
  });
});
