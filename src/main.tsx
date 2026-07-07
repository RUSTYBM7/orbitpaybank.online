import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { NotificationProvider } from './state/notifications'
import ScrollToTop from './components/ScrollToTop'
import './i18n/config'
import { LanguageProvider } from './i18n/LanguageProvider'

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error);
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <NotificationProvider>
          <ScrollToTop />
          <App />
        </NotificationProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)

// FIX-13: register service worker for PWA install + offline shell
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => console.info('[orbitpay] service worker registered', reg.scope))
      .catch((err) => console.warn('[orbitpay] service worker registration failed', err));
  });
}
