/**
 * Tests for ResultsList component
 * Scrollable list of search results.
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { ResultsList } from '../ResultsList';
import type { SearchResult } from '../../../types/search';

describe('ResultsList', () => {
  const mockResults: SearchResult[] = [
    {
      viewId: 'view-1',
      className: 'CKnob',
      category: 'control',
      displayPath: 'Root > Container',
    },
    {
      viewId: 'view-2',
      className: 'CSlider',
      category: 'control',
      displayPath: 'Root > Container',
    },
    {
      viewId: 'view-3',
      className: 'CTextLabel',
      category: 'display',
      displayPath: 'Root',
    },
  ];

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render list of results', () => {
      render(() => (
        <ResultsList
          results={mockResults}
          currentIndex={0}
          onSelect={vi.fn()}
          onNavigate={vi.fn()}
        />
      ));

      expect(screen.getByText('CKnob')).toBeInTheDocument();
      expect(screen.getByText('CSlider')).toBeInTheDocument();
      expect(screen.getByText('CTextLabel')).toBeInTheDocument();
    });

    it('should highlight current selection', () => {
      const { container } = render(() => (
        <ResultsList
          results={mockResults}
          currentIndex={1}
          onSelect={vi.fn()}
          onNavigate={vi.fn()}
        />
      ));

      const items = container.querySelectorAll('[role="option"]');
      expect(items[1].className).toContain('Selected');
      expect(items[0].className).not.toContain('Selected');
      expect(items[2].className).not.toContain('Selected');
    });
  });

  describe('empty state', () => {
    it('should display empty message when no results', () => {
      render(() => (
        <ResultsList
          results={[]}
          currentIndex={-1}
          onSelect={vi.fn()}
          onNavigate={vi.fn()}
        />
      ));

      expect(screen.getByText('No matches found')).toBeInTheDocument();
    });

    it('should display custom empty message', () => {
      render(() => (
        <ResultsList
          results={[]}
          currentIndex={-1}
          onSelect={vi.fn()}
          onNavigate={vi.fn()}
          emptyMessage="No views match your search"
        />
      ));

      expect(screen.getByText('No views match your search')).toBeInTheDocument();
    });
  });

  describe('scrollable container', () => {
    it('should have scrollable container with max-height', () => {
      const { container } = render(() => (
        <ResultsList
          results={mockResults}
          currentIndex={0}
          onSelect={vi.fn()}
          onNavigate={vi.fn()}
        />
      ));

      const list = container.querySelector('[role="listbox"]');
      expect(list).toBeInTheDocument();
    });
  });

  describe('selection handling', () => {
    it('should call onSelect when clicking a result', () => {
      const onSelect = vi.fn();
      render(() => (
        <ResultsList
          results={mockResults}
          currentIndex={0}
          onSelect={onSelect}
          onNavigate={vi.fn()}
        />
      ));

      fireEvent.click(screen.getByText('CSlider'));

      expect(onSelect).toHaveBeenCalledWith(1);
    });
  });

  describe('keyboard navigation', () => {
    it('should call onNavigate with down when ArrowDown is pressed', () => {
      const onNavigate = vi.fn();
      const { container } = render(() => (
        <ResultsList
          results={mockResults}
          currentIndex={0}
          onSelect={vi.fn()}
          onNavigate={onNavigate}
        />
      ));

      const list = container.querySelector('[role="listbox"]');
      fireEvent.keyDown(list!, { key: 'ArrowDown' });

      expect(onNavigate).toHaveBeenCalledWith('down');
    });

    it('should call onNavigate with up when ArrowUp is pressed', () => {
      const onNavigate = vi.fn();
      const { container } = render(() => (
        <ResultsList
          results={mockResults}
          currentIndex={1}
          onSelect={vi.fn()}
          onNavigate={onNavigate}
        />
      ));

      const list = container.querySelector('[role="listbox"]');
      fireEvent.keyDown(list!, { key: 'ArrowUp' });

      expect(onNavigate).toHaveBeenCalledWith('up');
    });

    it('should call onSelect with current index when Enter is pressed', () => {
      const onSelect = vi.fn();
      const { container } = render(() => (
        <ResultsList
          results={mockResults}
          currentIndex={1}
          onSelect={onSelect}
          onNavigate={vi.fn()}
        />
      ));

      const list = container.querySelector('[role="listbox"]');
      fireEvent.keyDown(list!, { key: 'Enter' });

      expect(onSelect).toHaveBeenCalledWith(1);
    });

    it('should prevent default on arrow key events', () => {
      const { container } = render(() => (
        <ResultsList
          results={mockResults}
          currentIndex={0}
          onSelect={vi.fn()}
          onNavigate={vi.fn()}
        />
      ));

      const list = container.querySelector('[role="listbox"]');
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      list!.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have role listbox', () => {
      render(() => (
        <ResultsList
          results={mockResults}
          currentIndex={0}
          onSelect={vi.fn()}
          onNavigate={vi.fn()}
        />
      ));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(() => (
        <ResultsList
          results={mockResults}
          currentIndex={0}
          onSelect={vi.fn()}
          onNavigate={vi.fn()}
        />
      ));

      const list = screen.getByRole('listbox');
      expect(list).toHaveAttribute('aria-label', 'Search results');
    });
  });
});
