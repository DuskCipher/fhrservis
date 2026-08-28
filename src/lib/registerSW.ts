/**
 * Service Worker Registration & PWA Utilities
 */

export interface SWRegistrationCallbacks {
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
}

let registration: ServiceWorkerRegistration | null = null;

export function registerServiceWorker(callbacks?: SWRegistrationCallbacks) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[PWA] Service Worker registered with scope:', registration.scope);

      // Check if there is already a waiting worker
      if (registration.waiting) {
        callbacks?.onNeedRefresh?.();
      }

      // Listen for new service worker installing
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration?.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available; please refresh.
              console.log('[PWA] New content available. Ready to refresh.');
              callbacks?.onNeedRefresh?.();
            } else {
              // Content is cached for offline use.
              console.log('[PWA] Content cached for offline use.');
              callbacks?.onOfflineReady?.();
            }
          }
        });
      });
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  });

  // Reload page when new worker takes control
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

export function updateServiceWorker() {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  } else {
    window.location.reload();
  }
}
