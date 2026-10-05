// Catálogo único de alimentos.
// aguaPct = umidade (g de água por 100 g do alimento), arredondada.
// Fonte principal: TACO — Tabela Brasileira de Composição de Alimentos (NEPA/UNICAMP, 4ª ed.).
// Itens marcados com fonte 'USDA' vêm da USDA FoodData Central (ausentes ou genéricos na TACO).

export type Grupo = 'fruta' | 'verdura' | 'cereal' | 'proteina' | 'laticinio' | 'bebida' | 'doce' | 'prato';
export type Fonte = 'TACO' | 'USDA';

export interface Food {
  id: string;
  nome: string;
  aguaPct: number;
  porcaoG: number;
  porcaoLabel: string;
  grupo: Grupo;
  fonte: Fonte;
}

const f = (
  id: string, nome: string, aguaPct: number, porcaoG: number, porcaoLabel: string,
  grupo: Grupo, fonte: Fonte = 'TACO',
): Food => ({ id, nome, aguaPct, porcaoG, porcaoLabel, grupo, fonte });

export const FOODS: Record<string, Food> = Object.fromEntries(
  [
    f('melancia', 'Melancia', 91, 200, '1 fatia média (200 g)', 'fruta'),
    f('pepino', 'Pepino', 97, 100, '½ pepino (100 g)', 'verdura'),
    f('tomate', 'Tomate', 95, 100, '1 tomate médio (100 g)', 'verdura'),
    f('alface', 'Alface', 96, 40, '4 folhas (40 g)', 'verdura'),
    f('morango', 'Morango', 92, 120, '10 morangos (120 g)', 'fruta'),
    f('laranja', 'Laranja', 90, 180, '1 laranja média (180 g)', 'fruta'),
    f('suco', 'Suco de laranja', 89, 200, '1 copo (200 mL)', 'bebida'),
    f('maca', 'Maçã', 84, 130, '1 maçã média (130 g)', 'fruta'),
    f('banana', 'Banana', 72, 80, '1 banana média (80 g)', 'fruta'),
    f('leite', 'Leite', 88, 200, '1 copo (200 mL)', 'laticinio'),
    f('iogurte', 'Iogurte', 87, 170, '1 pote (170 g)', 'laticinio'),
    f('ovo', 'Ovo cozido', 75, 50, '1 ovo (50 g)', 'proteina'),
    f('presunto', 'Presunto', 70, 30, '2 fatias (30 g)', 'proteina'),
    f('arroz', 'Arroz', 69, 100, '4 colheres de sopa (100 g)', 'cereal'),
    f('feijao', 'Feijão', 80, 100, '1 concha (100 g)', 'proteina'),
    f('frango', 'Frango grelhado', 63, 100, '1 filé (100 g)', 'proteina'),
    f('batatafrita', 'Batata frita', 50, 100, '1 porção pequena (100 g)', 'prato', 'USDA'),
    f('queijo', 'Queijo muçarela', 45, 30, '2 fatias (30 g)', 'laticinio'),
    f('paofrances', 'Pão francês', 29, 50, '1 pão (50 g)', 'cereal'),
    f('paoforma', 'Pão de forma', 35, 50, '2 fatias (50 g)', 'cereal'),
    f('aveia', 'Aveia', 9, 30, '3 colheres de sopa (30 g)', 'cereal'),
    f('cereal', 'Cereal matinal', 3, 30, '1 tigela (30 g)', 'cereal'),
    f('biscoito', 'Biscoito', 3, 30, '5 biscoitos (30 g)', 'doce'),
    f('sopa', 'Sopa de legumes', 90, 250, '1 prato fundo (250 g)', 'prato', 'USDA'),
    f('agua', 'Água', 100, 200, '1 copo (200 mL)', 'bebida'),
    f('chocolate', 'Chocolate', 1, 25, '1 barrinha (25 g)', 'doce'),
    f('uva', 'Uva', 86, 100, '1 cacho pequeno (100 g)', 'fruta'),
    f('abacaxi', 'Abacaxi', 86, 100, '1 fatia (100 g)', 'fruta'),
    f('cenoura', 'Cenoura', 90, 80, '1 cenoura média (80 g)', 'verdura'),
    f('brocolis', 'Brócolis', 91, 100, '1 xícara cozido (100 g)', 'verdura'),
    f('mel', 'Mel', 17, 20, '1 colher de sopa (20 g)', 'doce', 'USDA'),
    f('pera', 'Pera', 85, 130, '1 pera média (130 g)', 'fruta'),
    f('manteiga', 'Manteiga', 16, 10, '1 colher de chá (10 g)', 'laticinio', 'USDA'),
    f('kiwi', 'Kiwi', 83, 75, '1 kiwi (75 g)', 'fruta', 'USDA'),
    f('coco', 'Coco (polpa)', 47, 50, '1 pedaço (50 g)', 'fruta', 'USDA'),
    f('melao', 'Melão', 91, 150, '1 fatia (150 g)', 'fruta'),
    f('pimentao', 'Pimentão', 94, 80, '½ pimentão (80 g)', 'verdura'),
    f('abacate', 'Abacate', 84, 100, '½ xícara (100 g)', 'fruta'),
    f('batatadoce', 'Batata-doce', 80, 150, '1 batata média cozida (150 g)', 'verdura'),
    f('pizza', 'Pizza', 47, 110, '1 fatia (110 g)', 'prato', 'USDA'),
    f('sanduiche', 'Sanduíche', 45, 120, '1 misto (120 g)', 'prato', 'USDA'),
    f('salada', 'Salada verde', 94, 100, '1 prato de sobremesa (100 g)', 'verdura'),
    f('pipoca', 'Pipoca', 4, 25, '1 saquinho (25 g)', 'cereal', 'USDA'),
    f('amendoim', 'Amendoim', 2, 30, '1 punhado (30 g)', 'proteina'),
  ].map((x) => [x.id, x]),
);

export const food = (id: string): Food => {
  const it = FOODS[id];
  if (!it) throw new Error(`Alimento desconhecido: ${id}`);
  return it;
};

/** Água (mL) de uma quantidade em gramas. 1 g de água ≈ 1 mL. */
export const aguaDeGramas = (fd: Food, gramas: number): number => Math.round((gramas * fd.aguaPct) / 100);

/** Água (mL) da porção padrão do alimento. */
export const aguaMl = (fd: Food): number => aguaDeGramas(fd, fd.porcaoG);

/** 1 a 3 gotas, conforme o teor de água. */
export const gotas = (pct: number): 1 | 2 | 3 => (pct >= 80 ? 3 : pct >= 50 ? 2 : 1);

export const rotuloAgua = (pct: number): string =>
  pct >= 80 ? 'muita água' : pct >= 50 ? 'água média' : 'pouca água';

export const img = (id: string): string => `/food/${id}.webp`;

export const FONTE_TEXTO = 'Fonte: TACO/UNICAMP (4ª ed.) e USDA FoodData Central';
