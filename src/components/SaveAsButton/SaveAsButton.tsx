import type { Component } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import { projectStore, duplicateProject } from '../../stores/projectStore';
import { ProjectNameDialog } from '../ProjectNameDialog';
import styles from './SaveAsButton.module.css';

/**
 * SaveAsButton - Creates a duplicate of the current project with a new name.
 *
 * Opens a name dialog when clicked, then calls duplicateProject.
 */
export const SaveAsButton: Component = () => {
  const [isDialogOpen, setIsDialogOpen] = createSignal(false);

  const isDisabled = () => !projectStore.currentProject;

  const handleClick = () => {
    if (!isDisabled()) {
      setIsDialogOpen(true);
    }
  };

  const handleConfirm = async (name: string) => {
    const currentProject = projectStore.currentProject;
    if (!currentProject) return;

    await duplicateProject(currentProject.id, name);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const getSuggestedName = () => {
    const current = projectStore.currentProject;
    if (!current) return '';
    return `Copy of ${current.name}`;
  };

  return (
    <>
      <button
        type="button"
        class={styles.button}
        onClick={handleClick}
        disabled={isDisabled()}
        aria-label="Save As"
        title="Save project with a new name"
      >
        Save As
      </button>
      <Show when={isDialogOpen()}>
        <ProjectNameDialog
          isOpen={isDialogOpen()}
          mode="rename"
          initialName={getSuggestedName()}
          title="Save As"
          confirmText="Save"
          onConfirm={handleConfirm}
          onClose={handleCancel}
        />
      </Show>
    </>
  );
};
