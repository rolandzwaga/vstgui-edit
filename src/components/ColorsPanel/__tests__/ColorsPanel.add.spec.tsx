import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { ColorsPanel } from '../ColorsPanel';

const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

const mockAddColor = vi.hoisted(() => vi.fn(() => true));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
  getColors: () => {
    const doc = mockDocumentStore.document as {
      'vstgui-ui-description'?: { colors?: Record<string, string> };
    } | null;
    return doc?.['vstgui-ui-description']?.colors;
  },
  addColor: mockAddColor,
}));

describe('ColorsPanel - Add Color', () => {
  beforeEach(() => {
    mockDocumentStore.document = {
      'vstgui-ui-description': {
        version: '1',
        templates: {},
        colors: {},
      },
    };
    mockAddColor.mockClear();
  });

  describe('given empty colors panel', () => {
    it('should show add color button in header', () => {
      render(() => <ColorsPanel />);

      expect(screen.getByTestId('add-color-button')).toBeInTheDocument();
    });
  });

  describe('given add color button clicked', () => {
    it('should call addColor with generated name and default value', async () => {
      const user = userEvent.setup();
      render(() => <ColorsPanel />);

      await user.click(screen.getByTestId('add-color-button'));

      expect(mockAddColor).toHaveBeenCalledTimes(1);
      expect(mockAddColor).toHaveBeenCalledWith(
        expect.stringMatching(/^New Color( \d+)?$/),
        '#000000FF'
      );
    });
  });

  describe('given existing colors', () => {
    it('should generate unique name for new color', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          colors: {
            'New Color': '#FF0000FF',
          },
        },
      };

      const user = userEvent.setup();
      render(() => <ColorsPanel />);

      await user.click(screen.getByTestId('add-color-button'));

      expect(mockAddColor).toHaveBeenCalledWith('New Color 2', '#000000FF');
    });

    it('should increment name number when multiple exist', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          colors: {
            'New Color': '#FF0000FF',
            'New Color 2': '#00FF00FF',
          },
        },
      };

      const user = userEvent.setup();
      render(() => <ColorsPanel />);

      await user.click(screen.getByTestId('add-color-button'));

      expect(mockAddColor).toHaveBeenCalledWith('New Color 3', '#000000FF');
    });
  });

  describe('given document not loaded', () => {
    it('should disable add button when no document', () => {
      mockDocumentStore.document = null;

      render(() => <ColorsPanel />);

      const addButton = screen.getByTestId('add-color-button');
      expect(addButton).toBeDisabled();
    });
  });
});
