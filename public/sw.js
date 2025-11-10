// Service Worker for SmartMess PWA
const CACHE_NAME = 'SmartMess-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('SW: App shell cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW: Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (e.g., Cloudinary images)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip WebSocket requests
  if (event.request.url.includes('ws://') || event.request.url.includes('wss://')) {
    return;
  }

  // Skip API requests (let them go to network)
  if (event.request.url.includes('/api/') || event.request.url.includes('localhost:3000')) {
    return;
  }

  // Skip Vite dev server requests
  if (event.request.url.includes('@vite/client') || event.request.url.includes('@react-refresh')) {
    return;
  }

  // Skip hot module replacement requests
  if (event.request.url.includes('__vite_ping') || event.request.url.includes('__vite_hmr')) {
    return;
  }

  // Handle Google Fonts requests
  if (event.request.url.includes('fonts.googleapis.com') || event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.error('SW: Failed to cache font response:', error);
              });
          }
          return response;
        })
        .catch((error) => {
          console.error('SW: Font request failed:', error);
          return new Response('', { status: 404 });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Check if the response is valid
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              throw new Error('Invalid network response');
            }

            // Clone the response before caching
            const responseToCache = networkResponse.clone();

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.error('SW: Failed to cache response:', error);
              });

            return networkResponse;
          })
          .catch((error) => {
            console.error('SW: Network request failed:', error);
            
            // Return offline page for document requests
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
            
            // Return a safe empty response for other failed requests
            return new Response('', { status: 504, statusText: 'Gateway Timeout' });
          });
      })
      .catch((error) => {
        console.error('SW: Cache match failed:', error);
        return null;
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('SW: Push event received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from SmartMess',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SmartMess', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('SW: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Perform background sync operations
    console.log('SW: Performing background sync');
  } catch (error) {
    console.error('SW: Background sync failed:', error);
  }
}