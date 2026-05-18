import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const KEY_PREFIX = 'scroll:';

export const useScrollRestoration = () => {
  const { pathname, search } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    const key = KEY_PREFIX + pathname + search;

    if (navType === 'POP') {
      const saved = sessionStorage.getItem(key);
      const y = saved ? parseInt(saved, 10) : 0;
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: 'auto' });
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    const onScroll = () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname, search, navType]);
};
