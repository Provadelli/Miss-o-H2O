// Botão "Ouvir": lê textos em voz alta (Web Speech API, pt-BR).
export const falaDisponivel = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window;

let voz: SpeechSynthesisVoice | null = null;
function escolherVoz() {
  const vozes = speechSynthesis.getVoices();
  voz = vozes.find((v) => v.lang === 'pt-BR') ?? vozes.find((v) => v.lang.startsWith('pt')) ?? null;
}
if (falaDisponivel()) {
  escolherVoz();
  speechSynthesis.addEventListener?.('voiceschanged', escolherVoz);
}

export function falar(texto: string): void {
  if (!falaDisponivel()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, ''));
  u.lang = 'pt-BR';
  if (voz) u.voice = voz;
  u.rate = 0.95;
  speechSynthesis.speak(u);
}

export function pararFala(): void {
  if (falaDisponivel()) speechSynthesis.cancel();
}
