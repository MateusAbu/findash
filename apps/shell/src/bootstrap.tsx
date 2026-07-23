import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
// getElementById devolve HTMLElement | null — o strictNullChecks (T-0.2)
// obriga a tratar o null aqui, na fronteira com o DOM.
if (!container) {
  throw new Error('Elemento #root não encontrado no HTML gerado pelo Rsbuild');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
