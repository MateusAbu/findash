import { Component, type ErrorInfo, type ReactNode } from 'react';
import Button from 'ds/Button';
import Card from 'ds/Card';
import EmptyState from 'ds/EmptyState';

type Props = {
  /** Nome amigável do remote (aparece no card de erro). */
  label: string;
  onRetry: () => void;
  children: ReactNode;
};

type State = { hasError: boolean };

// Único componente de CLASSE do projeto — por necessidade: apenas classes
// capturam erro de render/lazy (getDerivedStateFromError não tem hook).
// Sem isso, um remote fora do ar derruba a árvore inteira (a tela branca
// da T-1.3). RF-S4.
export default class RemoteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    // Em produção este seria o alerta nº 1 de MFE (ver T-8.3).
    console.error(
      `[shell] falha ao carregar o remote "${this.props.label}"`,
      error,
      info.componentStack,
    );
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Card>
        <EmptyState
          title={`Não foi possível carregar ${this.props.label}`}
          description="O microfrontend pode estar fora do ar. O resto do app segue funcionando."
          action={<Button onClick={this.props.onRetry}>Tentar de novo</Button>}
        />
      </Card>
    );
  }
}
