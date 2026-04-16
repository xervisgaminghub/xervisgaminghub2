import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill process for browser compatibility
if (typeof window !== 'undefined' && !window.process) {
  // @ts-ignore
  window.process = { 
    env: { 
      // @ts-ignore
      NODE_ENV: (import.meta as any).env?.MODE,
      // @ts-ignore
      ...(import.meta as any).env 
    } 
  };
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical: 'root' element not found in DOM.");
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
