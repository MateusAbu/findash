import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import Playground from './playground/Playground';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Elemento #root não encontrado no HTML gerado pelo Rsbuild');
}

createRoot(container).render(
  <StrictMode>
    <Playground />
  </StrictMode>,
);
