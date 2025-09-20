const CACHE_NAME = "medi-alert-cache-v1";
const FILES_TO_CACHE = [
  "/",               // root
  "/login.html",     // main landing
  "/insight.html",
  "/journal.html",
  "/index.html",
  "/settings.html",
  "/styles.css",
  "/login.css",
  "/signup.html",
  "/add-medicine.html"
];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});


self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
