import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { CollapsibleSection } from '../CollapsibleSection';

describe('CollapsibleSection', () => {
  describe('given default props', () => {
    it('should render title in header', () => {
      render(() => (
        <CollapsibleSection title="Test Section">
          <div>Content</div>
        </CollapsibleSection>
      ));

      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });

    it('should render children when expanded by default', () => {
      render(() => (
        <CollapsibleSection title="Test Section">
          <div data-testid="child-content">Content</div>
        </CollapsibleSection>
      ));

      expect(screen.getByTestId('child-content')).toBeVisible();
    });

    it('should show collapse indicator', () => {
      render(() => (
        <CollapsibleSection title="Test Section">
          <div>Content</div>
        </CollapsibleSection>
      ));

      expect(screen.getByTestId('collapse-indicator')).toBeInTheDocument();
    });
  });

  describe('given defaultExpanded is false', () => {
    it('should hide children initially', () => {
      render(() => (
        <CollapsibleSection title="Test Section" defaultExpanded={false}>
          <div data-testid="child-content">Content</div>
        </CollapsibleSection>
      ));

      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    });
  });

  describe('when header is clicked', () => {
    it('should collapse content when expanded', async () => {
      render(() => (
        <CollapsibleSection title="Test Section">
          <div data-testid="child-content">Content</div>
        </CollapsibleSection>
      ));

      const header = screen.getByRole('button', { name: /Test Section/i });
      await fireEvent.click(header);

      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    });

    it('should expand content when collapsed', async () => {
      render(() => (
        <CollapsibleSection title="Test Section" defaultExpanded={false}>
          <div data-testid="child-content">Content</div>
        </CollapsibleSection>
      ));

      const header = screen.getByRole('button', { name: /Test Section/i });
      await fireEvent.click(header);

      expect(screen.getByTestId('child-content')).toBeVisible();
    });

    it('should toggle indicator direction', async () => {
      render(() => (
        <CollapsibleSection title="Test Section">
          <div>Content</div>
        </CollapsibleSection>
      ));

      const indicator = screen.getByTestId('collapse-indicator');
      const initialText = indicator.textContent;

      const header = screen.getByRole('button', { name: /Test Section/i });
      await fireEvent.click(header);

      expect(indicator.textContent).not.toBe(initialText);
    });
  });

  describe('given custom testId', () => {
    it('should apply testId to container', () => {
      render(() => (
        <CollapsibleSection title="Test Section" testId="my-section">
          <div>Content</div>
        </CollapsibleSection>
      ));

      expect(screen.getByTestId('my-section')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have button role on header', () => {
      render(() => (
        <CollapsibleSection title="Test Section">
          <div>Content</div>
        </CollapsibleSection>
      ));

      expect(screen.getByRole('button', { name: /Test Section/i })).toBeInTheDocument();
    });

    it('should have aria-expanded true when expanded', () => {
      render(() => (
        <CollapsibleSection title="Test Section">
          <div>Content</div>
        </CollapsibleSection>
      ));

      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-expanded false when collapsed', () => {
      render(() => (
        <CollapsibleSection title="Test Section" defaultExpanded={false}>
          <div>Content</div>
        </CollapsibleSection>
      ));

      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
