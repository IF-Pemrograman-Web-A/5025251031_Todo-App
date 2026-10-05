const CACHE_NAME = 'todo-app-v2';
const ASSETS = ['./', './index.html', './style.css', './index.js'];

self.addEventListener('install', event => {
    console.log('Service worker is installing...'); 
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', event => {
    console.log('Service worker is activating...');
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        ))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});