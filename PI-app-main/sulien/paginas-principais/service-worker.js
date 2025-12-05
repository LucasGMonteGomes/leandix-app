// =======================
// 📦 Cache
// =======================
const CACHE_NAME = "Lendix-v2.0";

// =======================
// 📂 Arquivos Essenciais
// =======================
const ASSETS = [

  // =======================
  // 🌐 HTML (Raiz)
  // =======================
  "/animacao.html",
  "/animacao4.html",
  "/animacaoIndex.html",
  "/index-adm.html",
  "/index-usuario.html",
  "/instalar.html",

  "/home.html",
  "/usuario.html",
  "/reservas.html",
  "/configura.html",
  "/animacaoSaida.html",

  // =======================
  // 🎨 CSS (Raiz)
  // =======================
  "/style.css",
  "/home.css",
  "/usuario.css",
  "/reservas.css",
  "/configura.css",
  "/notificacao.css",

  // =======================
  // ⚙ JS (Raiz)
  // =======================
  "/script.js",
  "/interacao.js",
  "/INTERACOES.js",
  "/usuario.js",
  "/reservas.js",
  "/configura.js",
  "/NotificacaoENDPOINT.js",

  // =======================
  // 📱 Manifest
  // =======================
  "/manifest.json",

  // =======================
  // 🖼️ Ícones PWA
  // =======================
  "/PROGRAM-PRINCIPAL/assets/icon-192x192.png",
  "/PROGRAM-PRINCIPAL/assets/icon-512x512.png",

  // =======================
  // 🔗 Icons SVG
  // =======================
  "/PROGRAM-PRINCIPAL/icons/casa.svg",
  "/PROGRAM-PRINCIPAL/icons/cecular.svg",
  "/PROGRAM-PRINCIPAL/icons/configurações.svg",
  "/PROGRAM-PRINCIPAL/icons/facebook.svg",
  "/PROGRAM-PRINCIPAL/icons/logo2.svg",
  "/PROGRAM-PRINCIPAL/icons/relogio.svg",
  "/PROGRAM-PRINCIPAL/icons/usuario.svg",
  "/PROGRAM-PRINCIPAL/icons/whatsapp.svg",

  // =======================
  // 🖼️ Imagens
  // =======================
  "/PROGRAM-PRINCIPAL/img/fundo.svg",
  "/PROGRAM-PRINCIPAL/img/icon.svg",
  "/PROGRAM-PRINCIPAL/img/logo.svg",
  "/PROGRAM-PRINCIPAL/img/logo2.svg",

  "/img/logo2.svg",
  "/img2/logo.svg",
  "/img2/logo2.svg",
  "/img2/logo2sulien.png",

  // =======================
  // 🔐 ADM - HTML
  // =======================
  "/ADM/home-adm.html",
  "/ADM/usuario-adm.html",
  "/ADM/reservas-adm.html",
  "/ADM/configura-adm.html",
  "/ADM/animacao3.html",
  "/ADM/animacaoSaida.html",

  // =======================
  // 🔐 ADM - CSS
  // =======================
  "/ADM/home.css",
  "/ADM/usuario.css",
  "/ADM/reservas.css",
  "/ADM/configura.css",

  // =======================
  // 🔐 ADM - JS
  // =======================
  "/ADM/script.js",
  "/ADM/usuario.js",
  "/ADM/reservas.js",
  "/ADM/configura.js",
  "/ADM/INTERACOES.js",

  // =======================
  // 🔐 ADM - Assets
  // =======================
  "/ADM/assets/icon-192x192.png",
  "/ADM/assets/icon-512x512.png",
  "/ADM/assets/config.js",

  // =======================
  // 🔐 ADM - SVGs
  // =======================
  "/ADM/icons/casa.svg",
  "/ADM/icons/cecular.svg",
  "/ADM/icons/configurações.svg",
  "/ADM/icons/facebook.svg",
  "/ADM/icons/logo2.svg",
  "/ADM/icons/relogio.svg",
  "/ADM/icons/usuario.svg",
  "/ADM/icons/whatsapp.svg",

  // =======================
  // 🔐 ADM - Imagens
  // =======================
  "/ADM/img/fundo.svg",
  "/ADM/img/icon.svg",
  "/ADM/img/logo.svg",
  "/ADM/img/logo2.svg",
];

// =======================
// 📥 Install
// =======================
self.addEventListener("install", event => {
  console.log("📦 Instalando Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// =======================
// 🧹 Activate
// =======================
self.addEventListener("activate", event => {
  console.log("🧹 Limpando caches antigos...");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// =======================
// 🌐 Fetch — Network First
// =======================
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
