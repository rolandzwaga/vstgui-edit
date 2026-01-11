/**
 * Tests for ResultItem component
 * Single search result row display.
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { ResultItem } from '../ResultItem';
import type { SearchResult } from '../../../types/search';

describe('ResultItem', () => {
  const mockResult: SearchResult = {
    viewId: 'view-1',
    className: 'CKnob',
    category: 'control',
    displayPath: 'Root > Container',
  };

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should display class name', () => {
      render(() => <ResultItem result={mockResult} isSelected={false} onClick={vi.fn()} />);

      expect(screen.getByText('CKnob')).toBeInTheDocument();
    });

    it('should display parent path', () => {
      render(() => <ResultItem result={mockResult} isSelected={false} onClick={vi.fn()} />);

      expect(screen.getByText('Root > Container')).toBeInTheDocument();
    });

    it('should display matched attribute when present', () => {
      const resultWithMatch: SearchResult = {
        ...mockResult,
        matchedAttribute: 'background-color',
        matchedValue: '#FF0000',
      };

      render(() => <ResultItem result={resultWithMatch} isSelected={false} onClick={vi.fn()} />);

      expect(screen.getByText('background-color: #FF0000')).toBeInTheDocument();
    });

    it('should not display matched attribute section when not present', () => {
      render(() => <ResultItem result={mockResult} isSelected={false} onClick={vi.fn()} />);

      expect(screen.queryByText(/background-color:/)).not.toBeInTheDocument();
    });
  });

  describe('selected state', () => {
    it('should apply selected styling when isSelected is true', () => {
      const { container } = render(() => (
        <ResultItem result={mockResult} isSelected={true} onClick={vi.fn()} />
      ));

      const item = container.querySelector('[role="option"]');
      expect(item?.className).toContain('Selected');
    });

    it('should have aria-selected true when selected', () => {
      render(() => <ResultItem result={mockResult} isSelected={true} onClick={vi.fn()} />);

      const item = screen.getByRole('option');
      expect(item).toHaveAttribute('aria-selected', 'true');
    });

    it('should have aria-selected false when not selected', () => {
      render(() => <ResultItem result={mockResult} isSelected={false} onClick={vi.fn()} />);

      const item = screen.getByRole('option');
      expect(item).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('click handling', () => {
    it('should call onClick when clicked', () => {
      const onClick = vi.fn();
      render(() => <ResultItem result={mockResult} isSelected={false} onClick={onClick} />);

      fireEvent.click(screen.getByRole('option'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when keyboard Enter is pressed', () => {
      const onClick = vi.fn();
      render(() => <ResultItem result={mockResult} isSelected={false} onClick={onClick} />);

      fireEvent.keyDown(screen.getByRole('option'), { key: 'Enter' });

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when keyboard Space is pressed', () => {
      const onClick = vi.fn();
      render(() => <ResultItem result={mockResult} isSelected={false} onClick={onClick} />);

      fireEvent.keyDown(screen.getByRole('option'), { key: ' ' });

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have role option', () => {
      render(() => <ResultItem result={mockResult} isSelected={false} onClick={vi.fn()} />);

      expect(screen.getByRole('option')).toBeInTheDocument();
    });

    it('should be focusable via tab', () => {
      render(() => <ResultItem result={mockResult} isSelected={false} onClick={vi.fn()} />);

      const item = screen.getByRole('option');
      expect(item).toHaveAttribute('tabIndex', '0');
    });
  });
});
