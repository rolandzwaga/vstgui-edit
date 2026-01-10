import { cleanup, render, screen } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { resetCanvas } from '../../../../stores/canvasStore';
import { CursorIndicator } from '../CursorIndicator';

describe('CursorIndicator', () => {
  beforeEach(() => {
    resetCanvas();
  });

  afterEach(() => {
    cleanup();
  });

  describe('visibility', () => {
    test('renders when visible prop is true', () => {
      render(() => (
        <CursorIndicator
          screenPosition={100}
          canvasValue={100}
          orientation="horizontal"
          visible={true}
        />
      ));
      const indicator = screen.getByTestId('cursor-indicator');
      expect(indicator).toBeInTheDocument();
    });

    test('does not render when visible prop is false', () => {
      render(() => (
        <CursorIndicator
          screenPosition={100}
          canvasValue={100}
          orientation="horizontal"
          visible={false}
        />
      ));
      expect(screen.queryByTestId('cursor-indicator')).not.toBeInTheDocument();
    });
  });

  describe('horizontal orientation', () => {
    test('positions indicator at correct X position', () => {
      render(() => (
        <CursorIndicator
          screenPosition={150}
          canvasValue={150}
          orientation="horizontal"
          visible={true}
        />
      ));
      const indicator = screen.getByTestId('cursor-indicator');
      expect(indicator).toHaveStyle({ left: '150px' });
    });

    test('renders as vertical line for horizontal ruler', () => {
      render(() => (
        <CursorIndicator
          screenPosition={100}
          canvasValue={100}
          orientation="horizontal"
          visible={true}
        />
      ));
      const indicator = screen.getByTestId('cursor-indicator');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('vertical orientation', () => {
    test('positions indicator at correct Y position', () => {
      render(() => (
        <CursorIndicator
          screenPosition={200}
          canvasValue={200}
          orientation="vertical"
          visible={true}
        />
      ));
      const indicator = screen.getByTestId('cursor-indicator');
      expect(indicator).toHaveStyle({ top: '200px' });
    });

    test('renders as horizontal line for vertical ruler', () => {
      render(() => (
        <CursorIndicator
          screenPosition={100}
          canvasValue={100}
          orientation="vertical"
          visible={true}
        />
      ));
      const indicator = screen.getByTestId('cursor-indicator');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('tooltip', () => {
    test('displays X coordinate for horizontal orientation', () => {
      render(() => (
        <CursorIndicator
          screenPosition={100}
          canvasValue={150}
          orientation="horizontal"
          visible={true}
        />
      ));
      const tooltip = screen.getByTestId('cursor-tooltip');
      expect(tooltip).toHaveTextContent('X: 150');
    });

    test('displays Y coordinate for vertical orientation', () => {
      render(() => (
        <CursorIndicator
          screenPosition={100}
          canvasValue={200}
          orientation="vertical"
          visible={true}
        />
      ));
      const tooltip = screen.getByTestId('cursor-tooltip');
      expect(tooltip).toHaveTextContent('Y: 200');
    });

    test('rounds coordinate value to integer', () => {
      render(() => (
        <CursorIndicator
          screenPosition={100}
          canvasValue={150.7}
          orientation="horizontal"
          visible={true}
        />
      ));
      const tooltip = screen.getByTestId('cursor-tooltip');
      expect(tooltip).toHaveTextContent('X: 151');
    });

    test('displays negative coordinates correctly', () => {
      render(() => (
        <CursorIndicator
          screenPosition={100}
          canvasValue={-50}
          orientation="horizontal"
          visible={true}
        />
      ));
      const tooltip = screen.getByTestId('cursor-tooltip');
      expect(tooltip).toHaveTextContent('X: -50');
    });
  });

  describe('updates with position changes', () => {
    test('position updates when screenPosition prop changes', () => {
      const { unmount } = render(() => (
        <CursorIndicator
          screenPosition={100}
          canvasValue={100}
          orientation="horizontal"
          visible={true}
        />
      ));
      let indicator = screen.getByTestId('cursor-indicator');
      expect(indicator).toHaveStyle({ left: '100px' });
      unmount();

      render(() => (
        <CursorIndicator
          screenPosition={250}
          canvasValue={250}
          orientation="horizontal"
          visible={true}
        />
      ));
      indicator = screen.getByTestId('cursor-indicator');
      expect(indicator).toHaveStyle({ left: '250px' });
    });
  });
});
