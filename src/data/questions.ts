// Banco do "Detetive da Água" (fase 2). Cada pergunta tem 3 opções (A, B, C).
// Opções com `food` mostram a ilustração; o texto padrão é o nome do alimento.

export interface Opcao { food?: string; texto?: string }
export interface Pergunta {
  pergunta: string;
  opcoes: [Opcao, Opcao, Opcao];
  correta: 0 | 1 | 2;
  explicacao: string;
}

export const PERGUNTAS: Pergunta[] = [
  {
    pergunta: 'Qual destes tem mais água?',
    opcoes: [{ food: 'melancia' }, { food: 'biscoito' }, { food: 'paoforma' }],
    correta: 0,
    explicacao: 'A melancia tem cerca de 91% de água. O biscoito tem só 3% e o pão de forma, cerca de 35%.',
  },
  {
    pergunta: 'Qual destes tem mais água?',
    opcoes: [{ food: 'queijo' }, { food: 'pepino' }, { food: 'arroz' }],
    correta: 1,
    explicacao: 'O pepino é campeão: quase 97% dele é água!',
  },
  {
    pergunta: 'Qual destes tem MENOS água?',
    opcoes: [{ food: 'leite' }, { food: 'tomate' }, { food: 'cereal' }],
    correta: 2,
    explicacao: 'O cereal matinal é seco e crocante: só cerca de 3% de água. Leite (88%) e tomate (95%) são cheios de água.',
  },
  {
    pergunta: 'Qual fruta tem mais água?',
    opcoes: [{ food: 'banana' }, { food: 'morango' }, { food: 'abacate' }],
    correta: 1,
    explicacao: 'O morango tem cerca de 92% de água. A banana tem 72% e o abacate, 84%.',
  },
  {
    pergunta: 'Qual verdura tem mais água?',
    opcoes: [{ food: 'alface' }, { food: 'batatadoce' }, { food: 'cenoura' }],
    correta: 0,
    explicacao: 'A alface tem cerca de 96% de água. A cenoura tem 90% e a batata-doce cozida, 80%.',
  },
  {
    pergunta: 'O feijão cozido tem quanto de água, mais ou menos?',
    opcoes: [{ texto: 'Cerca de 10%' }, { texto: 'Cerca de 40%' }, { texto: 'Cerca de 80%' }],
    correta: 2,
    explicacao: 'O feijão seco absorve muita água no cozimento. Cozido, ele tem cerca de 80% de água!',
  },
  {
    pergunta: 'O arroz cozido tem quanto de água?',
    opcoes: [{ texto: 'Quase nada' }, { texto: 'Cerca de 70%' }, { texto: '100%' }],
    correta: 1,
    explicacao: 'O arroz cozido tem cerca de 69% de água: ele incha porque absorve a água da panela.',
  },
  {
    pergunta: 'Qual café da manhã tem mais água?',
    opcoes: [{ food: 'leite', texto: 'Leite' }, { food: 'paofrances', texto: 'Pão francês' }, { food: 'aveia', texto: 'Aveia' }],
    correta: 0,
    explicacao: 'O leite tem cerca de 88% de água. Pão francês (29%) e aveia crua (9%) são bem secos.',
  },
  {
    pergunta: 'Qual lanche ajuda mais a hidratar?',
    opcoes: [{ food: 'pipoca' }, { food: 'uva' }, { food: 'amendoim' }],
    correta: 1,
    explicacao: 'A uva tem cerca de 86% de água. Pipoca (4%) e amendoim (2%) quase não têm.',
  },
  {
    pergunta: 'De onde vem, em média, a água que bebemos e comemos por dia?',
    opcoes: [
      { texto: 'Só das bebidas' },
      { texto: 'Cerca de 20% vem dos alimentos' },
      { texto: 'Toda dos alimentos' },
    ],
    correta: 1,
    explicacao: 'Segundo a EFSA (Autoridade Europeia de Segurança dos Alimentos), cerca de 20% da água que consumimos vem da comida.',
  },
  {
    pergunta: 'Qual destes tem mais água?',
    opcoes: [{ food: 'frango' }, { food: 'ovo' }, { food: 'presunto' }],
    correta: 1,
    explicacao: 'O ovo cozido tem cerca de 75% de água, o presunto 70% e o frango grelhado 63%.',
  },
  {
    pergunta: 'Por que a uva-passa é tão docinha e enrugada?',
    opcoes: [
      { texto: 'Porque perdeu quase toda a água' },
      { texto: 'Porque ganhou açúcar extra' },
      { texto: 'Porque é outra fruta' },
    ],
    correta: 0,
    explicacao: 'A uva-passa é uva desidratada: sem a água, o açúcar fica concentrado e a casca enruga.',
  },
  {
    pergunta: 'Qual destes tem mais água?',
    opcoes: [{ food: 'chocolate' }, { food: 'mel' }, { food: 'manteiga' }],
    correta: 1,
    explicacao: 'Pegadinha! Todos têm pouca água, mas o mel tem cerca de 17%, a manteiga 16% e o chocolate só 1%.',
  },
  {
    pergunta: 'Qual bebida/comida tem mais água?',
    opcoes: [{ food: 'suco' }, { food: 'iogurte' }, { food: 'agua' }],
    correta: 2,
    explicacao: 'A água pura tem, claro, 100%. Mas o suco (89%) e o iogurte (87%) também hidratam bastante!',
  },
  {
    pergunta: 'Qual destes pratos tem mais água?',
    opcoes: [{ food: 'pizza' }, { food: 'sopa' }, { food: 'sanduiche' }],
    correta: 1,
    explicacao: 'A sopa de legumes tem cerca de 90% de água. Pizza e sanduíche ficam abaixo de 50%.',
  },
  {
    pergunta: 'O que acontece com a água do alimento quando ele é frito?',
    opcoes: [
      { texto: 'Ela aumenta' },
      { texto: 'Parte dela evapora' },
      { texto: 'Nada muda' },
    ],
    correta: 1,
    explicacao: 'O óleo quente faz a água evaporar. Por isso a batata crua tem cerca de 83% de água e a frita bem menos.',
  },
  {
    pergunta: 'Qual fruta tem mais água?',
    opcoes: [{ food: 'coco', texto: 'Coco (polpa)' }, { food: 'melao' }, { food: 'banana' }],
    correta: 1,
    explicacao: 'O melão tem cerca de 91% de água. A polpa do coco tem 47% e a banana, 72%.',
  },
  {
    pergunta: 'Quanta água tem 1 fatia média de melancia (200 g)?',
    opcoes: [{ texto: 'Cerca de 20 mL' }, { texto: 'Cerca de 80 mL' }, { texto: 'Cerca de 180 mL' }],
    correta: 2,
    explicacao: '200 g × 91% ≈ 182 mL de água. É quase um copo inteiro!',
  },
  {
    pergunta: 'Qual destes tem mais água?',
    opcoes: [{ food: 'pimentao' }, { food: 'abacate' }, { food: 'batatafrita' }],
    correta: 0,
    explicacao: 'O pimentão tem cerca de 94% de água. O abacate tem 84% e a batata frita cerca de 50%.',
  },
  {
    pergunta: 'Comer frutas e verduras ajuda na hidratação?',
    opcoes: [
      { texto: 'Não, só a água hidrata' },
      { texto: 'Sim, elas têm muita água' },
      { texto: 'Só se forem cozidas' },
    ],
    correta: 1,
    explicacao: 'Sim! Muitas frutas e verduras têm mais de 85% de água, além de vitaminas e minerais.',
  },
  {
    pergunta: 'Qual destes tem MENOS água?',
    opcoes: [{ food: 'kiwi' }, { food: 'pera' }, { food: 'biscoito' }],
    correta: 2,
    explicacao: 'O biscoito tem só 3% de água. O kiwi (83%) e a pera (85%) são suculentos.',
  },
];
