const CACHE_NAME = 'timeline-cache-v40';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/puzzles.json',
    '/icon.png',
    '/fonts/NewYorker.otf',
    '/images/bg_elegant_dark.jpg',
    '/images/bg_elegant_light.jpg',
    '/images/bg_steampunk.jpg',
    '/images/bg_new_yorker_dark.jpg',
    '/images/bg_new_yorker_paper.jpg',
    '/images/bg_ny_ribbon.jpg',
    '/images/bg_ny_ribbon_wide.jpg',
    '/images/icon_ny_compass.jpg',
    '/images/icon_ny_info.jpg',
    '/images/icon_ny_gear.jpg',
    '/sounds/default_drop.mp3',
    '/sounds/default_confirm.mp3',
    '/sounds/default_complete.mp3',
    '/sounds/elegant_drop.mp3',
    '/sounds/elegant_confirm.mp3',
    '/sounds/elegant_complete.mp3',
    '/sounds/steampunk_drop.mp3',
    '/sounds/steampunk_confirm.mp3',
    '/sounds/steampunk_complete.mp3',
    '/music/Glass_Dark.mp3',
    '/music/Elegant_Dark.mp3',
    '/music/Elegant_Light.mp3',
    '/music/Steampunk.mp3',
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;
    
    // Don't intercept API calls except allowing them to fail gracefully to offline logic
    if (event.request.url.includes('/api/')) {
        return;
    }

    // Fix for Chrome 'only-if-cached' bug
    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
        return;
    }

    event.respondWith(
        caches.match(event.request, { ignoreSearch: true })
            .then(cachedResponse => {
                // Return cached response if found
                if (cachedResponse) {
                    // Update cache in the background
                    fetch(event.request).then(response => {
                        if (response && response.status === 200) {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, response);
                            });
                        }
                    }).catch(() => {});
                    
                    return cachedResponse;
                }
                
                // If not in cache, fetch from network
                return fetch(event.request).catch(error => {
                    console.error('Fetch failed:', error, event.request.url);
                    throw error;
                });
            })
    );
});
