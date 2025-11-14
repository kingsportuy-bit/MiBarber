import { useEffect, RefObject } from 'react';

type AnyEvent = MouseEvent | TouchEvent;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T> | RefObject<T>[],
  handler: (event: AnyEvent) => void,
): void {
  useEffect(() => {
    const listener = (event: AnyEvent) => {
      // Convertir ref a array si no lo es
      const refs = Array.isArray(ref) ? ref : [ref];
      
      // Verificar si alguno de los refs contiene el target
      const shouldIgnore = refs.some(refItem => {
        const el = refItem?.current;
        return el && (el === event.target || el.contains(event.target as Node));
      });
      
      if (shouldIgnore) {
        return;
      }

      handler(event);
    };

    document.addEventListener(`mousedown`, listener);
    document.addEventListener(`touchstart`, listener);

    return () => {
      document.removeEventListener(`mousedown`, listener);
      document.removeEventListener(`touchstart`, listener);
    };
  }, [ref, handler]);
}