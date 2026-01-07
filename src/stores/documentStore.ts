import { createStore, produce } from 'solid-js/store';
import { formatOrigin, parsePoint } from '../domain/canvas';
import { parseUidesc } from '../domain/parser';
import type { DocumentMetadata, DocumentStoreState } from '../types';
import type { Point, Size } from '../types/canvas';
import type { ViewNode, VSTGUIUIDescription } from '../types/uidesc';
import { resetCanvas } from './canvasStore';

function parseSizeRaw(size: string | undefined): Size {
  if (!size) {
    return { width: 0, height: 0 };
  }
  const parts = size.split(',');
  if (parts.length !== 2) {
    return { width: 0, height: 0 };
  }
  const width = Number.parseInt(parts[0].trim(), 10);
  const height = Number.parseInt(parts[1].trim(), 10);
  if (Number.isNaN(width) || Number.isNaN(height)) {
    return { width: 0, height: 0 };
  }
  return { width, height };
}

function formatSize(size: Size): string {
  return `${Math.round(size.width)}, ${Math.round(size.height)}`;
}

const initialState: DocumentStoreState = {
  // Upload state (from 001-uidesc-upload)
  content: null,
  metadata: null,
  uploadState: 'idle',
  error: null,
  // Parse state (from 002-uidesc-parsing)
  document: null,
  parseState: 'idle',
  parseErrors: null,
  detectedFormat: null,
};

const [store, setStore] = createStore<DocumentStoreState>({ ...initialState });

/**
 * Validates that the file has a .uidesc extension (case-insensitive)
 */
function validateExtension(filename: string): boolean {
  return filename.toLowerCase().endsWith('.uidesc');
}

/**
 * Reads a file as text using FileReader
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Parse the content and update parse state
 * FR-000: Automatically triggered after successful file upload
 */
function parseContent(content: string): void {
  // Set parsing state
  setStore({ parseState: 'parsing' });

  const result = parseUidesc(content);

  if (result.success) {
    // FR-009: Reset canvas (pan and zoom) on new document load
    resetCanvas();

    setStore({
      parseState: 'valid',
      document: result.document,
      parseErrors: null,
      detectedFormat: result.format,
    });
  } else {
    setStore({
      parseState: 'invalid',
      document: null,
      parseErrors: result.errors,
      detectedFormat: result.format,
    });
  }
}

/**
 * Load a file into the document store
 * Validates extension and empty file, stores raw string content
 */
export async function loadFile(file: File): Promise<void> {
  // Validate extension first
  if (!validateExtension(file.name)) {
    setStore({
      uploadState: 'error',
      error: {
        type: 'invalid-extension',
        filename: file.name,
        message: `File "${file.name}" is not a .uidesc file`,
      },
    });
    return;
  }

  // Set loading state
  setStore({ uploadState: 'loading', error: null });

  try {
    const content = await readFileAsText(file);

    // Check for empty file
    if (content.length === 0) {
      setStore({
        uploadState: 'error',
        error: {
          type: 'empty-file',
          message: 'The file is empty',
        },
      });
      return;
    }

    // Success - store raw content and metadata
    const metadata: DocumentMetadata = {
      filename: file.name,
      fileSize: content.length,
      loadedAt: new Date(),
    };

    setStore({
      content,
      metadata,
      uploadState: 'success',
      error: null,
    });

    // FR-000: Automatically trigger parsing after successful upload
    parseContent(content);
  } catch {
    setStore({
      uploadState: 'error',
      error: {
        type: 'empty-file',
        message: 'Failed to read file',
      },
    });
  }
}

/**
 * Reset the store to initial state
 */
export function reset(): void {
  setStore({ ...initialState });
}

/**
 * Set the dragging state
 * Only transitions from idle to dragging or dragging to idle
 */
export function setDragging(isDragging: boolean): void {
  if (isDragging) {
    setStore({ uploadState: 'dragging' });
  } else if (store.uploadState === 'dragging') {
    setStore({ uploadState: 'idle' });
  }
}

export const documentStore = store;

export function setDocumentForTest(doc: VSTGUIUIDescription): void {
  setStore({
    document: doc,
    parseState: 'valid',
    parseErrors: null,
    detectedFormat: 'json',
  });
}

