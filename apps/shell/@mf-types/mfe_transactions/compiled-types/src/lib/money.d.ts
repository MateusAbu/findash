/**
 * Converte valor digitado pt-BR ("1.234,56", "1234,56", "50") em centavos
 * inteiros — por manipulação de STRING, nunca parseFloat (IEEE-754, T-3.1).
 * Retorna null para entrada inválida.
 */
export declare function parseBRLToCents(input: string): number | null;
