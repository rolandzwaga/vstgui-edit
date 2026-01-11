/**
 * PropertiesPanel Batch Edit Tests
 * Tests for batch editing when multiple views are selected with mixed values.
 */

import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { PropertiesPanel } from '../PropertiesPanel';
import { resetSelection, selectAll } from '../../../stores/selectionStore';
import { resetProperties } from '../../../stores/propertiesStore';
import { resetTemplateStore, setActiveTemplate } from '../../../stores/templateStore';
import {
  historyStore,
  clearHistory,
  undo,
  redo,
  pushOperation,
} from '../../../stores/historyStore';
import { resetLockHideStore, lockViews } from '../../../stores/lockHideStore';
import { testInRoot } from '../../../__tests__/helpers/solidjs';

const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
  updateViewAttribute: vi.fn(),
  getViewAttribute: vi.fn(),
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
  updateViewAttribute: (viewId: string, name: string, value: string) =>
    mockDocumentStore.updateViewAttribute(viewId, name, value),
  getViewAttribute: (viewId: string, name: string) =>
    mockDocumentStore.getViewAttribute(viewId, name),
}));

describe('PropertiesPanel - Batch Edit', () => {
  beforeEach(() => {
    mockDocumentStore.document = null;
    mockDocumentStore.updateViewAttribute.mockClear();
    mockDocumentStore.getViewAttribute.mockClear();
    testInRoot(() => {
      resetSelection();
      resetProperties();
      resetTemplateStore();
      clearHistory();
      resetLockHideStore();
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('User Story 1: Edit Shared Attribute Across Multiple Views', () => {
    beforeEach(() => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
              children: {
                btn1: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '10, 20',
                    size: '100, 30',
                    title: 'Button 1',
                  },
                },
                btn2: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '50, 60',
                    size: '100, 30',
                    title: 'Button 2',
                  },
                },
                btn3: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '90, 100',
                    size: '100, 30',
                    title: 'Button 3',
                  },
                },
              },
            },
          },
        },
      };
      testInRoot(() => {
        setActiveTemplate('MainView');
      });
    });

    // T018: batch edit applies to all selected views (FR-002)
    it('should apply batch edit to all selected views', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn2', 'MainView-btn3']);
      });

      render(() => <PropertiesPanel />);

      // Find the title attribute row (should show "Mixed")
      const mixedElements = screen.getAllByText('Mixed');
      expect(mixedElements.length).toBeGreaterThan(0);

      // Find title row and double-click to edit
      const titleRow = screen.getByText('title').closest('[data-testid="attribute-row"]');
      expect(titleRow).toBeTruthy();

      const valueElement = titleRow!.querySelector('[data-testid="attribute-value"]');
      fireEvent.dblClick(valueElement!);

      // Should enter edit mode
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();

      // Type new value
      fireEvent.input(input, { target: { value: 'New Title' } });
      fireEvent.change(input, { target: { value: 'New Title' } });

      // Value is NOT propagated during typing
      expect(mockDocumentStore.updateViewAttribute).not.toHaveBeenCalled();

      // Press Enter to commit
      fireEvent.keyDown(input, { key: 'Enter' });

      // NOW verify updateViewAttribute was called for all 3 views
      expect(mockDocumentStore.updateViewAttribute).toHaveBeenCalledWith(
        'MainView-btn1',
        'title',
        'New Title'
      );
      expect(mockDocumentStore.updateViewAttribute).toHaveBeenCalledWith(
        'MainView-btn2',
        'title',
        'New Title'
      );
      expect(mockDocumentStore.updateViewAttribute).toHaveBeenCalledWith(
        'MainView-btn3',
        'title',
        'New Title'
      );
    });
  });

  describe('User Story 2: Single Undo/Redo for Batch Changes', () => {
    beforeEach(() => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
              children: {
                btn1: {
                  attributes: {
                    class: 'CTextButton',
                    title: 'Title A',
                  },
                },
                btn2: {
                  attributes: {
                    class: 'CTextButton',
                    title: 'Title B',
                  },
                },
              },
            },
          },
        },
      };

      // Setup mock to return different values per view
      mockDocumentStore.getViewAttribute.mockImplementation(
        (viewId: string, name: string) => {
          if (name === 'title') {
            if (viewId === 'MainView-btn1') return 'Title A';
            if (viewId === 'MainView-btn2') return 'Title B';
          }
          return undefined;
        }
      );

      testInRoot(() => {
        setActiveTemplate('MainView');
      });
    });

    // T020: verify batch edit creates single history operation (FR-004)
    it('should create single history operation for batch edit', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn2']);
      });

      render(() => <PropertiesPanel />);

      // Find title attribute row and double-click to edit
      const titleRow = screen.getByText('title').closest('[data-testid="attribute-row"]');
      const valueElement = titleRow!.querySelector('[data-testid="attribute-value"]');
      fireEvent.dblClick(valueElement!);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'Unified Title' } });
      fireEvent.change(input, { target: { value: 'Unified Title' } });

      // Commit the edit
      fireEvent.keyDown(input, { key: 'Enter' });

      // Check history - should have exactly one operation
      testInRoot(() => {
        expect(historyStore.canUndo).toBe(true);
        expect(historyStore.undoDescription).toContain('title');
      });
    });

    // T021: verify undo restores per-view original values (FR-005)
    it('should restore per-view original values on undo', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn2']);
      });

      render(() => <PropertiesPanel />);

      // Edit title attribute
      const titleRow = screen.getByText('title').closest('[data-testid="attribute-row"]');
      const valueElement = titleRow!.querySelector('[data-testid="attribute-value"]');
      fireEvent.dblClick(valueElement!);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'Unified Title' } });
      fireEvent.change(input, { target: { value: 'Unified Title' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      // Clear the mock to track undo calls
      mockDocumentStore.updateViewAttribute.mockClear();

      // Undo
      testInRoot(() => {
        undo();
      });

      // Verify each view gets its original value restored
      expect(mockDocumentStore.updateViewAttribute).toHaveBeenCalledWith(
        'MainView-btn1',
        'title',
        'Title A'
      );
      expect(mockDocumentStore.updateViewAttribute).toHaveBeenCalledWith(
        'MainView-btn2',
        'title',
        'Title B'
      );
    });

    // T022: verify redo reapplies batch value to all views (FR-006)
    it('should reapply batch value to all views on redo', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn2']);
      });

      render(() => <PropertiesPanel />);

      // Edit title attribute
      const titleRow = screen.getByText('title').closest('[data-testid="attribute-row"]');
      const valueElement = titleRow!.querySelector('[data-testid="attribute-value"]');
      fireEvent.dblClick(valueElement!);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'Unified Title' } });
      fireEvent.change(input, { target: { value: 'Unified Title' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      // Undo then redo
      testInRoot(() => {
        undo();
      });

      mockDocumentStore.updateViewAttribute.mockClear();

      testInRoot(() => {
        redo();
      });

      // Verify both views get the new value
      expect(mockDocumentStore.updateViewAttribute).toHaveBeenCalledWith(
        'MainView-btn1',
        'title',
        'Unified Title'
      );
      expect(mockDocumentStore.updateViewAttribute).toHaveBeenCalledWith(
        'MainView-btn2',
        'title',
        'Unified Title'
      );
    });

    // T023: verify history description includes view count (FR-012)
    it('should include view count in history description', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn2']);
      });

      render(() => <PropertiesPanel />);

      // Edit title attribute
      const titleRow = screen.getByText('title').closest('[data-testid="attribute-row"]');
      const valueElement = titleRow!.querySelector('[data-testid="attribute-value"]');
      fireEvent.dblClick(valueElement!);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'Unified Title' } });
      fireEvent.change(input, { target: { value: 'Unified Title' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      testInRoot(() => {
        // Description should mention view count
        expect(historyStore.undoDescription).toContain('2');
      });
    });
  });

  describe('User Story 4: Commit on Enter (no live preview for inline editors)', () => {
    beforeEach(() => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
              children: {
                btn1: {
                  attributes: {
                    class: 'CTextButton',
                    title: 'Title A',
                  },
                },
                btn2: {
                  attributes: {
                    class: 'CTextButton',
                    title: 'Title B',
                  },
                },
              },
            },
          },
        },
      };
      testInRoot(() => {
        setActiveTemplate('MainView');
      });
    });

    // T036: verify values are NOT updated during typing (only on commit)
    it('should NOT update views during typing - only on Enter commit', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn2']);
      });

      render(() => <PropertiesPanel />);

      // Edit title attribute
      const titleRow = screen.getByText('title').closest('[data-testid="attribute-row"]');
      const valueElement = titleRow!.querySelector('[data-testid="attribute-value"]');
      fireEvent.dblClick(valueElement!);

      mockDocumentStore.updateViewAttribute.mockClear();

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'Preview Value' } });
      fireEvent.change(input, { target: { value: 'Preview Value' } });

      // Should NOT update during typing
      expect(mockDocumentStore.updateViewAttribute).not.toHaveBeenCalled();

      // Only when user presses Enter
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockDocumentStore.updateViewAttribute).toHaveBeenCalledWith(
        'MainView-btn1',
        'title',
        'Preview Value'
      );
      expect(mockDocumentStore.updateViewAttribute).toHaveBeenCalledWith(
        'MainView-btn2',
        'title',
        'Preview Value'
      );
    });

    // T037: verify Escape cancels without calling any callbacks (FR-011)
    it('should cancel edit on Escape without updating views', () => {
      mockDocumentStore.getViewAttribute.mockImplementation(
        (viewId: string, name: string) => {
          if (name === 'title') {
            if (viewId === 'MainView-btn1') return 'Title A';
            if (viewId === 'MainView-btn2') return 'Title B';
          }
          return undefined;
        }
      );

      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn2']);
      });

      render(() => <PropertiesPanel />);

      // Edit title attribute
      const titleRow = screen.getByText('title').closest('[data-testid="attribute-row"]');
      const valueElement = titleRow!.querySelector('[data-testid="attribute-value"]');
      fireEvent.dblClick(valueElement!);

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'Preview Value' } });
      fireEvent.change(input, { target: { value: 'Preview Value' } });

      mockDocumentStore.updateViewAttribute.mockClear();

      // Press Escape to cancel
      fireEvent.keyDown(input, { key: 'Escape' });

      // Should NOT call updateViewAttribute - just close the editor
      expect(mockDocumentStore.updateViewAttribute).not.toHaveBeenCalled();

      // Editor should be closed
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
              children: {
                btn1: {
                  attributes: {
                    class: 'CTextButton',
                    title: 'Title A',
                  },
                },
                btn2: {
                  attributes: {
                    class: 'CTextButton',
                    title: 'Title B',
                  },
                },
              },
            },
          },
        },
      };
      testInRoot(() => {
        setActiveTemplate('MainView');
      });
    });

    // T046: verify locked views are skipped during batch edit (FR-008)
    it('should skip locked views during batch edit', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn2']);
        // Lock btn1
        lockViews(['MainView-btn1']);
      });

      render(() => <PropertiesPanel />);

      // Edit title attribute
      const titleRow = screen.getByText('title').closest('[data-testid="attribute-row"]');
      const valueElement = titleRow!.querySelector('[data-testid="attribute-value"]');
      fireEvent.dblClick(valueElement!);

      mockDocumentStore.updateViewAttribute.mockClear();

      const input = screen.getByRole('textbox');
      fireEvent.input(input, { target: { value: 'New Title' } });
      fireEvent.change(input, { target: { value: 'New Title' } });

      // Press Enter to commit
      fireEvent.keyDown(input, { key: 'Enter' });

      // Only btn2 should be updated (btn1 is locked)
      expect(mockDocumentStore.updateViewAttribute).not.toHaveBeenCalledWith(
        'MainView-btn1',
        'title',
        'New Title'
      );
      expect(mockDocumentStore.updateViewAttribute).toHaveBeenCalledWith(
        'MainView-btn2',
        'title',
        'New Title'
      );
    });

    // T047: verify single-view editing still works (FR-010 regression)
    it('should still work correctly for single view selection', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1']);
      });

      render(() => <PropertiesPanel />);

      // Find title row (should show actual value, not "Mixed")
      expect(screen.getByText('Title A')).toBeInTheDocument();

      // Edit title attribute
      const titleRow = screen.getByText('title').closest('[data-testid="attribute-row"]');
      const valueElement = titleRow!.querySelector('[data-testid="attribute-value"]');
      fireEvent.dblClick(valueElement!);

      mockDocumentStore.updateViewAttribute.mockClear();

      const input = screen.getByRole('textbox');
      // Should start with actual value, not empty
      expect(input).toHaveValue('Title A');

      fireEvent.input(input, { target: { value: 'Updated Title' } });
      fireEvent.change(input, { target: { value: 'Updated Title' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      // Should only update the single view
      expect(mockDocumentStore.updateViewAttribute).toHaveBeenCalledWith(
        'MainView-btn1',
        'title',
        'Updated Title'
      );
      expect(mockDocumentStore.updateViewAttribute).not.toHaveBeenCalledWith(
        'MainView-btn2',
        expect.anything(),
        expect.anything()
      );
    });

    // T047a: verify validation failure on batch edit rejects all changes (FR-009)
    it('should reject entire batch edit on validation failure', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn2']);
      });

      // Create document with point attribute that requires validation
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {
            MainView: {
              attributes: { class: 'CViewContainer' },
              children: {
                btn1: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '10, 20',
                  },
                },
                btn2: {
                  attributes: {
                    class: 'CTextButton',
                    origin: '30, 40',
                  },
                },
              },
            },
          },
        },
      };

      render(() => <PropertiesPanel />);

      // Find origin row and double-click to edit
      const originRow = screen.getByText('origin').closest('[data-testid="attribute-row"]');
      const valueElement = originRow!.querySelector('[data-testid="attribute-value"]');
      fireEvent.dblClick(valueElement!);

      const input = screen.getByRole('textbox');
      // Enter invalid point value
      fireEvent.input(input, { target: { value: 'invalid' } });
      fireEvent.change(input, { target: { value: 'invalid' } });

      mockDocumentStore.updateViewAttribute.mockClear();

      // Try to commit
      fireEvent.keyDown(input, { key: 'Enter' });

      // History should not record invalid edit - no new operation
      testInRoot(() => {
        expect(historyStore.canUndo).toBe(false);
      });
    });

    // T047b: verify class attribute remains non-editable with multiple views
    it('should keep class attribute non-editable for multiple views', () => {
      testInRoot(() => {
        selectAll(['MainView-btn1', 'MainView-btn2']);
      });

      render(() => <PropertiesPanel />);

      // Find class row
      const classRow = screen.getByText('class').closest('[data-testid="attribute-row"]');
      const valueElement = classRow!.querySelector('[data-testid="attribute-value"]');

      // Should not have editable class
      expect(valueElement).not.toHaveClass(/editable/);

      // Double-click should not enable editing
      fireEvent.dblClick(valueElement!);

      // Should not show any textbox
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });
});
