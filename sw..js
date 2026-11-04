// Naikkan VERSI setiap kali index.html diubah, supaya HP mengambil versi baru.
var VERSI = "lembur-v1";
var BERKAS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSI).then(function (c) { return c.addAll(BERKAS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (daftar) {
    return Promise.all(daftar.filter(function (k) { return k.indexOf("lembur-") === 0 && k !== VERSI; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Ambil dari internet dulu (supaya selalu terbaru), kalau tidak ada sinyal pakai simpanan di HP.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      if (res && res.ok) {
        var salinan = res.clone();
        caches.open(VERSI).then(function (c) { c.put(e.request, salinan); });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (r) {
        return r || caches.match("./index.html");
      });
    })
  );
});
