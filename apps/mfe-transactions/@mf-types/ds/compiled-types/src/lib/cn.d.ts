import { type ClassValue } from 'clsx';
/**
 * Combina classes condicionais (clsx) e resolve conflitos de utilities
 * (tailwind-merge): cn('px-4', 'px-6') → 'px-6', determinístico.
 */
export declare function cn(...inputs: ClassValue[]): string;
