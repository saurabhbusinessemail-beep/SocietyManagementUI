importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDestA8VwdF59t6sljV5SY7iodEia1VJ0Y",
  authDomain: "nestnet-105.firebaseapp.com",
  projectId: "nestnet-105",
  storageBucket: "nestnet-105.firebasestorage.app",
  messagingSenderId: "741652566094",
  appId: "1:741652566094:web:1e17a785d1a6cd461ff31f",
  measurementId: "G-1C0M1PERE1",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/assets/icon.png',
    badge: '/assets/badge.png',
    data: payload.data || {}
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});