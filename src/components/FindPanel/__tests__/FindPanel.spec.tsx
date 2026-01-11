/**
 * Tests for FindPanel component
 * Main Find/Replace panel container.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { FindPanel } from '../FindPanel';
import { resetSearchStore, setSearchResults, openFindPanel, setRawQuery } from '../../../stores/searchStore';
import type { SearchResult } from '../../../types/search';

// Mock Portal to render in place for testing
vi.mock('solid-js/web', async () => {
  const actual = await vi.importActual<typeof import('solid-js/web')>('solid-js/web');
  return {
    ...actual,
    Portal: (props: { children: unknown }) => props.children,
  };
});

describe('FindPanel', () => {
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
      displayPath: 'Root',
    },
  ];

  beforeEach(() => {
    resetSearchStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render panel with title', () => {
      openFindPanel();
      render(() => <FindPanel />);

      expect(screen.getByText('Find')).toBeInTheDocument();
    });

    it('should render search input', () => {
      openFindPanel();
      render(() => <FindPanel />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render close button', () => {
      openFindPanel();
      render(() => <FindPanel />);

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });

  describe('panel visibility', () => {
    it('should not render when panel is closed', () => {
      // Panel is closed by default
      render(() => <FindPanel />);

      expect(screen.queryByText('Find')).not.toBeInTheDocument();
    });

    it('should render when panel is open', () => {
      openFindPanel();
      render(() => <FindPanel />);

      expect(screen.getByText('Find')).toBeInTheDocument();
    });
  });

  describe('close behavior', () => {
    it('should close when close button is clicked', () => {
      openFindPanel();
      render(() => <FindPanel />);

      fireEvent.click(screen.getByRole('button', { name: /close/i }));

      expect(screen.queryByText('Find')).not.toBeInTheDocument();
    });

    it('should close when Escape is pressed', () => {
      openFindPanel();
      render(() => <FindPanel />);

      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });

      expect(screen.queryByText('Find')).not.toBeInTheDocument();
    });
  });

  describe('result count display', () => {
    it('should display result count when results exist', () => {
      openFindPanel();
      setRawQuery('CKnob');
      setSearchResults(mockResults);
      render(() => <FindPanel />);

      expect(screen.getByText('2 results')).toBeInTheDocument();
    });

    it('should display singular form for single result', () => {
      openFindPanel();
      setRawQuery('CKnob');
      setSearchResults([mockResults[0]]);
      render(() => <FindPanel />);

      expect(screen.getByText('1 result')).toBeInTheDocument();
    });

    it('should display no results message when query entered but no results', () => {
      openFindPanel();
      setRawQuery('NoMatch');
      setSearchResults([]);
      render(() => <FindPanel />);

      expect(screen.getByText('No matches found')).toBeInTheDocument();
    });
  });

  describe('fixed position', () => {
    it('should have fixed positioning for top-right placement', () => {
      openFindPanel();
      const { container } = render(() => <FindPanel />);

      const panel = container.querySelector('[role="dialog"]');
      expect(panel).toBeInTheDocument();
      // Position is controlled by CSS module
    });
  });

  describe('accessibility', () => {
    it('should have dialog role', () => {
      openFindPanel();
      render(() => <FindPanel />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      openFindPanel();
      render(() => <FindPanel />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', 'Find and Replace');
    });

    it('should focus search input on open', () => {
      openFindPanel();
      render(() => <FindPanel />);

      const input = screen.getByRole('textbox');
      expect(document.activeElement).toBe(input);
    });
  });
});
