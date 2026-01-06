import { describe, expect, it } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { EmptyState } from '../EmptyState';

describe('PropertiesPanel/EmptyState', () => {
  describe('given default props', () => {
    it('should render default message', () => {
      render(() => <EmptyState />);

      expect(screen.getByText('No selection')).toBeInTheDocument();
    });

    it('should have properties-empty-state test id', () => {
      render(() => <EmptyState />);

      expect(screen.getByTestId('properties-empty-state')).toBeInTheDocument();
    });
  });

  describe('given custom message', () => {
    it('should render custom message', () => {
      render(() => <EmptyState message="Select a view to see properties" />);

      expect(screen.getByText('Select a view to see properties')).toBeInTheDocument();
    });
  });
});
