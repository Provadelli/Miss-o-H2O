import { FASES } from '../phases';
import { estrelas, NUM_FASES } from '../logic/scoring';
import { ir, type Screen } from '../router';
import { concluidas, faseLiberada, getPlayer, proximaFase, total } from '../state/player';
import { h } from '../ui/h';
import { btn, estrelasEl, iconImg, topbar } from '../ui/components';

export const telaMapa: Screen = (root) => {
  const p = getPlayer();
  if (!p.nome) { ir('/nome'); return; }
  const prox = proximaFase();
  const pct = Math.round((concluidas() / NUM_FASES) * 100);

  const cards = FASES.map((f, i) => {
    const pts = p.fases[i];
    const liberada = faseLiberada(i);
    const status = pts != null ? `Concluída: ${pts} pts` : liberada ? 'Sua próxima fase!' : 'Bloqueada 🔒';
    return h('button', {
      type: 'button',
      class: `phase-card${pts != null ? ' phase-card--done' : ''}${i === prox ? ' phase-card--current' : ''}`,
      disabled: !liberada,
      'aria-label': `Fase ${f.num}: ${f.titulo}. ${status}`,
      onclick: () => ir(`/fase/${f.num}`),
    },
      iconImg(f.icone, 60),
      h('span', { class: 'phase-card__body' },
        h('span', { class: 'phase-card__num' }, `Fase ${f.num}`),
        h('span', { class: 'phase-card__title' }, f.titulo),
        h('span', { class: 'phase-card__status' }, status)),
      pts != null ? estrelasEl(estrelas(pts)) : null);
  });

  root.append(h('main', { class: 'screen' },
    topbar(`Olá, ${p.nome}!`, { href: '#/', label: 'Voltar ao início' }, () =>
      `Você está na fase ${Math.min(prox + 1, NUM_FASES)} de ${NUM_FASES}. Total de pontos: ${total()}.`),
    h('header', { class: 'banner' }, h('h1', null, 'Mapa da Missão'),
      h('p', { class: 'banner__sub' }, `Total: ${total()} de ${NUM_FASES * 100} pontos`)),
    h('div', { class: 'stack' },
      h('span', { class: 'progress-label' }, `${concluidas()} de ${NUM_FASES} fases concluídas`),
      h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct), 'aria-label': 'Progresso da missão' },
        h('span', { style: `width:${pct}%` }))),
    h('div', { class: 'phase-grid' }, cards),
    prox < NUM_FASES
      ? btn(`Jogar fase ${prox + 1}`, () => ir(`/fase/${prox + 1}`), { variant: 'primary', big: true, block: true, icon: 'bandeira' })
      : btn('Ver resultado final', () => ir('/final'), { variant: 'primary', big: true, block: true, icon: 'trofeu' }),
  ));
};
