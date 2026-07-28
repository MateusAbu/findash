// Tipagem manual dos módulos remotos — ponte até o DTS federado de ponta a
// ponta (T-6.1), quando este arquivo será substituído pelos tipos gerados.
declare module 'mfe_overview/OverviewPage' {
  import type { ComponentType } from 'react';
  const OverviewPage: ComponentType;
  export default OverviewPage;
}

declare module 'ds/Button' {
  import type { ComponentProps, ComponentType } from 'react';
  const Button: ComponentType<
    ComponentProps<'button'> & {
      variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
      size?: 'sm' | 'md' | 'lg';
    }
  >;
  export default Button;
}
