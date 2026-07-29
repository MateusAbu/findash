const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Formata centavos inteiros como moeda — a ÚNICA divisão por 100 do sistema,
 * na borda da UI. No domínio e no storage, dinheiro é sempre inteiro.
 */
export function formatCents(cents: number): string {
  return brl.format(cents / 100);
}

/**
 * Converte valor digitado pt-BR ("1.234,56", "1234,56", "50") em centavos
 * inteiros — por manipulação de STRING, nunca parseFloat (IEEE-754).
 * Retorna null para entrada inválida. Par do formatCents (borda oposta).
 * Promovida do mfe-transactions quando o mfe-goals virou o 2º consumidor.
 */
export function parseBRLToCents(input: string): number | null {
  const normalized = input.trim().replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [reais, centavos = ''] = normalized.split('.');
  return Number(reais) * 100 + Number(centavos.padEnd(2, '0') || '0');
}
