import { NUM_FASES } from '../logic/scoring';
import { load, save } from './storage';

const KEY = 'h2o.player';

export interface Player {
  id: string;
  nome: string;
  /** Pontos de cada fase (null = ainda não jogada). Guarda o melhor resultado. */
  fases: (number | null)[];
}

const novoId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // Fallback para navegadores antigos (UUID v4)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const vazio = (): Player => ({ id: novoId(), nome: '', fases: new Array(NUM_FASES).fill(null) });

let player: Player = load<Player>(KEY, vazio());
if (!Array.isArray(player.fases) || player.fases.length !== NUM_FASES) player.fases = vazio().fases;

export const getPlayer = (): Player => player;
const persist = () => save(KEY, player);

/** Começa uma nova partida com um apelido (novo id, para não sobrescrever outro jogador do mesmo aparelho). */
export function novoJogador(nome: string): void {
  player = { ...vazio(), nome };
  persist();
}

export function registrarFase(indice: number, pontos: number): void {
  const atual = player.fases[indice];
  player.fases[indice] = atual == null ? pontos : Math.max(atual, pontos);
  persist();
}

export const total = (p: Player = player): number => p.fases.reduce<number>((s, x) => s + (x ?? 0), 0);
export const concluidas = (p: Player = player): number => p.fases.filter((x) => x != null).length;
/** Índice da próxima fase liberada (a primeira não jogada), ou NUM_FASES se acabou. */
export const proximaFase = (p: Player = player): number => {
  const i = p.fases.findIndex((x) => x == null);
  return i === -1 ? NUM_FASES : i;
};
export const faseLiberada = (i: number): boolean => i <= proximaFase();
export const fasesParaEnvio = (): number[] => player.fases.map((x) => x ?? 0);
