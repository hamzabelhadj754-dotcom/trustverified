import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ── PWA: Register the service worker so the app is installable ──────────────
// Change register() → unregister() if you ever want to disable offline support.
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Optional: notify users when a new version is available
    const waitingWorker = registration.waiting;
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  },
});
