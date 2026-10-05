import { describe, expect, it } from 'vitest';
import { FOODS, aguaMl, food, gotas } from '../data/foods';
import { PRODUTOS } from '../data/market';
import { REFEICOES } from '../data/meals';
import { PERGUNTAS } from '../data/questions';
import { AFIRMACOES } from '../data/statements';
import {
  aguaMaximaRefeicoes, aguaProduto, cestaOtima, estrelas, faixaDe, passoDetetive, pontosCorrida,
  pontosDetetive, pontosDuelo, pontosMercado, pontosPrato, pontosRefeicao, pontosVF, sortearDuelos,
  totaisCesta, valorCorrida,
} from './scoring';

describe('água da porção', () => {
  it('calcula mL = g × %', () => {
    expect(aguaMl(food('melancia'))).toBe(182); // 200 g × 91%
    expect(aguaMl(food('agua'))).toBe(200);
    expect(aguaMl(food('cereal'))).toBe(1); // 30 g × 3%
  });
  it('usa os valores corrigidos da TACO', () => {
    expect(food('cereal').aguaPct).toBe(3);
    expect(food('feijao').aguaPct).toBe(80);
  });
  it('todos os alimentos têm dados válidos e imagem', () => {
    for (const f of Object.values(FOODS)) {
      expect(f.aguaPct).toBeGreaterThanOrEqual(0);
      expect(f.aguaPct).toBeLessThanOrEqual(100);
      expect(f.porcaoG).toBeGreaterThan(0);
    }
  });
  it('gotas de 1 a 3', () => {
    expect(gotas(95)).toBe(3);
    expect(gotas(60)).toBe(2);
    expect(gotas(10)).toBe(1);
  });
});

describe('fase 1: prato', () => {
  it('faixas', () => {
    expect(faixaDe(0)).toBe(0);
    expect(faixaDe(199)).toBe(0);
    expect(faixaDe(200)).toBe(1);
    expect(faixaDe(5000)).toBe(4);
  });
  it('acerto exato + bônus', () => {
    // melancia 182 + suco 178 = 360 mL → faixa 1; 400 g → 90%
    const r = pontosPrato(['melancia', 'suco'], 1);
    expect(r.ml).toBe(360);
    expect(r.pontos).toBe(100);
  });
  it('faixa vizinha vale metade e prato seco não tem bônus', () => {
    const r = pontosPrato(['cereal', 'paofrances'], 1); // 1 + 15 = 16 mL → faixa 0
    expect(r.estimativa).toBe(30);
    expect(r.bonus).toBe(0);
  });
});

describe('fase 2: detetive', () => {
  it('gotas nunca ficam negativas', () => {
    expect(passoDetetive(0, false)).toBe(0);
    expect(passoDetetive(5, true)).toBe(6);
  });
  it('teto de 100', () => {
    expect(pontosDetetive(8, 13)).toBe(100);
    expect(pontosDetetive(0, 0)).toBe(0);
    expect(pontosDetetive(4, 5)).toBe(60);
  });
  it('banco de perguntas é coerente com o catálogo', () => {
    expect(PERGUNTAS.length).toBeGreaterThanOrEqual(20);
    for (const q of PERGUNTAS) {
      for (const o of q.opcoes) if (o.food) expect(FOODS[o.food]).toBeDefined();
      // Perguntas "mais/menos água" com 3 alimentos: a resposta bate com a tabela
      if (q.opcoes.every((o) => o.food) && /mais água|MENOS água/.test(q.pergunta)) {
        const pcts = q.opcoes.map((o) => FOODS[o.food!].aguaPct);
        const alvo = q.pergunta.includes('MENOS') ? Math.min(...pcts) : Math.max(...pcts);
        expect(pcts[q.correta]).toBe(alvo);
      }
    }
  });
});

describe('fase 3: corrida', () => {
  it('valores das gotas', () => {
    expect(valorCorrida(97)).toBe(5);
    expect(valorCorrida(84)).toBe(4);
    expect(valorCorrida(72)).toBe(1);
    expect(valorCorrida(3)).toBe(-5);
  });
  it('pontos com teto', () => {
    expect(pontosCorrida(150)).toBe(100);
    expect(pontosCorrida(42)).toBe(42);
  });
});

describe('fase 4: mercado (knapsack)', () => {
  it('cesta ótima respeita orçamento e limite por item', () => {
    const o = cestaOtima();
    expect(o.custo).toBeLessThanOrEqual(100);
    expect(o.qtd.every((q) => q >= 0 && q <= 3)).toBe(true);
    expect(totaisCesta(o.qtd).agua).toBe(o.agua);
  });
  it('cesta ótima bate com a força bruta em um caso pequeno', () => {
    const prods = [{ food: 'melancia', preco: 7 }, { food: 'suco', preco: 4 }, { food: 'banana', preco: 3 }];
    let melhor = 0;
    for (let a = 0; a <= 3; a++) for (let b = 0; b <= 3; b++) for (let c = 0; c <= 3; c++) {
      if (a * 7 + b * 4 + c * 3 > 15) continue;
      melhor = Math.max(melhor, a * aguaProduto(prods[0]) + b * aguaProduto(prods[1]) + c * aguaProduto(prods[2]));
    }
    expect(cestaOtima(prods, 15).agua).toBe(melhor);
  });
  it('pontuação proporcional à ótima', () => {
    expect(pontosMercado(cestaOtima().qtd)).toBe(100);
    expect(pontosMercado(PRODUTOS.map(() => 0))).toBe(0);
    expect(pontosMercado(PRODUTOS.map(() => 3))).toBe(0); // estourou o orçamento
  });
});

describe('fase 5 e 6', () => {
  it('V/F: 10 por acerto', () => {
    expect(pontosVF(7)).toBe(70);
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(25);
  });
  it('duelo: bônus de sequência perfeita', () => {
    expect(pontosDuelo(8)).toBe(100);
    expect(pontosDuelo(7)).toBe(70);
  });
  it('duelos sorteados não repetem e não empatam', () => {
    const d = sortearDuelos();
    expect(d).toHaveLength(8);
    const todos = d.flat();
    expect(new Set(todos).size).toBe(16);
    for (const [a, b] of d) expect(Math.abs(FOODS[a].aguaPct - FOODS[b].aguaPct)).toBeGreaterThanOrEqual(4);
  });
});

describe('fase 7: refeição', () => {
  it('máximo = 100 com as melhores escolhas e equilíbrio', () => {
    const melhor = Object.fromEntries(REFEICOES.map((r) => [r.id,
      r.opcoes.slice().sort((a, b) => aguaMl(food(b)) - aguaMl(food(a))).slice(0, 3)])) as any;
    const r = pontosRefeicao(melhor);
    expect(r.total).toBe(aguaMaximaRefeicoes());
    expect(r.pontos).toBe(100);
  });
  it('refeição vazia vale zero', () => {
    expect(pontosRefeicao({ cafe: [], almoco: [], jantar: [] }).pontos).toBe(0);
  });
});

describe('estrelas', () => {
  it('faixas', () => {
    expect(estrelas(100)).toBe(3);
    expect(estrelas(60)).toBe(2);
    expect(estrelas(10)).toBe(1);
    expect(estrelas(0)).toBe(0);
  });
});
