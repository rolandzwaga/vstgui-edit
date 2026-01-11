/**
 * Tests for NavigationButtons component
 * Previous/Next buttons for navigating search results.
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { NavigationButtons } from '../NavigationButtons';

describe('NavigationButtons', () => {
  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render Previous button', () => {
      render(() => (
        <NavigationButtons
          currentIndex={0}
          totalCount={10}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
        />
      ));

      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    });

    it('should render Next button', () => {
      render(() => (
        <NavigationButtons
          currentIndex={0}
          totalCount={10}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
        />
      ));

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should display current position', () => {
      render(() => (
        <NavigationButtons
          currentIndex={2}
          totalCount={10}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
        />
      ));

      expect(screen.getByText('3 of 10')).toBeInTheDocument();
    });

    it('should display 0 of 0 when no results', () => {
      render(() => (
        <NavigationButtons
          currentIndex={-1}
          totalCount={0}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
        />
      ));

      expect(screen.getByText('0 of 0')).toBeInTheDocument();
    });
  });

  describe('button states', () => {
    it('should disable both buttons when no results', () => {
      render(() => (
        <NavigationButtons
          currentIndex={-1}
          totalCount={0}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
        />
      ));

      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });

    it('should enable buttons when results exist', () => {
      render(() => (
        <NavigationButtons
          currentIndex={0}
          totalCount={5}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
        />
      ));

      expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });

    it('should enable buttons even at first result (wrapping)', () => {
      render(() => (
        <NavigationButtons
          currentIndex={0}
          totalCount={5}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
        />
      ));

      expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
    });

    it('should enable buttons even at last result (wrapping)', () => {
      render(() => (
        <NavigationButtons
          currentIndex={4}
          totalCount={5}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
        />
      ));

      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
  });

  describe('click handling', () => {
    it('should call onPrevious when Previous button is clicked', () => {
      const onPrevious = vi.fn();
      render(() => (
        <NavigationButtons
          currentIndex={2}
          totalCount={10}
          onPrevious={onPrevious}
          onNext={vi.fn()}
        />
      ));

      fireEvent.click(screen.getByRole('button', { name: /previous/i }));

      expect(onPrevious).toHaveBeenCalledTimes(1);
    });

    it('should call onNext when Next button is clicked', () => {
      const onNext = vi.fn();
      render(() => (
        <NavigationButtons
          currentIndex={2}
          totalCount={10}
          onPrevious={vi.fn()}
          onNext={onNext}
        />
      ));

      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('should not call onPrevious when disabled', () => {
      const onPrevious = vi.fn();
      render(() => (
        <NavigationButtons
          currentIndex={-1}
          totalCount={0}
          onPrevious={onPrevious}
          onNext={vi.fn()}
        />
      ));

      fireEvent.click(screen.getByRole('button', { name: /previous/i }));

      expect(onPrevious).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label for position display', () => {
      render(() => (
        <NavigationButtons
          currentIndex={2}
          totalCount={10}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
        />
      ));

      const position = screen.getByText('3 of 10');
      expect(position).toHaveAttribute('aria-live', 'polite');
    });
  });
});
