/**
 * serviceWorkerRegistration.js
 *
 * This registers a Workbox-powered service worker (generated automatically by
 * Create React App's build process via workbox-webpack-plugin).
 *
 * What this gives you:
 *  ✅ "Add to Home Screen" / installability on iOS & Android
 *  ✅ Offline-first caching (assets served from cache when offline)
 *  ✅ Instant repeat visits (cache-first for static assets)
 *  ✅ Background sync-ready structure
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/)
);

/**
 * Call this in index.js to activate the service worker.
 * @param {object} config  Optional callbacks: { onSuccess, onUpdate }
 */
export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);

    // Our service worker won't work if PUBLIC_URL is on a different origin.
    if (publicUrl.origin !== window.location.origin) return;

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Running on localhost: check if a SW still exists or not.
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            '[TrustVerified SW] Running in offline-first mode. ' +
              'See https://cra.link/PWA'
          );
        });
      } else {
        // Not localhost: just register the service worker.
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Listen for updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available; will be used once all tabs are closed.
              console.log('[TrustVerified SW] New content available. Refresh to update.');
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Everything is now cached for offline use.
              console.log('[TrustVerified SW] Content is cached for offline use.');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('[TrustVerified SW] Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => window.location.reload());
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('[TrustVerified SW] No internet connection. App is running in offline mode.');
    });
}

/** Call this in index.js instead of register() to disable offline support. */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .catch((error) => console.error(error.message));
  }
}
