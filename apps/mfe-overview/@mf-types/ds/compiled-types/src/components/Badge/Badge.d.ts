import { type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import '../../styles.css';
declare const badgeVariants: (props?: ({
    variant?: "neutral" | "success" | "warning" | "error" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;
export declare function Badge({ className, variant, ...props }: BadgeProps): import("react").JSX.Element;
export default Badge;
