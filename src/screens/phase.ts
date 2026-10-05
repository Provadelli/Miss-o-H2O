import { FONTE_TEXTO } from '../data/foods';
import { FASES } from '../phases';
import type { Phase } from '../phases/types';
import { estrelas, NUM_FASES } from '../logic/scoring';
import { ir, type Screen } from '../router';
import { submitScore } from '../services/api';
import { sfx } from '../services/audio';
import { faseLiberada, fasesParaEnvio, getPlayer, registrarFase, total } from '../state/player';
import { clear, h } from '../ui/h';
import { anunciar, banner, btn, dica, estrelasEl, mascote, topbar } from '../ui/components';

export const telaFase: Screen = (root, param) => {
  const idx = Number(param) - 1;
  const fase = FASES[idx];
  if (!getPlayer().nome) { ir('/nome'); return; }
  if (!fase || !faseLiberada(idx)) { ir('/fases'); return; }

  const ctrl = new AbortController();
  intro(root, fase, () => jogar(root, fase, idx, ctrl.signal));
  return () => ctrl.abort();
};

function intro(root: HTMLElement, f: Phase, comecar: () => void) {
  clear(root);
  const textoFala = () => `Fase ${f.num}: ${f.titulo}. ${f.sub} ${f.instrucoes.join(' ')} Dica: ${f.dica}`;
  root.append(h('main', { class: 'screen', style: 'max-width:760px' },
    topbar(`Fase ${f.num} de ${NUM_FASES}`, { href: '#/fases', label: 'Voltar ao mapa' }, textoFala),
    banner(`${f.num}. ${f.titulo}`, f.sub, f.icone),
    h('section', { class: 'panel stack' },
      h('h2', { class: 'panel__title' }, 'Como funciona'),
      h('ul', { class: 'stack', style: 'margin:0;padding-left:1.2em;font-weight:700' }, f.instrucoes.map((t) => h('li', null, t)))),
    h('div', { class: 'row', style: 'flex-wrap:nowrap' }, mascote('mascot mascot--sm'), h('div', { style: 'flex:1' }, dica(f.dica))),
    btn(f.botao, comecar, { variant: 'primary', big: true, block: true, icon: f.icone }),
  ));
}

async function jogar(root: HTMLElement, f: Phase, idx: number, signal: AbortSignal) {
  clear(root);
  const area = h('div', { class: 'stack' });
  root.append(h('main', { class: 'screen' },
    topbar(`${f.num}. ${f.titulo}`, { href: '#/fases', label: 'Sair da fase e voltar ao mapa' }, () => area.innerText.slice(0, 600)),
    area));
  const res = await f.run({ root: area, signal });
  if (signal.aborted) return;

  registrarFase(idx, res.pontos);
  const p = getPlayer();
  const envio = submitScore({ id: p.id, name: p.nome, score: total(), phases: fasesParaEnvio() });
  sfx.vitoria();
  anunciar(`Fase concluída! Você fez ${res.pontos} pontos.`);

  const ultima = idx === NUM_FASES - 1;
  const status = h('p', { class: 'source' }, 'Enviando para o pódio…');
  envio.then((rank) => {
    status.textContent = rank ? `No pódio geral você está em ${rank}º lugar!` : '📴 Sem conexão: sua pontuação será enviada quando a internet voltar.';
  });

  clear(root);
  root.append(h('main', { class: 'screen', style: 'max-width:760px' },
    topbar(`Fase ${f.num} concluída`, { href: '#/fases', label: 'Voltar ao mapa' }, () =>
      `Você fez ${res.pontos} pontos de 100. Você sabia? ${res.saibaMais}`),
    banner('Fase concluída!', `${f.num}. ${f.titulo}`, 'estrela'),
    h('section', { class: 'panel stack center' },
      h('div', { class: 'big-num pop' }, `${res.pontos}`),
      h('p', { class: 'muted' }, 'pontos de 100'),
      h('div', null, estrelasEl(estrelas(res.pontos))),
      h('p', null, 'Total da missão: ', h('strong', null, `${total()} pontos`)),
      status),
    res.resumo ? h('section', { class: 'panel' }, res.resumo) : null,
    dica(res.saibaMais, 'Você sabia?'),
    h('div', { class: 'btn-row' },
      ultima
        ? btn('Ver resultado final', () => ir('/final'), { variant: 'primary', big: true, icon: 'trofeu' })
        : btn(`Próxima fase →`, () => ir(`/fase/${idx + 2}`), { variant: 'primary', big: true }),
      btn('Jogar de novo', () => ir(`/fase/${idx + 1}`)),
      btn('Mapa', () => ir('/fases'))),
    h('p', { class: 'source' }, FONTE_TEXTO),
  ));
}
