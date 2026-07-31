import type { ComponentProps, ReactNode } from 'react';
import '../../styles.css';
export type EmptyStateProps = ComponentProps<'div'> & {
    title: string;
    description?: string;
    /** Ação sugerida (normalmente um <Button>). */
    action?: ReactNode;
};
export declare function EmptyState({ title, description, action, className, ...props }: EmptyStateProps): import("react").JSX.Element;
export default EmptyState;
