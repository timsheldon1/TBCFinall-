import { useEffect, RefObject } from 'react';

export function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: () => void,
): void {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  // refs are stable — only callback identity matters
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback]);
}
