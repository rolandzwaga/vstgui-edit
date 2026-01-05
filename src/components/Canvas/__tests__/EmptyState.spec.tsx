import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  describe('Given default props', () => {
    it('should render with default message', () => {
      render(() => <EmptyState />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No template loaded')).toBeInTheDocument();
    });

    it('should have empty-state test id', () => {
      render(() => <EmptyState />);

      const element = screen.getByTestId('empty-state');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Given custom message prop', () => {
    it('should render with custom message', () => {
      render(() => <EmptyState message="Custom empty message" />);

      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });
  });
});
