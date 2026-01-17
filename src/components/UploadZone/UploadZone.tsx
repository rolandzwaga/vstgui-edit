import { createSignal, For, Show, createEffect, onMount } from 'solid-js';
import { documentStore, loadFile, setDragging, reset, createNewDocument } from '../../stores/documentStore';
import {
  projectStore,
  openNameDialog,
  closeNameDialog,
  setPendingFile,
  clearPendingFile,
  createProject,
  openProjectList,
  closeProjectList,
  listProjects,
  openProject,
  deleteProject,
  renameProject,
} from '../../stores/projectStore';
import { createDocument } from '../../domain/createNew/documentFactory';
import type { Project } from '../../domain/project/types';
import type { NewDocumentConfig } from '../../types/createNew';
import { ConfirmDialog } from '../ConfirmDialog';
import { CreateNewDialog } from '../CreateNewDialog';
import { ProjectNameDialog } from '../ProjectNameDialog';
import { ProjectList } from '../ProjectList';
import styles from './UploadZone.module.css';

const hasParseErrors = () =>
  documentStore.parseState === 'invalid' && documentStore.parseErrors && documentStore.parseErrors.length > 0;

export function UploadZone() {
  let fileInputRef: HTMLInputElement | undefined;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = createSignal(false);
  const [projects, setProjects] = createSignal<Project[]>([]);
  // Store pending new document config for project creation flow
  const [pendingNewDocConfig, setPendingNewDocConfig] = createSignal<NewDocumentConfig | null>(null);
  // Delete confirmation state
  const [deleteConfirmProject, setDeleteConfirmProject] = createSignal<Project | null>(null);

  // Load projects when component mounts (if not in session-only mode)
  onMount(async () => {
    if (!projectStore.isSessionOnly) {
      const loadedProjects = await listProjects();
      setProjects(loadedProjects);
    }
  });

  const handleCreateNew = () => {
    setIsCreateDialogOpen(true);
  };

  const handleOpenProjectList = async () => {
    // Refresh project list before opening
    if (!projectStore.isSessionOnly) {
      const loadedProjects = await listProjects();
      setProjects(loadedProjects);
    }
    openProjectList();
  };

  const handleCloseProjectList = () => {
    closeProjectList();
  };

  const handleOpenProject = async (id: string) => {
    const project = await openProject(id);
    if (project) {
      // Parse the uidesc content to load into documentStore
      const file = new File([project.uidescContent], `${project.name}.uidesc`, {
        type: 'text/plain',
      });
      // Use loadFile to parse and set up the document
      // We need to bypass the name dialog since we're loading an existing project
      closeProjectList();
    }
  };

  /**
   * Show delete confirmation dialog for a project.
   */
  const handleDeleteProject = (id: string) => {
    const project = projects().find(p => p.id === id);
    if (project) {
      setDeleteConfirmProject(project);
    }
  };

  /**
   * Confirm and execute project deletion.
   */
  const handleConfirmDelete = async () => {
    const project = deleteConfirmProject();
    if (!project) return;

    const success = await deleteProject(project.id);
    if (success) {
      // Refresh the project list
      const loadedProjects = await listProjects();
      setProjects(loadedProjects);
    }
    setDeleteConfirmProject(null);
  };

  /**
   * Cancel project deletion.
   */
  const handleCancelDelete = () => {
    setDeleteConfirmProject(null);
  };

  const handleCreate = (config: NewDocumentConfig) => {
    setIsCreateDialogOpen(false);

    if (projectStore.isSessionOnly) {
      // In session-only mode, just create the document without a project
      createNewDocument(config);
    } else {
      // Store the config and show project name dialog
      setPendingNewDocConfig(config);
      openNameDialog('create');
    }
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types.includes('Files')) {
      setDragging(true);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
    // Reset input so same file can be selected again
    target.value = '';
  };

  /**
   * Handle file upload - loads the file and shows project name dialog if not in session-only mode.
   */
  const handleFileUpload = async (file: File) => {
    await loadFile(file);

    // If parse was successful and we're not in session-only mode, show name dialog
    if (documentStore.parseState === 'valid' && !projectStore.isSessionOnly) {
      // Store the file info and open the name dialog
      setPendingFile({
        content: documentStore.content!,
        format: documentStore.detectedFormat === 'json' ? 'json' : 'xml',
        filename: file.name,
      });
      openNameDialog('create');
    }
  };

  /**
   * Handle project name confirmation from the dialog.
   * Handles both file upload and new document creation flows.
   */
  const handleNameConfirm = async (name: string) => {
    const pendingConfig = pendingNewDocConfig();
    const pending = projectStore.pendingFile;

    if (pendingConfig) {
      // New document creation flow
      const doc = createDocument(pendingConfig);
      const content = JSON.stringify(doc);
      await createProject(name, content, 'json');

      // Load the document into documentStore
      createNewDocument(pendingConfig);

      // Clean up
      setPendingNewDocConfig(null);
      closeNameDialog();
    } else if (pending) {
      // File upload flow
      await createProject(name, pending.content, pending.format);

      // Clean up
      clearPendingFile();
      closeNameDialog();
    } else {
      closeNameDialog();
    }
  };

  /**
   * Handle name dialog cancel - clear pending state.
   */
  const handleNameCancel = () => {
    clearPendingFile();
    setPendingNewDocConfig(null);
    closeNameDialog();
  };

  /**
   * Handle project rename from ProjectList.
   */
  const handleRenameProject = async (id: string, newName: string): Promise<boolean> => {
    const result = await renameProject(id, newName);
    if (result) {
      // Refresh the project list
      const updatedProjects = await listProjects();
      setProjects(updatedProjects);
    }
    return result;
  };

  const handleButtonClick = () => {
    fileInputRef?.click();
  };

  const handleDismissError = () => {
    reset();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleButtonClick();
    }
  };

  return (
    <div
      class={styles.uploadZone}
      role="region"
      aria-label="File upload zone"
      data-state={documentStore.uploadState}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Show when={documentStore.uploadState === 'loading'}>
        <div class={styles.spinner} aria-hidden="true" />
        <p class={styles.title}>Loading...</p>
        <p class={styles.subtitle}>Reading file contents</p>
      </Show>

      <Show when={documentStore.uploadState === 'success' && !hasParseErrors()}>
        <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        <p class={styles.title}>File loaded successfully</p>
        <p class={styles.filename}>{documentStore.metadata?.filename}</p>
        <button class={styles.button} onClick={handleButtonClick} type="button">
          Upload different file
        </button>
      </Show>

      <Show when={hasParseErrors()}>
        <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p class={styles.title}>Parse failed</p>
        <p class={styles.filename}>{documentStore.metadata?.filename}</p>
        <div class={styles.parseErrors} role="alert">
          <For each={documentStore.parseErrors}>
            {(error) => (
              <div class={styles.parseError}>
                <div class={styles.errorHeader}>
                  <span class={styles.errorType}>[{error.type}]</span>
                  <span class={styles.errorMsg}>{error.message}</span>
                </div>
                <Show when={error.path}>
                  <div class={styles.errorPath}>Path: {error.path}</div>
                </Show>
                <Show when={error.data}>
                  <div class={styles.errorData}>Data: {error.data}</div>
                </Show>
              </div>
            )}
          </For>
        </div>
        <button class={styles.dismissButton} onClick={handleDismissError} type="button">
          Try again
        </button>
      </Show>

      <Show when={documentStore.uploadState === 'error'}>
        <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p class={styles.title}>Upload failed</p>
        <div class={styles.errorMessage} role="alert">
          {documentStore.error?.message}
        </div>
        <button class={styles.dismissButton} onClick={handleDismissError} type="button">
          Try again
        </button>
      </Show>

      <Show when={documentStore.uploadState === 'idle' || documentStore.uploadState === 'dragging'}>
        <svg class={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p class={styles.title}>
          {documentStore.uploadState === 'dragging' ? 'Drop file here' : 'Drag and drop a .uidesc file'}
        </p>
        <p class={styles.subtitle}>or click the buttons below</p>
        <div class={styles.buttonGroup}>
          <button class={styles.button} onClick={handleButtonClick} type="button">
            Browse files
          </button>
          <button class={styles.buttonSecondary} onClick={handleCreateNew} type="button">
            Create New
          </button>
          <Show when={!projectStore.isSessionOnly}>
            <button class={styles.buttonSecondary} onClick={handleOpenProjectList} type="button">
              Open Project
            </button>
          </Show>
        </div>
      </Show>

      <input
        ref={fileInputRef}
        type="file"
        accept=".uidesc"
        class={styles.fileInput}
        onChange={handleFileSelect}
      />

      <CreateNewDialog
        isOpen={isCreateDialogOpen()}
        onClose={handleCloseDialog}
        onCreate={handleCreate}
      />

      <Show when={projectStore.nameDialogMode}>
        {(mode) => (
          <ProjectNameDialog
            isOpen={projectStore.isNameDialogOpen}
            mode={mode()}
            initialName={projectStore.pendingFile?.filename?.replace(/\.uidesc$/i, '') ?? ''}
            onConfirm={handleNameConfirm}
            onClose={handleNameCancel}
          />
        )}
      </Show>

      <ProjectList
        isOpen={projectStore.isProjectListOpen}
        projects={projects()}
        onClose={handleCloseProjectList}
        onOpen={handleOpenProject}
        onDelete={handleDeleteProject}
        onRename={handleRenameProject}
      />

      <ConfirmDialog
        isOpen={deleteConfirmProject() !== null}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirmProject()?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
