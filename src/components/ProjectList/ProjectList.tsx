import type { Component } from 'solid-js';
import { For, Show, createMemo, createSignal } from 'solid-js';

import type { Project } from '../../domain/project/types';
import { ProjectCard } from '../ProjectCard';

import styles from './ProjectList.module.css';

/** Debounce delay for search input in milliseconds */
const SEARCH_DEBOUNCE_MS = 150;

export interface ProjectListProps {
  isOpen: boolean;
  projects: Project[];
  /** ID of the currently open project (will be filtered from the list) */
  currentProjectId?: string;
  onClose: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onRename?: (id: string, newName: string) => Promise<boolean>;
}

/**
 * ProjectList displays a modal with all saved projects.
 *
 * Features:
 * - Search/filter by project name
 * - Sorted by last modified date (most recent first)
 * - Grid layout of project cards
 * - Empty state message
 * - Close button and backdrop dismiss
 */
export const ProjectList: Component<ProjectListProps> = (props) => {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [debouncedQuery, setDebouncedQuery] = createSignal('');
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Handle search input with debounce
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      setDebouncedQuery(value);
    }, SEARCH_DEBOUNCE_MS);
  };

  // Filter and sort projects
  const filteredProjects = createMemo(() => {
    const query = debouncedQuery().toLowerCase().trim();
    let projects = [...props.projects];

    // Filter out the currently open project (prevents deleting it while open)
    if (props.currentProjectId) {
      projects = projects.filter((p) => p.id !== props.currentProjectId);
    }

    // Filter by search query (case-insensitive)
    if (query) {
      projects = projects.filter((p) => p.name.toLowerCase().includes(query));
    }

    // Sort by updatedAt (most recent first)
    return projects.sort((a, b) => {
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

  // Check if we have no projects at all vs no search results
  const hasNoProjects = () => props.projects.length === 0;
  const hasNoSearchResults = () =>
    props.projects.length > 0 && filteredProjects().length === 0;

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
              {filteredProjects().length}
              {searchQuery() ? ` of ${props.projects.length}` : ''}{' '}
              {filteredProjects().length === 1 ? 'project' : 'projects'}
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

          <Show when={props.projects.length > 0}>
            <div class={styles.searchContainer}>
              <svg class={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                class={styles.searchInput}
                placeholder="Search projects..."
                value={searchQuery()}
                onInput={(e) => handleSearchInput(e.currentTarget.value)}
                aria-label="Search projects"
                data-testid="project-search-input"
              />
              <Show when={searchQuery()}>
                <button
                  type="button"
                  class={styles.clearButton}
                  onClick={() => {
                    setSearchQuery('');
                    setDebouncedQuery('');
                  }}
                  aria-label="Clear search"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </Show>
            </div>
          </Show>

          <div class={styles.content}>
            <Show when={hasNoProjects()}>
              <div class={styles.emptyState}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                <p>No projects yet</p>
                <span>Create a new project or open an existing .uidesc file</span>
              </div>
            </Show>

            <Show when={hasNoSearchResults()}>
              <div class={styles.emptyState}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <p>No matching projects</p>
                <span>Try a different search term</span>
              </div>
            </Show>

            <Show when={filteredProjects().length > 0}>
              <div class={styles.grid}>
                <For each={filteredProjects()}>
                  {(project) => (
                    <ProjectCard
                      project={project}
                      onClick={props.onOpen}
                      onDelete={props.onDelete}
                      onRename={props.onRename}
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
