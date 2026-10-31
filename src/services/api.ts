// Comunicação com o placar compartilhado (api/scores.ts), com fila offline.
import type { ScorePayload } from '../logic/validate';
import { load, remove, save } from '../state/storage';

export interface RankEntry { name: string; score: number; rank: number }

const FILA = 'h2o.pending';
const ULTIMO_TOP = 'h2o.lastTop';

// Pódio zerado para a feira: apaga uma única vez, em cada aparelho, o placar antigo
// salvo offline e envios pendentes de jogadores anteriores (para não voltarem ao pódio).
const RESET = 'h2o.reset';
const RESET_VERSAO = 'feira-2026';
if (load<{ v: string }>(RESET, { v: '' }).v !== RESET_VERSAO) {
  remove(ULTIMO_TOP);
  remove(FILA);
  save(RESET, { v: RESET_VERSAO });
}

export async function getTop(limit = 10): Promise<{ list: RankEntry[]; offline: boolean }> {
  try {
    const res = await fetch(`/api/scores?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const list = (await res.json()) as RankEntry[];
    save(ULTIMO_TOP, { list });
    return { list, offline: false };
  } catch {
    // Sem rede: mostra o último placar conhecido
    return { list: load<{ list: RankEntry[] }>(ULTIMO_TOP, { list: [] }).list, offline: true };
  }
}

/** Envia a pontuação acumulada. Se falhar, guarda na fila (só a mais recente importa). */
export async function submitScore(p: ScorePayload): Promise<number | null> {
  save(FILA, { payload: p });
  return flush();
}

let enviando: Promise<number | null> | null = null;

export function flush(): Promise<number | null> {
  if (enviando) return enviando;
  const item = load<{ payload: ScorePayload | null }>(FILA, { payload: null }).payload;
  if (!item) return Promise.resolve(null);
  enviando = (async () => {
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.status === 400) { remove(FILA); return null; } // inválido: não adianta reenviar
      if (!res.ok) throw new Error(String(res.status));
      const atual = load<{ payload: ScorePayload | null }>(FILA, { payload: null }).payload;
      if (atual && atual.score === item.score && atual.id === item.id) remove(FILA);
      const { rank } = (await res.json()) as { rank: number | null };
      return rank;
    } catch {
      return null;
    } finally {
      enviando = null;
    }
  })();
  return enviando;
}

export const temPendente = (): boolean => load<{ payload: unknown }>(FILA, { payload: null }).payload != null;

export function iniciarReenvio(): void {
  window.addEventListener('online', () => void flush());
  void flush();
}
