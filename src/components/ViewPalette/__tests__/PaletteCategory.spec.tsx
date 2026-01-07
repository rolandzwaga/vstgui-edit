import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@solidjs/testing-library';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { resetPalette, collapseCategory, setSearchQuery } from '../../../stores/paletteStore';
import { PaletteCategory } from '../PaletteCategory';
import type { PaletteCategory as PaletteCategoryType } from '../../../types/views';

describe('PaletteCategory', () => {
  const mockCategory: PaletteCategoryType = {
    id: 'controls',
    label: 'Controls',
    viewClasses: ['CSlider', 'CKnob', 'CTextButton'],
  };

  beforeEach(() => {
    testInRoot(() => {
      resetPalette();
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the category label', () => {
    render(() => <PaletteCategory category={mockCategory} />);

    expect(screen.getByText('Controls')).toBeInTheDocument();
  });

  it('displays item count', () => {
    render(() => <PaletteCategory category={mockCategory} />);

    expect(screen.getByText('(3)')).toBeInTheDocument();
  });

  it('has correct data-testid attribute', () => {
    render(() => <PaletteCategory category={mockCategory} />);

    expect(screen.getByTestId('palette-category-controls')).toBeInTheDocument();
  });

  it('shows items when expanded (default state)', () => {
    render(() => <PaletteCategory category={mockCategory} />);

    expect(screen.getByTestId('palette-item-CSlider')).toBeInTheDocument();
    expect(screen.getByTestId('palette-item-CKnob')).toBeInTheDocument();
    expect(screen.getByTestId('palette-item-CTextButton')).toBeInTheDocument();
  });

  it('hides items when collapsed', () => {
    testInRoot(() => {
      collapseCategory('controls');
    });

    render(() => <PaletteCategory category={mockCategory} />);

    expect(screen.queryByTestId('palette-item-CSlider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('palette-item-CKnob')).not.toBeInTheDocument();
  });

  it('toggles expansion on click', async () => {
    render(() => <PaletteCategory category={mockCategory} />);

    const header = screen.getByRole('button');

    expect(screen.getByTestId('palette-item-CSlider')).toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.queryByTestId('palette-item-CSlider')).not.toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.getByTestId('palette-item-CSlider')).toBeInTheDocument();
  });

  it('toggles expansion on Enter key', () => {
    render(() => <PaletteCategory category={mockCategory} />);

    const header = screen.getByRole('button');

    expect(screen.getByTestId('palette-item-CSlider')).toBeInTheDocument();

    fireEvent.keyDown(header, { key: 'Enter' });
    expect(screen.queryByTestId('palette-item-CSlider')).not.toBeInTheDocument();
  });

  it('toggles expansion on Space key', () => {
    render(() => <PaletteCategory category={mockCategory} />);

    const header = screen.getByRole('button');

    expect(screen.getByTestId('palette-item-CSlider')).toBeInTheDocument();

    fireEvent.keyDown(header, { key: ' ' });
    expect(screen.queryByTestId('palette-item-CSlider')).not.toBeInTheDocument();
  });

  it('has aria-expanded attribute', () => {
    render(() => <PaletteCategory category={mockCategory} />);

    const header = screen.getByRole('button');
    expect(header).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('hides category when search filters out all items', () => {
    testInRoot(() => {
      setSearchQuery('nonexistent');
    });

    render(() => <PaletteCategory category={mockCategory} />);

    expect(screen.queryByText('Controls')).not.toBeInTheDocument();
  });

  it('shows only matching items when searching', () => {
    testInRoot(() => {
      setSearchQuery('Slider');
    });

    render(() => <PaletteCategory category={mockCategory} />);

    expect(screen.getByTestId('palette-item-CSlider')).toBeInTheDocument();
    expect(screen.queryByTestId('palette-item-CKnob')).not.toBeInTheDocument();
    expect(screen.queryByTestId('palette-item-CTextButton')).not.toBeInTheDocument();
    expect(screen.getByText('(1)')).toBeInTheDocument();
  });
});
