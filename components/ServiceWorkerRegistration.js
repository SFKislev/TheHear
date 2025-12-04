'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Defer service worker registration until page is fully loaded
    // This prevents it from competing with critical resources
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Wait for page load or 3 seconds, whichever comes first
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      };

      if (document.readyState === 'complete') {
        // Page already loaded, register immediately
        setTimeout(registerSW, 1000);
      } else {
        // Wait for page load
        window.addEventListener('load', () => {
          setTimeout(registerSW, 1000);
        });
      }
    }
  }, []);

  return null; // This component doesn't render anything
} 