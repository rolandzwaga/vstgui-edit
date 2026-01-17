import type { Component } from 'solid-js';
import { Show } from 'solid-js';

import type { Project } from '../../domain/project/types';

import styles from './ProjectCard.module.css';

export interface ProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Formats a date for display in the project card.
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * ProjectCard displays a single project in the project list.
 *
 * Features:
 * - Project name and last modified date
 * - Thumbnail preview (or placeholder)
 * - Format badge (JSON/XML)
 * - Click to open
 * - Delete button
 */
export const ProjectCard: Component<ProjectCardProps> = (props) => {
  const handleClick = () => {
    props.onClick(props.project.id);
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    props.onDelete(props.project.id);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      props.onClick(props.project.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      class={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Open project ${props.project.name}`}
    >
      <div class={styles.thumbnail}>
        <Show
          when={props.project.thumbnailDataUrl}
          fallback={
            <div class={styles.placeholder}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
          }
        >
          <img
            src={props.project.thumbnailDataUrl!}
            alt={`Preview of ${props.project.name}`}
            class={styles.image}
          />
        </Show>
      </div>

      <div class={styles.content}>
        <div class={styles.header}>
          <span class={styles.name} title={props.project.name}>
            {props.project.name}
          </span>
          <span class={styles.format}>
            {props.project.uidescFormat.toUpperCase()}
          </span>
        </div>

        <div class={styles.footer}>
          <span class={styles.date}>
            {formatDate(props.project.updatedAt)}
          </span>
          <button
            type="button"
            class={styles.deleteButton}
            onClick={handleDelete}
            aria-label={`Delete project ${props.project.name}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