export function getView(viewId: string): ViewNode | null {
  const doc = store.document;
  if (!doc) {
    return null;
  }

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) {
    return null;
  }

  const templates = vstgui.templates;
  const templateEntries = Object.entries(templates);
  if (templateEntries.length === 0) {
    return null;
  }

  const [templateId, templateView] = templateEntries[0];
  return findViewInTree(templateView, viewId, templateId);
}

function findViewInTree(root: ViewNode, compositeId: string, rootId: string): ViewNode | null {
  if (compositeId === rootId) {
    return root;
  }

  const prefix = `${rootId}-`;
  if (!compositeId.startsWith(prefix)) {
    return null;
  }

  const remainingPath = compositeId.slice(prefix.length);
  const pathParts = remainingPath.split('-');

  let current: ViewNode = root;
  for (const part of pathParts) {
    if (!current.children?.[part]) {
      return null;
    }
    current = current.children[part];
  }

  return current;
}

export function updateViewOrigin(viewId: string, newOrigin: Point): Point | null {
  const doc = store.document;
  if (!doc) {
    return null;
  }

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) {
    return null;
  }

  const templates = vstgui.templates;
  const templateEntries = Object.entries(templates);
  if (templateEntries.length === 0) {
    return null;
  }

  const [templateId, templateView] = templateEntries[0];
  const view = findViewInTree(templateView, viewId, templateId);

  if (!view) {
    return null;
  }

  const previousOrigin = parsePoint(view.attributes.origin);
  const newOriginStr = formatOrigin(newOrigin);

  setStore(
    produce(draft => {
      const draftDoc = draft.document;
      if (!draftDoc) return;

      const draftVstgui = draftDoc['vstgui-ui-description'];
      if (!draftVstgui?.templates) return;

      const draftView = findViewInTree(draftVstgui.templates[templateId], viewId, templateId);
      if (draftView) {
        draftView.attributes.origin = newOriginStr;
      }
    })
  );

  return previousOrigin;
}

export function updateViewSize(viewId: string, newSize: Size): Size | null {
  const doc = store.document;
  if (!doc) {
    return null;
  }

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) {
    return null;
  }

  const templates = vstgui.templates;
  const templateEntries = Object.entries(templates);
  if (templateEntries.length === 0) {
    return null;
  }

  const [templateId, templateView] = templateEntries[0];
  const view = findViewInTree(templateView, viewId, templateId);

  if (!view) {
    return null;
  }

  const previousSize = parseSizeRaw(view.attributes.size);
  const newSizeStr = formatSize(newSize);

  setStore(
    produce(draft => {
      const draftDoc = draft.document;
      if (!draftDoc) return;

      const draftVstgui = draftDoc['vstgui-ui-description'];
      if (!draftVstgui?.templates) return;

      const draftView = findViewInTree(draftVstgui.templates[templateId], viewId, templateId);
      if (draftView) {
        draftView.attributes.size = newSizeStr;
      }
    })
  );

  return previousSize;
}

export function getViewAttribute(viewId: string, attributeName: string): string | undefined {
  const doc = store.document;
  if (!doc) {
    return undefined;
  }

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) {
    return undefined;
  }

  const templates = vstgui.templates;
  const templateEntries = Object.entries(templates);
  if (templateEntries.length === 0) {
    return undefined;
  }

  const [templateId, templateView] = templateEntries[0];
  const view = findViewInTree(templateView, viewId, templateId);

  if (!view) {
    return undefined;
  }

  const value = view.attributes[attributeName];
  return value === undefined ? undefined : String(value);
}

export function updateViewAttribute(
  viewId: string,
  attributeName: string,
  newValue: string
): string | null | undefined {
  const doc = store.document;
  if (!doc) {
    return null;
  }

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) {
    return null;
  }

  const templates = vstgui.templates;
  const templateEntries = Object.entries(templates);
  if (templateEntries.length === 0) {
    return null;
  }

  const [templateId, templateView] = templateEntries[0];
  const view = findViewInTree(templateView, viewId, templateId);

  if (!view) {
    return null;
  }

  const previousValue = view.attributes[attributeName];
  const previousStr = previousValue === undefined ? undefined : String(previousValue);

  setStore(
    produce(draft => {
      const draftDoc = draft.document;
      if (!draftDoc) return;

      const draftVstgui = draftDoc['vstgui-ui-description'];
      if (!draftVstgui?.templates) return;

      const draftView = findViewInTree(draftVstgui.templates[templateId], viewId, templateId);
      if (draftView) {
        draftView.attributes[attributeName] = newValue;
      }
    })
  );

  return previousStr;
}

