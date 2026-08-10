const CACHE_NAME = 'grido-lean-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/grido_lean.png'
];

// Recursos cross-origin que queremos cachear opcionalmente
const CROSS_ORIGIN_ASSETS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://unpkg.com/prop-types@15.8.1/prop-types.min.js',
  'https://unpkg.com/recharts@2.12.0/umd/Recharts.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cachear recursos locales primero
      await cache.addAll(ASSETS_TO_CACHE);
      // Intentar cachear cross-origin de forma tolerante
      for (const url of CROSS_ORIGIN_ASSETS) {
        try {
          const resp = await fetch(url, { mode: 'no-cors' });
          // En modo no-cors la respuesta puede ser opaca; aún así la guardamos
          await cache.put(url, resp);
        } catch (err) {
          // No abortamos la instalación por un fallo en recursos externos
          console.warn('No se pudo cachear', url, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Opcional: devolver un fallback si falla la red y no hay cache
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
