import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import { AlignmentButton } from '../AlignmentButton';
import { AlignLeftIcon } from '../AlignmentIcons';

describe('AlignmentButton', () => {
  const defaultProps = {
    type: 'left' as const,
    icon: AlignLeftIcon,
    label: 'Align Left',
    disabled: false,
    onClick: vi.fn(),
  };

  it('renders icon and tooltip', () => {
    render(() => <AlignmentButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: /align left/i });
    expect(button).toBeInTheDocument();
  });

  it('shows disabled state when disabled=true', () => {
    render(() => <AlignmentButton {...defaultProps} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows enabled state when disabled=false', () => {
    render(() => <AlignmentButton {...defaultProps} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('calls onClick when enabled and clicked', () => {
    const onClick = vi.fn();
    render(() => <AlignmentButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(() => <AlignmentButton {...defaultProps} disabled={true} onClick={onClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('has aria-label set correctly', () => {
    render(() => <AlignmentButton {...defaultProps} label="Custom Label" />);

    const button = screen.getByRole('button', { name: 'Custom Label' });
    expect(button).toBeInTheDocument();
  });

  it('includes shortcut in tooltip when provided', () => {
    render(() => <AlignmentButton {...defaultProps} shortcut="Ctrl+Shift+L" />);

    const button = screen.getByRole('button');
    expect(button.getAttribute('title')).toContain('Ctrl+Shift+L');
  });

  it('renders SVG icon inside button', () => {
    render(() => <AlignmentButton {...defaultProps} />);

    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
