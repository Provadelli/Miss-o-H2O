import { food, img } from '../data/foods';
import { PERGUNTAS } from '../data/questions';
import { embaralhar, GOTAS_INICIAIS, passoDetetive, pontosDetetive } from '../logic/scoring';
import { sfx } from '../services/audio';
import { h } from '../ui/h';
import { anunciar, chip, feedback, gota } from '../ui/components';
import { contador, esperarBotao, trocar } from './common';
import type { Phase } from './types';

const N = 8;

export const p2: Phase = {
  num: 2,
  titulo: 'Detetive da Água',
  icone: 'lupa',
  sub: 'Você é um detetive e precisa descobrir onde a água está escondida nos alimentos.',
  instrucoes: [
    `Responda ${N} perguntas escolhendo A, B ou C.`,
    `Você começa com ${GOTAS_INICIAIS} gotinhas.`,
    'Acertou: ganha 1 gotinha. Errou: perde 1 gotinha.',
    'Não tem tempo: pense com calma!',
  ],
  dica: 'Alguns alimentos têm muita água, mesmo sem parecer!',
  botao: 'Vamos lá!',

  async run({ root, signal }) {
    const perguntas = embaralhar(PERGUNTAS).slice(0, N);
    let gotas = GOTAS_INICIAIS;
    let acertos = 0;

    for (let i = 0; i < perguntas.length; i++) {
      if (signal.aborted) break;
      const q = perguntas[i];
      const hud = h('div', { class: 'hud' }, contador(i + 1, N),
        chip([gota(), ` ${gotas} gotas`], false, `${gotas} gotas`));
      const area = h('div', { class: 'stack' });
      const botoes = q.opcoes.map((o, k) => h('button', { type: 'button', class: 'choice' },
        h('span', { class: 'choice__letter', 'aria-hidden': 'true' }, 'ABC'[k]),
        o.food ? h('img', { src: img(o.food), alt: '', width: 48, height: 48 }) : null,
        h('span', null, o.texto ?? food(o.food!).nome)));
      trocar(root, h('div', { class: 'stack', style: 'max-width:760px;margin:0 auto;width:100%' },
        hud,
        h('section', { class: 'panel stack' },
          h('h2', { style: 'font-size:1.5rem;color:var(--navy)' }, '🔎 ', q.pergunta),
          h('div', { class: 'choices' }, botoes)),
        area));
      botoes[0].focus({ preventScroll: true });

      const escolha = await new Promise<number>((res) =>
        botoes.forEach((b, k) => b.addEventListener('click', () => res(k), { once: true })));
      if (signal.aborted) break;
      const certo = escolha === q.correta;
      if (certo) acertos++;
      gotas = passoDetetive(gotas, certo);
      botoes.forEach((b, k) => {
        b.disabled = true;
        if (k === q.correta) b.classList.add('choice--ok');
        else if (k === escolha) b.classList.add('choice--bad');
      });
      certo ? sfx.ok() : sfx.bad();
      anunciar(certo ? 'Acertou! Ganhou uma gota.' : 'Errou. Perdeu uma gota.');
      area.append(feedback(certo ? 'ok' : 'bad', certo ? 'Acertou! +1 gotinha' : 'Errou! −1 gotinha', q.explicacao));
      await esperarBotao(area, i < N - 1 ? 'Próxima pergunta →' : 'Ver resultado');
    }

    return {
      pontos: pontosDetetive(acertos, gotas),
      resumo: h('p', null, `Você acertou ${acertos} de ${N} perguntas e terminou com ${gotas} gotinhas. `,
        h('br'), h('small', { class: 'muted' }, 'Pontos = acertos × 10 + gotinhas × 4 (máximo 100).')),
      saibaMais: 'O feijão e o arroz absorvem água no cozimento: cozidos, têm cerca de 80% e 69% de água.',
    };
  },
};
