import { createRoot } from 'react-dom/client';
import '@picocss/pico/css/pico.classless.slate.min.css';
import './styles.css';
import { App } from './App.tsx';

// No <StrictMode> on purpose: in development it runs every effect twice,
// which would show every request twice in the server's log and the
// browser's Network tab.
createRoot(document.getElementById('root')!).render(<App />);
