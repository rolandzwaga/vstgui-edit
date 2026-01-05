import { cleanup, render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  GRID_SIZE_PRESETS,
  gridStore,
  resetGrid,
  setGridSize,
  setGridStyle,
  toggleVisibility,
} from '../../../stores/gridStore';
import { GridToolbar } from '../GridToolbar';

describe('GridToolbar', () => {
  beforeEach(() => {
    resetGrid();
  });

  afterEach(() => {
    cleanup();
  });

  describe('visibility toggle button', () => {
    test('renders visibility toggle button', () => {
      render(() => <GridToolbar />);
      const toggleButton = screen.getByRole('button', { name: /toggle grid/i });
      expect(toggleButton).toBeInTheDocument();
    });

    test('calls toggleVisibility when toggle button clicked', async () => {
      const user = userEvent.setup();
      render(() => <GridToolbar />);
      const toggleButton = screen.getByRole('button', { name: /toggle grid/i });

      await user.click(toggleButton);

      // Grid should now be hidden (was visible by default)
      expect(gridStore.isVisible).toBe(false);
    });

    test('toggle button indicates visible state', () => {
      render(() => <GridToolbar />);
      const toggleButton = screen.getByRole('button', { name: /toggle grid/i });
      // When visible, button should indicate grid is shown
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('toggle button indicates hidden state', () => {
      toggleVisibility(); // Set to hidden
      render(() => <GridToolbar />);
      const toggleButton = screen.getByRole('button', { name: /toggle grid/i });
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('size selector', () => {
    test('renders size selector', () => {
      render(() => <GridToolbar />);
      const sizeSelector = screen.getByRole('combobox', { name: /grid size/i });
      expect(sizeSelector).toBeInTheDocument();
    });

    test('displays current grid size', () => {
      render(() => <GridToolbar />);
      const sizeSelector = screen.getByRole('combobox', { name: /grid size/i });
      // Default size is 10
      expect(sizeSelector).toHaveValue('10');
    });

    test('displays all size preset options', () => {
      render(() => <GridToolbar />);
      const sizeSelector = screen.getByRole('combobox', { name: /grid size/i });
      const options = sizeSelector.querySelectorAll('option');
      expect(options).toHaveLength(GRID_SIZE_PRESETS.length);

      for (const preset of GRID_SIZE_PRESETS) {
        expect(screen.getByRole('option', { name: `${preset}px` })).toBeInTheDocument();
      }
    });

    test('calls setGridSize when size changed to 5', async () => {
      const user = userEvent.setup();
      render(() => <GridToolbar />);
      const sizeSelector = screen.getByRole('combobox', { name: /grid size/i });

      await user.selectOptions(sizeSelector, '5');

      expect(gridStore.size).toBe(5);
    });

    test('calls setGridSize when size changed to 20', async () => {
      const user = userEvent.setup();
      render(() => <GridToolbar />);
      const sizeSelector = screen.getByRole('combobox', { name: /grid size/i });

      await user.selectOptions(sizeSelector, '20');

      expect(gridStore.size).toBe(20);
    });

    test('reflects updated size from store', () => {
      setGridSize(16);
      render(() => <GridToolbar />);
      const sizeSelector = screen.getByRole('combobox', { name: /grid size/i });
      expect(sizeSelector).toHaveValue('16');
    });
  });

  describe('style selector', () => {
    test('renders style selector', () => {
      render(() => <GridToolbar />);
      const styleSelector = screen.getByRole('combobox', { name: /grid style/i });
      expect(styleSelector).toBeInTheDocument();
    });

    test('displays current grid style', () => {
      render(() => <GridToolbar />);
      const styleSelector = screen.getByRole('combobox', { name: /grid style/i });
      // Default style is 'lines'
      expect(styleSelector).toHaveValue('lines');
    });

    test('displays all style options', () => {
      render(() => <GridToolbar />);
      expect(screen.getByRole('option', { name: /lines/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /dots/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /crosshairs/i })).toBeInTheDocument();
    });

    test('calls setGridStyle when style changed to dots', async () => {
      const user = userEvent.setup();
      render(() => <GridToolbar />);
      const styleSelector = screen.getByRole('combobox', { name: /grid style/i });

      await user.selectOptions(styleSelector, 'dots');

      expect(gridStore.style).toBe('dots');
    });

    test('calls setGridStyle when style changed to crosshairs', async () => {
      const user = userEvent.setup();
      render(() => <GridToolbar />);
      const styleSelector = screen.getByRole('combobox', { name: /grid style/i });

      await user.selectOptions(styleSelector, 'crosshairs');

      expect(gridStore.style).toBe('crosshairs');
    });

    test('reflects updated style from store', () => {
      setGridStyle('crosshairs');
      render(() => <GridToolbar />);
      const styleSelector = screen.getByRole('combobox', { name: /grid style/i });
      expect(styleSelector).toHaveValue('crosshairs');
    });
  });

  describe('accessibility', () => {
    test('toolbar has correct role', () => {
      render(() => <GridToolbar />);
      const toolbar = screen.getByRole('toolbar', { name: /grid controls/i });
      expect(toolbar).toBeInTheDocument();
    });

    test('all controls have accessible labels', () => {
      render(() => <GridToolbar />);
      expect(screen.getByRole('button', { name: /toggle grid/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /grid size/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /grid style/i })).toBeInTheDocument();
    });
  });
});
