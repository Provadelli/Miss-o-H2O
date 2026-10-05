import { clear, h } from '../ui/h';
import { btn } from '../ui/components';

/** Mostra um botão e espera o clique. */
export function esperarBotao(alvo: HTMLElement, texto: string, icon?: string): Promise<void> {
  return new Promise((resolve) => {
    const b = btn(texto, () => { b.disabled = true; resolve(); }, { variant: 'primary', big: true, block: true, icon });
    alvo.append(b);
    b.focus({ preventScroll: true });
    b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
}

/** Troca o conteúdo de uma área. */
export function trocar(alvo: HTMLElement, ...filhos: (Node | null)[]): void {
  clear(alvo);
  for (const f of filhos) if (f) alvo.append(f);
}

export const contador = (atual: number, total: number, rotulo = 'Pergunta') =>
  h('span', { class: 'chip chip--light' }, `${rotulo} ${atual} de ${total}`);

export const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
