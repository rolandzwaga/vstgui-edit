import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { GradientsPanel } from '../GradientsPanel';

const mockDocumentStore = vi.hoisted(() => ({
  document: null as unknown,
}));

const mockAddGradient = vi.hoisted(() => vi.fn(() => true));
const mockPushOperation = vi.hoisted(() => vi.fn());

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mockDocumentStore,
  getGradients: () => {
    const doc = mockDocumentStore.document as {
      'vstgui-ui-description'?: { gradients?: Record<string, unknown[]> };
    } | null;
    return doc?.['vstgui-ui-description']?.gradients;
  },
  addGradient: mockAddGradient,
  deleteGradient: vi.fn(() => ({ stops: [], removedReferences: [] })),
  updateGradientName: vi.fn(() => true),
  updateGradientStops: vi.fn(() => null),
  updateViewAttribute: vi.fn(),
}));

vi.mock('../../../stores/historyStore', () => ({
  pushOperation: mockPushOperation,
}));

vi.mock('../../../domain/gradients/usage', () => ({
  findGradientUsages: vi.fn(() => []),
}));

describe('GradientsPanel - Add Gradient', () => {
  beforeEach(() => {
    mockDocumentStore.document = {
      'vstgui-ui-description': {
        version: '1',
        templates: {},
        gradients: {},
      },
    };
    mockAddGradient.mockClear();
    mockPushOperation.mockClear();
  });

  describe('given empty gradients panel', () => {
    it('should show add gradient button in header', () => {
      render(() => <GradientsPanel />);

      expect(screen.getByTestId('add-gradient-button')).toBeInTheDocument();
    });
  });

  describe('given add gradient button clicked', () => {
    it('should call addGradient with generated name and default stops', async () => {
      const user = userEvent.setup();
      render(() => <GradientsPanel />);

      await user.click(screen.getByTestId('add-gradient-button'));

      expect(mockAddGradient).toHaveBeenCalledTimes(1);
      expect(mockAddGradient).toHaveBeenCalledWith(
        expect.stringMatching(/^New Gradient( \d+)?$/),
        [
          { rgba: '#000000FF', start: '0.00' },
          { rgba: '#FFFFFFFF', start: '1.00' },
        ]
      );
    });

    it('should push history operation for undo', async () => {
      const user = userEvent.setup();
      render(() => <GradientsPanel />);

      await user.click(screen.getByTestId('add-gradient-button'));

      expect(mockPushOperation).toHaveBeenCalledTimes(1);
      expect(mockPushOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'add-gradient',
        })
      );
    });
  });

  describe('given existing gradients', () => {
    it('should generate unique name for new gradient', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          gradients: {
            'New Gradient': [
              { rgba: '#FF0000FF', start: '0.00' },
              { rgba: '#0000FFFF', start: '1.00' },
            ],
          },
        },
      };

      const user = userEvent.setup();
      render(() => <GradientsPanel />);

      await user.click(screen.getByTestId('add-gradient-button'));

      expect(mockAddGradient).toHaveBeenCalledWith(
        'New Gradient 2',
        expect.any(Array)
      );
    });

    it('should increment name number when multiple exist', async () => {
      mockDocumentStore.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          gradients: {
            'New Gradient': [
              { rgba: '#FF0000FF', start: '0.00' },
              { rgba: '#0000FFFF', start: '1.00' },
            ],
            'New Gradient 2': [
              { rgba: '#00FF00FF', start: '0.00' },
              { rgba: '#FF00FFFF', start: '1.00' },
            ],
          },
        },
      };

      const user = userEvent.setup();
      render(() => <GradientsPanel />);

      await user.click(screen.getByTestId('add-gradient-button'));

      expect(mockAddGradient).toHaveBeenCalledWith(
        'New Gradient 3',
        expect.any(Array)
      );
    });
  });

  describe('given document not loaded', () => {
    it('should disable add button when no document', () => {
      mockDocumentStore.document = null;

      render(() => <GradientsPanel />);

      const addButton = screen.getByTestId('add-gradient-button');
      expect(addButton).toBeDisabled();
    });
  });
});
