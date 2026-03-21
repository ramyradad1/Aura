import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import { SpeedInsights } from '@vercel/speed-insights/react';

const rootElement = document.getElementById('root')!;

const appContent = (
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
        <SpeedInsights />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, appContent);
} else {
  createRoot(rootElement).render(appContent);
}
