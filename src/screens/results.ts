import { FONTE_TEXTO } from '../data/foods';
import { FASES } from '../phases';
import { estrelas, NUM_FASES } from '../logic/scoring';
import { ir, type Screen } from '../router';
import { submitScore } from '../services/api';
import { concluidas, fasesParaEnvio, getPlayer, total } from '../state/player';
import { h } from '../ui/h';
import { banner, btn, dica, estrelasEl, mascote, topbar } from '../ui/components';

export const telaFinal: Screen = (root) => {
  const p = getPlayer();
  if (!p.nome) { ir('/'); return; }
  if (concluidas() < NUM_FASES) { ir('/fases'); return; }

  const posicao = h('p', { class: 'big-num', style: 'font-size:2rem' }, '…');
  submitScore({ id: p.id, name: p.nome, score: total(), phases: fasesParaEnvio() }).then((rank) => {
    posicao.textContent = rank ? `${rank}º lugar` : 'Envio pendente (sem internet)';
  });

  const tabela = h('table', { class: 'table' },
    h('thead', null, h('tr', null, h('th', null, 'Fase'), h('th', null, 'Estrelas'), h('th', { class: 'num' }, 'Pontos'))),
    h('tbody', null, FASES.map((f, i) => h('tr', null,
      h('td', null, `${f.num}. ${f.titulo}`),
      h('td', null, estrelasEl(estrelas(p.fases[i] ?? 0))),
      h('td', { class: 'num' }, String(p.fases[i] ?? 0))))));

  root.append(h('main', { class: 'screen', style: 'max-width:820px' },
    topbar('Resultado final', { href: '#/fases', label: 'Voltar ao mapa' }, () =>
      `Parabéns, ${p.nome}! Você completou a Missão H2O com ${total()} pontos de ${NUM_FASES * 100}.`),
    banner('Missão cumprida!', `Parabéns, ${p.nome}!`, 'trofeu'),
    h('section', { class: 'panel stack center' },
      h('div', { class: 'center' }, mascote('mascot bounce')),
      h('div', { class: 'big-num pop' }, `${total()}`),
      h('p', { class: 'muted' }, `pontos de ${NUM_FASES * 100}`),
      h('p', null, 'Sua posição no pódio:'), posicao),
    h('section', { class: 'panel' }, h('h2', { class: 'panel__title' }, 'Suas fases'), tabela),
    dica('Frutas, verduras, sopas e leite ajudam a hidratar. Beba água também!', 'Lembre-se:'),
    h('div', { class: 'btn-row' },
      btn('Ver pódio', () => ir('/'), { variant: 'primary', big: true, icon: 'trofeu' }),
      btn('Jogar novamente', () => ir('/nome'))),
    h('p', { class: 'source' }, FONTE_TEXTO),
  ));
};
