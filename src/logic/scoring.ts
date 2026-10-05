// Regras de pontuação das 7 fases (máximo de 100 cada). Funções puras, cobertas por testes.
import { FOODS, aguaMl, food } from '../data/foods';
import { MAX_POR_ITEM, ORCAMENTO, PRODUTOS, type Produto } from '../data/market';
import { ESCOLHAS_POR_REFEICAO, REFEICOES, VEGETAIS, type Refeicao } from '../data/meals';

export const MAX_FASE = 100;
export const NUM_FASES = 7;
const clamp = (n: number, lo = 0, hi = MAX_FASE) => Math.max(lo, Math.min(hi, Math.round(n)));

export const estrelas = (pts: number): 0 | 1 | 2 | 3 =>
  pts >= 85 ? 3 : pts >= 60 ? 2 : pts > 0 ? 1 : 0;

/* ---------- Fase 1: Desafio do Prato ---------- */
export const FAIXAS_PRATO = [
  { min: 0, max: 200, label: 'Até 200 mL' },
  { min: 200, max: 400, label: '200 a 400 mL' },
  { min: 400, max: 600, label: '400 a 600 mL' },
  { min: 600, max: 800, label: '600 a 800 mL' },
  { min: 800, max: Infinity, label: 'Mais de 800 mL' },
];

export const faixaDe = (ml: number): number => FAIXAS_PRATO.findIndex((f) => ml >= f.min && ml < f.max);

export function resumoPrato(ids: string[]) {
  const itens = ids.map((id) => ({ fd: food(id), ml: aguaMl(food(id)) }));
  const ml = itens.reduce((s, i) => s + i.ml, 0);
  const gramas = itens.reduce((s, i) => s + i.fd.porcaoG, 0);
  const pct = gramas ? Math.round((ml / gramas) * 100) : 0;
  return { itens, ml, gramas, pct };
}

export function pontosPrato(ids: string[], faixaChute: number) {
  const { ml, pct } = resumoPrato(ids);
  const certa = faixaDe(ml);
  const dist = Math.abs(certa - faixaChute);
  const estimativa = dist === 0 ? 60 : dist === 1 ? 30 : 0;
  const bonus = pct > 60 ? 40 : pct >= 40 ? 20 : 0;
  return { pontos: clamp(estimativa + bonus), estimativa, bonus, certa, ml, pct };
}

/* ---------- Fase 2: Detetive da Água ---------- */
export const GOTAS_INICIAIS = 5;
export const passoDetetive = (gotas: number, acertou: boolean) => Math.max(0, gotas + (acertou ? 1 : -1));
export const pontosDetetive = (acertos: number, gotasRestantes: number) => clamp(acertos * 10 + gotasRestantes * 4);

/* ---------- Fase 3: Corrida das Gotas ---------- */
/** Valor (em gotas) de pegar um alimento na corrida. */
export function valorCorrida(pct: number): number {
  if (pct >= 80) return Math.round(pct / 20); // 4 ou 5
  if (pct >= 50) return 1;
  return -5;
}
export const pontosCorrida = (gotas: number) => clamp(gotas);

/* ---------- Fase 4: Mercado (knapsack limitado) ---------- */
export interface Cesta { qtd: number[]; agua: number; custo: number }

export const aguaProduto = (p: Produto) => aguaMl(food(p.food));

