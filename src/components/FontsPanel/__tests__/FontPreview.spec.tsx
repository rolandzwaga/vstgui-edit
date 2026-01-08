import { describe, expect, it } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { FontPreview } from '../FontPreview';

describe('FontPreview', () => {
  describe('given basic font', () => {
    it('should render Aa text', () => {
      render(() => <FontPreview fontName="Arial" fontSize="12" />);

      expect(screen.getByText('Aa')).toBeInTheDocument();
    });

    it('should apply font-family style', () => {
      render(() => <FontPreview fontName="Helvetica" fontSize="14" />);

      const text = screen.getByText('Aa');
      expect(text).toHaveStyle({ 'font-family': 'Helvetica' });
    });
  });

  describe('given bold font', () => {
    it('should apply bold weight', () => {
      render(() => <FontPreview fontName="Arial" fontSize="12" bold />);

      const text = screen.getByText('Aa');
      expect(text).toHaveStyle({ 'font-weight': 'bold' });
    });
  });

  describe('given italic font', () => {
    it('should apply italic style', () => {
      render(() => <FontPreview fontName="Arial" fontSize="12" italic />);

      const text = screen.getByText('Aa');
      expect(text).toHaveStyle({ 'font-style': 'italic' });
    });
  });

  describe('given size prop', () => {
    it('should apply sm class by default', () => {
      render(() => <FontPreview fontName="Arial" fontSize="12" />);

      const preview = screen.getByTestId('font-preview');
      expect(preview.className).toContain('sm');
    });

    it('should apply md class when specified', () => {
      render(() => <FontPreview fontName="Arial" fontSize="12" size="md" />);

      const preview = screen.getByTestId('font-preview');
      expect(preview.className).toContain('md');
    });

    it('should apply lg class when specified', () => {
      render(() => <FontPreview fontName="Arial" fontSize="12" size="lg" />);

      const preview = screen.getByTestId('font-preview');
      expect(preview.className).toContain('lg');
    });
  });
});
