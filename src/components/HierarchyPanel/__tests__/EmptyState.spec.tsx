import { describe, expect, it } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  describe('given default props', () => {
    it('should render default message', () => {
      render(() => <EmptyState />);

      expect(screen.getByText('No template loaded')).toBeInTheDocument();
    });

    it('should have hierarchy-empty-state test id', () => {
      render(() => <EmptyState />);

      expect(screen.getByTestId('hierarchy-empty-state')).toBeInTheDocument();
    });
  });

  describe('given custom message', () => {
    it('should render custom message', () => {
      render(() => <EmptyState message="Custom message" />);

      expect(screen.getByText('Custom message')).toBeInTheDocument();
    });
  });
});