/**
 * Serialized view for removal/restoration operations.
 */
export interface RemovedViewInfo {
  /** The view ID that was removed */
  viewId: string;
  /** The key in the parent's children object */
  childKey: string;
  /** The parent view ID */
  parentId: string;
  /** The serialized view data */
  viewData: ViewNode;
}

/**
 * Find the parent of a view in the tree.
 * Returns [parentNode, childKey] or null if not found.
 */
function findParentInTree(
  root: ViewNode,
  targetId: string,
  rootId: string,
  currentPath: string = rootId
): { parent: ViewNode; childKey: string; parentId: string } | null {
  if (!root.children) {
    return null;
  }

  for (const [key, child] of Object.entries(root.children)) {
    const childId = `${currentPath}-${key}`;
    if (childId === targetId) {
      return { parent: root, childKey: key, parentId: currentPath };
    }
    const result = findParentInTree(child, targetId, rootId, childId);
    if (result) {
      return result;
    }
  }

  return null;
}

/**
 * Deep clone a ViewNode for serialization.
 */
function cloneViewNode(node: ViewNode): ViewNode {
  const clone: ViewNode = {
    attributes: { ...node.attributes },
  };
  if (node.children) {
    clone.children = {};
    for (const [key, child] of Object.entries(node.children)) {
      clone.children[key] = cloneViewNode(child);
    }
  }
  return clone;
}

/**
 * Remove a single view from the document.
 * Returns the removed view info for undo, or null if view not found.
 * Cannot remove the root template view.
 */
export function removeView(viewId: string): RemovedViewInfo | null {
  const doc = store.document;
  if (!doc) {
    return null;
  }

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) {
    return null;
  }

  const templates = vstgui.templates;
  const templateEntries = Object.entries(templates);
  if (templateEntries.length === 0) {
    return null;
  }

  const [templateId, templateView] = templateEntries[0];

  if (viewId === templateId) {
    return null;
  }

  const parentInfo = findParentInTree(templateView, viewId, templateId);
  if (!parentInfo) {
    return null;
  }

  const { childKey, parentId } = parentInfo;
  const viewToRemove = parentInfo.parent.children?.[childKey];
  if (!viewToRemove) {
    return null;
  }

  const viewData = cloneViewNode(viewToRemove);

  setStore(
    produce(draft => {
      const draftDoc = draft.document;
      if (!draftDoc) return;

      const draftVstgui = draftDoc['vstgui-ui-description'];
      if (!draftVstgui?.templates) return;

      const draftParentInfo = findParentInTree(
        draftVstgui.templates[templateId],
        viewId,
        templateId
      );
      if (draftParentInfo?.parent.children) {
        delete draftParentInfo.parent.children[childKey];
      }
    })
  );

  return {
    viewId,
    childKey,
    parentId,
    viewData,
  };
}

/**
 * Remove multiple views from the document.
 * Returns array of removed view info for undo.
 * Silently skips views that cannot be removed (root, not found).
 */
export function removeViews(viewIds: string[]): RemovedViewInfo[] {
  const removed: RemovedViewInfo[] = [];

  const sortedIds = [...viewIds].sort((a, b) => {
    const depthA = a.split('-').length;
    const depthB = b.split('-').length;
    return depthB - depthA;
  });

  for (const viewId of sortedIds) {
    const result = removeView(viewId);
    if (result) {
      removed.push(result);
    }
  }

  return removed;
}

/**
 * Add a view to a parent container.
 * Returns the new view ID, or null if parent not found.
 */
export function addView(parentId: string, view: ViewNode, childKey?: string): string | null {
  const doc = store.document;
  if (!doc) {
    return null;
  }

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) {
    return null;
  }

  const templates = vstgui.templates;
  const templateEntries = Object.entries(templates);
  if (templateEntries.length === 0) {
    return null;
  }

  const [templateId, templateView] = templateEntries[0];
  const parent = findViewInTree(templateView, parentId, templateId);

  if (!parent) {
    return null;
  }

  const key = childKey ?? generateChildKey(parent);
  const newViewId = `${parentId}-${key}`;

  setStore(
    produce(draft => {
      const draftDoc = draft.document;
      if (!draftDoc) return;

      const draftVstgui = draftDoc['vstgui-ui-description'];
      if (!draftVstgui?.templates) return;

      const draftParent = findViewInTree(draftVstgui.templates[templateId], parentId, templateId);
      if (draftParent) {
        if (!draftParent.children) {
          draftParent.children = {};
        }
        draftParent.children[key] = cloneViewNode(view);
      }
    })
  );

  return newViewId;
}

