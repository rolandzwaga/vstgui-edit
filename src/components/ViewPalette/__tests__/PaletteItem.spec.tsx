import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@solidjs/testing-library';
import { PaletteItem } from '../PaletteItem';

describe('PaletteItem', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the view class name', () => {
    render(() => <PaletteItem className="CTextButton" />);

    expect(screen.getByText('CTextButton')).toBeInTheDocument();
  });

  it('has correct data-testid attribute', () => {
    render(() => <PaletteItem className="CSlider" />);

    expect(screen.getByTestId('palette-item-CSlider')).toBeInTheDocument();
  });

  it('is draggable', () => {
    render(() => <PaletteItem className="CKnob" />);

    const item = screen.getByTestId('palette-item-CKnob');
    expect(item).toHaveAttribute('draggable', 'true');
  });

  it('sets drag data on drag start', () => {
    render(() => <PaletteItem className="CViewContainer" />);

    const item = screen.getByTestId('palette-item-CViewContainer');

    const setData = vi.fn();
    const dataTransfer = {
      setData,
      effectAllowed: '',
    };

    fireEvent.dragStart(item, { dataTransfer });

    expect(setData).toHaveBeenCalledWith('application/vstgui-view-class', 'CViewContainer');
    expect(dataTransfer.effectAllowed).toBe('copy');
  });

  it('handles drag start without dataTransfer gracefully', () => {
    render(() => <PaletteItem className="CTextLabel" />);

    const item = screen.getByTestId('palette-item-CTextLabel');

    fireEvent.dragStart(item, { dataTransfer: null });
  });
});
