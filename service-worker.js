/* =====================================================================
   SERVICE-WORKER.JS — GTA VI Countdown
   Service worker minimal : met en cache les fichiers du site pour un
   chargement plus rapide et un fonctionnement basique hors-ligne une
   fois la première visite effectuée. N'active aucune notification
   push serveur (voir la note dans i18n.js / le script principal :
   cela nécessiterait un serveur, ce que ce site statique n'a pas).
   ===================================================================== */

const CACHE_NAME = 'gta6-countdown-v1';
const ASSETS = [
  './gta6-countdown.html',
  './translations.js',
  './i18n.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {
      // Si un asset manque (ex. chemin différent), on n'échoue pas l'installation entière
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => cached);
    })
  );
});
