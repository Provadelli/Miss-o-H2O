import { aguaMl, food, img } from '../data/foods';
import { ESCOLHAS_POR_REFEICAO, REFEICOES, REFERENCIA_ALIMENTOS_ML, type Refeicao } from '../data/meals';
import { aguaRefeicao, pontosRefeicao, type Escolhas } from '../logic/scoring';
import { getTop } from '../services/api';
import { sfx } from '../services/audio';
import { getPlayer, total } from '../state/player';
import { clear, h } from '../ui/h';
import { anunciar, feedback, fmtMl, foodCard } from '../ui/components';
import { esperarBotao, trocar } from './common';
import type { Phase } from './types';

export const p7: Phase = {
  num: 7,
  titulo: 'Monte Sua Refeição',
  icone: 'chef',
  sub: 'Monte um café da manhã, um almoço e um jantar.',
  instrucoes: [
    `Escolha ${ESCOLHAS_POR_REFEICAO} alimentos para cada refeição.`,
    'Veja quantos mililitros de água cada refeição vai ter.',
    'Ganha mais pontos quem monta refeições com bastante água…',
    '…e com pelo menos uma fruta ou verdura em cada refeição!',
  ],
  dica: 'Tente montar refeições balanceadas e com alimentos que têm mais água!',
  botao: 'Vamos montar!',

  run({ root, signal }) {
    return new Promise((resolve) => {
      const esc: Escolhas = { cafe: [], almoco: [], jantar: [] };
      let aba: Refeicao = 'cafe';
      const tabs = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Refeições' });
      const painel = h('section', { class: 'panel stack', role: 'tabpanel', style: 'border-top-left-radius:0' });
      const resumo = h('div', { class: 'stack' });
      const pronto = h('button', { type: 'button', class: 'btn btn--primary btn--big btn--block' }, 'Finalizar refeições');

      const completo = () => REFEICOES.every((r) => esc[r.id].length === ESCOLHAS_POR_REFEICAO);

      const render = (focoId?: string) => {
        clear(tabs);
        REFEICOES.forEach((r) => {
          const ok = esc[r.id].length === ESCOLHAS_POR_REFEICAO;
          tabs.append(h('button', {
            type: 'button', class: 'tab', role: 'tab', id: `tab-${r.id}`,
            'aria-selected': String(r.id === aba), 'aria-controls': 'painel-refeicao',
            onclick: () => { aba = r.id; render(); (tabs.querySelector(`#tab-${r.id}`) as HTMLElement)?.focus(); },
          }, `${r.icone} ${r.nome}${ok ? ' ✓' : ''}`));
        });

        const r = REFEICOES.find((x) => x.id === aba)!;
        const sel = esc[aba];
        clear(painel);
        painel.id = 'painel-refeicao';
        painel.setAttribute('aria-labelledby', `tab-${aba}`);
        const grade = h('div', { class: 'food-grid' }, r.opcoes.map((id) => {
          const on = sel.includes(id);
          return foodCard(id, {
            showDrops: true, pressed: on, disabled: !on && sel.length >= ESCOLHAS_POR_REFEICAO,
            meta: [`~${food(id).aguaPct}% · ${fmtMl(aguaMl(food(id)))}`],
            label: `${food(id).nome}, ${food(id).aguaPct}% de água. ${on ? 'Escolhido.' : ''}`,
            onClick: () => {
              if (on) sel.splice(sel.indexOf(id), 1);
              else if (sel.length < ESCOLHAS_POR_REFEICAO) sel.push(id);
              render(id);
              // Completou esta refeição: vai para a próxima incompleta
              if (sel.length === ESCOLHAS_POR_REFEICAO) {
                const prox = REFEICOES.find((x) => esc[x.id].length < ESCOLHAS_POR_REFEICAO);
                if (prox) setTimeout(() => { aba = prox.id; render(); }, 450);
              }
            },
          });
        }));
        const slots = h('div', { class: 'slots', 'aria-label': 'Sua refeição' },
          Array.from({ length: ESCOLHAS_POR_REFEICAO }, (_, i) => h('div', { class: 'slot' },
            sel[i] ? h('img', { src: img(sel[i]), alt: food(sel[i]).nome, width: 48, height: 48 }) : 'vazio')));
        painel.append(grade, h('strong', null, 'Sua refeição:'), slots);
        if (focoId) (grade.children[r.opcoes.indexOf(focoId)] as HTMLElement | undefined)?.focus();

        clear(resumo);
        const totalMl = REFEICOES.reduce((s, x) => s + aguaRefeicao(esc[x.id]), 0);
        resumo.append(h('table', { class: 'table' }, h('tbody', null,
          REFEICOES.map((x) => h('tr', null, h('td', null, `${x.icone} ${x.nome}`), h('td', { class: 'num' }, fmtMl(aguaRefeicao(esc[x.id]))))),
          h('tr', null, h('th', null, '💧 Total'), h('th', { class: 'num' }, fmtMl(totalMl))))));
        pronto.disabled = !completo();
        pronto.textContent = completo() ? 'Finalizar refeições' : `Escolha ${ESCOLHAS_POR_REFEICAO} em cada refeição`;
      };
      render();

      pronto.addEventListener('click', () => { sfx.tap(); finalizar(); });
      trocar(root, h('div', { class: 'split' },
        h('div', null, tabs, painel),
        h('aside', { class: 'panel stack sticky' }, h('h2', { class: 'panel__title' }, 'Resultado'), resumo, pronto)));

      async function finalizar() {
        if (signal.aborted) return;
        const r = pontosRefeicao(esc);
        sfx.vitoria();
        anunciar(`Suas refeições têm ${r.total} mililitros de água.`);
        const pctRef = Math.round((r.total / REFERENCIA_ALIMENTOS_ML) * 100);
        const comparacao = h('ol', { class: 'ranklist' }, h('li', null, h('span', null, '…'), h('span', null, 'Carregando ranking…'), h('span')));
        const area = h('div', { class: 'stack' },
          feedback('ok', `Total: ${fmtMl(r.total)} de água`,
            `Os alimentos costumam fornecer cerca de 20% da água do dia: uns ${REFERENCIA_ALIMENTOS_ML} mL para um adulto (EFSA). Suas refeições chegam a ${pctRef}% disso.`),
          h('section', { class: 'panel stack' }, h('h2', { class: 'panel__title' }, 'Equilíbrio'),
            ...r.porRefeicao.map((p) => {
              const nome = REFEICOES.find((x) => x.id === p.id)!.nome;
              return h('p', { style: 'font-weight:700' }, p.equilibrada ? '✅ ' : '⚠️ ', `${nome}: ${fmtMl(p.ml)}`,
                p.equilibrada ? ' (tem fruta ou verdura)' : ' (faltou fruta ou verdura)');
            })),
          h('section', { class: 'panel stack' }, h('h2', { class: 'panel__title' }, 'Comparação com outros jogadores'), comparacao));
        trocar(root, area);
        getTop(3).then(({ list }) => {
          clear(comparacao);
          const eu = getPlayer();
          comparacao.append(h('li', { class: 'me' }, h('span', { class: 'pos' }, '★'), h('span', { class: 'nm' }, `Você (${eu.nome})`),
            h('span', null, `${total() - (eu.fases[6] ?? 0) + Math.max(eu.fases[6] ?? 0, r.pontos)} pts`)));
          list.filter((e) => e.name !== eu.nome).forEach((e) => comparacao.append(h('li', null, h('span', { class: 'pos' }, `${e.rank}º`), h('span', { class: 'nm' }, e.name), h('span', null, `${e.score} pts`))));
          if (!list.length) comparacao.append(h('li', null, h('span'), h('span', null, 'Você pode ser o primeiro do pódio!'), h('span')));
        });
        await esperarBotao(area, 'Ver pontuação');
        if (signal.aborted) return;
        resolve({
          pontos: r.pontos,
          resumo: h('p', null, `Hidratação: ${fmtMl(r.total)} · Refeições equilibradas: ${r.porRefeicao.filter((p) => p.equilibrada).length} de 3`),
          saibaMais: 'Uma boa alimentação também ajuda a economizar água: frutas e verduras hidratam e nutrem ao mesmo tempo!',
        });
      }
    });
  },
};
