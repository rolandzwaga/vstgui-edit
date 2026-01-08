import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { ControlTagsPanel } from '../ControlTagsPanel';

const mocks = vi.hoisted(() => ({
  document: null as unknown,
  addControlTag: vi.fn(() => true),
  deleteControlTag: vi.fn(() => ({ tagId: '0', removedReferences: [] })),
  pushOperation: vi.fn(),
}));

vi.mock('../../../stores/documentStore', () => ({
  documentStore: mocks,
  getControlTags: () => {
    const doc = mocks.document as {
      'vstgui-ui-description'?: { 'control-tags'?: Record<string, string> };
    } | null;
    return doc?.['vstgui-ui-description']?.['control-tags'];
  },
  addControlTag: mocks.addControlTag,
  deleteControlTag: mocks.deleteControlTag,
  updateControlTagName: vi.fn(() => true),
  updateControlTagId: vi.fn(() => '0'),
  restoreControlTagReference: vi.fn(() => true),
}));

vi.mock('../../../stores/historyStore', () => ({
  pushOperation: mocks.pushOperation,
}));

vi.mock('../../../domain/controlTags/usage', () => ({
  findControlTagUsages: vi.fn(() => []),
}));

async function expandSection() {
  const header = screen.getByRole('button', { name: /Control Tags/i });
  await fireEvent.click(header);
}

describe('ControlTagsPanel - History Integration', () => {
  beforeEach(() => {
    mocks.document = null;
    mocks.addControlTag.mockClear();
    mocks.deleteControlTag.mockClear();
    mocks.pushOperation.mockClear();
  });

  describe('add operation', () => {
    beforeEach(() => {
      mocks.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          'control-tags': {},
        },
      };
    });

    it('should push add-control-tag operation', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));
      await user.click(screen.getByTestId('dialog-add-button'));

      expect(mocks.pushOperation).toHaveBeenCalledTimes(1);
      const operation = mocks.pushOperation.mock.calls[0][0];
      expect(operation.type).toBe('add-control-tag');
      expect(operation.description).toContain('New Tag');
    });
  });

  describe('delete operation', () => {
    beforeEach(() => {
      mocks.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          'control-tags': {
            Unused: '0',
          },
        },
      };
    });

    it('should push delete-control-tag operation for unused tag', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);
      await expandSection();

      const item = screen.getByTestId('control-tag-item');
      await user.hover(item);

      const deleteButton = screen.getByTestId('delete-control-tag-button');
      await user.click(deleteButton);

      expect(mocks.deleteControlTag).toHaveBeenCalledWith('Unused');
      expect(mocks.pushOperation).toHaveBeenCalledTimes(1);
      const operation = mocks.pushOperation.mock.calls[0][0];
      expect(operation.type).toBe('delete-control-tag');
    });
  });
});
