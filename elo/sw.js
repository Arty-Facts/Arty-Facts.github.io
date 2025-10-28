// Basic offline cache for Elo Calculator (in /elo)
const CACHE_NAME = 'elo-calc';
const ASSETS = [
	'./',
	'./index.html',
	'./style.css',
	'./app.js',
	'./manifest.webmanifest',
	'./icon-128.png',
	'./icon-64.png'
];
self.addEventListener('install', event => {
	event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
	);
});
self.addEventListener('fetch', event => {
	const { request } = event;
	if (request.method !== 'GET') return;
	event.respondWith(
		caches.match(request).then(cached => {
			const fetchPromise = fetch(request).then(resp => {
				// Update runtime cache (ignore opaque failures)
				if (resp && resp.status === 200 && resp.type === 'basic') {
					const copy = resp.clone();
					caches.open(CACHE_NAME).then(c => c.put(request, copy));
				}
				return resp;
			}).catch(() => cached);
			return cached || fetchPromise;
		})
	);
});
