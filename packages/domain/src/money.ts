const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Formata centavos inteiros como moeda — a ÚNICA divisão por 100 do sistema,
 * na borda da UI. No domínio e no storage, dinheiro é sempre inteiro.
 */
export function formatCents(cents: number): string {
  return brl.format(cents / 100);
}
