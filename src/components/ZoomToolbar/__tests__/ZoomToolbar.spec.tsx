import { render, screen, fireEvent } from '@solidjs/testing-library';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resetCanvas,
  resetZoom,
  setZoom,
  zoomIn,
  zoomOut,
} from '../../../stores/canvasStore';
import { ZoomToolbar } from '../ZoomToolbar';

vi.mock('../../../stores/canvasStore', async () => {
  const actual = await vi.importActual('../../../stores/canvasStore');
  return {
    ...actual,
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetZoom: vi.fn(),
  };
});

describe('ZoomToolbar', () => {
  beforeEach(() => {
    resetCanvas();
    vi.clearAllMocks();
  });

  describe('zoom level display (FR-001)', () => {
    it('should display current zoom level as percentage', () => {
      render(() => <ZoomToolbar />);
      // Use aria-live attribute to target the display span, not the 100% button
      const display = screen.getByRole('status');
      expect(display).toHaveTextContent('100%');
    });

    it('should update display when zoom level changes', () => {
      render(() => <ZoomToolbar />);
      const display = screen.getByRole('status');
      expect(display).toHaveTextContent('100%');
      setZoom(1.5);
      expect(display).toHaveTextContent('150%');
    });

    it('should display MIN_ZOOM as 10%', () => {
      setZoom(0.1);
      render(() => <ZoomToolbar />);
      expect(screen.getByText('10%')).toBeInTheDocument();
    });

    it('should display MAX_ZOOM as 500%', () => {
      setZoom(5.0);
      render(() => <ZoomToolbar />);
      expect(screen.getByText('500%')).toBeInTheDocument();
    });
  });

  describe('zoom in button (FR-002)', () => {
    it('should have a zoom in button', () => {
      render(() => <ZoomToolbar />);
      const button = screen.getByRole('button', { name: /zoom in/i });
      expect(button).toBeInTheDocument();
    });

    it('should call zoomIn when + button is clicked', () => {
      render(() => <ZoomToolbar />);
      const button = screen.getByRole('button', { name: /zoom in/i });
      fireEvent.click(button);
      expect(zoomIn).toHaveBeenCalledTimes(1);
    });
  });

  describe('zoom out button (FR-003)', () => {
    it('should have a zoom out button', () => {
      render(() => <ZoomToolbar />);
      const button = screen.getByRole('button', { name: /zoom out/i });
      expect(button).toBeInTheDocument();
    });

    it('should call zoomOut when - button is clicked', () => {
      render(() => <ZoomToolbar />);
      const button = screen.getByRole('button', { name: /zoom out/i });
      fireEvent.click(button);
      expect(zoomOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('reset to 100% button (FR-005)', () => {
    it('should have a 100% reset button', () => {
      render(() => <ZoomToolbar />);
      const button = screen.getByRole('button', { name: /reset.*100/i });
      expect(button).toBeInTheDocument();
    });

    it('should call resetZoom when 100% button is clicked', () => {
      render(() => <ZoomToolbar />);
      const button = screen.getByRole('button', { name: /reset.*100/i });
      fireEvent.click(button);
      expect(resetZoom).toHaveBeenCalledTimes(1);
    });
  });
});
