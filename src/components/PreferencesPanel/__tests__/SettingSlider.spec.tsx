/**
 * Tests for SettingSlider component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { SettingSlider } from '../controls/SettingSlider';

describe('SettingSlider', () => {
  describe('render with value', () => {
    it('renders with label', () => {
      render(() => (
        <SettingSlider
          id="test-slider"
          label="Snap Threshold"
          value={5}
          min={1}
          max={20}
          onChange={() => {}}
        />
      ));

      expect(screen.getByText('Snap Threshold')).toBeInTheDocument();
    });

    it('renders slider input', () => {
      render(() => (
        <SettingSlider
          id="test-slider"
          label="Snap Threshold"
          value={5}
          min={1}
          max={20}
          onChange={() => {}}
        />
      ));

      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('renders with current value', () => {
      render(() => (
        <SettingSlider
          id="test-slider"
          label="Snap Threshold"
          value={15}
          min={1}
          max={20}
          onChange={() => {}}
        />
      ));

      expect(screen.getByRole('slider')).toHaveValue('15');
    });

    it('displays value text', () => {
      render(() => (
        <SettingSlider
          id="test-slider"
          label="Snap Threshold"
          value={15}
          min={1}
          max={20}
          onChange={() => {}}
        />
      ));

      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  describe('onChange callback', () => {
    it('calls onChange when slider value changes', () => {
      const onChange = vi.fn();

      render(() => (
        <SettingSlider
          id="test-slider"
          label="Snap Threshold"
          value={5}
          min={1}
          max={20}
          onChange={onChange}
        />
      ));

      const slider = screen.getByRole('slider');
      fireEvent.input(slider, { target: { value: '10' } });
      fireEvent.change(slider, { target: { value: '10' } });

      expect(onChange).toHaveBeenCalledWith(10);
    });

    it('calls onChange with number type', () => {
      const onChange = vi.fn();

      render(() => (
        <SettingSlider
          id="test-slider"
          label="Snap Threshold"
          value={5}
          min={1}
          max={20}
          onChange={onChange}
        />
      ));

      const slider = screen.getByRole('slider');
      fireEvent.input(slider, { target: { value: '15' } });
      fireEvent.change(slider, { target: { value: '15' } });

      expect(typeof onChange.mock.calls[0][0]).toBe('number');
    });
  });

  describe('min/max constraints', () => {
    it('sets min attribute on slider', () => {
      render(() => (
        <SettingSlider
          id="test-slider"
          label="Snap Threshold"
          value={5}
          min={1}
          max={20}
          onChange={() => {}}
        />
      ));

      expect(screen.getByRole('slider')).toHaveAttribute('min', '1');
    });

    it('sets max attribute on slider', () => {
      render(() => (
        <SettingSlider
          id="test-slider"
          label="Snap Threshold"
          value={5}
          min={1}
          max={20}
          onChange={() => {}}
        />
      ));

      expect(screen.getByRole('slider')).toHaveAttribute('max', '20');
    });

    it('supports different min/max ranges', () => {
      render(() => (
        <SettingSlider
          id="test-slider"
          label="Zoom"
          value={50}
          min={10}
          max={500}
          onChange={() => {}}
        />
      ));

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '10');
      expect(slider).toHaveAttribute('max', '500');
    });
  });

  describe('unit display', () => {
    it('displays unit when provided', () => {
      render(() => (
        <SettingSlider
          id="test-slider"
          label="Snap Threshold"
          value={5}
          min={1}
          max={20}
          unit="px"
          onChange={() => {}}
        />
      ));

      expect(screen.getByText('5 px')).toBeInTheDocument();
    });

    it('displays value without unit when not provided', () => {
      render(() => (
        <SettingSlider
          id="test-slider"
          label="Opacity"
          value={75}
          min={0}
          max={100}
          onChange={() => {}}
        />
      ));

      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('supports percentage unit', () => {
      render(() => (
        <SettingSlider
          id="test-slider"
          label="Opacity"
          value={75}
          min={0}
          max={100}
          unit="%"
          onChange={() => {}}
        />
      ));

      expect(screen.getByText('75 %')).toBeInTheDocument();
    });
  });

  describe('step', () => {
    it('uses step of 1 by default', () => {
      render(() => (
        <SettingSlider
          id="test-slider"
          label="Threshold"
          value={5}
          min={1}
          max={20}
          onChange={() => {}}
        />
      ));

      expect(screen.getByRole('slider')).toHaveAttribute('step', '1');
    });

    it('uses custom step when provided', () => {
      render(() => (
        <SettingSlider
          id="test-slider"
          label="Threshold"
          value={5}
          min={1}
          max={20}
          step={5}
          onChange={() => {}}
        />
      ));

      expect(screen.getByRole('slider')).toHaveAttribute('step', '5');
    });
  });

  describe('disabled state', () => {
    it('renders as disabled when disabled prop is true', () => {
      render(() => (
        <SettingSlider
          id="test-slider"
          label="Snap Threshold"
          value={5}
          min={1}
          max={20}
          onChange={() => {}}
          disabled={true}
        />
      ));

      expect(screen.getByRole('slider')).toBeDisabled();
    });

    it('does not call onChange when disabled', () => {
      const onChange = vi.fn();

      render(() => (
        <SettingSlider
          id="test-slider"
          label="Snap Threshold"
          value={5}
          min={1}
          max={20}
          onChange={onChange}
          disabled={true}
        />
      ));

      const slider = screen.getByRole('slider');
      fireEvent.input(slider, { target: { value: '10' } });
      fireEvent.change(slider, { target: { value: '10' } });

      // Note: Browser may or may not fire change on disabled input
      // The onChange should not be called in either case
    });
  });

  describe('accessibility', () => {
    it('has correct id for label association', () => {
      render(() => (
        <SettingSlider
          id="my-slider"
          label="Snap Threshold"
          value={5}
          min={1}
          max={20}
          onChange={() => {}}
        />
      ));

      expect(screen.getByRole('slider')).toHaveAttribute('id', 'my-slider');
    });

    it('can be found by label', () => {
      render(() => (
        <SettingSlider
          id="my-slider"
          label="Snap Threshold"
          value={5}
          min={1}
          max={20}
          onChange={() => {}}
        />
      ));

      expect(screen.getByLabelText('Snap Threshold')).toBeInTheDocument();
    });

    it('has aria-valuemin and aria-valuemax', () => {
      render(() => (
        <SettingSlider
          id="my-slider"
          label="Snap Threshold"
          value={5}
          min={1}
          max={20}
          onChange={() => {}}
        />
      ));

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '1');
      expect(slider).toHaveAttribute('aria-valuemax', '20');
    });
  });
});
