import { render, screen, fireEvent, cleanup, waitFor } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { Project } from '../../../domain/project/types';
import { DEFAULT_EDITOR_STATE, DEFAULT_PROJECT_SETTINGS } from '../../../domain/project/types';
import { ProjectList } from '../ProjectList';

function createTestProject(overrides: Partial<Project> = {}): Project {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: 'Test Project',
    createdAt: now,
    updatedAt: now,
    uidescContent: '{}',
    uidescFormat: 'json',
    editorState: { ...DEFAULT_EDITOR_STATE },
    settings: { ...DEFAULT_PROJECT_SETTINGS },
    thumbnailDataUrl: null,
    ...overrides,
  };
}

describe('ProjectList', () => {
  let onClose: () => void;
  let onOpen: (id: string) => void;
  let onDelete: (id: string) => void;

  beforeEach(() => {
    onClose = vi.fn() as () => void;
    onOpen = vi.fn() as (id: string) => void;
    onDelete = vi.fn() as (id: string) => void;
  });

  afterEach(() => {
    cleanup();
  });

  test('renders nothing when not open', () => {
    const { container } = render(() => (
      <ProjectList
        isOpen={false}
        projects={[]}
        onClose={onClose}
        onOpen={onOpen}
        onDelete={onDelete}
      />
    ));

    expect(container.textContent).toBe('');
  });

  test('renders modal when open', () => {
    render(() => (
      <ProjectList
        isOpen={true}
        projects={[]}
        onClose={onClose}
        onOpen={onOpen}
        onDelete={onDelete}
      />
    ));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Recent Projects')).toBeInTheDocument();
  });

  test('displays empty state when no projects', () => {
    render(() => (
      <ProjectList
        isOpen={true}
        projects={[]}
        onClose={onClose}
        onOpen={onOpen}
        onDelete={onDelete}
      />
    ));

    expect(screen.getByText(/No projects yet/i)).toBeInTheDocument();
  });

  test('renders project cards sorted by updatedAt (most recent first)', () => {
    const oldProject = createTestProject({
      name: 'Old Project',
      updatedAt: '2026-01-10T12:00:00Z',
    });
    const newProject = createTestProject({
      name: 'New Project',
      updatedAt: '2026-01-15T12:00:00Z',
    });

    render(() => (
      <ProjectList
        isOpen={true}
        projects={[oldProject, newProject]}
        onClose={onClose}
        onOpen={onOpen}
        onDelete={onDelete}
      />
    ));

    // Get all project name elements
    const names = screen.getAllByText(/Project$/);
    expect(names[0]).toHaveTextContent('New Project');
    expect(names[1]).toHaveTextContent('Old Project');
  });

  test('calls onClose when close button is clicked', () => {
    render(() => (
      <ProjectList
        isOpen={true}
        projects={[]}
        onClose={onClose}
        onOpen={onOpen}
        onDelete={onDelete}
      />
    ));

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onOpen when project card is clicked', () => {
    const project = createTestProject({ name: 'My Project' });

    render(() => (
      <ProjectList
        isOpen={true}
        projects={[project]}
        onClose={onClose}
        onOpen={onOpen}
        onDelete={onDelete}
      />
    ));

    const card = screen.getByRole('button', { name: /Open project My Project/i });
    fireEvent.click(card);

    expect(onOpen).toHaveBeenCalledWith(project.id);
  });

  test('calls onDelete when project delete button is clicked', () => {
    const project = createTestProject({ name: 'Delete Me' });

    render(() => (
      <ProjectList
        isOpen={true}
        projects={[project]}
        onClose={onClose}
        onOpen={onOpen}
        onDelete={onDelete}
      />
    ));

    const deleteButton = screen.getByRole('button', { name: /Delete project Delete Me/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(project.id);
  });

  test('closes on Escape key', () => {
    render(() => (
      <ProjectList
        isOpen={true}
        projects={[]}
        onClose={onClose}
        onOpen={onOpen}
        onDelete={onDelete}
      />
    ));

    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('closes on backdrop click', () => {
    render(() => (
      <ProjectList
        isOpen={true}
        projects={[]}
        onClose={onClose}
        onOpen={onOpen}
        onDelete={onDelete}
      />
    ));

    const backdrop = screen.getByTestId('project-list-backdrop');
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('displays project count', () => {
    const projects = [
      createTestProject({ name: 'P1' }),
      createTestProject({ name: 'P2' }),
      createTestProject({ name: 'P3' }),
    ];

    render(() => (
      <ProjectList
        isOpen={true}
        projects={projects}
        onClose={onClose}
        onOpen={onOpen}
        onDelete={onDelete}
      />
    ));

    expect(screen.getByText(/3 projects/i)).toBeInTheDocument();
  });
});
