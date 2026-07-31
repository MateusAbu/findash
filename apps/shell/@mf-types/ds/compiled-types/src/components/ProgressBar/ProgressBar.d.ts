import type { ComponentProps } from 'react';
import '../../styles.css';
export type ProgressBarProps = ComponentProps<'div'> & {
    /** Percentual 0–100 (valores fora do intervalo são grampeados). */
    value: number;
    /** Cor da barra como valor CSS (ex.: var(--color-warning), '#f59e0b').
     *  É prop de estilo, não classe: cor dinâmica em string de classe
     *  (`bg-${cor}`) é invisível para o scanner do Tailwind. */
    color?: string;
};
export declare function ProgressBar({ value, color, className, ...props }: ProgressBarProps): import("react").JSX.Element;
export default ProgressBar;
