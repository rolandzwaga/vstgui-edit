import { render, screen, fireEvent } from '@solidjs/testing-library';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetCanvas, setZoom, zoomIn, zoomOut } from '../../../stores/canvasStore';
import { ZoomToolbar } from '../ZoomToolbar';

vi.mock('../../../stores/canvasStore', async () => {
  const actual = await vi.importActual('../../../stores/canvasStore');
  return {
    ...actual,
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
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
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should update display when zoom level changes', () => {
      render(() => <ZoomToolbar />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      setZoom(1.5);
      expect(screen.getByText('150%')).toBeInTheDocument();
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
});
