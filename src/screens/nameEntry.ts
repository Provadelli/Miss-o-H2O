import { erroNome, limparNome, NOME_MAX } from '../logic/validate';
import { ir, type Screen } from '../router';
import { novoJogador } from '../state/player';
import { h } from '../ui/h';
import { btn, mascote, topbar } from '../ui/components';

export const telaNome: Screen = (root) => {
  const input = h('input', {
    id: 'apelido', class: 'input', type: 'text', maxLength: NOME_MAX, autocomplete: 'nickname',
    autocapitalize: 'words', spellcheck: false, enterKeyHint: 'go', placeholder: 'Ex.: Gotinha Veloz',
    'aria-describedby': 'apelido-ajuda apelido-erro',
  });
  const erro = h('p', { id: 'apelido-erro', class: 'error', role: 'alert' });

  const enviar = (e?: Event) => {
    e?.preventDefault();
    const msg = erroNome(input.value);
    if (msg) { erro.textContent = msg; input.focus(); return; }
    novoJogador(limparNome(input.value));
    ir('/fases');
  };

  root.append(h('main', { class: 'screen', style: 'max-width:620px' },
    topbar('Seu apelido', { href: '#/', label: 'Voltar ao início' }, () => 'Digite um apelido de 2 a 16 letras. Ele vai aparecer no pódio.'),
    h('div', { class: 'center' }, mascote('mascot bounce')),
    h('form', { class: 'panel stack', onsubmit: enviar, novalidate: true },
      h('div', { class: 'field' },
        h('label', { for: 'apelido' }, 'Como você quer aparecer no pódio?'),
        input,
        h('small', { id: 'apelido-ajuda', class: 'muted' }, `De 2 a ${NOME_MAX} letras. Não use seu nome completo.`)),
      erro,
      h('button', { type: 'submit', class: 'btn btn--primary btn--big btn--block' }, 'Começar a missão →')),
    btn('Voltar', () => ir('/'), { block: true, small: true }),
  ));
  setTimeout(() => input.focus(), 50);
};
