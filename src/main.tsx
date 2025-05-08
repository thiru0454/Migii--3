import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initBusinessDatabase } from './utils/businessDatabase.ts';

// Initialize our mock business database
initBusinessDatabase();

// Log that we're using the client-side mock email service
console.log("Using client-side mock email service for development");

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/registerSW.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <App />
);
