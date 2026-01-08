import { describe, it, expect, beforeEach } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import { templateStore, setActiveTemplate, resetTemplateStore } from '../templateStore';

describe('templateStore', () => {
  beforeEach(() => {
    resetTemplateStore();
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
