/**
 * Registers the service worker for PWA support
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((registration) => {
        if (window.app && window.app.debug) {
          window.app.debug('ServiceWorker registration successful with scope: ', registration.scope);
        }
      }).catch((err) => {
        if (window.app && window.app.debug) {
          window.app.debug('ServiceWorker registration failed: ', err);
        }
      });
    });
  }
}

registerServiceWorker();
