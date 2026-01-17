import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExportMenu } from '../ExportMenu';
import { resetProjectStore, setCurrentProject } from '../../../stores/projectStore';
import { setDocumentForTest, reset as resetDocumentStore } from '../../../stores/documentStore';
import type { Project } from '../../../domain/project/types';
import type { VSTGUIUIDescription } from '../../../types/uidesc';

const mockProject: Project = {
  id: 'proj-123',
  name: 'Test Project',
  uidescContent: '{"vstgui-ui-description":{"version":"1"}}',
  uidescFormat: 'json',
  settings: {} as Project['settings'],
  editorState: {} as Project['editorState'],
  createdAt: new Date(),
  updatedAt: new Date(),
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

describe('ExportMenu', () => {
  beforeEach(() => {
    resetProjectStore();
    resetDocumentStore();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    test('renders Export button', () => {
      setCurrentProject(mockProject);
      setDocumentForTest(mockDocument);
      render(() => <ExportMenu />);

      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    test('is disabled when no project is open', () => {
      render(() => <ExportMenu />);

      const button = screen.getByRole('button', { name: /export/i });
      expect(button).toBeDisabled();
    });

    test('is enabled when project is open', () => {
      setCurrentProject(mockProject);
      setDocumentForTest(mockDocument);
      render(() => <ExportMenu />);

      const button = screen.getByRole('button', { name: /export/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe('dropdown', () => {
    test('shows dropdown menu on click', () => {
      setCurrentProject(mockProject);
      setDocumentForTest(mockDocument);
      render(() => <ExportMenu />);

      const button = screen.getByRole('button', { name: /export/i });
      fireEvent.click(button);

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    test('shows JSON option', () => {
      setCurrentProject(mockProject);
      setDocumentForTest(mockDocument);
      render(() => <ExportMenu />);

      const button = screen.getByRole('button', { name: /export/i });
      fireEvent.click(button);

      expect(screen.getByRole('menuitem', { name: /json/i })).toBeInTheDocument();
    });

    test('shows XML option', () => {
      setCurrentProject(mockProject);
      setDocumentForTest(mockDocument);
      render(() => <ExportMenu />);

      const button = screen.getByRole('button', { name: /export/i });
      fireEvent.click(button);

      expect(screen.getByRole('menuitem', { name: /xml/i })).toBeInTheDocument();
    });

    test('shows ZIP option', () => {
      setCurrentProject(mockProject);
      setDocumentForTest(mockDocument);
      render(() => <ExportMenu />);

      const button = screen.getByRole('button', { name: /export/i });
      fireEvent.click(button);

      expect(screen.getByRole('menuitem', { name: /zip/i })).toBeInTheDocument();
    });

    test('closes dropdown on outside click', () => {
      setCurrentProject(mockProject);
      setDocumentForTest(mockDocument);
      render(() => <ExportMenu />);

      const button = screen.getByRole('button', { name: /export/i });
      fireEvent.click(button);

      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.click(document.body);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    test('closes dropdown on Escape', () => {
      setCurrentProject(mockProject);
      setDocumentForTest(mockDocument);
      render(() => <ExportMenu />);

      const button = screen.getByRole('button', { name: /export/i });
      fireEvent.click(button);

      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.keyDown(button, { key: 'Escape' });

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('export actions', () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;

    beforeEach(() => {
      URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });

    test('clicking JSON triggers download', async () => {
      setCurrentProject(mockProject);
      setDocumentForTest(mockDocument);

      render(() => <ExportMenu />);

      const button = screen.getByRole('button', { name: /export/i });
      fireEvent.click(button);

      const jsonOption = screen.getByRole('menuitem', { name: /json/i });
      fireEvent.click(jsonOption);

      await Promise.resolve();

      // Verify URL.createObjectURL was called (indicating blob was created)
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('clicking XML triggers download', async () => {
      setCurrentProject(mockProject);
      setDocumentForTest(mockDocument);

      render(() => <ExportMenu />);

      const button = screen.getByRole('button', { name: /export/i });
      fireEvent.click(button);

      const xmlOption = screen.getByRole('menuitem', { name: /xml/i });
      fireEvent.click(xmlOption);

      await Promise.resolve();

      // Verify URL.createObjectURL was called (indicating blob was created)
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('clicking ZIP triggers download', async () => {
      setCurrentProject(mockProject);
      setDocumentForTest(mockDocument);

      render(() => <ExportMenu />);

      const button = screen.getByRole('button', { name: /export/i });
      fireEvent.click(button);

      const zipOption = screen.getByRole('menuitem', { name: /zip/i });
      fireEvent.click(zipOption);

      // ZIP is async
      await new Promise(r => setTimeout(r, 100));

      // Verify URL.createObjectURL was called (indicating blob was created)
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('closes dropdown after export', async () => {
      setCurrentProject(mockProject);
      setDocumentForTest(mockDocument);

      render(() => <ExportMenu />);

      const button = screen.getByRole('button', { name: /export/i });
      fireEvent.click(button);

      const jsonOption = screen.getByRole('menuitem', { name: /json/i });
      fireEvent.click(jsonOption);

      await Promise.resolve();

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
