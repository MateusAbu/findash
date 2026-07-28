import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';
import '../../styles.css';

export type ProgressBarProps = ComponentProps<'div'> & {
  /** Percentual 0–100 (valores fora do intervalo são grampeados). */
  value: number;
  /** Cor da barra como valor CSS (ex.: var(--color-warning), '#f59e0b').
   *  É prop de estilo, não classe: cor dinâmica em string de classe
   *  (`bg-${cor}`) é invisível para o scanner do Tailwind. */
  color?: string;
};

export function ProgressBar({ value, color, className, ...props }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-border', className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width]"
        style={{ width: `${clamped}%`, ...(color ? { backgroundColor: color } : {}) }}
      />
    </div>
  );
}

export default ProgressBar;
