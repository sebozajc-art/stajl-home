// Stajl Home – service worker: aplikacijska lupina deluje tudi ob slabi povezavi
const PREDPOMNILNIK = 'stajl-home-v12';
const LUPINA = ['./', './index.html', './manifest.json', './ikona-stajl-180.png', './ikona-stajl-512.png', './logo-stajl.png', './logo-mono.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(PREDPOMNILNIK).then(c => c.addAll(LUPINA)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== PREDPOMNILNIK).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Supabase gre vedno v omrežje
  // strani (HTML) vedno preveri na strežniku, da je takoj nova verzija
  const html = e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  e.respondWith(fetch(e.request, html ? { cache: 'no-cache' } : undefined).then(r => {
    const kopija = r.clone();
    caches.open(PREDPOMNILNIK).then(c => c.put(e.request, kopija));
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
