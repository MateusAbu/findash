import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes condicionais (clsx) e resolve conflitos de utilities
 * (tailwind-merge): cn('px-4', 'px-6') → 'px-6', determinístico.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
