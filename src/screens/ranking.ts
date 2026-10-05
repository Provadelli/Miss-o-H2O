import { getTop, type RankEntry } from '../services/api';
import { getPlayer, total } from '../state/player';
import { h, clear } from '../ui/h';
import { iconImg } from '../ui/components';

export function podioEl(list: RankEntry[]): HTMLElement {
  const spot = (pos: 1 | 2 | 3) => {
    const e = list[pos - 1];
    return h('div', { class: `podium__spot podium__spot--${pos}${e ? '' : ' podium__spot--empty'}` },
      iconImg(`medalha${pos}`, 52),
      h('span', { class: 'podium__name' }, e ? e.name : '—'),
      h('span', { class: 'podium__score' }, e ? `${e.score} pts` : 'livre!'),
      h('div', { class: 'podium__block', 'aria-hidden': 'true' }, String(pos)));
  };
  const desc = [1, 2, 3].map((p) => list[p - 1] ? `${p}º lugar: ${list[p - 1].name}, ${list[p - 1].score} pontos` : `${p}º lugar vago`).join('. ');
  return h('div', { class: 'podium', role: 'img', 'aria-label': `Pódio. ${desc}` }, spot(2), spot(1), spot(3));
}

export function listaEl(list: RankEntry[], desde = 4): HTMLElement {
  const me = getPlayer();
  const itens = list.filter((e) => e.rank >= desde);
  if (!itens.length) return h('p', { class: 'muted center' }, desde > 1 ? 'Ainda há lugares livres no ranking!' : 'Ninguém jogou ainda. Seja o primeiro!');
  return h('ol', { class: 'ranklist', 'aria-label': 'Ranking' },
    itens.map((e) => h('li', { class: e.name === me.nome && e.score === total() ? 'me' : '' },
      h('span', { class: 'pos' }, `${e.rank}º`), h('span', { class: 'nm' }, e.name), h('span', null, `${e.score} pts`))));
}

/** Painel de ranking que se atualiza sozinho. Retorna a função de limpeza. */
export function rankingAoVivo(alvo: HTMLElement, opts: { limite?: number; intervalo?: number } = {}): () => void {
  const { limite = 10, intervalo = 10_000 } = opts;
  let timer = 0;
  let vivo = true;
  const status = h('p', { class: 'source', 'aria-live': 'off' });
  const tick = async () => {
    const { list, offline } = await getTop(limite);
    if (!vivo) return;
    clear(alvo);
    alvo.append(podioEl(list), listaEl(list), status);
    status.textContent = offline ? '📴 Sem conexão: mostrando o último placar salvo.' : `Atualiza sozinho a cada ${intervalo / 1000} segundos.`;
    if (!document.hidden) timer = window.setTimeout(tick, intervalo);
  };
  const onVis = () => { if (!document.hidden && vivo) { clearTimeout(timer); void tick(); } };
  document.addEventListener('visibilitychange', onVis);
  alvo.append(h('p', { class: 'muted center' }, 'Carregando pódio…'));
  void tick();
  return () => { vivo = false; clearTimeout(timer); document.removeEventListener('visibilitychange', onVis); };
}
