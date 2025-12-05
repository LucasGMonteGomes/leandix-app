// =======================
// 📦 Configuração de Cache
// =======================
const CACHE_NAME = "Lendix-v1.1";

// =======================
// 📂 Arquivos Essenciais
// =======================
const ASSETS = [

  // HTML
  "/app/index.html",
  "/app/home.html",
  "/app/instalar.html",

  // CSS
  "/app/style.css",
  "/app/home.css",

  // JS
  "/app/script.js",

  // Manifest
  "/app/manifest.json",

  // Ícones PWA
  "/app/assets/icon-192x192.png",
  "/app/assets/icon-512x512.png",

  // Icons SVG (menu, redes, etc)
  "/app/icons/casa.svg",
  "/app/icons/cecular.svg",
  "/app/icons/configurações.svg",
  "/app/icons/facebook.svg",
  "/app/icons/logo2.svg",
  "/app/icons/relogio.svg",
  "/app/icons/usuario.svg",
  "/app/icons/whatsapp.svg",

  // Imagens
  "/app/img/fundo.svg",
  "/app/img/icon.svg",
  "/app/img/logo.svg",
  "/app/img/logo2.svg",
];

// =======================
// 📥 Instalação
// =======================
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Caching estático inicial...");
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// =======================
// 🧹 Ativação
// =======================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Deletando cache antigo:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// =======================
// 🌐 Fetch (Network-first)
// =======================
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => caches.match(event.request))
  );
});
