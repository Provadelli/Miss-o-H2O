// Monte Sua Refeição (fase 7): opções da referência, com os valores corrigidos pela TACO.
export type Refeicao = 'cafe' | 'almoco' | 'jantar';

export const ESCOLHAS_POR_REFEICAO = 3;

export const REFEICOES: { id: Refeicao; nome: string; icone: string; opcoes: string[] }[] = [
  { id: 'cafe', nome: 'Café da manhã', icone: '☀️', opcoes: ['melancia', 'leite', 'banana', 'cereal', 'paofrances', 'iogurte'] },
  { id: 'almoco', nome: 'Almoço', icone: '🍽️', opcoes: ['arroz', 'feijao', 'frango', 'salada', 'batatafrita', 'suco'] },
  { id: 'jantar', nome: 'Jantar', icone: '🌙', opcoes: ['sopa', 'sanduiche', 'iogurte', 'maca', 'queijo', 'agua'] },
];

/** Alimentos que contam como "fruta ou verdura" para o equilíbrio da refeição. */
export const VEGETAIS = new Set(['melancia', 'banana', 'salada', 'sopa', 'maca']);

/** Referência: cerca de 20% da água diária vem dos alimentos (EFSA, 2010).
 *  Para ingestão adequada de ~2,0–2,5 L/dia em adultos, isso dá ~400–500 mL. */
export const REFERENCIA_ALIMENTOS_ML = 500;
