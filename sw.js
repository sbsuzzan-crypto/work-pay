const CACHE_NAME = 'payroll-manager-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/config.js',
  '/js/utils/storage.js',
  '/js/utils/ui.js',
  '/js/utils/api.js',
  '/js/utils/pdf.js',
  '/js/components/dashboard.js',
  '/js/components/workers.js',
  '/js/components/contracts.js',
  '/js/components/worklog.js',
  '/js/components/advances.js',
  '/js/components/payroll.js',
  '/js/components/reports.js',
  '/js/components/settings.js',
  '/js/components/modals.js'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 