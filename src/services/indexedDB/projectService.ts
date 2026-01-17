/**
 * Project Service
 *
 * CRUD operations for projects stored in IndexedDB.
 */

import type { Project } from '../../domain/project/types';
import { STORES } from '../../domain/project/types';
import { getStore, promisifyRequest } from './database';

// ============================================================================
// Project Service
// ============================================================================

export const projectService = {
  /**
   * Creates a new project in IndexedDB.
   *
   * @param project - The project to create
   */
  async create(project: Project): Promise<void> {
    const store = getStore(STORES.PROJECTS, 'readwrite');
    await promisifyRequest(store.put(project));
  },

  /**
   * Gets a project by ID.
   *
   * @param id - The project ID
   * @returns The project or undefined if not found
   */
  async get(id: string): Promise<Project | undefined> {
    const store = getStore(STORES.PROJECTS, 'readonly');
    return promisifyRequest(store.get(id));
  },

  /**
   * Gets all projects, sorted by updatedAt descending (most recent first).
   *
   * @returns Array of all projects
   */
  async getAll(): Promise<Project[]> {
    const store = getStore(STORES.PROJECTS, 'readonly');
    const projects = await promisifyRequest(store.getAll());

    // Sort by updatedAt descending
    return projects.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });
  },

  /**
   * Updates an existing project.
   *
   * @param project - The project with updated fields
   */
  async update(project: Project): Promise<void> {
    const store = getStore(STORES.PROJECTS, 'readwrite');
    await promisifyRequest(store.put(project));
  },

  /**
   * Deletes a project by ID.
   *
   * @param id - The project ID to delete
   */
  async delete(id: string): Promise<void> {
    const store = getStore(STORES.PROJECTS, 'readwrite');
    await promisifyRequest(store.delete(id));
  },
};
