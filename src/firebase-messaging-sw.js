// Listen for install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Listen for activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  return self.clients.claim();
});

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

// Your Firebase config (same as frontend)
const firebaseConfig = {
  apiKey: "AIzaSyDestA8VwdF59t6sljV5SY7iodEia1VJ0Y",
  authDomain: "nestnet-105.firebaseapp.com",
  projectId: "nestnet-105",
  storageBucket: "nestnet-105.firebasestorage.app",
  messagingSenderId: "741652566094",
  appId: "1:741652566094:web:1e17a785d1a6cd461ff31f",
  measurementId: "G-1C0M1PERE1",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/assets/icons/icon-72x72.png',
    badge: '/assets/icons/icon-72x72.png',
    data: payload.data || {}
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.notification);
  event.notification.close();
  
  // Handle click based on data
  const data = event.notification.data || {};
  
  // You can open a specific URL or focus the app
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true})
      .then((clientList) => {
        // Focus existing window or open new one
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});