const CACHE_NAME = 'havsite-cache-v1';
const urlsToCache = [
  'offline.html',
  'myscript.js',
  'images/logo_og.png',
  'images/logo_192.png',
  'images/logo_512.png',
  'images/home_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.html',
  'fonts/national-park-v1-latin-regular.woff2',
  'fonts/poppins-v23-latin-regular.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => caches.match('offline.html'));
    })
  );
});