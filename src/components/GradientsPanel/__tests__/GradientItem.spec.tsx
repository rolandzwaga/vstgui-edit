import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import type { GradientColorStop } from '../../../types/uidesc';
import { GradientItem } from '../GradientItem';

vi.mock('../../../stores/documentStore', () => ({
  getGradients: vi.fn(() => ({})),
  updateGradientName: vi.fn(() => true),
  updateGradientStops: vi.fn(() => []),
}));

vi.mock('../../../stores/historyStore', () => ({
  pushOperation: vi.fn(),
}));

describe('GradientItem', () => {
  const defaultStops: GradientColorStop[] = [
    { rgba: '#000000FF', start: '0.00' },
    { rgba: '#FFFFFFFF', start: '1.00' },
  ];

  const defaultProps = {
    name: 'TestGradient',
    stops: defaultStops,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('given basic gradient', () => {
    it('should render gradient name', () => {
      render(() => <GradientItem {...defaultProps} />);

      expect(screen.getByTestId('gradient-name')).toHaveTextContent('TestGradient');
    });

    it('should render stop count summary', () => {
      render(() => <GradientItem {...defaultProps} />);

      expect(screen.getByTestId('gradient-summary')).toHaveTextContent('2 stops');
    });

    it('should render gradient preview', () => {
      render(() => <GradientItem {...defaultProps} />);

      expect(screen.getByTestId('gradient-preview')).toBeInTheDocument();
    });

    it('should render singular stop text for 1 stop', () => {
      const props = {
        ...defaultProps,
        stops: [{ rgba: '#FF0000FF', start: '0.50' }],
      };

      render(() => <GradientItem {...props} />);

      expect(screen.getByTestId('gradient-summary')).toHaveTextContent('1 stop');
    });
  });

  describe('given long gradient name', () => {
    it('should truncate name exceeding 24 chars', () => {
      const props = {
        ...defaultProps,
        name: 'ThisIsAVeryLongGradientNameThatExceedsTwentyFourCharacters',
      };

      render(() => <GradientItem {...props} />);

      const nameEl = screen.getByTestId('gradient-name');
      expect(nameEl.textContent).toContain('...');
      expect(nameEl.textContent!.length).toBeLessThan(props.name.length);
    });

    it('should show full name in tooltip', () => {
      const props = {
        ...defaultProps,
        name: 'ThisIsAVeryLongGradientNameThatExceedsTwentyFourCharacters',
      };

      render(() => <GradientItem {...props} />);

      const item = screen.getByTestId('gradient-item');
      expect(item).toHaveAttribute('title', props.name);
    });
  });

  describe('given usageCount', () => {
    it('should render usage badge when count > 0', () => {
      render(() => <GradientItem {...defaultProps} usageCount={3} />);

      expect(screen.getByTestId('usage-badge')).toHaveTextContent('3');
    });

    it('should not render usage badge when count is 0', () => {
      render(() => <GradientItem {...defaultProps} usageCount={0} />);

      expect(screen.queryByTestId('usage-badge')).not.toBeInTheDocument();
    });

    it('should call onUsageClick when badge clicked', async () => {
      const user = userEvent.setup();
      const onUsageClick = vi.fn();
      render(() => <GradientItem {...defaultProps} usageCount={2} onUsageClick={onUsageClick} />);

      await user.click(screen.getByTestId('usage-badge'));

      expect(onUsageClick).toHaveBeenCalledWith('TestGradient');
    });
  });

  describe('given expand/collapse functionality', () => {
    it('should show expand icon by default', () => {
      render(() => <GradientItem {...defaultProps} />);

      expect(screen.getByTestId('expand-icon')).toHaveTextContent('▼');
    });

    it('should expand when clicked', async () => {
      const user = userEvent.setup();
      render(() => <GradientItem {...defaultProps} />);

      await user.click(screen.getByTestId('gradient-item'));

      expect(screen.getByTestId('expand-icon')).toHaveTextContent('▲');
    });

    it('should show stop editor when expanded', async () => {
      const user = userEvent.setup();
      render(() => <GradientItem {...defaultProps} />);

      await user.click(screen.getByTestId('gradient-item'));

      expect(screen.getByTestId('gradient-stop-editor')).toBeInTheDocument();
    });

    it('should collapse when clicked again', async () => {
      const user = userEvent.setup();
      render(() => <GradientItem {...defaultProps} />);

      await user.click(screen.getByTestId('gradient-item'));
      await user.click(screen.getByTestId('gradient-item'));

      expect(screen.getByTestId('expand-icon')).toHaveTextContent('▼');
      expect(screen.queryByTestId('gradient-stop-editor')).not.toBeInTheDocument();
    });
  });

  describe('given rename functionality', () => {
    it('should enter edit mode on double-click', async () => {
      const user = userEvent.setup();
      render(() => <GradientItem {...defaultProps} />);

      await user.dblClick(screen.getByTestId('gradient-name'));

      expect(screen.getByTestId('gradient-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('gradient-name-input')).toHaveValue('TestGradient');
    });

    it('should focus input when entering edit mode', async () => {
      const user = userEvent.setup();
      render(() => <GradientItem {...defaultProps} />);

      await user.dblClick(screen.getByTestId('gradient-name'));

      expect(screen.getByTestId('gradient-name-input')).toHaveFocus();
    });

    it('should save name on Enter', async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      render(() => <GradientItem {...defaultProps} onRename={onRename} />);

      await user.dblClick(screen.getByTestId('gradient-name'));
      const input = screen.getByTestId('gradient-name-input');
      await user.clear(input);
      await user.type(input, 'RenamedGradient{Enter}');

      expect(onRename).toHaveBeenCalledWith('TestGradient', 'RenamedGradient');
    });

    it('should save name on blur', async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      render(() => <GradientItem {...defaultProps} onRename={onRename} />);

      await user.dblClick(screen.getByTestId('gradient-name'));
      const input = screen.getByTestId('gradient-name-input');
      await user.clear(input);
      await user.type(input, 'RenamedGradient');
      fireEvent.blur(input);

      expect(onRename).toHaveBeenCalledWith('TestGradient', 'RenamedGradient');
    });

    it('should cancel edit on Escape', async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      render(() => <GradientItem {...defaultProps} onRename={onRename} />);

      await user.dblClick(screen.getByTestId('gradient-name'));
      await user.keyboard('{Escape}');

      expect(screen.queryByTestId('gradient-name-input')).not.toBeInTheDocument();
      expect(screen.getByTestId('gradient-name')).toHaveTextContent('TestGradient');
      expect(onRename).not.toHaveBeenCalled();
    });

    it('should not save if name unchanged', async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      render(() => <GradientItem {...defaultProps} onRename={onRename} />);

      await user.dblClick(screen.getByTestId('gradient-name'));
      await user.keyboard('{Enter}');

      expect(onRename).not.toHaveBeenCalled();
    });

    it('should show error for empty name', async () => {
      const user = userEvent.setup();
      render(() => <GradientItem {...defaultProps} />);

      await user.dblClick(screen.getByTestId('gradient-name'));
      const input = screen.getByTestId('gradient-name-input');
      await user.clear(input);
      await user.keyboard('{Enter}');

      expect(screen.getByTestId('gradient-name-error')).toBeInTheDocument();
    });

    it('should show error for duplicate name', async () => {
      const user = userEvent.setup();
      render(() => <GradientItem {...defaultProps} existingNames={['OtherGradient']} />);

      await user.dblClick(screen.getByTestId('gradient-name'));
      const input = screen.getByTestId('gradient-name-input');
      await user.clear(input);
      await user.type(input, 'OtherGradient{Enter}');

      expect(screen.getByTestId('gradient-name-error')).toBeInTheDocument();
    });
  });

  describe('given delete functionality', () => {
    it('should show delete button on hover', async () => {
      const user = userEvent.setup();
      render(() => <GradientItem {...defaultProps} onDelete={() => {}} />);

      await user.hover(screen.getByTestId('gradient-item'));

      expect(screen.getByTestId('delete-gradient-button')).toBeInTheDocument();
    });

    it('should hide delete button when not hovered', () => {
      render(() => <GradientItem {...defaultProps} onDelete={() => {}} />);

      expect(screen.queryByTestId('delete-gradient-button')).not.toBeInTheDocument();
    });

    it('should call onDelete when delete button clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(() => <GradientItem {...defaultProps} onDelete={onDelete} />);

      await user.hover(screen.getByTestId('gradient-item'));
      await user.click(screen.getByTestId('delete-gradient-button'));

      expect(onDelete).toHaveBeenCalledWith('TestGradient');
    });
  });
});
