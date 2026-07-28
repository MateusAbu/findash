/**
 * Converte valor digitado pt-BR ("1.234,56", "1234,56", "50") em centavos
 * inteiros — por manipulação de STRING, nunca parseFloat (IEEE-754, T-3.1).
 * Retorna null para entrada inválida.
 */
export function parseBRLToCents(input: string): number | null {
  const normalized = input.trim().replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [reais, centavos = ''] = normalized.split('.');
  return Number(reais) * 100 + Number(centavos.padEnd(2, '0') || '0');
}
