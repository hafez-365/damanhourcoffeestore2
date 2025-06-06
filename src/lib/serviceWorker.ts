// src/lib/serviceWorker.ts
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registered: ', registration.scope);
          
          // التحقق من وجود تحديثات
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('New content is available; please refresh.');
                    // يمكنك هنا عرض إشعار للمستخدم لتحديث الصفحة
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
};

// دالة لحذف التخزين المؤقت عند إصدار تحديث جديد
export const clearOldCaches = async () => {
  const cacheNames = await caches.keys();
  const currentCacheName = 'damanhour-coffee-v1';
  
  return Promise.all(
    cacheNames
      .filter(cacheName => cacheName !== currentCacheName)
      .map(cacheName => caches.delete(cacheName))
  );
};