import { aguaMl, food, img } from '../data/foods';
import { FAIXAS_PRATO, pontosPrato, resumoPrato } from '../logic/scoring';
import { sfx } from '../services/audio';
import { clear, h } from '../ui/h';
import { anunciar, feedback, fmtMl, foodCard } from '../ui/components';
import { esperarBotao, trocar } from './common';
import type { Phase } from './types';

const OPCOES = ['cereal', 'leite', 'paoforma', 'banana', 'iogurte', 'suco', 'ovo', 'presunto', 'queijo', 'melancia'];
const MAX = 5;

export const p1: Phase = {
  num: 1,
  titulo: 'Desafio do Prato',
  icone: 'prato',
  sub: 'Monte seu prato. Cada alimento tem uma quantidade de água escondida!',
  instrucoes: [
    `Toque nos alimentos para colocar no prato (até ${MAX}).`,
    'As gotas mostram se o alimento tem pouca, média ou muita água.',
    'Depois, tente adivinhar quantos mL de água tem o seu prato.',
    'Prato com mais de 60% de água ganha bônus!',
  ],
  dica: 'Frutas e bebidas costumam ter muita água. Pães e cereais, pouca.',
  botao: 'Monte seu prato',

  run({ root, signal }) {
    return new Promise((resolve) => {
      const sel: string[] = [];
      const grade = h('div', { class: 'food-grid' });
      const prato = h('div', { class: 'plate', role: 'img', 'aria-label': 'Prato vazio' });
      const conta = h('p', { class: 'center', style: 'font-weight:800' });
      const pronto = h('button', { type: 'button', class: 'btn btn--primary btn--big btn--block', disabled: true }, 'Pronto! →');

      const render = (foco = -1) => {
        clear(grade);
        for (const id of OPCOES) {
          const fd = food(id);
          const on = sel.includes(id);
          grade.append(foodCard(id, {
            showDrops: true, pressed: on,
            disabled: !on && sel.length >= MAX,
            meta: [fd.porcaoLabel],
            label: `${fd.nome}, ${fd.porcaoLabel}. ${on ? 'No prato. Toque para tirar.' : 'Toque para colocar no prato.'}`,
            onClick: () => {
              if (on) sel.splice(sel.indexOf(id), 1);
              else if (sel.length < MAX) sel.push(id);
              render(OPCOES.indexOf(id)); // mantém o foco do teclado no mesmo cartão
            },
          }));
        }
        clear(prato);
        sel.forEach((id) => prato.append(h('img', { src: img(id), alt: '', width: 64, height: 64 })));
        prato.setAttribute('aria-label', sel.length ? `No prato: ${sel.map((id) => food(id).nome).join(', ')}` : 'Prato vazio');
        conta.textContent = `${sel.length} de ${MAX} alimentos`;
        pronto.disabled = sel.length === 0;
        if (foco >= 0) (grade.children[foco] as HTMLElement | undefined)?.focus();
      };
      render();

      pronto.addEventListener('click', () => { sfx.tap(); chutar(); });
      trocar(root, h('div', { class: 'split' },
        h('section', { 'aria-label': 'Alimentos' }, grade),
        h('aside', { class: 'panel stack sticky' }, h('h2', { class: 'panel__title' }, 'Seu prato'), prato, conta, pronto)));

      function chutar() {
        const pratoFixo = sel.slice();
        const opcoes = h('div', { class: 'choices' }, FAIXAS_PRATO.map((f, i) =>
          h('button', { type: 'button', class: 'choice', onclick: () => revelar(pratoFixo, i) },
            h('span', { class: 'choice__letter', 'aria-hidden': 'true' }, String.fromCharCode(65 + i)), f.label)));
        trocar(root,
          h('section', { class: 'panel stack' },
            h('h2', { class: 'panel__title' }, 'Seu palpite'),
            h('div', { class: 'row', style: 'justify-content:center' }, pratoFixo.map((id) => h('img', { src: img(id), alt: food(id).nome, width: 56, height: 56 }))),
            h('p', { style: 'font-weight:800;font-size:1.2rem' }, 'Quantos mL de água você acha que tem no seu prato?'),
            opcoes));
        (opcoes.firstElementChild as HTMLElement)?.focus();
      }

      async function revelar(ids: string[], chute: number) {
        if (signal.aborted) return;
        const r = pontosPrato(ids, chute);
        const { itens, pct } = resumoPrato(ids);
        const acertou = r.certa === chute;
        acertou ? sfx.ok() : sfx.bad();
        anunciar(`Seu prato tem ${r.ml} mililitros de água.`);
        const tabela = h('table', { class: 'table' },
          h('thead', null, h('tr', null, h('th', null, 'Alimento'), h('th', { class: 'num' }, '% água'), h('th', { class: 'num' }, 'Água'))),
          h('tbody', null, itens.map(({ fd }) => h('tr', null,
            h('td', null, fd.nome, h('br'), h('small', { class: 'muted' }, fd.porcaoLabel)),
            h('td', { class: 'num' }, `${fd.aguaPct}%`),
            h('td', { class: 'num' }, fmtMl(aguaMl(fd)))))),
          h('tfoot', null, h('tr', null, h('th', null, 'Total'), h('th', { class: 'num' }, `${pct}%`), h('th', { class: 'num' }, fmtMl(r.ml)))));
        const area = h('div', { class: 'stack' },
          feedback(acertou ? 'ok' : 'bad',
            acertou ? 'Acertou a faixa!' : `A faixa certa era: ${FAIXAS_PRATO[r.certa].label}`,
            `Seu prato tem ${fmtMl(r.ml)} de água.`),
          h('section', { class: 'panel' }, h('h2', { class: 'panel__title' }, 'O cálculo'), tabela,
            h('p', { class: 'muted', style: 'margin-top:8px' }, 'Água = peso da porção × % de água. 1 g de água ≈ 1 mL.')),
          feedback(r.bonus === 40 ? 'ok' : 'info',
            r.bonus === 40 ? 'Bônus de prato hidratante! +40' : r.bonus ? 'Bônus parcial: +20' : 'Sem bônus desta vez',
            `${pct}% do seu prato é água. Para o bônus máximo, passe de 60%.`));
        trocar(root, area);
        await esperarBotao(area, 'Ver pontuação');
        if (signal.aborted) return;
        resolve({
          pontos: r.pontos,
          resumo: h('div', { class: 'stack' },
            h('p', null, `Estimativa: ${r.estimativa} pts · Bônus: ${r.bonus} pts`), tabela.cloneNode(true)),
          saibaMais: 'A melancia tem tanta água que 1 fatia média (200 g) tem cerca de 180 mL: quase um copo inteiro!',
        });
      }
    });
  },
};
