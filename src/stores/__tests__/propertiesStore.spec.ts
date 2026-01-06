import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import {
  collapseGroup,
  expandGroup,
  isGroupExpanded,
  propertiesStore,
  resetProperties,
  toggleGroup,
} from '../propertiesStore';

describe('propertiesStore', () => {
  beforeEach(() => {
    testInRoot(() => {
      resetProperties();
    });
  });

  describe('initial state', () => {
    it('should have all collapsible groups expanded by default', () => {
      testInRoot(() => {
        expect(propertiesStore.expandedGroups.has('geometry')).toBe(true);
        expect(propertiesStore.expandedGroups.has('appearance')).toBe(true);
        expect(propertiesStore.expandedGroups.has('text')).toBe(true);
        expect(propertiesStore.expandedGroups.has('behavior')).toBe(true);
        expect(propertiesStore.expandedGroups.has('other')).toBe(true);
      });
    });

    it('should not include identity in expandedGroups (always visible)', () => {
      testInRoot(() => {
        expect(propertiesStore.expandedGroups.has('identity')).toBe(false);
      });
    });
  });

  describe('toggleGroup', () => {
    it('should collapse an expanded group', () => {
      testInRoot(() => {
        toggleGroup('geometry');
        expect(propertiesStore.expandedGroups.has('geometry')).toBe(false);
      });
    });

    it('should expand a collapsed group', () => {
      testInRoot(() => {
        toggleGroup('geometry');
        toggleGroup('geometry');
        expect(propertiesStore.expandedGroups.has('geometry')).toBe(true);
      });
    });

    it('should not affect other groups', () => {
      testInRoot(() => {
        toggleGroup('geometry');
        expect(propertiesStore.expandedGroups.has('appearance')).toBe(true);
        expect(propertiesStore.expandedGroups.has('text')).toBe(true);
      });
    });

    it('should be a no-op for identity group', () => {
      testInRoot(() => {
        const sizeBefore = propertiesStore.expandedGroups.size;
        toggleGroup('identity');
        expect(propertiesStore.expandedGroups.size).toBe(sizeBefore);
      });
    });
  });

  describe('expandGroup', () => {
    it('should add group to expandedGroups', () => {
      testInRoot(() => {
        toggleGroup('geometry');
        expandGroup('geometry');
        expect(propertiesStore.expandedGroups.has('geometry')).toBe(true);
      });
    });

    it('should be idempotent', () => {
      testInRoot(() => {
        expandGroup('geometry');
        expandGroup('geometry');
        expect(propertiesStore.expandedGroups.has('geometry')).toBe(true);
      });
    });

    it('should be a no-op for identity group', () => {
      testInRoot(() => {
        const sizeBefore = propertiesStore.expandedGroups.size;
        expandGroup('identity');
        expect(propertiesStore.expandedGroups.size).toBe(sizeBefore);
      });
    });
  });

  describe('collapseGroup', () => {
    it('should remove group from expandedGroups', () => {
      testInRoot(() => {
        collapseGroup('geometry');
        expect(propertiesStore.expandedGroups.has('geometry')).toBe(false);
      });
    });

    it('should be idempotent', () => {
      testInRoot(() => {
        collapseGroup('geometry');
        collapseGroup('geometry');
        expect(propertiesStore.expandedGroups.has('geometry')).toBe(false);
      });
    });

    it('should be a no-op for identity group', () => {
      testInRoot(() => {
        const sizeBefore = propertiesStore.expandedGroups.size;
        collapseGroup('identity');
        expect(propertiesStore.expandedGroups.size).toBe(sizeBefore);
      });
    });
  });

  describe('isGroupExpanded', () => {
    it('should return true for expanded groups', () => {
      testInRoot(() => {
        expect(isGroupExpanded('geometry')).toBe(true);
      });
    });

    it('should return false for collapsed groups', () => {
      testInRoot(() => {
        toggleGroup('geometry');
        expect(isGroupExpanded('geometry')).toBe(false);
      });
    });

    it('should always return true for identity group', () => {
      testInRoot(() => {
        expect(isGroupExpanded('identity')).toBe(true);
      });
    });
  });

  describe('resetProperties', () => {
    it('should restore all collapsible groups to expanded', () => {
      testInRoot(() => {
        toggleGroup('geometry');
        toggleGroup('appearance');
        toggleGroup('text');

        resetProperties();

        expect(propertiesStore.expandedGroups.has('geometry')).toBe(true);
        expect(propertiesStore.expandedGroups.has('appearance')).toBe(true);
        expect(propertiesStore.expandedGroups.has('text')).toBe(true);
        expect(propertiesStore.expandedGroups.has('behavior')).toBe(true);
        expect(propertiesStore.expandedGroups.has('other')).toBe(true);
      });
    });
  });
});
