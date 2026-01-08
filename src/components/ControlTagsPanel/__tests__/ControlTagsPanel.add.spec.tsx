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

describe('ControlTagsPanel - Add Control Tag via Dialog', () => {
  beforeEach(() => {
    mocks.document = null;
    mocks.addControlTag.mockClear();
    mocks.pushOperation.mockClear();
  });

  describe('dialog opening', () => {
    beforeEach(() => {
      mocks.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          'control-tags': {},
        },
      };
    });

    it('should open dialog when add button clicked', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));

      expect(screen.getByTestId('add-control-tag-dialog')).toBeInTheDocument();
    });

    it('should pre-fill dialog with suggested name and ID', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));

      const nameInput = screen.getByTestId('dialog-name-input') as HTMLInputElement;
      const idInput = screen.getByTestId('dialog-id-input') as HTMLInputElement;

      expect(nameInput.value).toBe('New Tag');
      expect(idInput.value).toBe('0');
    });
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

    it('should call addControlTag when Add clicked in dialog', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));
      await user.click(screen.getByTestId('dialog-add-button'));

      expect(mocks.addControlTag).toHaveBeenCalledWith('New Tag', '0');
    });

    it('should push history operation when adding', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));
      await user.click(screen.getByTestId('dialog-add-button'));

      expect(mocks.pushOperation).toHaveBeenCalled();
      const operation = mocks.pushOperation.mock.calls[0][0];
      expect(operation.type).toBe('add-control-tag');
    });

    it('should close dialog after adding', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));
      await user.click(screen.getByTestId('dialog-add-button'));

      expect(screen.queryByTestId('add-control-tag-dialog')).not.toBeInTheDocument();
    });

    it('should not add when Cancel clicked', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));
      await user.click(screen.getByTestId('dialog-cancel-button'));

      expect(mocks.addControlTag).not.toHaveBeenCalled();
      expect(screen.queryByTestId('add-control-tag-dialog')).not.toBeInTheDocument();
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

    it('should suggest unique name "New Tag 2" when "New Tag" exists', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));

      const nameInput = screen.getByTestId('dialog-name-input') as HTMLInputElement;
      expect(nameInput.value).toBe('New Tag 2');
    });

    it('should suggest next available ID', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));

      const idInput = screen.getByTestId('dialog-id-input') as HTMLInputElement;
      expect(idInput.value).toBe('2');
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

    it('should suggest gap-filling ID "1"', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));

      const idInput = screen.getByTestId('dialog-id-input') as HTMLInputElement;
      expect(idInput.value).toBe('1');
    });
  });

  describe('custom values', () => {
    beforeEach(() => {
      mocks.document = {
        'vstgui-ui-description': {
          version: '1',
          templates: {},
          'control-tags': {},
        },
      };
    });

    it('should allow user to enter custom name and ID', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagsPanel />);

      await user.click(screen.getByTestId('add-control-tag-button'));

      const nameInput = screen.getByTestId('dialog-name-input');
      const idInput = screen.getByTestId('dialog-id-input');

      await user.clear(nameInput);
      await user.type(nameInput, 'CustomTag');
      await user.clear(idInput);
      await user.type(idInput, '99');

      await user.click(screen.getByTestId('dialog-add-button'));

      expect(mocks.addControlTag).toHaveBeenCalledWith('CustomTag', '99');
    });
  });
});
