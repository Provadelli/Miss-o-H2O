export type Cleanup = void | (() => void);
export type Screen = (root: HTMLElement, param?: string) => Cleanup;

/** Navega para uma rota (#/...). Se já estiver nela, redesenha a tela. */
export function ir(rota: string): void {
  if (location.hash === `#${rota}`) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = rota;
}
