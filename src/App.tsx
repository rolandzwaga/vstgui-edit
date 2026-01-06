import { UploadZone } from './components/UploadZone/UploadZone';
import { Canvas } from './components/Canvas';
import { MainToolbar } from './components/MainToolbar';
import { documentStore } from './stores/documentStore';
import { fitToView } from './stores/canvasStore';
import type { TemplateDefinition } from './types/uidesc';
import './styles/tokens.css';

export default function App() {
  const handleFitToView = () => {
    const viewportWidth = window.innerWidth - 64;
    const viewportHeight = window.innerHeight - 200;

    const doc = documentStore.document;
    const vstgui = doc?.['vstgui-ui-description'];
    const templates = vstgui?.templates;
    if (!templates) return;

    const firstTemplate = Object.values(templates)[0] as TemplateDefinition | undefined;
    if (!firstTemplate?.attributes?.size) return;

    const [width, height] = firstTemplate.attributes.size.split(',').map((s) => Number.parseInt(s.trim(), 10));
    if (Number.isNaN(width) || Number.isNaN(height)) return;

    fitToView({ width: viewportWidth, height: viewportHeight }, { width, height });
  };

  return (
    <main style={{ padding: '1rem', margin: '0 auto', "padding-top":  documentStore.parseState === 'valid' ? 0 : '2rem'}}>
      {/* Show upload zone when no document, canvas when document loaded */}
      {documentStore.parseState === 'valid' ? (
        <div style={{ "min-height": '400px' }}>
          <MainToolbar onFitToView={handleFitToView} />
          <Canvas />
        </div>
      ) : (
        <>
        <h1 style={{ "margin-bottom": '1.5rem', "text-align": 'center' }}>VSTGUI-Edit</h1>
        <div style={{ "max-width": '600px', margin: '0 auto' }}>
          <UploadZone />
        </div>
        </>
      )}
    </main>
  );
}
