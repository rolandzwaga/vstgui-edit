import { type Accessor, createMemo } from 'solid-js';
import { parseSize } from '../../domain/canvas/coordinates';
import { flattenHierarchy } from '../../domain/canvas/flattenHierarchy';
import { documentStore, getParentId, getTemplate } from '../../stores/documentStore';
import { isViewOrAncestorHidden } from '../../stores/lockHideStore';
import { selectionStore } from '../../stores/selectionStore';
import { templateStore } from '../../stores/templateStore';
import type { RenderableView, TemplateBounds } from '../../types/canvas';
import type { TemplateDefinition } from '../../types/uidesc';

export interface UseCanvasDataResult {
  activeTemplate: Accessor<[string, TemplateDefinition] | null>;
  renderableViews: Accessor<RenderableView[]>;
  visibleViews: Accessor<RenderableView[]>;
  templateBounds: Accessor<TemplateBounds | null>;
  selectedViews: Accessor<RenderableView[]>;
  hoveredView: Accessor<RenderableView | null>;
  isEmpty: Accessor<boolean>;
}

export function useCanvasData(): UseCanvasDataResult {
  const activeTemplate = createMemo((): [string, TemplateDefinition] | null => {
    const activeId = templateStore.activeTemplateId;
    if (!activeId) return null;

    const template = getTemplate(activeId);
    if (!template) return null;

    return [activeId, template];
  });

  const renderableViews = createMemo((): RenderableView[] => {
    const template = activeTemplate();
    if (!template) return [];

    const doc = documentStore.document;
    const vstgui = doc?.['vstgui-ui-description'];

    const [name, view] = template;
    return flattenHierarchy(view, name, {
      fonts: vstgui?.fonts,
      colors: vstgui?.colors,
    });
  });

  const visibleViews = createMemo((): RenderableView[] => {
    const views = renderableViews();
    return views.filter(view => !isViewOrAncestorHidden(view.id, getParentId));
  });

  const templateBounds = createMemo((): TemplateBounds | null => {
    const template = activeTemplate();
    if (!template) return null;

    const [, view] = template;
    const size = parseSize(view.attributes.size);

    return {
      width: size.width,
      height: size.height,
    };
  });

  const isEmpty = () => activeTemplate() === null;

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
    activeTemplate,
    renderableViews,
    visibleViews,
    templateBounds,
    selectedViews,
    hoveredView,
    isEmpty,
  };
}
