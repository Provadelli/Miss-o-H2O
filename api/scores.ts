// Placar compartilhado da Missão H₂O (Vercel Function + Upstash Redis).
//   GET    /api/scores?limit=10 → [{ name, score, rank }]
//   POST   /api/scores { id, name, score, phases[7] } → { rank }
//   DELETE /api/scores (header x-admin-key) → zera o ranking
import { Redis } from '@upstash/redis';
import { validarPayload } from '../src/logic/validate.js';

const RANKING = 'ranking';
const PLAYERS = 'players';
const LIMITE_POR_MINUTO = 40;

let redis: Redis | null = null;
function db(): Redis {
  if (redis) return redis;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Redis não configurado (KV_REST_API_URL/TOKEN)');
  redis = new Redis({ url, token });
  return redis;
}

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });

const ipDe = (req: Request) =>
  (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'anon';

export async function GET(req: Request): Promise<Response> {
  try {
    const limit = Math.min(50, Math.max(1, Number(new URL(req.url).searchParams.get('limit')) || 10));
    const r = db();
    const raw = await r.zrange<(string | number)[]>(RANKING, 0, limit - 1, { rev: true, withScores: true });
    const ids: string[] = [];
    const scores: number[] = [];
    for (let i = 0; i < raw.length; i += 2) { ids.push(String(raw[i])); scores.push(Number(raw[i + 1])); }
    const nomes = ids.length ? ((await r.hmget<Record<string, string>>(PLAYERS, ...ids)) ?? {}) : {};
    const list = ids.map((id, i) => ({ name: nomes[id] ?? 'Jogador', score: scores[i], rank: i + 1 }));
    return json(list, 200, { 'cache-control': 'public, s-maxage=5, stale-while-revalidate=10' });
  } catch (e) {
    console.error('GET /api/scores', e);
    return json({ error: 'ranking indisponível' }, 503);
  }
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try { body = await req.json(); } catch { return json({ error: 'JSON inválido' }, 400); }
  const v = validarPayload(body);
  if (!v.ok) return json({ error: v.error }, 400);

  try {
    const r = db();
    const chave = `rl:${ipDe(req)}`;
    const n = await r.incr(chave);
    if (n === 1) await r.expire(chave, 60);
    if (n > LIMITE_POR_MINUTO) return json({ error: 'muitas requisições, tente em 1 minuto' }, 429);

    const { id, name, score } = v.data;
    // GT: só atualiza se a nova pontuação for maior (guarda o melhor resultado)
    await r.zadd(RANKING, { gt: true }, { score, member: id });
    await r.hset(PLAYERS, { [id]: name });
    const pos = await r.zrevrank(RANKING, id);
    return json({ rank: pos == null ? null : pos + 1 });
  } catch (e) {
    console.error('POST /api/scores', e);
    return json({ error: 'ranking indisponível' }, 503);
  }
}

export async function DELETE(req: Request): Promise<Response> {
  const chave = process.env.ADMIN_KEY;
  const enviada = req.headers.get('x-admin-key') ?? '';
  if (!chave || chave.length < 8 || !iguais(enviada, chave)) return json({ error: 'não autorizado' }, 401);
  try {
    await db().del(RANKING, PLAYERS);
    return json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/scores', e);
    return json({ error: 'falha ao zerar' }, 503);
  }
}

/** Comparação em tempo constante. */
function iguais(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
