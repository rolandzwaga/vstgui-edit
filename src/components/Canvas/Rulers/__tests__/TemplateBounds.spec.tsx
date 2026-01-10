import { cleanup, render, screen } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { resetCanvas, setZoom, startPan, updatePan, endPan } from '../../../../stores/canvasStore';
import { resetGrid } from '../../../../stores/gridStore';
import { HorizontalRuler } from '../HorizontalRuler';
import { VerticalRuler } from '../VerticalRuler';

describe('Template Bounds Indicator', () => {
  beforeEach(() => {
    resetCanvas();
    resetGrid();
  });

  afterEach(() => {
    cleanup();
  });

  describe('HorizontalRuler template bounds', () => {
    test('renders template bounds when template width is set', () => {
      render(() => (
        <HorizontalRuler width={800} cursorPosition={null} templateWidth={600} />
      ));
      const bounds = screen.getByTestId('template-bounds-horizontal');
      expect(bounds).toBeInTheDocument();
    });

    test('template bounds starts at origin', () => {
      render(() => (
        <HorizontalRuler width={800} cursorPosition={null} templateWidth={600} />
      ));
      const bounds = screen.getByTestId('template-bounds-horizontal');
      expect(bounds).toHaveStyle({ left: '0px' });
    });

    test('template bounds width matches template width at 100% zoom', () => {
      render(() => (
        <HorizontalRuler width={800} cursorPosition={null} templateWidth={600} />
      ));
      const bounds = screen.getByTestId('template-bounds-horizontal');
      expect(bounds).toHaveStyle({ width: '600px' });
    });

    test('template bounds scales with zoom', () => {
      setZoom(2.0);
      render(() => (
        <HorizontalRuler width={800} cursorPosition={null} templateWidth={600} />
      ));
      const bounds = screen.getByTestId('template-bounds-horizontal');
      // At 200% zoom, 600px becomes 800px (limited to viewport)
      expect(bounds).toHaveStyle({ width: '800px' });
    });

    test('template bounds shifts with pan', () => {
      // Pan right by 100px
      startPan(0, 0);
      updatePan(100, 0);
      endPan();

      render(() => (
        <HorizontalRuler width={800} cursorPosition={null} templateWidth={600} />
      ));
      const bounds = screen.getByTestId('template-bounds-horizontal');
      expect(bounds).toHaveStyle({ left: '100px' });
    });
  });

  describe('VerticalRuler template bounds', () => {
    test('renders template bounds when template height is set', () => {
      render(() => (
        <VerticalRuler height={600} cursorPosition={null} templateHeight={400} />
      ));
      const bounds = screen.getByTestId('template-bounds-vertical');
      expect(bounds).toBeInTheDocument();
    });

    test('template bounds starts at origin', () => {
      render(() => (
        <VerticalRuler height={600} cursorPosition={null} templateHeight={400} />
      ));
      const bounds = screen.getByTestId('template-bounds-vertical');
      expect(bounds).toHaveStyle({ top: '0px' });
    });

    test('template bounds height matches template height at 100% zoom', () => {
      render(() => (
        <VerticalRuler height={600} cursorPosition={null} templateHeight={400} />
      ));
      const bounds = screen.getByTestId('template-bounds-vertical');
      expect(bounds).toHaveStyle({ height: '400px' });
    });

    test('template bounds scales with zoom', () => {
      setZoom(0.5);
      render(() => (
        <VerticalRuler height={600} cursorPosition={null} templateHeight={400} />
      ));
      const bounds = screen.getByTestId('template-bounds-vertical');
      // At 50% zoom, 400px becomes 200px
      expect(bounds).toHaveStyle({ height: '200px' });
    });
  });

  describe('bounds clipping', () => {
    test('horizontal bounds clipped to viewport width', () => {
      render(() => (
        <HorizontalRuler width={400} cursorPosition={null} templateWidth={600} />
      ));
      const bounds = screen.getByTestId('template-bounds-horizontal');
      // Template is 600px but viewport is only 400px
      expect(bounds).toHaveStyle({ width: '400px' });
    });

    test('vertical bounds clipped to viewport height', () => {
      render(() => (
        <VerticalRuler height={300} cursorPosition={null} templateHeight={400} />
      ));
      const bounds = screen.getByTestId('template-bounds-vertical');
      // Template is 400px but viewport is only 300px
      expect(bounds).toHaveStyle({ height: '300px' });
    });
  });
});
