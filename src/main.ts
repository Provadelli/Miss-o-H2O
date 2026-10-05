import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

import { iniciarReenvio } from './services/api';
import { pararFala } from './services/speech';
import { aplicar } from './state/settings';
import type { Cleanup, Screen } from './router';
import { clear } from './ui/h';
import { telaInicio } from './screens/home';
import { telaNome } from './screens/nameEntry';
import { telaMapa } from './screens/phaseMap';
import { telaFase } from './screens/phase';
import { telaFinal } from './screens/results';
import { telaPodio } from './screens/podium';


const rotas: [RegExp, Screen][] = [
  [/^\/?$/, telaInicio],
  [/^\/nome$/, telaNome],
  [/^\/fases$/, telaMapa],
  [/^\/fase\/([1-7])$/, telaFase],
  [/^\/final$/, telaFinal],
  [/^\/podio$/, telaPodio],
];

const app = document.getElementById('app')!;
let limpar: Cleanup;

function render(): void {
  if (typeof limpar === 'function') limpar();
  limpar = undefined;
  pararFala();
  document.querySelector('.modal-backdrop')?.remove();
  const path = location.hash.replace(/^#/, '') || '/';
  for (const [re, tela] of rotas) {
    const m = path.match(re);
    if (m) {
      clear(app);
      window.scrollTo(0, 0);
      limpar = tela(app, m[1]);
      // Foco no conteúdo novo para leitores de tela e teclado
      const alvo = app.querySelector<HTMLElement>('h1, h2') ?? app;
      if (alvo !== app) alvo.setAttribute('tabindex', '-1');
      alvo.focus({ preventScroll: true });
      return;
    }
  }
  location.hash = '/';
}

aplicar();
window.addEventListener('hashchange', render);
render();
iniciarReenvio();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* PWA é opcional */ });
  });
}
