import { describe, expect, it } from 'vitest';
import type { NewDocumentConfig } from '../../../types/createNew';
import {
  createDocument,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_ORIGIN,
  DEFAULT_TEMPLATE_NAME,
} from '../documentFactory';

describe('createDocument', () => {
  const defaultConfig: NewDocumentConfig = {
    width: 800,
    height: 600,
    containerClass: 'CViewContainer',
  };

  it('returns valid VSTGUIUIDescription structure', () => {
    const doc = createDocument(defaultConfig);

    expect(doc).toHaveProperty('vstgui-ui-description');
    expect(doc['vstgui-ui-description']).toHaveProperty('version');
    expect(doc['vstgui-ui-description']).toHaveProperty('templates');
  });

  it('uses config.width and config.height in size attribute', () => {
    const doc = createDocument({ width: 1024, height: 768, containerClass: 'CViewContainer' });

    const template = doc['vstgui-ui-description'].templates?.view;
    expect(template?.attributes.size).toBe('1024, 768');
  });

  it('uses config.containerClass in class attribute', () => {
    const doc = createDocument({ width: 400, height: 300, containerClass: 'CScrollView' });

    const template = doc['vstgui-ui-description'].templates?.view;
    expect(template?.attributes.class).toBe('CScrollView');
  });

  it('sets version "1"', () => {
    const doc = createDocument(defaultConfig);
    expect(doc['vstgui-ui-description'].version).toBe('1');
  });

  it('sets template name to "view"', () => {
    const doc = createDocument(defaultConfig);
    const templates = doc['vstgui-ui-description'].templates;

    expect(templates).toBeDefined();
    expect(templates).toHaveProperty('view');
  });

  it('sets origin to "0, 0"', () => {
    const doc = createDocument(defaultConfig);
    const template = doc['vstgui-ui-description'].templates?.view;

    expect(template?.attributes.origin).toBe('0, 0');
  });

  it('sets background-color to "~ BlackCColor"', () => {
    const doc = createDocument(defaultConfig);
    const template = doc['vstgui-ui-description'].templates?.view;

    expect(template?.attributes['background-color']).toBe('~ BlackCColor');
  });

  it('creates different documents for different container classes', () => {
    const scrollViewDoc = createDocument({
      width: 400,
      height: 300,
      containerClass: 'CScrollView',
    });
    const rowColumnDoc = createDocument({
      width: 400,
      height: 300,
      containerClass: 'CRowColumnView',
    });

    expect(scrollViewDoc['vstgui-ui-description'].templates?.view?.attributes.class).toBe(
      'CScrollView'
    );
    expect(rowColumnDoc['vstgui-ui-description'].templates?.view?.attributes.class).toBe(
      'CRowColumnView'
    );
  });
});

describe('constants', () => {
  it('DEFAULT_TEMPLATE_NAME is "view"', () => {
    expect(DEFAULT_TEMPLATE_NAME).toBe('view');
  });

  it('DEFAULT_ORIGIN is "0, 0"', () => {
    expect(DEFAULT_ORIGIN).toBe('0, 0');
  });

  it('DEFAULT_BACKGROUND_COLOR is "~ BlackCColor"', () => {
    expect(DEFAULT_BACKGROUND_COLOR).toBe('~ BlackCColor');
  });
});
