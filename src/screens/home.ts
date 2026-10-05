import { FONTE_TEXTO } from '../data/foods';
import { NUM_FASES } from '../logic/scoring';
import { ir, type Screen } from '../router';
import { concluidas, getPlayer, total } from '../state/player';
import { h } from '../ui/h';
import { btn, dica, mascote, modal, topbar } from '../ui/components';
import { rankingAoVivo } from './ranking';

export function comoJogar(): void {
  modal('Como jogar', [
    h('ol', { class: 'stack', style: 'padding-left:1.2em;margin:0;font-weight:700' },
      h('li', null, 'Escolha um apelido. Não precisa de cadastro!'),
      h('li', null, `Passe pelas ${NUM_FASES} fases. Cada uma vale até 100 pontos.`),
      h('li', null, 'Em cada fase você descobre quanta água existe nos alimentos.'),
      h('li', null, 'Sua pontuação vai para o pódio que todos veem na tela inicial.'),
    ),
    dica('Use o botão "Aa" para aumentar as letras ou ligar o alto contraste, e o 🔊 para ouvir as instruções.'),
  ]);
}

export const telaInicio: Screen = (root) => {
  const p = getPlayer();
  const emAndamento = p.nome && concluidas() > 0;
  const terminou = concluidas() === NUM_FASES;
  const painel = h('div', { class: 'stack' });

  root.append(h('main', { class: 'screen' },
    topbar('Missão H₂O', undefined, () =>
      'Missão H2O, uma aventura pela água dos alimentos. Toque em Jogar para começar. Veja o pódio com os melhores jogadores.'),
    h('section', { class: 'row', style: 'justify-content:center;gap:16px;flex-wrap:nowrap' },
      mascote('mascot bounce'),
      h('div', { class: 'banner' },
        h('h1', null, 'Missão H₂O'),
        h('p', { class: 'banner__sub' }, 'Uma aventura pela água escondida nos alimentos!'))),
    h('div', { class: 'split' },
      h('section', { class: 'panel', 'aria-labelledby': 'podio-t' },
        h('h2', { class: 'panel__title', id: 'podio-t' }, '🏆 Pódio'), painel),
      h('section', { class: 'stack sticky' },
        emAndamento && !terminou
          ? h('div', { class: 'panel stack center' },
              h('p', null, 'Olá, ', h('strong', null, p.nome), `! Você tem ${total()} pontos em ${concluidas()} de ${NUM_FASES} fases.`),
              btn('Continuar', () => ir('/fases'), { variant: 'primary', big: true, block: true, icon: 'bandeira' }),
              btn('Novo jogador', () => ir('/nome'), { block: true }))
          : btn('Jogar', () => ir('/nome'), { variant: 'primary', big: true, block: true, icon: 'bandeira' }),
        btn('Como jogar', comoJogar, { block: true, icon: 'lampada' }),
        btn('Modo telão', () => ir('/podio'), { block: true, small: true, icon: 'trofeu' }),
        dica('Cerca de 20% da água que consumimos vem dos alimentos!', 'Você sabia?'),
      )),
    h('p', { class: 'source' }, FONTE_TEXTO, ' · Ilustrações: Microsoft Fluent Emoji (MIT)'),
  ));

  return rankingAoVivo(painel);
};
