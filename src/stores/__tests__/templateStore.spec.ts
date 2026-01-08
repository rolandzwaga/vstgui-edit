import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import { resetSelection, select, selectionStore } from '../selectionStore';
import { resetTemplateStore, setActiveTemplate, templateStore } from '../templateStore';

describe('templateStore', () => {
  beforeEach(() => {
    resetTemplateStore();
    resetSelection();
  });

  describe('initial state', () => {
    it('should have null activeTemplateId initially', () => {
      testInRoot(() => {
        expect(templateStore.activeTemplateId).toBeNull();
      });
    });
  });

  describe('setActiveTemplate', () => {
    it('should set activeTemplateId to provided value', () => {
      testInRoot(() => {
        setActiveTemplate('MainView');
        expect(templateStore.activeTemplateId).toBe('MainView');
      });
    });

    it('should update activeTemplateId when changed', () => {
      testInRoot(() => {
        setActiveTemplate('MainView');
        setActiveTemplate('SettingsView');
        expect(templateStore.activeTemplateId).toBe('SettingsView');
      });
    });

    it('should allow setting to null', () => {
      testInRoot(() => {
        setActiveTemplate('MainView');
        setActiveTemplate(null);
        expect(templateStore.activeTemplateId).toBeNull();
      });
    });

    it('should clear selection when template changes', () => {
      testInRoot(() => {
        select('view-1');
        expect(selectionStore.selectedIds.size).toBe(1);

        setActiveTemplate('MainView');
        setActiveTemplate('SettingsView');

        expect(selectionStore.selectedIds.size).toBe(0);
      });
    });

    it('should not clear selection when setting same template', () => {
      testInRoot(() => {
        setActiveTemplate('MainView');
        select('view-1');
        expect(selectionStore.selectedIds.size).toBe(1);

        setActiveTemplate('MainView');

        expect(selectionStore.selectedIds.size).toBe(1);
      });
    });
  });

  describe('resetTemplateStore', () => {
    it('should reset activeTemplateId to null', () => {
      testInRoot(() => {
        setActiveTemplate('MainView');
        resetTemplateStore();
        expect(templateStore.activeTemplateId).toBeNull();
      });
    });
  });
});
