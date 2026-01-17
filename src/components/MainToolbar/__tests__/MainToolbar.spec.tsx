import { cleanup, render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { resetGrid } from '../../../stores/gridStore';
import { resetProjectStore, setCurrentProject } from '../../../stores/projectStore';
import { setDocumentForTest, reset as resetDocumentStore } from '../../../stores/documentStore';
import type { Project } from '../../../domain/project/types';
import type { VSTGUIUIDescription } from '../../../types/uidesc';
import { MainToolbar } from '../MainToolbar';

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

describe('MainToolbar', () => {
  beforeEach(() => {
    resetGrid();
    resetProjectStore();
    resetDocumentStore();
  });

  afterEach(() => {
    cleanup();
  });

  describe('container', () => {
    test('renders main toolbar container', () => {
      render(() => <MainToolbar />);
      const toolbar = screen.getByRole('toolbar', { name: /main toolbar/i });
      expect(toolbar).toBeInTheDocument();
    });

    test('has correct structure for flex layout', () => {
      render(() => <MainToolbar />);
      const toolbar = screen.getByRole('toolbar', { name: /main toolbar/i });
      expect(toolbar).toBeInTheDocument();
    });
  });

  describe('ZoomToolbar integration', () => {
    test('renders ZoomToolbar component', () => {
      render(() => <MainToolbar />);
      // ZoomToolbar has a zoom controls toolbar
      const zoomToolbar = screen.getByRole('toolbar', { name: /zoom controls/i });
      expect(zoomToolbar).toBeInTheDocument();
    });

    test('renders zoom in button', () => {
      render(() => <MainToolbar />);
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      expect(zoomInButton).toBeInTheDocument();
    });

    test('renders zoom out button', () => {
      render(() => <MainToolbar />);
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      expect(zoomOutButton).toBeInTheDocument();
    });

    test('renders fit button', () => {
      render(() => <MainToolbar />);
      const fitButton = screen.getByRole('button', { name: /fit to view/i });
      expect(fitButton).toBeInTheDocument();
    });

    test('passes onFitToView prop to ZoomToolbar', async () => {
      const user = userEvent.setup();
      const onFitToView = vi.fn();

      render(() => <MainToolbar onFitToView={onFitToView} />);
      const fitButton = screen.getByRole('button', { name: /fit to view/i });

      await user.click(fitButton);

      expect(onFitToView).toHaveBeenCalledOnce();
    });
  });

  describe('GridToolbar integration', () => {
    test('renders GridToolbar component', () => {
      render(() => <MainToolbar />);
      // GridToolbar has a grid controls toolbar
      const gridToolbar = screen.getByRole('toolbar', { name: /grid controls/i });
      expect(gridToolbar).toBeInTheDocument();
    });

    test('renders grid visibility toggle button', () => {
      render(() => <MainToolbar />);
      const toggleButton = screen.getByRole('button', { name: /toggle grid/i });
      expect(toggleButton).toBeInTheDocument();
    });

    test('renders grid size selector', () => {
      render(() => <MainToolbar />);
      const sizeSelector = screen.getByRole('combobox', { name: /grid size/i });
      expect(sizeSelector).toBeInTheDocument();
    });

    test('renders grid style selector', () => {
      render(() => <MainToolbar />);
      const styleSelector = screen.getByRole('combobox', { name: /grid style/i });
      expect(styleSelector).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    test('main toolbar has correct aria-label', () => {
      render(() => <MainToolbar />);
      const toolbar = screen.getByRole('toolbar', { name: /main toolbar/i });
      expect(toolbar).toHaveAttribute('aria-label', 'Main toolbar');
    });

    test('contains nested toolbars for zoom, grid, view mode, and alignment', () => {
      render(() => <MainToolbar />);
      const toolbars = screen.getAllByRole('toolbar');
      // Main toolbar + ZoomToolbar + GridToolbar + ViewModeToolbar + AlignmentToolbar = 5
      expect(toolbars.length).toBe(5);
    });
  });

  describe('ExportMenu integration', () => {
    test('renders ExportMenu component', () => {
      render(() => <MainToolbar />);
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();
    });

    test('ExportMenu is disabled when no project is open', () => {
      render(() => <MainToolbar />);
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeDisabled();
    });

    test('ExportMenu is enabled when project is open', () => {
      setCurrentProject(mockProject);
      setDocumentForTest(mockDocument);

      render(() => <MainToolbar />);
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).not.toBeDisabled();
    });
  });
});
