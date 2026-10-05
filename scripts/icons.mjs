// Gera os ícones PNG do PWA a partir de public/icons/icon.svg
import sharp from 'sharp';
for (const s of [192, 512]) {
  await sharp('public/icons/icon.svg').resize(s, s).png().toFile(`public/icons/icon-${s}.png`);
}
console.log('ícones gerados');
