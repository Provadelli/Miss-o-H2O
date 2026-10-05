import { food } from '../data/foods';
import { NUM_DUELOS, pontosDuelo, sortearDuelos } from '../logic/scoring';
import { sfx } from '../services/audio';
import { h } from '../ui/h';
import { anunciar, feedback, foodCard } from '../ui/components';
import { contador, espera, esperarBotao, trocar } from './common';
import type { Phase } from './types';

export const p6: Phase = {
  num: 6,
  titulo: 'Quem Tem Mais Água?',
  icone: 'balanca',
  sub: 'Dois alimentos se enfrentam. Qual deles tem mais água?',
  instrucoes: [
    `São ${NUM_DUELOS} duelos.`,
    'Toque no alimento que você acha que tem MAIS água.',
    'Cada acerto vale 10 pontos. Acertando todos, ganha +20 de bônus!',
  ],
  dica: 'Compare a porcentagem: é a água em cada 100 g do alimento.',
  botao: 'Começar duelo',

  async run({ root, signal }) {
    const duelos = sortearDuelos();
    let acertos = 0;

    for (let i = 0; i < duelos.length; i++) {
      if (signal.aborted) break;
      const [a, b] = duelos[i];
      const fa = food(a), fb = food(b);
      const area = h('div', { class: 'stack' });
      let resolver!: (id: string) => void;
      const escolhido = new Promise<string>((r) => (resolver = r));
      const cardA = foodCard(a, { onClick: () => resolver(a), label: `${fa.nome}` });
      const cardB = foodCard(b, { onClick: () => resolver(b), label: `${fb.nome}` });
      trocar(root, h('div', { class: 'stack', style: 'max-width:760px;margin:0 auto;width:100%' },
        h('div', { class: 'hud' }, contador(i + 1, NUM_DUELOS, 'Duelo'), h('span', { class: 'chip' }, `${acertos} acertos`)),
        h('section', { class: 'panel stack' },
          h('h2', { class: 'center', style: 'font-size:1.5rem;color:var(--navy)' }, 'Quem tem mais água?'),
          h('div', { class: 'duel' }, cardA, h('span', { class: 'duel__vs', 'aria-hidden': 'true' }, 'VS'), cardB)),
        area));
      cardA.focus({ preventScroll: true });

      const esc = await escolhido;
      if (signal.aborted) break;
      const vencedor = fa.aguaPct > fb.aguaPct ? a : b;
      const certo = esc === vencedor;
      if (certo) acertos++;
      [cardA, cardB].forEach((c) => ((c as HTMLButtonElement).disabled = true));
      (vencedor === a ? cardA : cardB).classList.add('food--ok');
      if (!certo) (esc === a ? cardA : cardB).classList.add('food--bad');
      certo ? sfx.ok() : sfx.bad();

      // Barras animadas com as porcentagens
      const barra = (nome: string, pct: number) => {
        const fill = h('div', { class: 'bar-compare__fill' });
        requestAnimationFrame(() => requestAnimationFrame(() => (fill.style.width = `${pct}%`)));
        return h('div', { class: 'bar-compare__row' },
          h('span', null, nome), h('div', { class: 'bar-compare__track' }, fill), h('span', null, `${pct}%`));
      };
      area.append(
        h('section', { class: 'panel bar-compare', 'aria-label': `${fa.nome} ${fa.aguaPct}%, ${fb.nome} ${fb.aguaPct}%` },
          barra(fa.nome, fa.aguaPct), barra(fb.nome, fb.aguaPct)),
        feedback(certo ? 'ok' : 'bad', certo ? 'Acertou! +10' : 'Errou!',
          `${food(vencedor).nome} tem ${food(vencedor).aguaPct}% de água.`));
      anunciar(`${certo ? 'Acertou' : 'Errou'}. ${fa.nome} tem ${fa.aguaPct} por cento e ${fb.nome} tem ${fb.aguaPct} por cento de água.`);
      await espera(400);
      await esperarBotao(area, i < duelos.length - 1 ? 'Próximo duelo →' : 'Ver resultado');
    }

    const perfeito = acertos === NUM_DUELOS;
    return {
      pontos: pontosDuelo(acertos),
      resumo: h('p', null, `Você acertou ${acertos} de ${NUM_DUELOS} duelos.`, perfeito ? ' Sequência perfeita: +20 de bônus!' : ''),
      saibaMais: 'O pepino (97%) e a alface (96%) estão entre os alimentos com mais água que existem.',
    };
  },
};
