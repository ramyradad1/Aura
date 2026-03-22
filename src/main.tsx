import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App.tsx';
import './index.css';

import './index.css';

function ErrorFallback({ error }: { error: any }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 text-center">
      <div className="rounded-xl border border-danger-200 bg-danger-50 p-8 max-w-md shadow-lg">
        <h2 className="text-xl font-bold text-danger-800 mb-4">Something went wrong!</h2>
        <p className="text-danger-600 mb-4 text-sm wrap-break-word">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);
