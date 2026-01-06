import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { AttributeGroup } from '../AttributeGroup';
import type { AttributeGroup as AttributeGroupType } from '../../../types/properties';

describe('AttributeGroup', () => {
  const createGroup = (overrides: Partial<AttributeGroupType> = {}): AttributeGroupType => ({
    id: 'geometry',
    label: 'Geometry',
    priority: 1,
    attributes: [
      { name: 'origin', value: '10, 20', isMixed: false, isCopyable: true },
      { name: 'size', value: '100, 50', isMixed: false, isCopyable: true },
    ],
    ...overrides,
  });

  describe('basic rendering', () => {
    it('should render group label', () => {
      render(() => <AttributeGroup group={createGroup()} isExpanded={true} />);

      expect(screen.getByText('Geometry')).toBeInTheDocument();
    });

    it('should render all attributes when expanded', () => {
      render(() => <AttributeGroup group={createGroup()} isExpanded={true} />);

      expect(screen.getByText('origin')).toBeInTheDocument();
      expect(screen.getByText('size')).toBeInTheDocument();
    });

    it('should have attribute-group test id', () => {
      render(() => <AttributeGroup group={createGroup()} isExpanded={true} />);

      expect(screen.getByTestId('attribute-group')).toBeInTheDocument();
    });
  });

  describe('collapsed state', () => {
    it('should hide attributes when collapsed', () => {
      render(() => <AttributeGroup group={createGroup()} isExpanded={false} />);

      expect(screen.queryByText('origin')).not.toBeInTheDocument();
      expect(screen.queryByText('size')).not.toBeInTheDocument();
    });

    it('should still show group header when collapsed', () => {
      render(() => <AttributeGroup group={createGroup()} isExpanded={false} />);

      expect(screen.getByText('Geometry')).toBeInTheDocument();
    });
  });

  describe('identity group', () => {
    it('should always show attributes for identity group even when collapsed', () => {
      const identityGroup = createGroup({
        id: 'identity',
        label: 'Identity',
        priority: 0,
        attributes: [{ name: 'class', value: 'CView', isMixed: false, isCopyable: true }],
      });

      render(() => <AttributeGroup group={identityGroup} isExpanded={false} />);

      expect(screen.getByText('class')).toBeInTheDocument();
    });

    it('should not show collapse indicator for identity group', () => {
      const identityGroup = createGroup({
        id: 'identity',
        label: 'Identity',
        priority: 0,
        attributes: [{ name: 'class', value: 'CView', isMixed: false, isCopyable: true }],
      });

      render(() => <AttributeGroup group={identityGroup} isExpanded={true} />);

      expect(screen.queryByTestId('collapse-indicator')).not.toBeInTheDocument();
    });
  });

  describe('toggle callback', () => {
    it('should call onToggle when header is clicked', async () => {
      const onToggle = vi.fn();
      const { container } = render(() => (
        <AttributeGroup group={createGroup()} isExpanded={true} onToggle={onToggle} />
      ));

      const header = container.querySelector('[data-testid="group-header"]');
      header?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onToggle).toHaveBeenCalled();
    });

    it('should not call onToggle for identity group', async () => {
      const onToggle = vi.fn();
      const identityGroup = createGroup({
        id: 'identity',
        label: 'Identity',
        priority: 0,
      });

      const { container } = render(() => (
        <AttributeGroup group={identityGroup} isExpanded={true} onToggle={onToggle} />
      ));

      const header = container.querySelector('[data-testid="group-header"]');
      header?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('chevron indicator', () => {
    it('should show down chevron when expanded', () => {
      render(() => <AttributeGroup group={createGroup()} isExpanded={true} />);

      const indicator = screen.getByTestId('collapse-indicator');
      expect(indicator).toHaveTextContent('▼');
    });

    it('should show right chevron when collapsed', () => {
      render(() => <AttributeGroup group={createGroup()} isExpanded={false} />);

      const indicator = screen.getByTestId('collapse-indicator');
      expect(indicator).toHaveTextContent('▶');
    });
  });
});
