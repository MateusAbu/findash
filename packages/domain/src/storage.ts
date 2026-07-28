/**
 * Fronteira com o localStorage: leitura com try/catch e validação leve.
 * Dado corrompido é descartado com aviso — nunca derruba o app (a UI trata
 * lista vazia; um throw aqui apagaria a tela inteira).
 */
export function readCollection<T>(key: string, isValid: (item: unknown) => item is T): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn(`[findash] conteúdo inesperado em "${key}" — ignorando`);
      return [];
    }
    return parsed.filter(isValid);
  } catch (error) {
    console.warn(`[findash] falha ao ler "${key}" — ignorando`, error);
    return [];
  }
}

export function writeCollection<T>(key: string, items: readonly T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}
