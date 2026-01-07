import { describe, expect, it } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { ColorItem } from '../ColorItem';

describe('ColorItem', () => {
  describe('given name and value', () => {
    it('should render color name', () => {
      render(() => <ColorItem name="Background" value="#2d2d2dff" />);

      expect(screen.getByTestId('color-name')).toHaveTextContent('Background');
    });

    it('should render color value in lowercase', () => {
      render(() => <ColorItem name="Background" value="#2D2D2DFF" />);

      expect(screen.getByTestId('color-value')).toHaveTextContent('#2d2d2dff');
    });

    it('should render color swatch', () => {
      render(() => <ColorItem name="Background" value="#2d2d2dff" />);

      expect(screen.getByTestId('color-swatch')).toBeInTheDocument();
    });

    it('should have color-item test id', () => {
      render(() => <ColorItem name="Background" value="#2d2d2dff" />);

      expect(screen.getByTestId('color-item')).toBeInTheDocument();
    });
  });

  describe('given long name', () => {
    it('should truncate name with ellipsis', () => {
      const longName = 'This is a very long color name that exceeds the limit';
      render(() => <ColorItem name={longName} value="#ff0000" />);

      const nameElement = screen.getByTestId('color-name');
      expect(nameElement.textContent?.length).toBeLessThan(longName.length);
      expect(nameElement.textContent).toContain('…');
    });

    it('should show full name in title tooltip', () => {
      const longName = 'This is a very long color name that exceeds the limit';
      render(() => <ColorItem name={longName} value="#ff0000" />);

      const item = screen.getByTestId('color-item');
      expect(item).toHaveAttribute('title', longName);
    });
  });

  describe('given short name', () => {
    it('should not have title attribute', () => {
      render(() => <ColorItem name="Short" value="#ff0000" />);

      const item = screen.getByTestId('color-item');
      expect(item).not.toHaveAttribute('title');
    });
  });

  describe('given isReadOnly prop', () => {
    it('should apply readonly class', () => {
      render(() => <ColorItem name="~ BlackCColor" value="#000000ff" isReadOnly />);

      const item = screen.getByTestId('color-item');
      expect(item.className).toContain('readonly');
    });
  });
});
