import { lazy, Suspense, useState, type ComponentType, type LazyExoticComponent } from 'react';
import Skeleton from 'ds/Skeleton';
import RemoteErrorBoundary from './RemoteErrorBoundary';

type Loader = () => Promise<{ default: ComponentType }>;

// Sizing via style (não className): o shell não compila Tailwind — só as
// classes já presentes no CSS federado do DS existem aqui.
function PageSkeleton() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Skeleton style={{ height: 96 }} />
      <Skeleton style={{ height: 240 }} />
      <Skeleton style={{ height: 160 }} />
    </div>
  );
}

type Props = {
  loader: Loader;
  label: string;
};

// O wrapper de todo remote de página (RF-S3/S4): lazy + Suspense + boundary.
export default function RemotePage({ loader, label }: Props) {
  // lazy() guarda a Promise do 1º import() — se ela rejeitou, fica rejeitada
  // para sempre. Retry = criar um lazy NOVO (novo import(), nova ida à rede)
  // e remontar o boundary via key (limpa o estado de erro).
  const [attempt, setAttempt] = useState(0);
  const [Page, setPage] = useState<LazyExoticComponent<ComponentType>>(() => lazy(loader));

  function retry() {
    setPage(() => lazy(loader));
    setAttempt((a) => a + 1);
  }

  return (
    <RemoteErrorBoundary key={attempt} label={label} onRetry={retry}>
      <Suspense fallback={<PageSkeleton />}>
        <Page />
      </Suspense>
    </RemoteErrorBoundary>
  );
}
