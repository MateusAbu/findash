// Tipagem manual dos módulos remotos — ponte até o DTS federado de ponta a
// ponta (T-6.1), quando este arquivo será substituído pelos tipos gerados.
declare module 'mfe_overview/OverviewPage' {
  import type { ComponentType } from 'react';
  const OverviewPage: ComponentType;
  export default OverviewPage;
}
