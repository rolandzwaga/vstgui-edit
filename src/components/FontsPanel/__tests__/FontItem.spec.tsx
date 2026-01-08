import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { FontItem } from '../FontItem';
import type { FontDefinition } from '../../../types/uidesc';

vi.mock('../../../stores/documentStore', () => ({
  getFonts: vi.fn(() => ({})),
  updateFontName: vi.fn(() => true),
}));

vi.mock('../../../stores/historyStore', () => ({
  pushOperation: vi.fn(),
}));

describe('FontItem', () => {
  const defaultProps = {
    name: 'TestFont',
    fontDef: {
      'font-name': 'Arial',
      size: '12',
    } as FontDefinition,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('given basic font', () => {
    it('should render font name', () => {
      render(() => <FontItem {...defaultProps} />);

      expect(screen.getByTestId('font-name')).toHaveTextContent('TestFont');
    });

    it('should render font summary', () => {
      render(() => <FontItem {...defaultProps} />);

      expect(screen.getByTestId('font-summary')).toHaveTextContent('Arial 12pt');
    });

    it('should render font preview', () => {
      render(() => <FontItem {...defaultProps} />);

      expect(screen.getByTestId('font-preview')).toBeInTheDocument();
    });
  });

  describe('given font with bold and italic', () => {
    it('should show B and I in summary', () => {
      const props = {
        name: 'StyledFont',
        fontDef: {
          'font-name': 'Helvetica',
          size: '14',
          bold: 'true',
          italic: 'true',
        } as FontDefinition,
      };

      render(() => <FontItem {...props} />);

      expect(screen.getByTestId('font-summary')).toHaveTextContent('Helvetica 14pt B I');
    });
  });

  describe('given long font name', () => {
    it('should truncate name exceeding 30 chars', () => {
      const props = {
        ...defaultProps,
        name: 'ThisIsAVeryLongFontNameThatExceedsThirtyCharacters',
      };

      render(() => <FontItem {...props} />);

      const nameEl = screen.getByTestId('font-name');
      expect(nameEl.textContent).toContain('…');
      expect(nameEl.textContent?.length).toBeLessThan(
        props.name.length
      );
    });
  });

  describe('given usageCount', () => {
    it('should render usage badge when count > 0', () => {
      render(() => <FontItem {...defaultProps} usageCount={3} />);

      expect(screen.getByTestId('usage-badge')).toHaveTextContent('3');
    });

    it('should not render usage badge when count is 0', () => {
      render(() => <FontItem {...defaultProps} usageCount={0} />);

      expect(screen.queryByTestId('usage-badge')).not.toBeInTheDocument();
    });
  });

  describe('given isReadOnly', () => {
    it('should have readonly class', () => {
      render(() => <FontItem {...defaultProps} isReadOnly />);

      const item = screen.getByTestId('font-item');
      expect(item.className).toContain('readonly');
    });
  });
});
