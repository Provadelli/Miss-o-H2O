import { food, gotas, img, rotuloAgua } from '../data/foods';
import { sfx } from '../services/audio';
import { falaDisponivel, falar, pararFala } from '../services/speech';
import { getSettings, setSettings } from '../state/settings';
import { clear, h, svg } from './h';

/* ---------- Mascote "Gotinha" (SVG feito à mão) ---------- */
let gid = 0;
export function mascote(cls = 'mascot', feliz = true): Element {
  const id = `g${++gid}`;
  const boca = feliz
    ? '<path d="M40 74 Q50 84 60 74" stroke="#0a2350" stroke-width="4" fill="none" stroke-linecap="round"/>'
    : '<path d="M41 79 Q50 72 59 79" stroke="#0a2350" stroke-width="4" fill="none" stroke-linecap="round"/>';
  return svg(`<svg class="${cls}" viewBox="0 0 100 120" role="img" aria-label="Gotinha, a mascote">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7fd6ff"/><stop offset="1" stop-color="#1e88e5"/></linearGradient></defs>
    <path d="M50 4 C50 4 12 52 12 76 a38 38 0 0 0 76 0 C88 52 50 4 50 4Z" fill="url(#${id})" stroke="#0b3d91" stroke-width="4"/>
    <ellipse cx="34" cy="50" rx="7" ry="12" fill="#fff" opacity=".55" transform="rotate(20 34 50)"/>
    <ellipse cx="38" cy="66" rx="6" ry="7.5" fill="#0a2350"/><ellipse cx="62" cy="66" rx="6" ry="7.5" fill="#0a2350"/>
    <circle cx="40" cy="63" r="2.2" fill="#fff"/><circle cx="64" cy="63" r="2.2" fill="#fff"/>
    <ellipse cx="29" cy="78" rx="6" ry="3.5" fill="#ff8fb0" opacity=".7"/><ellipse cx="71" cy="78" rx="6" ry="3.5" fill="#ff8fb0" opacity=".7"/>
    ${boca}</svg>`);
}

/* ---------- Gotas ---------- */
const DROP = '<path d="M12 1C12 1 2 13 2 19a10 10 0 0 0 20 0C22 13 12 1 12 1Z"/>';
export function gota(on = true): Element {
  return svg(`<svg class="drop${on ? '' : ' drop--off'}" viewBox="0 0 24 30" aria-hidden="true"><g fill="#1e88e5" stroke="#0b3d91" stroke-width="1.5">${DROP}</g></svg>`);
}
export function gotasEl(pct: number): HTMLElement {
  const n = gotas(pct);
  return h('span', { class: 'drops', role: 'img', 'aria-label': `${n} de 3 gotas: ${rotuloAgua(pct)}` },
    gota(n >= 1), gota(n >= 2), gota(n >= 3));
}

/* ---------- Faixa-título ---------- */
export function banner(titulo: string, sub?: string, icone?: string, nivel: 'h1' | 'h2' = 'h1'): HTMLElement {
  const T = h(nivel, null, icone ? h('img', { src: img(icone), alt: '', width: 48, height: 48 }) : null, titulo);
  return h('header', { class: 'banner' }, T, sub ? h('p', { class: 'banner__sub' }, sub) : null);
}

/* ---------- Botões ---------- */
interface BtnOpts { variant?: 'primary' | 'ok'; big?: boolean; block?: boolean; small?: boolean; icon?: string; disabled?: boolean; label?: string }
export function btn(texto: string, onClick: (e: MouseEvent) => void, o: BtnOpts = {}): HTMLButtonElement {
  const cls = ['btn', o.variant && `btn--${o.variant}`, o.big && 'btn--big', o.block && 'btn--block', o.small && 'btn--small']
    .filter(Boolean).join(' ');
  return h('button', {
    type: 'button', class: cls, disabled: o.disabled, 'aria-label': o.label,
    onclick: (e: MouseEvent) => { sfx.tap(); onClick(e); },
  }, o.icon ? h('img', { src: img(o.icon), alt: '', width: 40, height: 40 }) : null, texto);
}

/* ---------- Cartão de alimento ---------- */
interface FoodOpts { meta?: (Node | string)[]; onClick?: () => void; pressed?: boolean; disabled?: boolean; showDrops?: boolean; label?: string }
export function foodCard(id: string, o: FoodOpts = {}): HTMLElement {
  const fd = food(id);
  const filhos = [
    h('img', { src: img(id), alt: '', width: 64, height: 64, loading: 'lazy', decoding: 'async' }),
    h('span', { class: 'food__name' }, fd.nome),
    o.showDrops ? gotasEl(fd.aguaPct) : null,
    ...(o.meta ?? []).map((m) => h('span', { class: 'food__meta' }, m)),
  ];
  if (!o.onClick) return h('div', { class: 'food' }, filhos);
  return h('button', {
    type: 'button', class: 'food',
    'aria-pressed': o.pressed == null ? null : String(o.pressed),
    'aria-label': o.label, disabled: o.disabled,
    onclick: () => { sfx.tap(); o.onClick!(); },
  }, filhos);
}

/* ---------- Dica, feedback, estrelas ---------- */
export const dica = (texto: string, titulo = 'Dica:'): HTMLElement =>
  h('aside', { class: 'tip' }, h('strong', null, titulo), texto);

