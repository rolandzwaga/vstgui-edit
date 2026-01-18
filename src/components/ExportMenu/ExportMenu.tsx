import { createSignal, onCleanup, onMount, Show, type Component } from 'solid-js';
import {
  exportAsJSON,
  exportAsXML,
  exportAsZIP,
  createDownloadBlob,
  triggerDownload,
  type ExportBitmap,
} from '../../domain/project';
import { getBitmapPath } from '../../domain/bitmaps/missingBitmaps';
import { bitmapService } from '../../services/indexedDB/bitmapService';
import { projectStore } from '../../stores/projectStore';
import { documentStore, getBitmaps } from '../../stores/documentStore';
import styles from './ExportMenu.module.css';

export const ExportMenu: Component = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  let menuRef: HTMLDivElement | undefined;
  let buttonRef: HTMLButtonElement | undefined;

  const isDisabled = () => !projectStore.currentProject || !documentStore.document;

  const toggleDropdown = () => {
    if (!isDisabled()) {
      setIsOpen(!isOpen());
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    const doc = documentStore.document;
    const project = projectStore.currentProject;
    if (!doc || !project) return;

    const content = exportAsJSON(doc);
    const blob = createDownloadBlob(content, 'json');
    const filename = `${project.name}.uidesc`;
    triggerDownload(blob, filename);
    closeDropdown();
  };

  const handleExportXML = () => {
    const doc = documentStore.document;
    const project = projectStore.currentProject;
    if (!doc || !project) return;

    const content = exportAsXML(doc);
    const blob = createDownloadBlob(content, 'xml');
    const filename = `${project.name}.uidesc`;
    triggerDownload(blob, filename);
    closeDropdown();
  };

  const handleExportZIP = async () => {
    const doc = documentStore.document;
    const project = projectStore.currentProject;
    if (!doc || !project) return;

    try {
      // Fetch stored bitmaps from IndexedDB
      const storedBitmaps = await bitmapService.getByProject(project.id);

      // Get bitmap definitions from uidesc to get original paths
      const bitmapDefs = getBitmaps() ?? {};

      // Convert to ExportBitmap format, preserving original paths
      const exportBitmaps: ExportBitmap[] = await Promise.all(
        storedBitmaps.map(async (bitmap) => {
          // Look up the original path from the uidesc document
          const bitmapDef = bitmapDefs[bitmap.name];
          const originalPath = bitmapDef ? getBitmapPath(bitmapDef) : '';

          return {
            name: bitmap.name,
            path: originalPath,
            data: new Uint8Array(await bitmap.blob.arrayBuffer()),
          };
        })
      );

      const content = await exportAsZIP(doc, project.name, exportBitmaps);
      const blob = createDownloadBlob(content, 'zip');
      const filename = `${project.name}.zip`;
      triggerDownload(blob, filename);
    } catch (error) {
      console.error('Failed to export ZIP:', error);
    }
    closeDropdown();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeDropdown();
    }
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      menuRef &&
      !menuRef.contains(e.target as Node) &&
      buttonRef &&
      !buttonRef.contains(e.target as Node)
    ) {
      closeDropdown();
    }
  };

  onMount(() => {
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div class={styles.container}>
      <button
        ref={buttonRef}
        type="button"
        class={styles.button}
        onClick={toggleDropdown}
        disabled={isDisabled()}
        aria-haspopup="true"
        aria-expanded={isOpen()}
      >
        Export
      </button>
      <Show when={isOpen()}>
        <div
          ref={menuRef}
          class={styles.dropdown}
          role="menu"
          aria-label="Export options"
        >
          <button
            type="button"
            class={styles.menuItem}
            role="menuitem"
            onClick={handleExportJSON}
          >
            Export as JSON (.uidesc)
          </button>
          <button
            type="button"
            class={styles.menuItem}
            role="menuitem"
            onClick={handleExportXML}
          >
            Export as XML (.uidesc)
          </button>
          <button
            type="button"
            class={styles.menuItem}
            role="menuitem"
            onClick={handleExportZIP}
          >
            Export as ZIP Archive
          </button>
        </div>
      </Show>
    </div>
  );
};