/**
 * Generate a unique child key for a parent view.
 */
function generateChildKey(parent: ViewNode): string {
  const existing = parent.children ? Object.keys(parent.children) : [];
  let index = existing.length;
  while (existing.includes(String(index))) {
    index++;
  }
  return String(index);
}

/**
 * Restore a previously removed view.
 * Returns the view ID if successful, null otherwise.
 */
export function restoreView(info: RemovedViewInfo): string | null {
  const doc = store.document;
  if (!doc) {
    return null;
  }

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) {
    return null;
  }

  const templates = vstgui.templates;
  const templateEntries = Object.entries(templates);
  if (templateEntries.length === 0) {
    return null;
  }

  const [templateId, templateView] = templateEntries[0];
  const parent = findViewInTree(templateView, info.parentId, templateId);

  if (!parent) {
    return null;
  }

  setStore(
    produce(draft => {
      const draftDoc = draft.document;
      if (!draftDoc) return;

      const draftVstgui = draftDoc['vstgui-ui-description'];
      if (!draftVstgui?.templates) return;

      const draftParent = findViewInTree(
        draftVstgui.templates[templateId],
        info.parentId,
        templateId
      );
      if (draftParent) {
        if (!draftParent.children) {
          draftParent.children = {};
        }
        draftParent.children[info.childKey] = cloneViewNode(info.viewData);
      }
    })
  );

  return info.viewId;
}

/**
 * Duplicate a view with an offset.
 * Returns the new view ID, or null if source view not found.
 */
export function duplicateView(viewId: string, offset: Point): string | null {
  const doc = store.document;
  if (!doc) {
    return null;
  }

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) {
    return null;
  }

  const templates = vstgui.templates;
  const templateEntries = Object.entries(templates);
  if (templateEntries.length === 0) {
    return null;
  }

  const [templateId, templateView] = templateEntries[0];

  if (viewId === templateId) {
    return null;
  }

  const parentInfo = findParentInTree(templateView, viewId, templateId);
  if (!parentInfo) {
    return null;
  }

  const sourceView = parentInfo.parent.children?.[parentInfo.childKey];
  if (!sourceView) {
    return null;
  }

  const clonedView = cloneViewNode(sourceView);
  const currentOrigin = parsePoint(clonedView.attributes.origin);
  const newOrigin = {
    x: currentOrigin.x + offset.x,
    y: currentOrigin.y + offset.y,
  };
  clonedView.attributes.origin = formatOrigin(newOrigin);

  return addView(parentInfo.parentId, clonedView);
}

export function getParentId(viewId: string): string | null {
  const doc = store.document;
  if (!doc) return null;

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) return null;

  const templateEntries = Object.entries(vstgui.templates);
  if (templateEntries.length === 0) return null;

  const [templateId] = templateEntries[0];
  if (viewId === templateId) return null;

  const lastDash = viewId.lastIndexOf('-');
  if (lastDash === -1) return null;

  return viewId.substring(0, lastDash);
}

export function getChildIds(viewId: string): string[] {
  const doc = store.document;
  if (!doc) return [];

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) return [];

  const templateEntries = Object.entries(vstgui.templates);
  if (templateEntries.length === 0) return [];

  const [templateId, templateView] = templateEntries[0];
  const view = findViewInTree(templateView, viewId, templateId);

  if (!view?.children) return [];

  return Object.keys(view.children).map(key => `${viewId}-${key}`);
}

export function getChildIndex(viewId: string): number {
  const parentId = getParentId(viewId);
  if (!parentId) return -1;

  const siblings = getChildIds(parentId);
  return siblings.indexOf(viewId);
}

export interface ReparentResult {
  viewId: string;
  oldParentId: string;
  oldIndex: number;
  oldChildKey: string;
  newParentId: string;
  newChildKey: string;
  oldOrigin: string;
  newOrigin: string;
}

