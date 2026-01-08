import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { ControlTagItem } from '../ControlTagItem';

const mocks = vi.hoisted(() => ({
  getControlTags: vi.fn(() => ({ Volume: '0', Pan: '1' })),
  updateControlTagName: vi.fn(() => true),
  updateControlTagId: vi.fn(() => '0'),
  pushOperation: vi.fn(),
}));

vi.mock('../../../stores/documentStore', () => ({
  getControlTags: mocks.getControlTags,
  updateControlTagName: mocks.updateControlTagName,
  updateControlTagId: mocks.updateControlTagId,
}));

vi.mock('../../../stores/historyStore', () => ({
  pushOperation: mocks.pushOperation,
}));

describe('ControlTagItem - Edit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getControlTags.mockReturnValue({ Volume: '0', Pan: '1' });
  });

  describe('name editing', () => {
    it('should show input on double-click name', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagItem name="Volume" tagId="0" />);

      const name = screen.getByTestId('control-tag-name');
      await user.dblClick(name);

      expect(screen.getByTestId('control-tag-name-input')).toBeInTheDocument();
    });

    it('should save name on Enter', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagItem name="Volume" tagId="0" />);

      const name = screen.getByTestId('control-tag-name');
      await user.dblClick(name);

      const input = screen.getByTestId('control-tag-name-input');
      await user.clear(input);
      await user.type(input, 'Master Volume');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mocks.updateControlTagName).toHaveBeenCalledWith('Volume', 'Master Volume');
      expect(mocks.pushOperation).toHaveBeenCalled();
    });

    it('should cancel edit on Escape', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagItem name="Volume" tagId="0" />);

      const name = screen.getByTestId('control-tag-name');
      await user.dblClick(name);

      const input = screen.getByTestId('control-tag-name-input');
      await user.type(input, 'Changed');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(screen.queryByTestId('control-tag-name-input')).not.toBeInTheDocument();
      expect(mocks.updateControlTagName).not.toHaveBeenCalled();
    });

    it('should show error for duplicate name', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagItem name="Volume" tagId="0" />);

      const name = screen.getByTestId('control-tag-name');
      await user.dblClick(name);

      const input = screen.getByTestId('control-tag-name-input');
      await user.clear(input);
      await user.type(input, 'Pan');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(screen.getByTestId('control-tag-name-error')).toBeInTheDocument();
      expect(mocks.updateControlTagName).not.toHaveBeenCalled();
    });

    it('should show error for empty name', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagItem name="Volume" tagId="0" />);

      const name = screen.getByTestId('control-tag-name');
      await user.dblClick(name);

      const input = screen.getByTestId('control-tag-name-input');
      await user.clear(input);
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(screen.getByTestId('control-tag-name-error')).toBeInTheDocument();
      expect(mocks.updateControlTagName).not.toHaveBeenCalled();
    });
  });

  describe('ID editing', () => {
    it('should show input on click ID', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagItem name="Volume" tagId="0" />);

      const id = screen.getByTestId('control-tag-id');
      await user.click(id);

      expect(screen.getByTestId('control-tag-id-input')).toBeInTheDocument();
    });

    it('should save ID on Enter', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagItem name="Volume" tagId="0" />);

      const id = screen.getByTestId('control-tag-id');
      await user.click(id);

      const input = screen.getByTestId('control-tag-id-input');
      await user.clear(input);
      await user.type(input, '10');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mocks.updateControlTagId).toHaveBeenCalledWith('Volume', '10');
      expect(mocks.pushOperation).toHaveBeenCalled();
    });

    it('should show error for duplicate ID', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagItem name="Volume" tagId="0" />);

      const id = screen.getByTestId('control-tag-id');
      await user.click(id);

      const input = screen.getByTestId('control-tag-id-input');
      await user.clear(input);
      await user.type(input, '1');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(screen.getByTestId('control-tag-id-error')).toBeInTheDocument();
      expect(mocks.updateControlTagId).not.toHaveBeenCalled();
    });

    it('should show error for non-integer ID', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagItem name="Volume" tagId="0" />);

      const id = screen.getByTestId('control-tag-id');
      await user.click(id);

      const input = screen.getByTestId('control-tag-id-input');
      await user.clear(input);
      await user.type(input, 'abc');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(screen.getByTestId('control-tag-id-error')).toBeInTheDocument();
      expect(mocks.updateControlTagId).not.toHaveBeenCalled();
    });

    it('should reject negative IDs', async () => {
      const user = userEvent.setup();
      render(() => <ControlTagItem name="Volume" tagId="0" />);

      const id = screen.getByTestId('control-tag-id');
      await user.click(id);

      const input = screen.getByTestId('control-tag-id-input');
      await user.clear(input);
      await user.type(input, '-1');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(screen.getByTestId('control-tag-id-error')).toBeInTheDocument();
      expect(mocks.updateControlTagId).not.toHaveBeenCalled();
    });
  });
});
