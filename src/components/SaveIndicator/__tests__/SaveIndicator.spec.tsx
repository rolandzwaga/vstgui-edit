import { cleanup, render, screen } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  projectStore,
  resetProjectStore,
  setCurrentProject,
  setIsDirty,
  setSaveStatus,
  setLastSavedAt,
} from '../../../stores/projectStore';
import { DEFAULT_EDITOR_STATE, DEFAULT_PROJECT_SETTINGS } from '../../../domain/project/types';
import type { Project } from '../../../domain/project/types';
import { SaveIndicator } from '../SaveIndicator';

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

describe('SaveIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-17T12:30:00Z'));
    resetProjectStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test('renders nothing when no project is open', () => {
    const { container } = render(() => <SaveIndicator />);
    expect(container.textContent).toBe('');
  });

  test('displays "Saving..." when save status is saving', () => {
    setCurrentProject(createTestProject());
    setSaveStatus('saving');

    render(() => <SaveIndicator />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  test('displays "Saved" with time when save status is saved', () => {
    setCurrentProject(createTestProject());
    setSaveStatus('saved');
    setLastSavedAt(new Date('2026-01-17T12:25:00Z'));

    render(() => <SaveIndicator />);

    // Should show "Saved at [time]"
    expect(screen.getByText(/Saved at/)).toBeInTheDocument();
  });

  test('displays "Unsaved changes" when dirty and not saving', () => {
    setCurrentProject(createTestProject());
    setSaveStatus('idle');
    setIsDirty(true);

    render(() => <SaveIndicator />);

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });

  test('displays error state when save status is error', () => {
    setCurrentProject(createTestProject());
    setSaveStatus('error');

    render(() => <SaveIndicator />);

    expect(screen.getByText('Save failed')).toBeInTheDocument();
  });

  test('displays idle state when clean and idle', () => {
    setCurrentProject(createTestProject());
    setSaveStatus('idle');
    setIsDirty(false);

    render(() => <SaveIndicator />);

    // When idle and not dirty, should show nothing or "All changes saved"
    const indicator = screen.queryByTestId('save-indicator');
    if (indicator) {
      expect(indicator.textContent).toMatch(/All changes saved|^$/);
    }
  });

  test('applies saving style when saving', () => {
    setCurrentProject(createTestProject());
    setSaveStatus('saving');

    render(() => <SaveIndicator />);

    const indicator = screen.getByTestId('save-indicator');
    // CSS Modules adds hash suffix, so check for partial match
    expect(indicator.className).toMatch(/saving/);
  });

  test('applies error style when error', () => {
    setCurrentProject(createTestProject());
    setSaveStatus('error');

    render(() => <SaveIndicator />);

    const indicator = screen.getByTestId('save-indicator');
    expect(indicator.className).toMatch(/error/);
  });

  test('applies dirty style when dirty', () => {
    setCurrentProject(createTestProject());
    setSaveStatus('idle');
    setIsDirty(true);

    render(() => <SaveIndicator />);

    const indicator = screen.getByTestId('save-indicator');
    expect(indicator.className).toMatch(/dirty/);
  });
});
