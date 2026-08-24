/* guarda o app no aparelho: abre sem internet e atualiza em segundo plano */
var CACHE = 'orcamento-v1';
var ARQUIVOS = ['./', './index.html', './manifest.json', './icone-180.png', './icone-512.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARQUIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if(k !== CACHE) return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  if(new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function(guardado){
      var rede = fetch(e.request).then(function(resp){
        if(resp && resp.status === 200){
          var copia = resp.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copia); });
        }
        return resp;
      }).catch(function(){ return guardado || caches.match('./index.html'); });
      return guardado || rede;
    })
  );
});