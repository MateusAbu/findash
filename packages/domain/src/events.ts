import type { Transaction } from './types';

/**
 * Contrato dos Custom Events (seção 5 da spec). Prefixo findash: evita
 * colisão com eventos nativos/de terceiros. Comunicação SEM dependência de
 * módulo: emissor e ouvinte só compartilham este contrato de tipos.
 */
export interface FindashEventMap {
  'findash:transaction-added': { transaction: Transaction };
  'findash:goal-contribution': { goalId: string; amountCents: number };
}

export type FindashEventName = keyof FindashEventMap;

export function emitFindashEvent<K extends FindashEventName>(
  name: K,
  detail: FindashEventMap[K],
): void {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

// Declaration merging no WindowEventMap: window.addEventListener('findash:...')
// ganha autocomplete e event.detail tipado em qualquer app que importe o pacote.
declare global {
  interface WindowEventMap {
    'findash:transaction-added': CustomEvent<FindashEventMap['findash:transaction-added']>;
    'findash:goal-contribution': CustomEvent<FindashEventMap['findash:goal-contribution']>;
  }
}
