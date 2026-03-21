// Service Worker для Виртуального музея детского сада №24
// Стратегия: Stale-While-Revalidate для статических ресурсов

const CACHE_NAME = 'museum-v1';
const OFFLINE_URL = '/offline.html';

// Ресурсы для предварительного кэширования
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/gallery.html',
  '/portnova.html',
  '/video-gallery.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/offline.html'
];

// === УСТАНОВКА: кэшируем ключевые ресурсы ===
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS.map((url) => {
        return new Request(url, { cache: 'reload' });
      })).catch((err) => {
        // Не блокируем установку если некоторые ресурсы недоступны
        console.warn('[SW] Предварительное кэширование частично не удалось:', err);
      });
    })
  );
  // Активируем сразу, без ожидания закрытия старых вкладок
  self.skipWaiting();
});

// === АКТИВАЦИЯ: удаляем устаревшие кэши ===
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// === ПЕРЕХВАТ ЗАПРОСОВ ===
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Только GET-запросы
  if (request.method !== 'GET') return;

  // Медиафайлы (видео, аудио) требуют Range-запросов для перемотки —
  // SW не умеет их обрабатывать, пропускаем напрямую к сети
  const url = new URL(request.url);
  const isMedia = /\.(mp4|webm|ogg|mp3|wav|m4a)$/i.test(url.pathname);
  if (isMedia) return;

  // Пропускаем запросы к внешним ресурсам (шрифты Google и т.п.)
  if (url.origin !== self.location.origin) {
    // Для Google Fonts — стратегия Cache-First
    if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
      event.respondWith(
        caches.open('google-fonts-v1').then((cache) => {
          return cache.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            });
          });
        })
      );
    }
    return;
  }

  // Для HTML-страниц — Network-First (чтобы всегда получать актуальный контент)
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Для статических ресурсов (CSS, JS, изображения) — Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => null);

        // Возвращаем кэш сразу (если есть), обновляем в фоне
        return cached || fetchPromise;
      });
    })
  );
});