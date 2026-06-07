import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005';

type Status = 'checking' | 'up' | 'down';

export function useServerStatus(): { status: Status } {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/branches/list`, {
          signal: controller.signal,
          method: 'GET',
        });
        // fetch doesn't throw on 5xx — API Gateway up / Lambda down returns 502/503
        setStatus(res.ok ? 'up' : 'down');
      } catch {
        if (!controller.signal.aborted) {
          setStatus('down');
        }
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  return { status };
}