export function feedback(tipo: 'ok' | 'bad' | 'info', titulo: string, texto?: string | Node): HTMLElement {
  const icone = tipo === 'ok' ? '✓' : tipo === 'bad' ? '✗' : 'i';
  return h('div', { class: `feedback feedback--${tipo} pop`, role: 'status' },
    h('span', { class: 'feedback__icon', 'aria-hidden': 'true' }, icone),
    h('div', null, h('strong', { style: 'display:block;font-size:1.1rem' }, titulo), texto ?? null));
}

export function estrelasEl(n: number): HTMLElement {
  return h('span', { class: 'stars', role: 'img', 'aria-label': `${n} de 3 estrelas` },
    [0, 1, 2].map((i) => h('span', { class: i < n ? '' : 'off', 'aria-hidden': 'true' }, '★')));
}

export const chip = (conteudo: (Node | string)[], light = false, label?: string) =>
  h('span', { class: `chip${light ? ' chip--light' : ''}`, 'aria-label': label }, conteudo);

export const iconImg = (id: string, size = 28) => h('img', { src: img(id), alt: '', width: size, height: size });

/* ---------- Avisos ---------- */
export function anunciar(msg: string): void {
  const live = document.getElementById('live');
  if (!live) return;
  live.textContent = '';
  setTimeout(() => { live.textContent = msg; }, 30);
}

let toastTimer = 0;
export function toast(msg: string, ms = 2600): void {
  document.querySelector('.toast')?.remove();
  const t = h('div', { class: 'toast', role: 'status' }, msg);
  document.body.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.remove(), ms);
}

/* ---------- Modal acessível ---------- */
export function modal(titulo: string, corpo: (Node | string)[], acoes?: HTMLElement[]): { close: () => void } {
  const anterior = document.activeElement as HTMLElement | null;
  const tituloId = `m${Date.now()}`;
  const close = () => {
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
    anterior?.focus?.();
  };
  const box = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': tituloId },
    h('h2', { id: tituloId }, titulo), ...corpo,
    h('div', { class: 'btn-row' }, acoes ?? [btn('Fechar', () => close(), { variant: 'primary' })]));
  const backdrop = h('div', { class: 'modal-backdrop', onclick: (e: Event) => { if (e.target === backdrop) close(); } }, box);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = box.querySelectorAll<HTMLElement>('button, [href], input, select, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', onKey);
  document.body.appendChild(backdrop);
  (box.querySelector('button') as HTMLElement | null)?.focus();
  return { close };
}

/* ---------- Botão "Ouvir" ---------- */
export function ouvirBtn(texto: () => string): HTMLElement | null {
  if (!falaDisponivel()) return null;
  return h('button', {
    type: 'button', class: 'icon-btn', 'aria-label': 'Ouvir em voz alta', title: 'Ouvir',
    onclick: () => falar(texto()),
  }, '🔊');
}

/* ---------- Configurações de acessibilidade ---------- */
export function abrirConfiguracoes(): void {
  const corpo = h('div', { class: 'stack' });
  const render = () => {
    clear(corpo);
    const s = getSettings();
    const linha = (rotulo: string, ctrl: HTMLElement) => h('div', { class: 'row' }, h('span', { style: 'flex:1;font-weight:800' }, rotulo), ctrl);
    const toggle = (on: boolean, fn: () => void, nome: string) =>
      h('button', { type: 'button', class: 'icon-btn', 'aria-pressed': String(on), 'aria-label': nome, onclick: () => { fn(); render(); } },
        on ? 'Ligado' : 'Desligado');
    corpo.append(
      linha('Tamanho do texto', h('div', { class: 'row' },
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Diminuir texto', disabled: s.texto === 1,
          onclick: () => { setSettings({ texto: (s.texto - 1) as 1 | 2 }); render(); } }, 'A−'),
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Aumentar texto', disabled: s.texto === 3,
          onclick: () => { setSettings({ texto: (s.texto + 1) as 2 | 3 }); render(); } }, 'A+'))),
      linha('Sons', toggle(s.som, () => setSettings({ som: !s.som }), 'Sons')),
      linha('Alto contraste', toggle(s.contraste, () => setSettings({ contraste: !s.contraste }), 'Alto contraste')),
      linha('Modo calmo (corrida mais lenta)', toggle(s.calmo, () => setSettings({ calmo: !s.calmo }), 'Modo calmo')),
    );
  };
  render();
  modal('Configurações', [corpo]);
}

/* ---------- Barra superior ---------- */
export function topbar(titulo: string, voltar?: { href: string; label: string }, ouvir?: () => string): HTMLElement {
  return h('nav', { class: 'topbar', 'aria-label': 'Navegação' },
    voltar ? h('a', { class: 'icon-btn', href: voltar.href, 'aria-label': voltar.label, onclick: () => pararFala() }, '←') : null,
    h('span', { class: 'topbar__title' }, titulo),
    ouvir ? ouvirBtn(ouvir) : null,
    h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Configurações de acessibilidade', title: 'Acessibilidade', onclick: abrirConfiguracoes }, 'Aa'),
  );
}

export const fmtMl = (ml: number) => `${ml.toLocaleString('pt-BR')} mL`;