/** Melhor cesta (máxima água) com orçamento e limite por item. Programação dinâmica O(n·B·k). */
export function cestaOtima(produtos: Produto[] = PRODUTOS, orcamento = ORCAMENTO, maxPorItem = MAX_POR_ITEM): Cesta {
  const n = produtos.length;
  // dp[i][b] = melhor água usando os i primeiros produtos com orçamento b
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(orcamento + 1).fill(0));
  const escolha: number[][] = Array.from({ length: n + 1 }, () => new Array(orcamento + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    const { preco } = produtos[i - 1];
    const agua = aguaProduto(produtos[i - 1]);
    for (let b = 0; b <= orcamento; b++) {
      let best = dp[i - 1][b], bestK = 0;
      for (let k = 1; k <= maxPorItem && k * preco <= b; k++) {
        const v = dp[i - 1][b - k * preco] + k * agua;
        if (v > best) { best = v; bestK = k; }
      }
      dp[i][b] = best;
      escolha[i][b] = bestK;
    }
  }
  const qtd = new Array(n).fill(0);
  let b = orcamento;
  for (let i = n; i >= 1; i--) {
    qtd[i - 1] = escolha[i][b];
    b -= escolha[i][b] * produtos[i - 1].preco;
  }
  return { qtd, agua: dp[n][orcamento], custo: orcamento - b };
}

export function totaisCesta(qtd: number[], produtos: Produto[] = PRODUTOS) {
  let agua = 0, custo = 0;
  qtd.forEach((q, i) => { agua += q * aguaProduto(produtos[i]); custo += q * produtos[i].preco; });
  return { agua, custo };
}

export function pontosMercado(qtd: number[], produtos: Produto[] = PRODUTOS, orcamento = ORCAMENTO) {
  const { agua, custo } = totaisCesta(qtd, produtos);
  if (custo > orcamento) return 0;
  const otima = cestaOtima(produtos, orcamento).agua;
  return otima ? clamp((100 * agua) / otima) : 0;
}

/* ---------- Fase 5: Verdadeiro ou Falso ---------- */
export const pontosVF = (acertos: number) => clamp(acertos * 10);

/* ---------- Fase 6: Quem Tem Mais Água? ---------- */
export const NUM_DUELOS = 8;
export const pontosDuelo = (acertos: number, total = NUM_DUELOS) =>
  clamp(acertos * 10 + (acertos === total ? 20 : 0));

/** Sorteia duelos com diferença mínima de 4 pontos percentuais (sem empates ambíguos). */
export function sortearDuelos(rand: () => number = Math.random, n = NUM_DUELOS): [string, string][] {
  const ids = Object.keys(FOODS).filter((id) => id !== 'agua');
  const usados = new Set<string>();
  const out: [string, string][] = [];
  let guard = 0;
  while (out.length < n && guard++ < 2000) {
    const a = ids[Math.floor(rand() * ids.length)];
    const b = ids[Math.floor(rand() * ids.length)];
    if (a === b || usados.has(a) || usados.has(b)) continue;
    if (Math.abs(FOODS[a].aguaPct - FOODS[b].aguaPct) < 4) continue;
    usados.add(a); usados.add(b);
    out.push([a, b]);
  }
  return out;
}

/* ---------- Fase 7: Monte Sua Refeição ---------- */
export type Escolhas = Record<Refeicao, string[]>;

export const aguaRefeicao = (ids: string[]) => ids.reduce((s, id) => s + aguaMl(food(id)), 0);

/** Máxima água possível escolhendo as 3 melhores opções de cada refeição. */
export function aguaMaximaRefeicoes(): number {
  return REFEICOES.reduce((s, r) => {
    const top = r.opcoes.map((id) => aguaMl(food(id))).sort((a, b) => b - a).slice(0, ESCOLHAS_POR_REFEICAO);
    return s + top.reduce((x, y) => x + y, 0);
  }, 0);
}

export function pontosRefeicao(esc: Escolhas) {
  const porRefeicao = REFEICOES.map((r) => ({
    id: r.id,
    ml: aguaRefeicao(esc[r.id] ?? []),
    equilibrada: (esc[r.id] ?? []).some((id) => VEGETAIS.has(id)),
  }));
  const total = porRefeicao.reduce((s, r) => s + r.ml, 0);
  const hidratacao = (70 * total) / aguaMaximaRefeicoes();
  const equilibrio = porRefeicao.filter((r) => r.equilibrada).length * 10;
  return { pontos: clamp(hidratacao + equilibrio), total, porRefeicao, equilibrio };
}

/* ---------- Utilitários ---------- */
export function embaralhar<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
