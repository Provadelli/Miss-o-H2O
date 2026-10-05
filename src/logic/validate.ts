// Validação compartilhada entre o jogo e a API (api/scores.ts).
export const NOME_MIN = 2;
export const NOME_MAX = 16;
export const FASES = 7;
export const MAX_FASE = 100;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Lista curta de termos ofensivos comuns em PT-BR (comparação sem acentos e sem leetspeak).
const PROIBIDAS = [
  'porra', 'caralho', 'buceta', 'boceta', 'cuzao', 'cu', 'merda', 'bosta', 'puta', 'puto', 'putaria',
  'viado', 'viadinho', 'piroca', 'pinto', 'rola', 'xoxota', 'xereca', 'foda', 'foder', 'fodase',
  'arrombado', 'otario', 'babaca', 'idiota', 'imbecil', 'retardado', 'corno', 'vagabunda', 'vadia',
  'piranha', 'safada', 'macaco', 'nazi', 'hitler', 'fdp', 'vtnc', 'pqp', 'krl', 'crl', 'tnc',
  'penis', 'vagina', 'sexo', 'porno', 'cacete', 'punheta', 'siririca', 'bicha', 'traveco', 'sapatao',
];

const normalizar = (s: string) =>
  s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[@4]/g, 'a').replace(/3/g, 'e').replace(/[1!]/g, 'i').replace(/0/g, 'o')
    .replace(/[5$]/g, 's').replace(/7/g, 't');

/** Remove caracteres de controle/HTML e espaços extras. */
export function limparNome(raw: string): string {
  return String(raw ?? '')
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f-\u009f<>"'`&\\/{}[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NOME_MAX);
}

export function temPalavrao(nome: string): boolean {
  const n = normalizar(nome);
  const palavras = n.split(/[^a-z]+/).filter(Boolean);
  const junto = n.replace(/[^a-z]/g, '');
  return PROIBIDAS.some((p) =>
    // Palavras curtas só contam inteiras (evita barrar "Carolina", "Pintor"…)
    palavras.includes(p) || (p.length >= 6 && junto.includes(p)));
}

/** Retorna mensagem de erro amigável, ou null se o apelido é válido. */
export function erroNome(raw: string): string | null {
  const nome = limparNome(raw);
  if (nome.length < NOME_MIN) return `O apelido precisa ter pelo menos ${NOME_MIN} letras.`;
  if (!/[\p{L}\p{N}]/u.test(nome)) return 'Use letras ou números no apelido.';
  if (temPalavrao(nome)) return 'Ops! Escolha um apelido mais legal. 😊';
  return null;
}

export const uuidValido = (id: unknown): id is string => typeof id === 'string' && UUID_RE.test(id);

export interface ScorePayload { id: string; name: string; score: number; phases: number[] }

/** Valida o corpo do POST /api/scores. Retorna o payload limpo ou uma mensagem de erro. */
export function validarPayload(body: unknown): { ok: true; data: ScorePayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'corpo inválido' };
  const b = body as Record<string, unknown>;
  if (!uuidValido(b.id)) return { ok: false, error: 'id inválido' };
  if (typeof b.name !== 'string') return { ok: false, error: 'nome inválido' };
  const name = limparNome(b.name);
  const errNome = erroNome(name);
  if (errNome) return { ok: false, error: errNome };
  if (!Array.isArray(b.phases) || b.phases.length !== FASES) return { ok: false, error: 'fases inválidas' };
  const phases = b.phases.map(Number);
  if (phases.some((p) => !Number.isInteger(p) || p < 0 || p > MAX_FASE)) return { ok: false, error: 'pontos de fase inválidos' };
  const soma = phases.reduce((s, p) => s + p, 0);
  if (b.score !== soma) return { ok: false, error: 'soma não confere' };
  return { ok: true, data: { id: b.id, name, score: soma, phases } };
}
