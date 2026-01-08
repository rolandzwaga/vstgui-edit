import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { AddControlTagDialog } from '../AddControlTagDialog';

describe('AddControlTagDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onAdd: vi.fn(),
    existingTags: {} as Record<string, string>,
    suggestedName: 'New Tag',
    suggestedId: '0',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should not render when closed', () => {
      render(() => <AddControlTagDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('add-control-tag-dialog')).not.toBeInTheDocument();
    });

    it('should render when open', () => {
      render(() => <AddControlTagDialog {...defaultProps} />);

      expect(screen.getByTestId('add-control-tag-dialog')).toBeInTheDocument();
    });

    it('should show dialog title', () => {
      render(() => <AddControlTagDialog {...defaultProps} />);

      expect(screen.getByText('Add Control Tag')).toBeInTheDocument();
    });

    it('should pre-fill name with suggested value', () => {
      render(() => <AddControlTagDialog {...defaultProps} suggestedName="New Tag 2" />);

      const input = screen.getByTestId('dialog-name-input') as HTMLInputElement;
      expect(input.value).toBe('New Tag 2');
    });

    it('should pre-fill ID with suggested value', () => {
      render(() => <AddControlTagDialog {...defaultProps} suggestedId="5" />);

      const input = screen.getByTestId('dialog-id-input') as HTMLInputElement;
      expect(input.value).toBe('5');
    });

    it('should show Cancel and Add buttons', () => {
      render(() => <AddControlTagDialog {...defaultProps} />);

      expect(screen.getByTestId('dialog-cancel-button')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-add-button')).toBeInTheDocument();
    });
  });

  describe('cancel behavior', () => {
    it('should call onClose when Cancel clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(() => <AddControlTagDialog {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByTestId('dialog-cancel-button'));

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when Escape pressed', async () => {
      const onClose = vi.fn();
      render(() => <AddControlTagDialog {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(screen.getByTestId('add-control-tag-dialog'), { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(() => <AddControlTagDialog {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByTestId('dialog-backdrop'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('add behavior', () => {
    it('should call onAdd with name and ID when Add clicked', async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(() => <AddControlTagDialog {...defaultProps} onAdd={onAdd} />);

      await user.click(screen.getByTestId('dialog-add-button'));

      expect(onAdd).toHaveBeenCalledWith('New Tag', '0');
    });

    it('should call onAdd when Enter pressed in name input', async () => {
      const onAdd = vi.fn();
      render(() => <AddControlTagDialog {...defaultProps} onAdd={onAdd} />);

      const input = screen.getByTestId('dialog-name-input');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onAdd).toHaveBeenCalledWith('New Tag', '0');
    });

    it('should call onAdd when Enter pressed in ID input', async () => {
      const onAdd = vi.fn();
      render(() => <AddControlTagDialog {...defaultProps} onAdd={onAdd} />);

      const input = screen.getByTestId('dialog-id-input');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onAdd).toHaveBeenCalledWith('New Tag', '0');
    });

    it('should use edited values when Add clicked', async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(() => <AddControlTagDialog {...defaultProps} onAdd={onAdd} />);

      const nameInput = screen.getByTestId('dialog-name-input');
      const idInput = screen.getByTestId('dialog-id-input');

      await user.clear(nameInput);
      await user.type(nameInput, 'Volume');
      await user.clear(idInput);
      await user.type(idInput, '10');

      await user.click(screen.getByTestId('dialog-add-button'));

      expect(onAdd).toHaveBeenCalledWith('Volume', '10');
    });
  });

  describe('validation', () => {
    it('should show error for empty name', async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(() => <AddControlTagDialog {...defaultProps} onAdd={onAdd} />);

      const nameInput = screen.getByTestId('dialog-name-input');
      await user.clear(nameInput);
      await user.click(screen.getByTestId('dialog-add-button'));

      expect(screen.getByTestId('dialog-name-error')).toBeInTheDocument();
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('should show error for duplicate name', async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(() => (
        <AddControlTagDialog
          {...defaultProps}
          existingTags={{ Volume: '0' }}
          onAdd={onAdd}
        />
      ));

      const nameInput = screen.getByTestId('dialog-name-input');
      await user.clear(nameInput);
      await user.type(nameInput, 'Volume');
      await user.click(screen.getByTestId('dialog-add-button'));

      expect(screen.getByTestId('dialog-name-error')).toBeInTheDocument();
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('should show error for non-integer ID', async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(() => <AddControlTagDialog {...defaultProps} onAdd={onAdd} />);

      const idInput = screen.getByTestId('dialog-id-input');
      await user.clear(idInput);
      await user.type(idInput, 'abc');
      await user.click(screen.getByTestId('dialog-add-button'));

      expect(screen.getByTestId('dialog-id-error')).toBeInTheDocument();
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('should show error for duplicate ID', async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(() => (
        <AddControlTagDialog
          {...defaultProps}
          existingTags={{ Volume: '5' }}
          suggestedId="0"
          onAdd={onAdd}
        />
      ));

      const idInput = screen.getByTestId('dialog-id-input');
      await user.clear(idInput);
      await user.type(idInput, '5');
      await user.click(screen.getByTestId('dialog-add-button'));

      expect(screen.getByTestId('dialog-id-error')).toBeInTheDocument();
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('should reject negative IDs', async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(() => <AddControlTagDialog {...defaultProps} onAdd={onAdd} />);

      const idInput = screen.getByTestId('dialog-id-input');
      await user.clear(idInput);
      await user.type(idInput, '-1');
      await user.click(screen.getByTestId('dialog-add-button'));

      expect(screen.getByTestId('dialog-id-error')).toBeInTheDocument();
      expect(onAdd).not.toHaveBeenCalled();
    });
  });
});
