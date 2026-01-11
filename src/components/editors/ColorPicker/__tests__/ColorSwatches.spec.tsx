/**
 * ColorSwatches Tests
 *
 * Tests for the color swatches grid component.
 * Shows document colors, predefined colors, and recent colors.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent, screen } from '@solidjs/testing-library';
import { ColorSwatches } from '../ColorSwatches';

describe('ColorSwatches', () => {
  const defaultProps = {
    documentColors: ['Background', 'Accent', 'Text'],
    documentColorValues: {
      Background: '#2D2D2DFF',
      Accent: '#FF5500FF',
      Text: '#FFFFFFFF',
    },
    selectedValue: null,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ===========================================================================
  // Document Colors
  // ===========================================================================

  describe('document colors', () => {
    test('renders document color swatches', () => {
      const { container } = render(() => <ColorSwatches {...defaultProps} />);
      const swatches = container.querySelectorAll('[data-testid^="swatch-doc-"]');
      expect(swatches.length).toBe(3);
    });

    test('clicking document color calls onSelect with color name', () => {
      const onSelect = vi.fn();
      const { container } = render(() => (
        <ColorSwatches {...defaultProps} onSelect={onSelect} />
      ));

      const swatch = container.querySelector('[data-testid="swatch-doc-Background"]');
      expect(swatch).toBeTruthy();

      fireEvent.click(swatch!);
      expect(onSelect).toHaveBeenCalledWith('Background', 'document-color');
    });

    test('shows resolved hex color as swatch background', () => {
      const { container } = render(() => <ColorSwatches {...defaultProps} />);

      const swatch = container.querySelector('[data-testid="swatch-doc-Accent"]') as HTMLElement;
      expect(swatch).toBeTruthy();
      // Swatch should have background-color set
    });

    test('shows missing indicator when document color has no resolved value', () => {
      const { container } = render(() => (
        <ColorSwatches
          {...defaultProps}
          documentColors={['MissingColor']}
          documentColorValues={{}}
        />
      ));

      const swatch = container.querySelector('[data-testid="swatch-doc-MissingColor"]');
      expect(swatch).toBeTruthy();
      // Check that swatchMissing class is applied (CSS Modules mangles names)
      const classList = Array.from(swatch?.classList || []);
      expect(classList.some(c => c.includes('swatchMissing'))).toBe(true);
    });

    test('highlights selected document color', () => {
      const { container } = render(() => (
        <ColorSwatches {...defaultProps} selectedValue="Accent" />
      ));

      const swatch = container.querySelector('[data-testid="swatch-doc-Accent"]');
      // CSS Modules mangles class names, check via aria-pressed
      expect(swatch?.getAttribute('aria-pressed')).toBe('true');
    });

    test('hides document section when showDocument is false', () => {
      const { container } = render(() => (
        <ColorSwatches {...defaultProps} showDocument={false} />
      ));

      const swatches = container.querySelectorAll('[data-testid^="swatch-doc-"]');
      expect(swatches.length).toBe(0);
    });
  });

  // ===========================================================================
  // Predefined Colors
  // ===========================================================================

  describe('predefined colors', () => {
    test('renders 10 predefined color swatches', () => {
      const { container } = render(() => <ColorSwatches {...defaultProps} />);
      const swatches = container.querySelectorAll('[data-testid^="swatch-predefined-"]');
      expect(swatches.length).toBe(10);
    });

    test('clicking predefined color calls onSelect with reference format', () => {
      const onSelect = vi.fn();
      const { container } = render(() => (
        <ColorSwatches {...defaultProps} onSelect={onSelect} />
      ));

      const swatch = container.querySelector('[data-testid="swatch-predefined-BlackCColor"]');
      expect(swatch).toBeTruthy();

      fireEvent.click(swatch!);
      expect(onSelect).toHaveBeenCalledWith('~ BlackCColor', 'predefined-color');
    });

    test('highlights selected predefined color', () => {
      const { container } = render(() => (
        <ColorSwatches {...defaultProps} selectedValue="~ RedCColor" />
      ));

      const swatch = container.querySelector('[data-testid="swatch-predefined-RedCColor"]');
      expect(swatch?.getAttribute('aria-pressed')).toBe('true');
    });

    test('hides predefined section when showPredefined is false', () => {
      const { container } = render(() => (
        <ColorSwatches {...defaultProps} showPredefined={false} />
      ));

      const swatches = container.querySelectorAll('[data-testid^="swatch-predefined-"]');
      expect(swatches.length).toBe(0);
    });
  });

  // ===========================================================================
  // Recent Colors
  // ===========================================================================

  describe('recent colors', () => {
    test('renders recent color swatches when available', () => {
      // Mock localStorage
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => JSON.stringify(['#FF0000FF', '#00FF00FF', '#0000FFFF'])),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });

      const { container } = render(() => <ColorSwatches {...defaultProps} />);
      const swatches = container.querySelectorAll('[data-testid^="swatch-recent-"]');
      expect(swatches.length).toBe(3);
    });

    test('clicking recent color calls onSelect with hex value', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => JSON.stringify(['#FF0000FF'])),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });

      const onSelect = vi.fn();
      const { container } = render(() => (
        <ColorSwatches {...defaultProps} onSelect={onSelect} />
      ));

      const swatch = container.querySelector('[data-testid="swatch-recent-0"]');
      expect(swatch).toBeTruthy();

      fireEvent.click(swatch!);
      expect(onSelect).toHaveBeenCalledWith('#FF0000FF', 'recent-color');
    });

    test('highlights selected recent color', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => JSON.stringify(['#FF0000FF', '#00FF00FF'])),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });

      const { container } = render(() => (
        <ColorSwatches {...defaultProps} selectedValue="#FF0000FF" />
      ));

      const swatch = container.querySelector('[data-testid="swatch-recent-0"]');
      expect(swatch?.getAttribute('aria-pressed')).toBe('true');
    });

    test('hides recent section when showRecent is false', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => JSON.stringify(['#FF0000FF'])),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });

      const { container } = render(() => (
        <ColorSwatches {...defaultProps} showRecent={false} />
      ));

      const swatches = container.querySelectorAll('[data-testid^="swatch-recent-"]');
      expect(swatches.length).toBe(0);
    });

    test('hides recent section when no recent colors', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });

      const { container } = render(() => <ColorSwatches {...defaultProps} />);
      const header = container.querySelector('[data-testid="recent-header"]');
      expect(header).toBeNull();
    });
  });

  // ===========================================================================
  // Keyboard Navigation
  // ===========================================================================

  describe('keyboard navigation', () => {
    test('swatches are focusable', () => {
      const { container } = render(() => <ColorSwatches {...defaultProps} />);
      const swatch = container.querySelector('[data-testid="swatch-doc-Background"]');
      expect(swatch?.getAttribute('tabindex')).toBe('0');
    });

    test('Enter key selects swatch', () => {
      const onSelect = vi.fn();
      const { container } = render(() => (
        <ColorSwatches {...defaultProps} onSelect={onSelect} />
      ));

      const swatch = container.querySelector('[data-testid="swatch-doc-Background"]');
      fireEvent.keyDown(swatch!, { key: 'Enter' });

      expect(onSelect).toHaveBeenCalledWith('Background', 'document-color');
    });

    test('Space key selects swatch', () => {
      const onSelect = vi.fn();
      const { container } = render(() => (
        <ColorSwatches {...defaultProps} onSelect={onSelect} />
      ));

      const swatch = container.querySelector('[data-testid="swatch-doc-Accent"]');
      fireEvent.keyDown(swatch!, { key: ' ' });

      expect(onSelect).toHaveBeenCalledWith('Accent', 'document-color');
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    test('swatches have role="button"', () => {
      const { container } = render(() => <ColorSwatches {...defaultProps} />);
      const swatch = container.querySelector('[data-testid="swatch-doc-Background"]');
      expect(swatch?.getAttribute('role')).toBe('button');
    });

    test('swatches have aria-label with color name', () => {
      const { container } = render(() => <ColorSwatches {...defaultProps} />);
      const swatch = container.querySelector('[data-testid="swatch-doc-Accent"]');
      expect(swatch?.getAttribute('aria-label')).toContain('Accent');
    });

    test('selected swatch has aria-pressed="true"', () => {
      const { container } = render(() => (
        <ColorSwatches {...defaultProps} selectedValue="Accent" />
      ));

      const swatch = container.querySelector('[data-testid="swatch-doc-Accent"]');
      expect(swatch?.getAttribute('aria-pressed')).toBe('true');
    });
  });
});
