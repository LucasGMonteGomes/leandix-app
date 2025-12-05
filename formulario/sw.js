// =======================
// 📦 Configuração de Cache
// =======================
const CACHE_NAME = "sulien-v1";
const DYNAMIC_CACHE = "sulien-dynamic";

// =======================
// 📂 Arquivos Essenciais (cache estático)
// =======================
const ASSETS = [
  // 🌐 Páginas HTML
  "/",
  "/index.html",
  "/formulario.html",
  "/loginADM.html",
  "/sucesso.html",

  // 🎨 CSS
  "/formulario.css",
  "/login.css",
  "/style.css",

  // ⚙️ JavaScript raiz
  "/script.js",
  "/interacao.js",

  // ⚙️ JavaScript Micro Serviços
  "/JavaScript-MicroServicos/MaskCNPJ.js",
  "/JavaScript-MicroServicos/MaskTelefone.js",
  "/JavaScript-MicroServicos/ValidateEmail.js",
  "/JavaScript-MicroServicos/ValidateFormFields.js",
  "/JavaScript-MicroServicos/ValidateNomeEmpresa.js",

  // ⚙️ JavaScript Perguntas Animadas
  "/JavaScript-PerguntasAnimadas/PerguntasAnimadasEmpresa.js",

  // 🧩 PHP
  "/processar_form.php",
  "/validarLogin.php",
  "/ver_dados.php",

  // 🖼️ Imagens
  "/img/logo2sulien.png",
  "/img/logo2sulien600x338.png",
  "/img/oqueleandix.jpeg",
  "/img/agencia.jpg",
  "/img/grafico.png",
  "/img/homem1.png",

  // 🎨 Ícones SVG
  "/icons/cecullar.svg",
  "/icons/facebook.svg",
  "/icons/instagram.svg",
  "/icons/twitter.svg",
  "/icons/whatsapp.svg",

  // 📱 Manifest
  "/manifest.txt"
];

// =======================
// 📦 Instalação do SW (cache inicial)
// =======================
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Caching estático inicial (Sulien)...");
      return cache.addAll(ASSETS);
    })
  );
});

// =======================
// ♻️ Ativação (limpa caches antigos)
// =======================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      );
    })
  );
});

// =======================
// 🔄 Estratégia: Cache First + Dynamic Cache
// =======================
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request)
        .then(res => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            if (event.request.url.startsWith("http")) {
              cache.put(event.request, res.clone());
            }
            return res;
          });
        })
        .catch(() => {
          // fallback: se for imagem e falhar, retorna logo
          if (event.request.destination === "image") {
            return caches.match("/img/logo2sulien.png");
          }
        });
    })
  );
});
