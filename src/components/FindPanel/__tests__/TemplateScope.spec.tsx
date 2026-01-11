/**
 * Tests for TemplateScope component
 * Toggle for searching current template or all templates.
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { TemplateScope } from '../TemplateScope';

describe('TemplateScope', () => {
  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render "Current template" option', () => {
      render(() => (
        <TemplateScope
          scope="current"
          currentTemplateName="MainPanel"
          templateCount={3}
          onScopeChange={vi.fn()}
        />
      ));

      expect(screen.getByLabelText(/Current template/)).toBeInTheDocument();
    });

    it('should render "All templates" option', () => {
      render(() => (
        <TemplateScope
          scope="current"
          currentTemplateName="MainPanel"
          templateCount={3}
          onScopeChange={vi.fn()}
        />
      ));

      expect(screen.getByLabelText(/All templates/)).toBeInTheDocument();
    });

    it('should display current template name', () => {
      render(() => (
        <TemplateScope
          scope="current"
          currentTemplateName="MainPanel"
          templateCount={3}
          onScopeChange={vi.fn()}
        />
      ));

      expect(screen.getByText(/MainPanel/)).toBeInTheDocument();
    });

    it('should display template count for all templates option', () => {
      render(() => (
        <TemplateScope
          scope="all"
          currentTemplateName="MainPanel"
          templateCount={5}
          onScopeChange={vi.fn()}
        />
      ));

      expect(screen.getByText(/5/)).toBeInTheDocument();
    });
  });

  describe('scope selection', () => {
    it('should have "Current template" selected when scope is current', () => {
      render(() => (
        <TemplateScope
          scope="current"
          currentTemplateName="MainPanel"
          templateCount={3}
          onScopeChange={vi.fn()}
        />
      ));

      const currentRadio = screen.getByRole('radio', { name: /Current template/ });
      expect(currentRadio).toBeChecked();
    });

    it('should have "All templates" selected when scope is all', () => {
      render(() => (
        <TemplateScope
          scope="all"
          currentTemplateName="MainPanel"
          templateCount={3}
          onScopeChange={vi.fn()}
        />
      ));

      const allRadio = screen.getByRole('radio', { name: /All templates/ });
      expect(allRadio).toBeChecked();
    });

    it('should call onScopeChange with "all" when clicking All templates', () => {
      const onScopeChange = vi.fn();
      render(() => (
        <TemplateScope
          scope="current"
          currentTemplateName="MainPanel"
          templateCount={3}
          onScopeChange={onScopeChange}
        />
      ));

      const allRadio = screen.getByRole('radio', { name: /All templates/ });
      fireEvent.click(allRadio);

      expect(onScopeChange).toHaveBeenCalledWith('all');
    });

    it('should call onScopeChange with "current" when clicking Current template', () => {
      const onScopeChange = vi.fn();
      render(() => (
        <TemplateScope
          scope="all"
          currentTemplateName="MainPanel"
          templateCount={3}
          onScopeChange={onScopeChange}
        />
      ));

      const currentRadio = screen.getByRole('radio', { name: /Current template/ });
      fireEvent.click(currentRadio);

      expect(onScopeChange).toHaveBeenCalledWith('current');
    });

    it('should not call onScopeChange when clicking already selected scope', () => {
      const onScopeChange = vi.fn();
      render(() => (
        <TemplateScope
          scope="current"
          currentTemplateName="MainPanel"
          templateCount={3}
          onScopeChange={onScopeChange}
        />
      ));

      const currentRadio = screen.getByRole('radio', { name: /Current template/ });
      fireEvent.click(currentRadio);

      expect(onScopeChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should disable "All templates" when there is only one template', () => {
      render(() => (
        <TemplateScope
          scope="current"
          currentTemplateName="MainPanel"
          templateCount={1}
          onScopeChange={vi.fn()}
        />
      ));

      const allRadio = screen.getByRole('radio', { name: /All templates/ });
      expect(allRadio).toBeDisabled();
    });

    it('should enable "All templates" when there are multiple templates', () => {
      render(() => (
        <TemplateScope
          scope="current"
          currentTemplateName="MainPanel"
          templateCount={3}
          onScopeChange={vi.fn()}
        />
      ));

      const allRadio = screen.getByRole('radio', { name: /All templates/ });
      expect(allRadio).not.toBeDisabled();
    });

    it('should not call onScopeChange when clicking disabled option', () => {
      const onScopeChange = vi.fn();
      render(() => (
        <TemplateScope
          scope="current"
          currentTemplateName="MainPanel"
          templateCount={1}
          onScopeChange={onScopeChange}
        />
      ));

      const allRadio = screen.getByRole('radio', { name: /All templates/ });
      fireEvent.click(allRadio);

      expect(onScopeChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have radio group with shared name', () => {
      render(() => (
        <TemplateScope
          scope="current"
          currentTemplateName="MainPanel"
          templateCount={3}
          onScopeChange={vi.fn()}
        />
      ));

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(2);
      expect(radios[0]).toHaveAttribute('name', 'templateScope');
      expect(radios[1]).toHaveAttribute('name', 'templateScope');
    });
  });
});
