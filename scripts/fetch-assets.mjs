// Baixa as ilustrações Fluent Emoji 3D (Microsoft, licença MIT) e converte para WebP leve.
// Uso: npm run assets   (os arquivos gerados ficam versionados em public/food)
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets';
const MAP = {
  melancia: 'Watermelon', pepino: 'Cucumber', tomate: 'Tomato', alface: 'Leafy green',
  morango: 'Strawberry', laranja: 'Tangerine', suco: 'Beverage box', maca: 'Red apple',
  banana: 'Banana', leite: 'Glass of milk', iogurte: 'Custard', ovo: 'Egg',
  presunto: 'Cut of meat', arroz: 'Cooked rice', feijao: 'Beans', frango: 'Poultry leg',
  batatafrita: 'French fries', queijo: 'Cheese wedge', paofrances: 'Baguette bread',
  paoforma: 'Bread', aveia: 'Bowl with spoon', cereal: 'Bowl with spoon', biscoito: 'Cookie',
  sopa: 'Pot of food', agua: 'Droplet', chocolate: 'Chocolate bar', uva: 'Grapes',
  abacaxi: 'Pineapple', cenoura: 'Carrot', brocolis: 'Broccoli', mel: 'Honey pot',
  pera: 'Pear', manteiga: 'Butter', kiwi: 'Kiwi fruit', coco: 'Coconut', melao: 'Melon',
  pimentao: 'Bell pepper', abacate: 'Avocado', batatadoce: 'Roasted sweet potato',
  pizza: 'Pizza', sanduiche: 'Sandwich', salada: 'Green salad', pipoca: 'Popcorn',
  amendoim: 'Peanuts',
  // UI
  trofeu: 'Trophy', moeda: 'Coin', cesta: 'Shopping cart', lupa: 'Magnifying glass tilted left',
  cerebro: 'Brain', prato: 'Fork and knife with plate', corredor: 'Person running',
  estrela: 'Star', chef: 'Cook', medalha1: '1st place medal', medalha2: '2nd place medal',
  medalha3: '3rd place medal', lampada: 'Light bulb', relogio: 'Stopwatch', bandeira: 'Chequered flag',
  balanca: 'Balance scale',
};

const slug = (n) => n.toLowerCase().replace(/ /g, '_');
await mkdir('public/food', { recursive: true });
for (const [id, name] of Object.entries(MAP)) {
  let url = `${BASE}/${encodeURIComponent(name)}/3D/${slug(name)}_3d.png`;
  let res = await fetch(url);
  if (!res.ok) {
    // Emojis com tom de pele ficam em Default/3D
    url = `${BASE}/${encodeURIComponent(name)}/Default/3D/${slug(name)}_3d_default.png`;
    res = await fetch(url);
  }
  if (!res.ok) { console.error('FALHOU', id, url, res.status); continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  const out = await sharp(buf).resize(128, 128).webp({ quality: 82, alphaQuality: 90 }).toBuffer();
  await writeFile(`public/food/${id}.webp`, out);
  console.log('ok', id, out.length);
}
