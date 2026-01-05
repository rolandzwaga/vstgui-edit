import { UploadZone } from './components/UploadZone/UploadZone';
import { Canvas } from './components/Canvas';
import { documentStore } from './stores/documentStore';
import './styles/tokens.css';

export default function App() {
  return (
    <main style={{ padding: '2rem', margin: '0 auto' }}>
      <h1 style={{ "margin-bottom": '1.5rem', "text-align": 'center' }}>VSGUI-Edit</h1>

      {/* Show upload zone when no document, canvas when document loaded */}
      {documentStore.parseState === 'valid' ? (
        <div style={{ border: '1px solid #ccc', "min-height": '400px' }}>
          <Canvas />
        </div>
      ) : (
        <div style={{ "max-width": '600px', margin: '0 auto' }}>
          <UploadZone />
        </div>
      )}
    </main>
  );
}
