import { img } from '../data/foods';
import { AFIRMACOES } from '../data/statements';
import { embaralhar, pontosVF } from '../logic/scoring';
import { sfx } from '../services/audio';
import { h } from '../ui/h';
import { anunciar, feedback } from '../ui/components';
import { contador, esperarBotao, trocar } from './common';
import type { Phase } from './types';

const N = 10;

export const p5: Phase = {
  num: 5,
  titulo: 'Verdadeiro ou Falso',
  icone: 'cerebro',
  sub: 'Leia cada frase e diga se ela é verdadeira ou falsa.',
  instrucoes: [
    `São ${N} frases sobre a água dos alimentos.`,
    'Toque em VERDADEIRO ou FALSO.',
    'Cada acerto vale 10 pontos. Depois de responder, você vê a explicação.',
  ],
  dica: 'Desconfie de alimentos secos e crocantes: eles quase não têm água.',
  botao: 'Começar',

  async run({ root, signal }) {
    const lista = embaralhar(AFIRMACOES).slice(0, N);
    let acertos = 0;

    for (let i = 0; i < lista.length; i++) {
      if (signal.aborted) break;
      const a = lista[i];
      const area = h('div', { class: 'stack' });
      const bV = h('button', { type: 'button', class: 'btn btn--ok' }, '✓ Verdadeiro');
      const bF = h('button', { type: 'button', class: 'btn', style: 'background:var(--bad);color:#fff;box-shadow:0 4px 0 #7a1414' }, '✗ Falso');
      trocar(root, h('div', { class: 'stack', style: 'max-width:760px;margin:0 auto;width:100%' },
        h('div', { class: 'hud' }, contador(i + 1, N, 'Frase'), h('span', { class: 'chip' }, `${acertos} acertos`)),
        h('section', { class: 'panel stack' },
          a.food ? h('img', { src: img(a.food), alt: '', width: 96, height: 96, style: 'margin:0 auto' }) : null,
          h('p', { class: 'statement' }, `“${a.texto}”`),
          h('div', { class: 'vf' }, bV, bF)),
        area));
      bV.focus({ preventScroll: true });

      const resp = await new Promise<boolean>((res) => {
        bV.addEventListener('click', () => res(true), { once: true });
        bF.addEventListener('click', () => res(false), { once: true });
      });
      if (signal.aborted) break;
      const certo = resp === a.verdadeira;
      if (certo) acertos++;
      bV.disabled = bF.disabled = true;
      certo ? sfx.ok() : sfx.bad();
      anunciar(certo ? 'Acertou!' : 'Errou.');
      area.append(feedback(certo ? 'ok' : 'bad',
        `${certo ? 'Acertou!' : 'Errou!'} A frase é ${a.verdadeira ? 'VERDADEIRA' : 'FALSA'}.`, a.explicacao));
      await esperarBotao(area, i < N - 1 ? 'Próxima frase →' : 'Ver resultado');
    }

    return {
      pontos: pontosVF(acertos),
      resumo: h('p', null, `Você acertou ${acertos} de ${N} frases.`),
      saibaMais: 'O abacate parece "gorduroso", mas cerca de 84% dele é água!',
    };
  },
};
