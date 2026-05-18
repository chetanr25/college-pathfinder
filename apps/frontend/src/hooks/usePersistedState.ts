import { useEffect, useRef, useState } from 'react';

type Storage = 'session' | 'local';

const getStore = (kind: Storage) =>
  kind === 'local' ? window.localStorage : window.sessionStorage;

export function usePersistedState<T>(
  key: string,
  initial: T,
  storage: Storage = 'session'
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const store = getStore(storage);
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = store.getItem(key);
      if (raw === null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  const keyRef = useRef(key);
  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  useEffect(() => {
    try {
      store.setItem(keyRef.current, JSON.stringify(value));
    } catch {
      /* quota or serialization error — ignore */
    }
  }, [value, store]);

  return [value, setValue];
}

export function clearPersistedState(key: string, storage: Storage = 'session') {
  try {
    getStore(storage).removeItem(key);
  } catch {
    /* ignore */
  }
}
