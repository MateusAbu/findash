import { type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import '../../styles.css';
declare const toastVariants: (props?: ({
    variant?: "success" | "error" | "info" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type ToastProps = ComponentProps<'div'> & VariantProps<typeof toastVariants> & {
    onClose?: () => void;
};
export declare function Toast({ className, variant, onClose, children, ...props }: ToastProps): import("react").JSX.Element;
export default Toast;
