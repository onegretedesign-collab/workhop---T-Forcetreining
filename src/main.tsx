import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent pinch-to-zoom and gesture expansion on mobile devices
if (typeof window !== 'undefined') {
  // Prevent multi-touch pinch zoom
  window.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  window.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // Prevent iOS Safari gesture zoom events
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());

  // Prevent double-tap to zoom
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        // Only prevent default on non-interactive elements to allow normal clicking
        const target = e.target as HTMLElement;
        if (!target.closest('button, a, input, select, textarea, [role="button"]')) {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );
}

createRoot(document.getElementById('root')!).render(<App />);
