self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('sgr-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/app.js',
        '/style.css',
        '/assets/images/icon.png',
        '/assets/images/adaptive-icon.png',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});