export function reparentView(
  viewId: string,
  newParentId: string,
  _newIndex?: number,
  newOrigin?: string
): ReparentResult | null {
  const doc = store.document;
  if (!doc) return null;

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) return null;

  const templateEntries = Object.entries(vstgui.templates);
  if (templateEntries.length === 0) return null;

  const [templateId, templateView] = templateEntries[0];

  if (viewId === templateId) return null;

  const parentInfo = findParentInTree(templateView, viewId, templateId);
  if (!parentInfo) return null;

  const targetParent = findViewInTree(templateView, newParentId, templateId);
  if (!targetParent) return null;

  const viewToMove = parentInfo.parent.children?.[parentInfo.childKey];
  if (!viewToMove) return null;

  const oldOrigin = viewToMove.attributes.origin || '0, 0';
  const finalOrigin = newOrigin ?? oldOrigin;
  const oldIndex = getChildIndex(viewId);

  const viewData = cloneViewNode(viewToMove);
  viewData.attributes.origin = finalOrigin;

  const newChildKey = generateChildKey(targetParent);

  setStore(
    produce(draft => {
      const draftDoc = draft.document;
      if (!draftDoc) return;

      const draftVstgui = draftDoc['vstgui-ui-description'];
      if (!draftVstgui?.templates) return;

      const draftParentInfo = findParentInTree(
        draftVstgui.templates[templateId],
        viewId,
        templateId
      );
      if (draftParentInfo?.parent.children) {
        delete draftParentInfo.parent.children[parentInfo.childKey];
      }

      const draftTargetParent = findViewInTree(
        draftVstgui.templates[templateId],
        newParentId,
        templateId
      );
      if (draftTargetParent) {
        if (!draftTargetParent.children) {
          draftTargetParent.children = {};
        }
        draftTargetParent.children[newChildKey] = viewData;
      }
    })
  );

  return {
    viewId,
    oldParentId: parentInfo.parentId,
    oldIndex,
    oldChildKey: parentInfo.childKey,
    newParentId,
    newChildKey,
    oldOrigin,
    newOrigin: finalOrigin,
  };
}

export interface ReorderResult {
  viewId: string;
  parentId: string;
  oldIndex: number;
  newIndex: number;
}

export function reorderView(viewId: string, newIndex: number): ReorderResult | null {
  const parentId = getParentId(viewId);
  if (!parentId) return null;

  const siblings = getChildIds(parentId);
  const oldIndex = siblings.indexOf(viewId);
  if (oldIndex === -1) return null;

  if (newIndex < 0 || newIndex >= siblings.length) return null;
  if (oldIndex === newIndex) return null;

  const doc = store.document;
  if (!doc) return null;

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) return null;

  const templateEntries = Object.entries(vstgui.templates);
  if (templateEntries.length === 0) return null;

  const [templateId, templateView] = templateEntries[0];

  const parent = findViewInTree(templateView, parentId, templateId);
  if (!parent?.children) return null;

  const childEntries = Object.entries(parent.children);
  const childKey = viewId.split('-').pop()!;

  const currentIdx = childEntries.findIndex(([k]) => k === childKey);
  if (currentIdx === -1) return null;

  const [removed] = childEntries.splice(currentIdx, 1);
  childEntries.splice(newIndex, 0, removed);

  const newChildren: Record<string, ViewNode> = {};
  for (const [key, value] of childEntries) {
    newChildren[key] = value;
  }

  setStore(
    produce(draft => {
      const draftDoc = draft.document;
      if (!draftDoc) return;

      const draftVstgui = draftDoc['vstgui-ui-description'];
      if (!draftVstgui?.templates) return;

      const draftParent = findViewInTree(draftVstgui.templates[templateId], parentId, templateId);
      if (draftParent) {
        draftParent.children = newChildren;
      }
    })
  );

  return {
    viewId,
    parentId,
    oldIndex,
    newIndex,
  };
}

export interface GroupResult {
  groupId: string;
  movedViewIds: string[];
}

/**
 * Create a new CViewContainer and move specified views into it.
 * Views must have the same parent and there must be at least 2 views.
 * Returns the new group ID and moved view IDs, or null on failure.
 */
