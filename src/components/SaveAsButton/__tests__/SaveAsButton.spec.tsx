import { render, screen, fireEvent, cleanup, waitFor } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { SaveAsButton } from '../SaveAsButton';
import { resetProjectStore, setCurrentProject } from '../../../stores/projectStore';
import { setDocumentForTest, reset as resetDocumentStore } from '../../../stores/documentStore';
import type { Project } from '../../../domain/project/types';
import { DEFAULT_EDITOR_STATE, DEFAULT_PROJECT_SETTINGS } from '../../../domain/project/types';
import type { VSTGUIUIDescription } from '../../../types/uidesc';

const mockProject: Project = {
  id: 'proj-123',
  name: 'Test Project',
  uidescContent: '{"vstgui-ui-description":{"version":"1"}}',
  uidescFormat: 'json',
  settings: DEFAULT_PROJECT_SETTINGS,
  editorState: DEFAULT_EDITOR_STATE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  thumbnailDataUrl: null,
};

const mockDocument: VSTGUIUIDescription = {
  'vstgui-ui-description': {
    version: '1',
    templates: {
      view: {
        attributes: {
          class: 'CViewContainer',
          origin: '0, 0',
          size: '400, 300',
        },
      },
    },
  },
};

describe('SaveAsButton', () => {
  beforeEach(() => {
    resetProjectStore();
    resetDocumentStore();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders Save As button', () => {
    setCurrentProject(mockProject);
    setDocumentForTest(mockDocument);

    render(() => <SaveAsButton />);

    expect(screen.getByRole('button', { name: /save as/i })).toBeInTheDocument();
  });

  test('is disabled when no project is open', () => {
    render(() => <SaveAsButton />);

    const button = screen.getByRole('button', { name: /save as/i });
    expect(button).toBeDisabled();
  });

  test('is enabled when project is open', () => {
    setCurrentProject(mockProject);
    setDocumentForTest(mockDocument);

    render(() => <SaveAsButton />);

    const button = screen.getByRole('button', { name: /save as/i });
    expect(button).not.toBeDisabled();
  });

  test('opens name dialog on click', () => {
    setCurrentProject(mockProject);
    setDocumentForTest(mockDocument);

    render(() => <SaveAsButton />);

    const button = screen.getByRole('button', { name: /save as/i });
    fireEvent.click(button);

    // Dialog should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
  });

  test('suggests name based on current project', () => {
    setCurrentProject({ ...mockProject, name: 'My Plugin' });
    setDocumentForTest(mockDocument);

    render(() => <SaveAsButton />);

    const button = screen.getByRole('button', { name: /save as/i });
    fireEvent.click(button);

    const input = screen.getByLabelText('Project Name');
    expect(input).toHaveValue('Copy of My Plugin');
  });
});
