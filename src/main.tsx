import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/marcellus/latin-400.css';
import '@fontsource/amiri/arabic-400.css';
import '@fontsource/amiri/arabic-700.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-sans-arabic/latin-400.css';
import '@fontsource/ibm-plex-sans-arabic/latin-600.css';
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
