// Efeitos sonoros curtos gerados com WebAudio (sem arquivos para baixar).
import { getSettings } from '../state/settings';

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (!getSettings().som) return null;
  try {
    ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tom(freq: number, inicio: number, dur: number, tipo: OscillatorType = 'sine', vol = 0.18) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + inicio;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  tap: () => tom(660, 0, 0.07, 'triangle', 0.1),
  ok: () => { tom(660, 0, 0.12); tom(880, 0.09, 0.18); },
  bad: () => { tom(240, 0, 0.16, 'square', 0.08); tom(180, 0.12, 0.2, 'square', 0.08); },
  gota: () => tom(1200, 0, 0.08, 'sine', 0.12),
  vitoria: () => [523, 659, 784, 1047].forEach((f, i) => tom(f, i * 0.11, 0.22, 'triangle', 0.14)),
};
