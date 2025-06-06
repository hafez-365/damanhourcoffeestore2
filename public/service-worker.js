// public/service-worker.js
const CACHE_NAME = 'damanhour-coffee-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/logo192.svg',
  '/logo512.svg',
  // '/images/placeholder.webp'
];

// مرحلة التثبيت: تخزين الموارد الأساسية مسبقاً
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// مرحلة التنشيط: حذف التخزين المؤقت القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية التخزين: الشبكة أولاً مع السقوط على التخزين المؤقت
self.addEventListener('fetch', event => {
  // تجاهل الطلبات غير GET والطلبات الخارجية
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // معالجة طلبات الصفحات
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // استراتيجية التخزين: الشبكة أولاً مع التحديث
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(event.request)
        .then(response => {
          // تخزين النسخة المحدثة
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // السقوط على التخزين المؤقت
          return cache.match(event.request)
            .then(response => response || fetch(event.request));
        });
    })
  );
});

// معالجة الرسائل من الصفحة
self.addEventListener('message', event => {
  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME)
      .then(() => self.registration.unregister());
  }
});