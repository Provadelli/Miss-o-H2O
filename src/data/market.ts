// Mercado da Água (fase 4): preços em moedas, mesmos produtos da referência.
// A água de cada produto é calculada da porção (foods.ts), não fixa.
export const ORCAMENTO = 100;
export const MAX_POR_ITEM = 3;

export interface Produto { food: string; preco: number }

export const PRODUTOS: Produto[] = [
  { food: 'melancia', preco: 20 },
  { food: 'morango', preco: 15 },
  { food: 'laranja', preco: 10 },
  { food: 'iogurte', preco: 8 },
  { food: 'banana', preco: 6 },
  { food: 'paoforma', preco: 5 },
  { food: 'aveia', preco: 8 },
  { food: 'queijo', preco: 12 },
  { food: 'ovo', preco: 7 },
  { food: 'suco', preco: 10 },
];
