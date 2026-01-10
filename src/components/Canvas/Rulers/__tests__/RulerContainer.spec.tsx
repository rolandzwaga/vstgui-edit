import { cleanup, render, screen } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { reset, setDocumentForTest } from '../../../../stores/documentStore';
import { resetCanvas } from '../../../../stores/canvasStore';
import { resetGrid } from '../../../../stores/gridStore';
import { RulerContainer } from '../RulerContainer';
import type { VSTGUIUIDescription } from '../../../../types/uidesc';

// Helper to create a mock document
function createMockDocument(templateWidth = 600, templateHeight = 400): VSTGUIUIDescription {
  return {
    'vstgui-ui-description': {
      version: '1',
      templates: {
        TestTemplate: {
          attributes: {
            class: 'CViewContainer',
            origin: '0, 0',
            size: `${templateWidth}, ${templateHeight}`,
          },
        },
      },
    },
  };
}

describe('RulerContainer', () => {
  beforeEach(() => {
    resetCanvas();
    resetGrid();
    reset();
  });

  afterEach(() => {
    cleanup();
  });

  describe('CSS grid layout', () => {
    test('renders container with grid layout', () => {
      setDocumentForTest(createMockDocument());
      render(() => (
        <RulerContainer>
          <div data-testid="test-child">Canvas Content</div>
        </RulerContainer>
      ));
      const container = screen.getByTestId('ruler-container');
      expect(container).toBeInTheDocument();
    });

    test('renders children in viewport area', () => {
      setDocumentForTest(createMockDocument());
      render(() => (
        <RulerContainer>
          <div data-testid="test-child">Canvas Content</div>
        </RulerContainer>
      ));
      const child = screen.getByTestId('test-child');
      expect(child).toBeInTheDocument();
      expect(child).toHaveTextContent('Canvas Content');
    });

    test('viewport wrapper contains children', () => {
      setDocumentForTest(createMockDocument());
      render(() => (
        <RulerContainer>
          <div data-testid="test-child">Content</div>
        </RulerContainer>
      ));
      const viewport = screen.getByTestId('ruler-viewport');
      expect(viewport).toBeInTheDocument();
      expect(viewport).toContainElement(screen.getByTestId('test-child'));
    });
  });

  describe('rulers hidden when no template', () => {
    test('does not render rulers when parseState is idle', () => {
      // No document loaded - default state
      render(() => (
        <RulerContainer>
          <div>Content</div>
        </RulerContainer>
      ));
      expect(screen.queryByTestId('horizontal-ruler')).not.toBeInTheDocument();
      expect(screen.queryByTestId('vertical-ruler')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ruler-origin')).not.toBeInTheDocument();
    });
  });

  describe('rulers visible when template loaded', () => {
    test('renders horizontal ruler when template is loaded', () => {
      setDocumentForTest(createMockDocument());
      render(() => (
        <RulerContainer>
          <div>Content</div>
        </RulerContainer>
      ));
      expect(screen.getByTestId('horizontal-ruler')).toBeInTheDocument();
    });

    test('renders vertical ruler when template is loaded', () => {
      setDocumentForTest(createMockDocument());
      render(() => (
        <RulerContainer>
          <div>Content</div>
        </RulerContainer>
      ));
      expect(screen.getByTestId('vertical-ruler')).toBeInTheDocument();
    });

    test('renders origin indicator when template is loaded', () => {
      setDocumentForTest(createMockDocument());
      render(() => (
        <RulerContainer>
          <div>Content</div>
        </RulerContainer>
      ));
      expect(screen.getByTestId('ruler-origin')).toBeInTheDocument();
    });

    test('all ruler components render in correct positions', () => {
      setDocumentForTest(createMockDocument());
      render(() => (
        <RulerContainer>
          <div>Content</div>
        </RulerContainer>
      ));
      const container = screen.getByTestId('ruler-container');
      const origin = screen.getByTestId('ruler-origin');
      const horizontal = screen.getByTestId('horizontal-ruler');
      const vertical = screen.getByTestId('vertical-ruler');
      const viewport = screen.getByTestId('ruler-viewport');

      // All should be present in the container
      expect(container).toContainElement(origin);
      expect(container).toContainElement(horizontal);
      expect(container).toContainElement(vertical);
      expect(container).toContainElement(viewport);
    });
  });

  describe('visibility toggle on document changes', () => {
    test('rulers appear when document loads', () => {
      render(() => (
        <RulerContainer>
          <div>Content</div>
        </RulerContainer>
      ));

      // Initially no rulers
      expect(screen.queryByTestId('horizontal-ruler')).not.toBeInTheDocument();

      // Load document - component should reactively update
      setDocumentForTest(createMockDocument());

      // Now rulers should appear (SolidJS reactive updates)
      expect(screen.getByTestId('horizontal-ruler')).toBeInTheDocument();
    });
  });
});
