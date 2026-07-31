import { type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import '../../styles.css';
declare const buttonVariants: (props?: ({
    variant?: "primary" | "secondary" | "ghost" | "danger" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;
export declare function Button({ className, variant, size, type, ...props }: ButtonProps): import("react").JSX.Element;
export default Button;
