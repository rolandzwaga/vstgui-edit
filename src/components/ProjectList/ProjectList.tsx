import type { Component } from 'solid-js';
import { For, Show, createMemo } from 'solid-js';

import type { Project } from '../../domain/project/types';
import { ProjectCard } from '../ProjectCard';

import styles from './ProjectList.module.css';

export interface ProjectListProps {
  isOpen: boolean;
  projects: Project[];
  onClose: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * ProjectList displays a modal with all saved projects.
 *
 * Features:
 * - Sorted by last modified date (most recent first)
 * - Grid layout of project cards
 * - Empty state message
 * - Close button and backdrop dismiss
 */
export const ProjectList: Component<ProjectListProps> = (props) => {
  // Sort projects by updatedAt (most recent first)
  const sortedProjects = createMemo(() => {
    return [...props.projects].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onClose();
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  return (
    <Show when={props.isOpen}>
      <div
        class={styles.backdrop}
        data-testid="project-list-backdrop"
        onClick={handleBackdropClick}
      >
        <div
          class={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-list-title"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div class={styles.header}>
            <h2 id="project-list-title" class={styles.title}>
              Recent Projects
            </h2>
            <span class={styles.count}>
              {props.projects.length} {props.projects.length === 1 ? 'project' : 'projects'}
            </span>
            <button
              type="button"
              class={styles.closeButton}
              onClick={props.onClose}
              aria-label="Close project list"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class={styles.content}>
            <Show
              when={sortedProjects().length > 0}
              fallback={
                <div class={styles.emptyState}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                  <p>No projects yet</p>
                  <span>Create a new project or open an existing .uidesc file</span>
                </div>
              }
            >
              <div class={styles.grid}>
                <For each={sortedProjects()}>
                  {(project) => (
                    <ProjectCard
                      project={project}
                      onClick={props.onOpen}
                      onDelete={props.onDelete}
                    />
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};
