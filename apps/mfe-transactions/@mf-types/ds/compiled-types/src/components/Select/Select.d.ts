import type { ComponentProps } from 'react';
import '../../styles.css';
export type SelectProps = ComponentProps<'select'> & {
    invalid?: boolean;
};
export declare function Select({ className, invalid, children, ...props }: SelectProps): import("react").JSX.Element;
export default Select;
