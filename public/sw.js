const CACHE_NAME = 'timeline-cache-v49';

// Assets the app cannot work without. If any of these fail the install should
// fail, because an incomplete cache would break offline play.
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/puzzles.json',
    '/icon.png'
];

// Nice-to-have assets. These are cached individually so that one bad URL — a
// renamed image, a CDN blip, an offline first load — cannot abort the whole
// install and leave the app with no service worker at all. `cache.addAll()`
// is all-or-nothing, which is what used to happen here.
const OPTIONAL_ASSETS = [
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

async function cacheOptional(cache, urls) {
    await Promise.all(
        urls.map(async (url) => {
            try {
                await cache.add(new Request(url, { cache: 'reload' }));
            } catch (err) {
                console.warn('[sw] optional asset skipped:', url, err);
            }
        })
    );
}

self.addEventListener('install', event => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(CORE_ASSETS);
            await cacheOptional(cache, OPTIONAL_ASSETS);
            await self.skipWaiting();
        })()
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
            await self.clients.claim();
        })()
    );
});

// Cache lookups use ignoreSearch, so same-origin entries are keyed without the
// query string to keep reads and writes consistent.
function cacheKeyFor(request) {
    const url = new URL(request.url);
    if (url.origin === self.location.origin && url.search) {
        return new Request(url.origin + url.pathname);
    }
    return request;
}

self.addEventListener('fetch', event => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;

    // Never intercept API calls; they must fail through to the app's own
    // offline handling rather than being served stale.
    if (event.request.url.includes('/api/')) {
        return;
    }

    // Fix for Chrome 'only-if-cached' bug
    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
        return;
    }

    event.respondWith(
        (async () => {
            const cachedResponse = await caches.match(event.request, { ignoreSearch: true });

            if (cachedResponse) {
                // Stale-while-revalidate: refresh in the background.
                event.waitUntil(
                    (async () => {
                        try {
                            const response = await fetch(event.request);
                            if (response && response.status === 200 && response.type !== 'opaque') {
                                const cache = await caches.open(CACHE_NAME);
                                // Write back under the same key the lookup
                                // matched. Using event.request directly would
                                // store "/app.js?v=3" alongside "/app.js" and
                                // grow the cache on every version bump.
                                await cache.put(cacheKeyFor(event.request), response.clone());
                            }
                        } catch (err) {
                            // Offline; the cached copy is still good.
                        }
                    })()
                );
                return cachedResponse;
            }

            try {
                return await fetch(event.request);
            } catch (err) {
                // Navigations should still land on the app shell when offline.
                if (event.request.mode === 'navigate') {
                    const shell = await caches.match('/index.html');
                    if (shell) return shell;
                }
                throw err;
            }
        })()
    );
});
