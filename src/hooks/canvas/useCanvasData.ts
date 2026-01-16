import { type Accessor, createMemo } from 'solid-js';
import { parseSize } from '../../domain/canvas/coordinates';
import { flattenHierarchy } from '../../domain/canvas/flattenHierarchy';
import { buildStyledViewProps } from '../../domain/viewMode/styledViewProps';
import { documentStore, getParentId, getTemplate, getView } from '../../stores/documentStore';
import { isViewOrAncestorHidden } from '../../stores/lockHideStore';
import { selectionStore } from '../../stores/selectionStore';
import { templateStore } from '../../stores/templateStore';
import type { RenderableView, TemplateBounds } from '../../types/canvas';
import type { TemplateDefinition } from '../../types/uidesc';
import type { StyledViewProps } from '../../types/viewMode';

export interface UseCanvasDataResult {
  activeTemplate: Accessor<[string, TemplateDefinition] | null>;
  renderableViews: Accessor<RenderableView[]>;
  visibleViews: Accessor<RenderableView[]>;
  templateBounds: Accessor<TemplateBounds | null>;
  selectedViews: Accessor<RenderableView[]>;
  hoveredView: Accessor<RenderableView | null>;
  isEmpty: Accessor<boolean>;
  /** Map of view ID to styled props for styled mode rendering */
  styledViewPropsMap: Accessor<Map<string, StyledViewProps>>;
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
    // Filter out hidden views - they shouldn't show selection overlay
    return views.filter(
      view => selectedIds.has(view.id) && !isViewOrAncestorHidden(view.id, getParentId)
    );
  });

  const hoveredView = createMemo((): RenderableView | null => {
    const hoveredId = selectionStore.hoveredId;
    if (!hoveredId) return null;
    return renderableViews().find(v => v.id === hoveredId) ?? null;
  });

  /**
   * Computes styled view props for all visible views.
   * Uses the document's colors definition for color resolution.
   */
  const styledViewPropsMap = createMemo((): Map<string, StyledViewProps> => {
    const views = visibleViews();
    const doc = documentStore.document;
    const documentColors = doc?.['vstgui-ui-description']?.colors;
    const map = new Map<string, StyledViewProps>();

    for (const view of views) {
      const viewNode = getView(view.id);
      if (viewNode) {
        const styledProps = buildStyledViewProps(viewNode.attributes, documentColors);
        map.set(view.id, styledProps);
      }
    }

    return map;
  });

  return {
    activeTemplate,
    renderableViews,
    visibleViews,
    templateBounds,
    selectedViews,
    hoveredView,
    isEmpty,
    styledViewPropsMap,
  };
}
