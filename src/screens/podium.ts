import { type Screen } from '../router';
import { h } from '../ui/h';
import { mascote } from '../ui/components';
import { rankingAoVivo } from './ranking';

// Modo telão: pódio em tela cheia para um monitor/projetor da feira.
export const telaPodio: Screen = (root) => {
  const painel = h('div', { class: 'stack' });
  const qr = h('div', { class: 'stack center', style: 'justify-items:center' });
  const url = location.origin + '/';

  // Carregado sob demanda: só o modo telão precisa do gerador de QR
  import('qrcode')
    .then(({ default: QRCode }) => QRCode.toString(url, { type: 'svg', margin: 1, color: { dark: '#072a66', light: '#ffffff' } }))
    .then((markup) => {
      const t = document.createElement('template');
      t.innerHTML = markup;
      const el = t.content.firstElementChild as SVGElement;
      el.classList.add('qr');
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', `QR code para ${url}`);
      qr.prepend(el);
    })
    .catch(() => { /* sem QR, segue só a URL */ });

  qr.append(h('strong', { style: 'font-size:2.4vh' }, 'Aponte a câmera e jogue!'), h('span', { class: 'muted', style: 'font-size:2vh' }, url.replace(/^https?:\/\//, '')));

  root.append(h('main', { class: 'screen tv' },
    h('div', { class: 'row', style: 'justify-content:space-between' },
      h('div', { class: 'row' }, mascote('mascot'), h('div', { class: 'banner' }, h('h1', { style: 'font-size:6vh' }, 'Pódio da Missão H₂O'))),
      h('a', { href: '#/', class: 'icon-btn', 'aria-label': 'Sair do modo telão' }, '✕')),
    h('div', { class: 'tv__grid' },
      h('section', { class: 'panel' }, painel),
      h('section', { class: 'panel' }, qr)),
  ));

  const tentarTelaCheia = () => { document.documentElement.requestFullscreen?.().catch(() => {}); };
  root.addEventListener('dblclick', tentarTelaCheia);
  const pararRanking = rankingAoVivo(painel, { limite: 10, intervalo: 5000 });
  return () => {
    pararRanking();
    if (document.fullscreenElement) void document.exitFullscreen?.();
  };
};
