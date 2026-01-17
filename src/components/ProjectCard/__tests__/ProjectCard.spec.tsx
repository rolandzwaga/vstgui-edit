import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { Project } from '../../../domain/project/types';
import { DEFAULT_EDITOR_STATE, DEFAULT_PROJECT_SETTINGS } from '../../../domain/project/types';
import { ProjectCard } from '../ProjectCard';

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

describe('ProjectCard', () => {
  let onClick: (id: string) => void;
  let onDelete: (id: string) => void;

  beforeEach(() => {
    onClick = vi.fn() as (id: string) => void;
    onDelete = vi.fn() as (id: string) => void;
  });

  afterEach(() => {
    cleanup();
  });

  test('renders project name', () => {
    const project = createTestProject({ name: 'My Plugin UI' });
    render(() => <ProjectCard project={project} onClick={onClick} onDelete={onDelete} />);

    expect(screen.getByText('My Plugin UI')).toBeInTheDocument();
  });

  test('renders formatted date', () => {
    const project = createTestProject({
      updatedAt: '2026-01-15T12:00:00Z',
    });
    render(() => <ProjectCard project={project} onClick={onClick} onDelete={onDelete} />);

    // Should show the date in some human-readable format
    expect(screen.getByText(/Jan/i)).toBeInTheDocument();
  });

  test('renders placeholder when no thumbnail', () => {
    const project = createTestProject({ thumbnailDataUrl: null });
    render(() => <ProjectCard project={project} onClick={onClick} onDelete={onDelete} />);

    // Should have a placeholder element (no img tag)
    const card = screen.getByRole('button', { name: /Open project Test Project/i });
    expect(card).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('renders thumbnail when available', () => {
    const project = createTestProject({
      thumbnailDataUrl: 'data:image/png;base64,test123',
    });
    render(() => <ProjectCard project={project} onClick={onClick} onDelete={onDelete} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'data:image/png;base64,test123');
  });

  test('calls onClick when card is clicked', () => {
    const project = createTestProject({ name: 'Clickable Project' });
    render(() => <ProjectCard project={project} onClick={onClick} onDelete={onDelete} />);

    const card = screen.getByRole('button', { name: /Open project Clickable Project/i });
    fireEvent.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(project.id);
  });

  test('calls onDelete when delete button is clicked', () => {
    const project = createTestProject();
    render(() => <ProjectCard project={project} onClick={onClick} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(project.id);
  });

  test('delete button click does not trigger onClick', () => {
    const project = createTestProject();
    render(() => <ProjectCard project={project} onClick={onClick} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  test('displays format badge', () => {
    const project = createTestProject({ uidescFormat: 'xml' });
    render(() => <ProjectCard project={project} onClick={onClick} onDelete={onDelete} />);

    expect(screen.getByText('XML')).toBeInTheDocument();
  });

  test('handles keyboard Enter on card', () => {
    const project = createTestProject();
    render(() => <ProjectCard project={project} onClick={onClick} onDelete={onDelete} />);

    const card = screen.getByRole('button', { name: /Open project Test Project/i });
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(onClick).toHaveBeenCalledWith(project.id);
  });

  test('handles keyboard Space on card', () => {
    const project = createTestProject();
    render(() => <ProjectCard project={project} onClick={onClick} onDelete={onDelete} />);

    const card = screen.getByRole('button', { name: /Open project Test Project/i });
    fireEvent.keyDown(card, { key: ' ' });

    expect(onClick).toHaveBeenCalledWith(project.id);
  });
});
