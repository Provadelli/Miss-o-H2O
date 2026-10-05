import { food, img } from '../data/foods';
import { MAX_POR_ITEM, ORCAMENTO, PRODUTOS } from '../data/market';
import { aguaProduto, cestaOtima, pontosMercado, totaisCesta } from '../logic/scoring';
import { sfx } from '../services/audio';
import { clear, h } from '../ui/h';
import { anunciar, chip, feedback, fmtMl, gota, iconImg } from '../ui/components';
import { esperarBotao, trocar } from './common';
import type { Phase } from './types';

export const p4: Phase = {
  num: 4,
  titulo: 'Mercado da Água',
  icone: 'cesta',
  sub: `Você recebe ${ORCAMENTO} moedas para fazer compras.`,
  instrucoes: [
    'Cada produto tem um preço em moedas e uma quantidade de água.',
    `Monte a cesta com o MÁXIMO de água possível sem passar de ${ORCAMENTO} moedas.`,
    `Você pode levar até ${MAX_POR_ITEM} unidades de cada produto.`,
    'Quando terminar, toque em COMPRAR.',
  ],
  dica: 'Compare quanta água cada moeda compra. Nem sempre o mais caro é o melhor!',
  botao: 'Ir às compras',

  run({ root, signal }) {
    return new Promise((resolve) => {
      const qtd = PRODUTOS.map(() => 0);
      const grade = h('div', { class: 'food-grid', style: 'grid-template-columns:repeat(auto-fill,minmax(150px,1fr))' });
      const resumo = h('div', { class: 'stack' });
      const comprar = h('button', { type: 'button', class: 'btn btn--primary btn--big btn--block' }, '🛒 Comprar');
      const vivo = h('p', { class: 'sr-only', 'aria-live': 'polite' });

      const render = (foco?: string) => {
        const { agua, custo } = totaisCesta(qtd);
        const saldo = ORCAMENTO - custo;
        clear(grade);
        PRODUTOS.forEach((p, i) => {
          const fd = food(p.food);
          const menos = h('button', { type: 'button', class: 'icon-btn', 'aria-label': `Tirar ${fd.nome}`, disabled: qtd[i] === 0,
            dataset: { k: `${i}-` }, onclick: () => { qtd[i]--; sfx.tap(); render(`${i}-`); } }, '−');
          const mais = h('button', { type: 'button', class: 'icon-btn', 'aria-label': `Adicionar ${fd.nome}`,
            disabled: qtd[i] >= MAX_POR_ITEM || p.preco > saldo,
            dataset: { k: `${i}+` }, onclick: () => { qtd[i]++; sfx.gota(); render(`${i}+`); } }, '+');
          grade.append(h('div', { class: `food${qtd[i] ? ' is-selected' : ''}` },
            h('img', { src: img(p.food), alt: '', width: 64, height: 64, loading: 'lazy' }),
            h('span', { class: 'food__name' }, fd.nome),
            h('span', { class: 'food__meta' }, iconImg('moeda', 18), ` ${p.preco} moedas`),
            h('span', { class: 'food__meta' }, '💧 ', fmtMl(aguaProduto(p))),
            h('span', { class: 'food__meta' }, fd.porcaoLabel),
            h('div', { class: 'row', style: 'justify-content:center;gap:6px;flex-wrap:nowrap' },
              menos, h('strong', { 'aria-label': `${qtd[i]} na cesta`, style: 'min-width:1.5em;font-size:1.3rem' }, String(qtd[i])), mais)));
        });
        clear(resumo);
        resumo.append(
          h('div', { class: 'hud' },
            chip([iconImg('moeda'), ` ${saldo} moedas`], false, `Saldo: ${saldo} moedas`),
            chip([gota(), ` ${fmtMl(agua)}`], true, `Água na cesta: ${agua} mililitros`)),
          h('p', { class: 'center muted dock__extra' }, `Gasto: ${custo} de ${ORCAMENTO} moedas`),
          h('div', { class: 'row dock__extra', style: 'justify-content:center' },
            PRODUTOS.flatMap((p, i) => Array.from({ length: qtd[i] }, () => h('img', { src: img(p.food), alt: '', width: 32, height: 32 })))));
        comprar.disabled = custo === 0;
        vivo.textContent = `Saldo ${saldo} moedas. Água ${agua} mililitros.`;
        if (foco) {
          const alvo = grade.querySelector<HTMLButtonElement>(`[data-k="${foco}"]`);
          (alvo && !alvo.disabled ? alvo : grade.querySelector<HTMLButtonElement>(`[data-k="${foco.replace(/[+-]$/, (c) => (c === '+' ? '-' : '+'))}"]`))?.focus();
        }
      };
      render();

      comprar.addEventListener('click', () => finalizar());
      trocar(root, h('div', { class: 'split' },
        h('section', { 'aria-label': 'Produtos' }, grade),
        h('aside', { class: 'panel stack sticky dock' }, h('h2', { class: 'panel__title' }, 'Sua cesta'), resumo, comprar, vivo)));

      async function finalizar() {
        if (signal.aborted) return;
        const pontos = pontosMercado(qtd);
        const { agua } = totaisCesta(qtd);
        const otima = cestaOtima();
        sfx.vitoria();
        anunciar(`Você comprou ${agua} mililitros de água. O máximo possível era ${otima.agua}.`);
        const listaOtima = h('ul', { class: 'stack', style: 'margin:0;padding-left:1.2em;font-weight:700' },
          PRODUTOS.map((p, i) => otima.qtd[i]
            ? h('li', null, `${otima.qtd[i]}× ${food(p.food).nome} (${otima.qtd[i] * p.preco} moedas, ${fmtMl(otima.qtd[i] * aguaProduto(p))})`)
            : null));
        const area = h('div', { class: 'stack' },
          feedback(pontos >= 90 ? 'ok' : 'info', `Sua cesta tem ${fmtMl(agua)} de água`,
            `Isso é ${pontos}% da melhor cesta possível (${fmtMl(otima.agua)}).`),
          h('section', { class: 'panel stack' },
            h('h2', { class: 'panel__title' }, 'A cesta campeã'),
            h('p', null, `Com ${otima.custo} moedas dava para levar ${fmtMl(otima.agua)}:`),
            listaOtima));
        trocar(root, area);
        await esperarBotao(area, 'Ver pontuação');
        if (signal.aborted) return;
        resolve({
          pontos,
          resumo: h('div', { class: 'stack' }, h('p', null, `Você conseguiu ${fmtMl(agua)}; o máximo era ${fmtMl(otima.agua)}.`), listaOtima.cloneNode(true)),
          saibaMais: 'Iogurte, suco e laranja dão muita água por moeda. Já pão, aveia e queijo têm pouca água.',
        });
      }
    });
  },
};
