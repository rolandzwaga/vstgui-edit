import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@solidjs/testing-library';
import { testInRoot } from '../../../__tests__/helpers/solidjs';
import { resetPalette } from '../../../stores/paletteStore';
import { ViewPalette } from '../ViewPalette';

async function expandSection() {
  const header = screen.getByRole('button', { name: /Views/i });
  await fireEvent.click(header);
}

describe('ViewPalette', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetPalette();
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders with data-testid', () => {
    render(() => <ViewPalette />);

    expect(screen.getByTestId('view-palette')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(() => <ViewPalette />);

    expect(screen.getByText('Views')).toBeInTheDocument();
  });

  it('renders search input', async () => {
    render(() => <ViewPalette />);
    await expandSection();

    expect(screen.getByTestId('palette-search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search views...')).toBeInTheDocument();
  });

  it('renders all categories', async () => {
    render(() => <ViewPalette />);
    await expandSection();

    expect(screen.getByTestId('palette-category-containers')).toBeInTheDocument();
    expect(screen.getByTestId('palette-category-controls')).toBeInTheDocument();
    expect(screen.getByTestId('palette-category-displays')).toBeInTheDocument();
    expect(screen.getByTestId('palette-category-text-input')).toBeInTheDocument();
    expect(screen.getByTestId('palette-category-animation')).toBeInTheDocument();
  });

  it('filters items when searching', async () => {
    render(() => <ViewPalette />);
    await expandSection();

    const searchInput = screen.getByTestId('palette-search');
    fireEvent.input(searchInput, { target: { value: 'Knob' } });

    expect(screen.getByTestId('palette-item-CKnob')).toBeInTheDocument();
    expect(screen.getByTestId('palette-item-CAnimKnob')).toBeInTheDocument();
    expect(screen.queryByTestId('palette-item-CSlider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('palette-item-CTextButton')).not.toBeInTheDocument();
  });

  it('hides categories with no matching items', async () => {
    render(() => <ViewPalette />);
    await expandSection();

    const searchInput = screen.getByTestId('palette-search');
    fireEvent.input(searchInput, { target: { value: 'Knob' } });

    expect(screen.getByTestId('palette-category-controls')).toBeInTheDocument();
    expect(screen.queryByTestId('palette-category-containers')).not.toBeInTheDocument();
    expect(screen.queryByTestId('palette-category-displays')).not.toBeInTheDocument();
  });

  it('shows all items when search is cleared', async () => {
    render(() => <ViewPalette />);
    await expandSection();

    const searchInput = screen.getByTestId('palette-search');

    fireEvent.input(searchInput, { target: { value: 'Knob' } });
    expect(screen.queryByTestId('palette-item-CSlider')).not.toBeInTheDocument();

    fireEvent.input(searchInput, { target: { value: '' } });
    expect(screen.getByTestId('palette-item-CSlider')).toBeInTheDocument();
  });

  it('search is case-insensitive', async () => {
    render(() => <ViewPalette />);
    await expandSection();

    const searchInput = screen.getByTestId('palette-search');
    fireEvent.input(searchInput, { target: { value: 'slider' } });

    expect(screen.getByTestId('palette-item-CSlider')).toBeInTheDocument();
  });

  it('shows categories with correct item counts', async () => {
    render(() => <ViewPalette />);
    await expandSection();

    expect(screen.getByText('Containers')).toBeInTheDocument();
    expect(screen.getByText('(7)')).toBeInTheDocument();

    expect(screen.getByText('Controls')).toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
  });
});
