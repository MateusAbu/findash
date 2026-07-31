import type { ComponentProps, ReactNode } from 'react';
import '../../styles.css';
export type CardProps = ComponentProps<'section'> & {
    /** Conteúdo do topo (título, ações). Omitido = sem header. */
    header?: ReactNode;
    /** Conteúdo do rodapé (ações, links). Omitido = sem footer. */
    footer?: ReactNode;
};
export declare function Card({ header, footer, className, children, ...props }: CardProps): import("react").JSX.Element;
export default Card;
