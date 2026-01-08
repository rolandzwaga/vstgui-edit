import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { ControlTagsPanel } from '../ControlTagsPanel';

const mocks = vi.hoisted(() => ({
  document: null as unknown,
  addControlTag: vi.fn(() => true),
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
  deleteControlTag: vi.fn(() => ({ tagId: '0', removedReferences: [] })),
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

describe('ControlTagsPanel - Add Control Tag', () => {
  beforeEach(() => {
    mocks.document = null;
    mocks.addControlTag.mockClear();
    mocks.pushOperation.mockClear();
  });

  describe('given document with empty control-tags', () => {
    beforeEach(() => {
      mocks.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          'control-tags': {},
        },
      };
    });

    it('should call addControlTag with "New Tag" and "0" when clicked', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));

      expect(mocks.addControlTag).toHaveBeenCalledWith('New Tag', '0');
    });

    it('should push history operation when adding', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));

      expect(mocks.pushOperation).toHaveBeenCalled();
      const operation = mocks.pushOperation.mock.calls[0][0];
      expect(operation.type).toBe('add-control-tag');
    });
  });

  describe('given document with existing control-tags', () => {
    beforeEach(() => {
      mocks.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          'control-tags': {
            'New Tag': '0',
            Volume: '1',
          },
        },
      };
    });

    it('should generate unique name "New Tag 2" when "New Tag" exists', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));

      expect(mocks.addControlTag).toHaveBeenCalledWith('New Tag 2', '2');
    });
  });

  describe('given document with ID gaps', () => {
    beforeEach(() => {
      mocks.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          'control-tags': {
            Volume: '0',
            Pan: '2',
            Bypass: '3',
          },
        },
      };
    });

    it('should fill gap and assign ID "1"', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));

      expect(mocks.addControlTag).toHaveBeenCalledWith('New Tag', '1');
    });
  });
});
