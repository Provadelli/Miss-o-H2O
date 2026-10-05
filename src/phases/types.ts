export interface PhaseCtx {
  /** Área onde a fase desenha a sua interface. */
  root: HTMLElement;
  /** Abortado quando o jogador sai da fase (limpar timers, listeners, animações). */
  signal: AbortSignal;
}

export interface PhaseResult {
  pontos: number;
  /** Resumo educativo mostrado na tela de resultado. */
  resumo?: Node;
  /** Curiosidade "Você sabia?". */
  saibaMais: string;
}

export interface Phase {
  num: number;
  titulo: string;
  icone: string;
  sub: string;
  instrucoes: string[];
  dica: string;
  botao: string;
  run(ctx: PhaseCtx): Promise<PhaseResult>;
}
