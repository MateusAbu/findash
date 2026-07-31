import type { ComponentProps } from 'react';
import '../../styles.css';
export type InputProps = ComponentProps<'input'> & {
    /** Marca o campo como inválido: aria-invalid + borda de erro, sempre juntos. */
    invalid?: boolean;
};
export declare function Input({ className, invalid, ...props }: InputProps): import("react").JSX.Element;
export default Input;
