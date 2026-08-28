import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminConfigProvider } from './context/AdminConfigContext';
import { CloudflareProvider } from './context/CloudflareContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <AdminConfigProvider>
          <CloudflareProvider>
            <App />
          </CloudflareProvider>
        </AdminConfigProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);

