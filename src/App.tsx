import { UploadZone } from './components/UploadZone/UploadZone';
import './styles/tokens.css';

export default function App() {
  return (
    <main style={{ padding: '2rem', "max-width": '600px', margin: '0 auto' }}>
      <h1 style={{ "margin-bottom": '1.5rem', "text-align": 'center' }}>VSGUI-Edit</h1>
      <UploadZone />
    </main>
  );
}
