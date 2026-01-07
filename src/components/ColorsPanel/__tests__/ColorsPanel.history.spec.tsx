import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { ColorsPanel } from '../ColorsPanel';

const mockPushOperation = vi.hoisted(() => vi.fn());

vi.mock('../../../stores/documentStore', () => ({
  documentStore: {
    document: {
      'vstgui-ui-description': {
        version: '1',
        templates: {},
        colors: {},
      },
    },
  },
  getColors: () => ({}),
  addColor: vi.fn(() => true),
  deleteColor: vi.fn(() => '#000000FF'),
}));

vi.mock('../../../stores/historyStore', () => ({
  pushOperation: mockPushOperation,
}));

vi.mock('../../../domain/colors/historyOperations', () => ({
  createAddColorOperation: vi.fn((name, value) => ({
    type: 'add-color',
    description: `Add color "${name}"`,
  })),
  createDeleteColorOperation: vi.fn((name, value) => ({
    type: 'delete-color',
    description: `Delete color "${name}"`,
  })),
}));

vi.mock('../../../domain/colors/usage', () => ({
  findColorUsages: vi.fn(() => []),
}));

describe('ColorsPanel - History Integration', () => {
  beforeEach(() => {
    mockPushOperation.mockClear();
  });

  describe('given add color operation', () => {
    it('should push add-color operation to history', async () => {
      const user = userEvent.setup();
      render(() => <ColorsPanel />);

      await user.click(screen.getByTestId('add-color-button'));

      expect(mockPushOperation).toHaveBeenCalledTimes(1);
      expect(mockPushOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'add-color',
          description: expect.stringContaining('Add color'),
        })
      );
    });
  });

  describe('given history operation types', () => {
    it('should create proper operation for add', async () => {
      const user = userEvent.setup();
      render(() => <ColorsPanel />);

      await user.click(screen.getByTestId('add-color-button'));

      const call = mockPushOperation.mock.calls[0][0];
      expect(call.type).toBe('add-color');
    });
  });
});
