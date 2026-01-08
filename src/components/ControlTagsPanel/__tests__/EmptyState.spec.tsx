import { describe, expect, it } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  describe('given no message prop', () => {
    it('should render default message', () => {
      render(() => <EmptyState />);

      expect(screen.getByText('No control tags defined')).toBeInTheDocument();
    });

    it('should render hint', () => {
      render(() => <EmptyState />);

      expect(screen.getByText('Click + to add one')).toBeInTheDocument();
    });

    it('should have testid', () => {
      render(() => <EmptyState />);

      expect(screen.getByTestId('control-tags-empty-state')).toBeInTheDocument();
    });
  });

  describe('given custom message', () => {
    it('should render custom message', () => {
      render(() => <EmptyState message="Custom empty message" />);

      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });
  });
});
