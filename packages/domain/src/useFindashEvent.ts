import { useEffect } from 'react';
import type { FindashEventMap, FindashEventName } from './events';

/**
 * Escuta um Custom Event do contrato findash:* com payload tipado e cleanup
 * automático (sem removeEventListener no unmount = listeners fantasmas).
 *
 * O handler entra nas deps: passe uma referência estável (useCallback) ou
 * aceite o re-subscribe barato a cada render.
 */
export function useFindashEvent<K extends FindashEventName>(
  name: K,
  handler: (detail: FindashEventMap[K]) => void,
): void {
  useEffect(() => {
    const listener = (event: CustomEvent<FindashEventMap[K]>) => handler(event.detail);
    window.addEventListener(name, listener as EventListener);
    return () => window.removeEventListener(name, listener as EventListener);
  }, [name, handler]);
}
