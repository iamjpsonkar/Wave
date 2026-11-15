import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DiagnosticsErrorBoundary from './DiagnosticsErrorBoundary';
import { configureDiagnostics, reportDiagnostic } from './diagnostics';
import './styles.css';

if (new URLSearchParams(window.location.search).get('waveDebug') === '1') configureDiagnostics('debug');

window.addEventListener('error', event => {
  reportDiagnostic('error', 'runtime:uncaught-error', {
    errorName: event.error instanceof Error ? event.error.name : 'Error',
    source: 'window'
  });
});
window.addEventListener('unhandledrejection', event => {
  reportDiagnostic('error', 'runtime:unhandled-rejection', {
    errorName: event.reason instanceof Error ? event.reason.name : 'NonErrorRejection',
    source: 'window'
  });
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DiagnosticsErrorBoundary><App /></DiagnosticsErrorBoundary>
  </React.StrictMode>
);
