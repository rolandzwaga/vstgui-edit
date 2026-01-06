import { describe, expect, it } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { SelectionHeader } from '../SelectionHeader';

describe('SelectionHeader', () => {
  describe('single selection', () => {
    it('should render class name for single selection', () => {
      render(() => <SelectionHeader className="CTextButton" selectionCount={1} sameClass={true} />);

      expect(screen.getByText('CTextButton')).toBeInTheDocument();
    });

    it('should have properties-header test id', () => {
      render(() => <SelectionHeader className="CView" selectionCount={1} sameClass={true} />);

      expect(screen.getByTestId('properties-header')).toBeInTheDocument();
    });
  });

  describe('multi-selection same class', () => {
    it('should render class name with count for same class multi-selection', () => {
      render(() => <SelectionHeader className="CTextButton" selectionCount={3} sameClass={true} />);

      expect(screen.getByText('CTextButton')).toBeInTheDocument();
      expect(screen.getByText('(3)')).toBeInTheDocument();
    });
  });

  describe('multi-selection different classes', () => {
    it('should render only count when classes differ', () => {
      render(() => <SelectionHeader className={null} selectionCount={3} sameClass={false} />);

      expect(screen.getByText('3 views selected')).toBeInTheDocument();
    });

    it('should use singular for 2 views', () => {
      render(() => <SelectionHeader className={null} selectionCount={2} sameClass={false} />);

      expect(screen.getByText('2 views selected')).toBeInTheDocument();
    });
  });
});
