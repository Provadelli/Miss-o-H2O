import { FOODS, food, img } from '../data/foods';
import { pontosCorrida, valorCorrida } from '../logic/scoring';
import { sfx } from '../services/audio';
import { getSettings } from '../state/settings';
import { h } from '../ui/h';
import { anunciar, chip, feedback, gota } from '../ui/components';
import { esperarBotao, trocar } from './common';
import type { Phase } from './types';

const DURACAO = 45; // segundos
const W = 800, H = 360;
const FAIXAS = [150, 230, 310]; // y do "chão" de cada faixa
const PX = 120; // x do corredor
const BOM = Object.values(FOODS).filter((f) => f.aguaPct >= 80 && f.id !== 'agua' && f.grupo !== 'prato').map((f) => f.id);
const MEDIO = ['banana', 'arroz', 'batatafrita', 'ovo', 'presunto'];
const RUIM = ['paofrances', 'biscoito', 'queijo', 'cereal', 'chocolate', 'pipoca', 'amendoim', 'aveia'];

interface Item { id: string; faixa: number; x: number; valor: number; pego: boolean }
interface Texto { txt: string; x: number; y: number; t: number; bom: boolean }

export const p3: Phase = {
  num: 3,
  titulo: 'Corrida das Gotas',
  icone: 'corredor',
  sub: 'Corra pegando alimentos com muita água e fuja dos que têm pouca!',
  instrucoes: [
    `A corrida dura ${DURACAO} segundos.`,
    'Troque de faixa com os botões ▲ ▼, deslizando o dedo ou com as setas do teclado.',
    'Alimentos com muita água (80% ou mais) dão gotas. Os com pouca água tiram 5 gotas!',
    'Ficou difícil? Ligue o "modo calmo" no botão Aa.',
  ],
  dica: 'Melancia, pepino, tomate e morango são ótimos. Fuja do pão, do biscoito e do queijo!',
  botao: 'Jogar',

  run({ root, signal }) {
    return new Promise((resolve) => {
      const calmo = getSettings().calmo;
      const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const canvas = h('canvas', { width: W, height: H, 'aria-label': 'Pista da corrida', role: 'img' });
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = W * dpr; canvas.height = H * dpr;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(dpr, dpr);

      const gotasChip = chip([gota(), ' 0 gotas']);
      const tempoChip = chip(['⏱ ', `${DURACAO}s`], true);
      const pausa = h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Pausar' }, '⏸');
      const sobe = h('button', { type: 'button', class: 'btn btn--primary', 'aria-label': 'Subir de faixa' }, '▲');
      const desce = h('button', { type: 'button', class: 'btn btn--primary', 'aria-label': 'Descer de faixa' }, '▼');
      const aviso = h('p', { class: 'sr-only', 'aria-live': 'polite' });

      trocar(root, h('div', { class: 'stack', style: 'max-width:900px;margin:0 auto;width:100%' },
        h('div', { class: 'hud' }, gotasChip, tempoChip, pausa),
        h('div', { class: 'runner-wrap' }, canvas),
        h('div', { class: 'runner-controls' }, sobe, desce),
        aviso));

      // Imagens
      const imgs: Record<string, HTMLImageElement> = {};
      for (const id of [...BOM, ...MEDIO, ...RUIM, 'corredor']) {
        const im = new Image(); im.src = img(id); imgs[id] = im;
      }

      // Estado
      let faixa = 1, yAtual = FAIXAS[1];
      let gotas = 0, bons = 0, ruins = 0;
      let t = 0, proxSpawn = 1.2, scroll = 0;
      let pausado = false, contagem = 3, fim = false;
      const itens: Item[] = [];
      const textos: Texto[] = [];
      const v0 = calmo ? 170 : 260, acel = calmo ? 2.5 : 6;
      let ultimo = performance.now();
      let raf = 0;

      const mover = (d: number) => {
        if (pausado || fim) return;
        const n = Math.max(0, Math.min(2, faixa + d));
        if (n !== faixa) { faixa = n; sfx.tap(); }
      };
      const setPausa = (p: boolean) => {
        if (fim) return;
        pausado = p;
        pausa.textContent = p ? '▶' : '⏸';
        pausa.setAttribute('aria-label', p ? 'Continuar' : 'Pausar');
        if (!p) ultimo = performance.now();
        aviso.textContent = p ? 'Corrida pausada.' : 'Corrida continuando.';
        desenhar();
      };

      sobe.addEventListener('click', () => mover(-1));
      desce.addEventListener('click', () => mover(1));
      pausa.addEventListener('click', () => setPausa(!pausado));
      canvas.addEventListener('click', () => { if (pausado) setPausa(false); });
      const onKey = (e: KeyboardEvent) => {
        if (['ArrowUp', 'w', 'W'].includes(e.key)) { e.preventDefault(); mover(-1); }
        else if (['ArrowDown', 's', 'S'].includes(e.key)) { e.preventDefault(); mover(1); }
        else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') setPausa(!pausado);
      };
      window.addEventListener('keydown', onKey);
      // Deslizar o dedo
      let y0: number | null = null;
      canvas.addEventListener('pointerdown', (e) => { y0 = e.clientY; });
      canvas.addEventListener('pointerup', (e) => {
        if (y0 == null) return;
        const dy = e.clientY - y0; y0 = null;
        if (Math.abs(dy) > 24) mover(dy < 0 ? -1 : 1);
        else {
          // Toque simples: vai para a faixa tocada
          const r = canvas.getBoundingClientRect();
          const y = ((e.clientY - r.top) / r.height) * H;
          const alvo = FAIXAS.reduce((best, fy, i) => (Math.abs(fy - 30 - y) < Math.abs(FAIXAS[best] - 30 - y) ? i : best), 0);
          mover(alvo - faixa);
        }
      });
      const onVis = () => { if (document.hidden) setPausa(true); };
      document.addEventListener('visibilitychange', onVis);
      window.addEventListener('blur', onVis);

      const limpar = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('keydown', onKey);
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('blur', onVis);
      };
      signal.addEventListener('abort', limpar);

      const sortear = (): string => {
        const r = Math.random();
        const pool = r < 0.55 ? BOM : r < 0.7 ? MEDIO : RUIM;
        return pool[Math.floor(Math.random() * pool.length)];
      };
      const spawn = () => {
        const id = sortear();
        const usadas = itens.filter((i) => i.x > W - 60).map((i) => i.faixa);
        const livres = [0, 1, 2].filter((f) => !usadas.includes(f));
        if (!livres.length) return;
        const fx = livres[Math.floor(Math.random() * livres.length)];
        itens.push({ id, faixa: fx, x: W + 40, valor: valorCorrida(food(id).aguaPct), pego: false });
      };

      function atualizar(dt: number) {
        t += dt;
        const vel = v0 + acel * t;
        scroll = (scroll + vel * dt) % 80;
        const alvoY = FAIXAS[faixa];
        yAtual += (alvoY - yAtual) * Math.min(1, dt * 14);

        proxSpawn -= dt;
        if (proxSpawn <= 0) {
          spawn();
          if (Math.random() < 0.25 + t / 200) spawn();
          const base = calmo ? 1.15 : 0.85;
          proxSpawn = Math.max(calmo ? 0.8 : 0.5, base - t * 0.008);
        }
        for (const it of itens) {
          it.x -= vel * dt;
          if (!it.pego && it.faixa === faixa && Math.abs(it.x - PX) < 46) {
            it.pego = true;
            gotas = Math.max(0, gotas + it.valor);
            if (it.valor > 0) { bons++; it.valor >= 4 ? sfx.gota() : sfx.tap(); } else { ruins++; sfx.bad(); }
            textos.push({ txt: `${it.valor > 0 ? '+' : '−'}${Math.abs(it.valor)}`, x: PX + 30, y: FAIXAS[it.faixa] - 70, t: 0, bom: it.valor > 0 });
            gotasChip.lastChild!.textContent = ` ${gotas} gotas`;
          }
        }
        for (let i = itens.length - 1; i >= 0; i--) if (itens[i].x < -60 || itens[i].pego) itens.splice(i, 1);
        for (let i = textos.length - 1; i >= 0; i--) { textos[i].t += dt; textos[i].y -= 40 * dt; if (textos[i].t > 0.9) textos.splice(i, 1); }
        tempoChip.lastChild!.textContent = `${Math.max(0, Math.ceil(DURACAO - t))}s`;
      }

      function desenhar() {
        // Céu
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#8fd3ff'); g.addColorStop(1, '#e6f6ff');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // Faixas (passarelas de madeira)
        FAIXAS.forEach((fy, i) => {
          ctx.fillStyle = i % 2 ? '#f0c98a' : '#e9bd78';
          ctx.fillRect(0, fy - 18, W, 26);
          ctx.fillStyle = '#c99a55';
          for (let x = -scroll; x < W; x += 80) ctx.fillRect(x, fy - 18, 4, 26);
        });
        // Barra de progresso
        ctx.fillStyle = '#ffffffaa'; ctx.fillRect(20, 16, W - 40, 12);
        ctx.fillStyle = '#1565d8'; ctx.fillRect(20, 16, (W - 40) * Math.min(1, t / DURACAO), 12);
        // Itens
        for (const it of itens) {
          const fy = FAIXAS[it.faixa];
          const im = imgs[it.id];
          if (im.complete) ctx.drawImage(im, it.x - 30, fy - 78, 60, 60);
          ctx.font = 'bold 18px Nunito, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = it.valor > 0 ? '#0b3d91' : '#c62828';
          ctx.fillText(`${it.valor > 0 ? '+' : '−'}${Math.abs(it.valor)}`, it.x, fy - 82);
        }
        // Corredor
        const bob = reduz || pausado ? 0 : Math.sin(t * 16) * 4;
        const cr = imgs.corredor;
        if (cr.complete) ctx.drawImage(cr, PX - 40, yAtual - 92 + bob, 80, 80);
        // Textos flutuantes
        for (const tx of textos) {
          ctx.globalAlpha = 1 - tx.t / 0.9;
          ctx.font = 'bold 30px "Baloo 2", sans-serif';
          ctx.fillStyle = tx.bom ? '#15803d' : '#c62828';
          ctx.fillText(tx.txt, tx.x, tx.y);
          ctx.globalAlpha = 1;
        }
        // Sobreposições
        if (contagem > 0 || pausado) {
          ctx.fillStyle = 'rgba(7,42,102,.55)'; ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
          ctx.font = 'bold 72px "Baloo 2", sans-serif';
          ctx.fillText(pausado ? 'Pausado' : String(Math.ceil(contagem)), W / 2, H / 2 + 10);
          if (pausado) { ctx.font = 'bold 24px Nunito, sans-serif'; ctx.fillText('Toque aqui ou em ▶ para continuar', W / 2, H / 2 + 56); }
        }
      }

      const loop = (agora: number) => {
        if (signal.aborted) return;
        const dt = Math.min(0.05, (agora - ultimo) / 1000);
        ultimo = agora;
        if (!pausado) {
          if (contagem > 0) contagem -= dt;
          else atualizar(dt);
        }
        desenhar();
        if (t >= DURACAO) { terminar(); return; }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame((a) => { ultimo = a; loop(a); });
      anunciar('A corrida vai começar em 3 segundos.');

      async function terminar() {
        fim = true;
        limpar();
        sfx.vitoria();
        const pontos = pontosCorrida(gotas);
        anunciar(`Fim da corrida! Você juntou ${gotas} gotas.`);
        const area = h('div', { class: 'stack', style: 'max-width:760px;margin:0 auto;width:100%' },
          feedback('ok', `Fim da corrida! ${gotas} gotas`, `Você pegou ${bons} alimentos com água e esbarrou em ${ruins} alimentos secos.`));
        trocar(root, area);
        await esperarBotao(area, 'Ver pontuação');
        if (signal.aborted) return;
        resolve({
          pontos,
          resumo: h('p', null, `Gotas: ${gotas} (máximo de 100 pontos). Alimentos bons: ${bons} · secos: ${ruins}.`),
          saibaMais: 'Tomate e pepino têm mais de 95% de água. São ótimos lanches para dias quentes!',
        });
      }
    });
  },
};
