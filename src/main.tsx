import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './lib/registerSW.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Progressive Web App (PWA) Service Worker
registerServiceWorker({
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('pwa-need-refresh'));
  },
  onOfflineReady() {
    console.log('[PWA] FHRCAR is ready for offline usage.');
  },
});