export function createGroupContainer(
  viewIds: string[],
  containerId: string,
  attrs: { origin: string; size: string; [key: string]: string }
): GroupResult | null {
  if (viewIds.length < 2) return null;

  const doc = store.document;
  if (!doc) return null;

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) return null;

  const templateEntries = Object.entries(vstgui.templates);
  if (templateEntries.length === 0) return null;

  const [templateId, templateView] = templateEntries[0];

  const parentIds = viewIds.map(id => getParentId(id));
  const firstParentId = parentIds[0];
  if (!firstParentId || parentIds.some(p => p !== firstParentId)) return null;

  const parent = findViewInTree(templateView, firstParentId, templateId);
  if (!parent) return null;

  const viewsToMove: Array<{ key: string; view: ViewNode }> = [];
  for (const viewId of viewIds) {
    const childKey = viewId.split('-').pop()!;
    const view = parent.children?.[childKey];
    if (!view) return null;
    viewsToMove.push({ key: childKey, view: cloneViewNode(view) });
  }

  const newGroupId = `${firstParentId}-${containerId}`;

  setStore(
    produce(draft => {
      const draftDoc = draft.document;
      if (!draftDoc) return;

      const draftVstgui = draftDoc['vstgui-ui-description'];
      if (!draftVstgui?.templates) return;

      const draftParent = findViewInTree(
        draftVstgui.templates[templateId],
        firstParentId,
        templateId
      );
      if (!draftParent?.children) return;

      for (const { key } of viewsToMove) {
        delete draftParent.children[key];
      }

      const newContainer: ViewNode = {
        attributes: {
          class: 'CViewContainer',
          ...attrs,
        },
        children: {},
      };

      for (let i = 0; i < viewsToMove.length; i++) {
        newContainer.children![String(i)] = viewsToMove[i].view;
      }

      draftParent.children[containerId] = newContainer;
    })
  );

  return {
    groupId: newGroupId,
    movedViewIds: viewIds.map((_, i) => `${newGroupId}-${i}`),
  };
}

export interface UngroupResult {
  containerId: string;
  childIds: string[];
  containerOrigin: string;
  containerSize: string;
  containerAttributes: Record<string, string>;
}

/**
 * Move all children of a container to its parent and delete the container.
 * Cannot ungroup the root template or non-container views.
 * Returns info needed for undo, or null on failure.
 */
export function ungroupContainer(containerId: string): UngroupResult | null {
  const doc = store.document;
  if (!doc) return null;

  const vstgui = doc['vstgui-ui-description'];
  if (!vstgui?.templates) return null;

  const templateEntries = Object.entries(vstgui.templates);
  if (templateEntries.length === 0) return null;

  const [templateId, templateView] = templateEntries[0];

  if (containerId === templateId) return null;

  const parentId = getParentId(containerId);
  if (!parentId) return null;

  const container = findViewInTree(templateView, containerId, templateId);
  if (!container) return null;

  const containerClass = container.attributes.class;
  if (containerClass !== 'CViewContainer') return null;

  const parent = findViewInTree(templateView, parentId, templateId);
  if (!parent) return null;

  const containerOrigin = container.attributes.origin || '0, 0';
  const containerSize = container.attributes.size || '0, 0';
  const containerAttributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(container.attributes)) {
    if (typeof value === 'string') {
      containerAttributes[key] = value;
    }
  }

  const childrenToMove: Array<{ key: string; view: ViewNode }> = [];
  if (container.children) {
    for (const [key, child] of Object.entries(container.children)) {
      childrenToMove.push({ key, view: cloneViewNode(child) });
    }
  }

  const containerKey = containerId.split('-').pop()!;
  const movedChildIds: string[] = [];

  setStore(
    produce(draft => {
      const draftDoc = draft.document;
      if (!draftDoc) return;

      const draftVstgui = draftDoc['vstgui-ui-description'];
      if (!draftVstgui?.templates) return;

      const draftParent = findViewInTree(draftVstgui.templates[templateId], parentId, templateId);
      if (!draftParent?.children) return;

      const existingKeys = Object.keys(draftParent.children);
      let nextKey = existingKeys.length;

      for (const { view } of childrenToMove) {
        while (existingKeys.includes(String(nextKey))) {
          nextKey++;
        }
        const newKey = String(nextKey);
        draftParent.children[newKey] = view;
        movedChildIds.push(`${parentId}-${newKey}`);
        existingKeys.push(newKey);
        nextKey++;
      }

      delete draftParent.children[containerKey];
    })
  );

  return {
    containerId,
    childIds: movedChildIds,
    containerOrigin,
    containerSize,
    containerAttributes,
  };
}
