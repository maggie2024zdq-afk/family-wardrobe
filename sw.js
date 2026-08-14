// sw.js — 离线缓存
// 策略：cache-first（缓存优先）+ 后台静默更新。
// 有本地缓存时直接返回，离线/换网也能秒开；联网时在后台把最新资源写入缓存，下次打开即新版。
const CACHE = 'wardrobe-v5';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/db.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/icon-maskable.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// cache-first + 后台更新：先读缓存（离线/换网秒开），联网后在后台刷新缓存（下次打开即新版）
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // 跨域请求（如天气 API）不拦截，走网络
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached); // 网络失败（如 github.io 被墙）直接回退缓存
      return cached || network; // 有缓存则优先用缓存（不阻塞），无缓存才等网络
    })
  );
});
