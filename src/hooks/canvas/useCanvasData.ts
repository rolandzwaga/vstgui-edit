import { type Accessor, createMemo } from 'solid-js';
import { parseSize } from '../../domain/canvas/coordinates';
import { flattenHierarchy } from '../../domain/canvas/flattenHierarchy';
import { documentStore } from '../../stores/documentStore';
import { selectionStore } from '../../stores/selectionStore';
import type { RenderableView, TemplateBounds } from '../../types/canvas';
import type { TemplateDefinition } from '../../types/uidesc';

export interface UseCanvasDataResult {
  firstTemplate: Accessor<[string, TemplateDefinition] | null>;
  renderableViews: Accessor<RenderableView[]>;
  templateBounds: Accessor<TemplateBounds | null>;
  selectedViews: Accessor<RenderableView[]>;
  hoveredView: Accessor<RenderableView | null>;
  isEmpty: Accessor<boolean>;
}

export function useCanvasData(): UseCanvasDataResult {
  const templates = () => {
    const doc = documentStore.document;
    if (!doc) return null;

    const vstgui = doc['vstgui-ui-description'];
    if (!vstgui) return null;

    return vstgui.templates ?? null;
  };

  const firstTemplate = createMemo((): [string, TemplateDefinition] | null => {
    const t = templates();
    if (!t) return null;

    const entries = Object.entries(t) as [string, TemplateDefinition][];
    if (entries.length === 0) return null;

    return entries[0];
  });

  const renderableViews = createMemo((): RenderableView[] => {
    const template = firstTemplate();
    if (!template) return [];

    const doc = documentStore.document;
    const vstgui = doc?.['vstgui-ui-description'];

    const [name, view] = template;
    return flattenHierarchy(view, name, {
      fonts: vstgui?.fonts,
      colors: vstgui?.colors,
    });
  });

  const templateBounds = createMemo((): TemplateBounds | null => {
    const template = firstTemplate();
    if (!template) return null;

    const [, view] = template;
    const size = parseSize(view.attributes.size);

    return {
      width: size.width,
      height: size.height,
    };
  });

  const isEmpty = () => firstTemplate() === null;

  const selectedViews = createMemo((): RenderableView[] => {
    const views = renderableViews();
    const selectedIds = selectionStore.selectedIds;
    return views.filter(view => selectedIds.has(view.id));
  });

  const hoveredView = createMemo((): RenderableView | null => {
    const hoveredId = selectionStore.hoveredId;
    if (!hoveredId) return null;
    return renderableViews().find(v => v.id === hoveredId) ?? null;
  });

  return {
    firstTemplate,
    renderableViews,
    templateBounds,
    selectedViews,
    hoveredView,
    isEmpty,
  };
}
