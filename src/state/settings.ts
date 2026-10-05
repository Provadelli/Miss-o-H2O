import { load, save } from './storage';

const KEY = 'h2o.settings';

export interface Settings {
  texto: 1 | 2 | 3;
  som: boolean;
  contraste: boolean;
  calmo: boolean;
}

const reduzMovimento = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

let s: Settings = load<Settings>(KEY, { texto: 1, som: true, contraste: false, calmo: reduzMovimento() });

export const getSettings = (): Settings => s;

export function setSettings(patch: Partial<Settings>): void {
  s = { ...s, ...patch };
  save(KEY, s);
  aplicar();
}

export function aplicar(): void {
  const root = document.documentElement;
  root.dataset.text = String(s.texto);
  if (s.contraste) root.dataset.contrast = 'high';
  else delete root.dataset.contrast;
}
