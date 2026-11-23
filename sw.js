// Guarda la página y sus recursos para poder mostrar el código QR sin conexión.
const CACHE = 'comedor-v1';
const ASSETS = [
  './', './index.html', './escudo-unmsm.png', './manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0/dist/umd/supabase.js',
  'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.url.includes('supabase.co')) return; // datos siempre en vivo
  if (req.mode === 'navigate') {
    // la página: primero la red (para tener la última versión), si no hay conexión, la copia guardada
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // librerías e imágenes: primero la copia guardada
  e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => {
    if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
    return r;
  })));
});
