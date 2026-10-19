import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to the top when the route changes (hash routers don't do it on their own). */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
