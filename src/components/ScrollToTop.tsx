/**
 * ScrollToTop — scrolls the window to the top on every route change so
 * that following an internal link never leaves you in the middle of the
 * previous page.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // If the URL has a hash like #checking, scroll to that anchor after
    // the page renders; otherwise scroll to the top.
    if (hash) {
      // Wait a tick for the destination to mount.
      const t = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        }
      }, 60);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}
