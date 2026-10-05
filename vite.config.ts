import { defineConfig, type Plugin } from 'vite';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

/** Preenche a lista de precache do service worker com todos os arquivos do build. */
function precacheSW(): Plugin {
  return {
    name: 'h2o-precache-sw',
    apply: 'build',
    async closeBundle() {
      const dist = 'dist';
      const walk = async (dir: string): Promise<string[]> =>
        (await Promise.all((await readdir(dir, { withFileTypes: true })).map((d) =>
          d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]))).flat();
      const files = (await walk(dist))
        .map((f) => '/' + relative(dist, f).split(sep).join('/'))
        .filter((f) => f !== '/sw.js' && f !== '/index.html' && !f.endsWith('.map') && !f.endsWith('.woff'));
      const swPath = join(dist, 'sw.js');
      const sw = (await readFile(swPath, 'utf8'))
        .replace('__VERSION__', Date.now().toString(36))
        .replace('self.__PRECACHE__', JSON.stringify(['/', ...files]));
      await writeFile(swPath, sw);
    },
  };
}

/** Só no `npm run dev`: placar em memória imitando api/scores.ts (em produção é a Vercel Function + Redis). */
function devScores(): Plugin {
  const scores = new Map<string, { name: string; score: number }>();
  return {
    name: 'h2o-dev-scores',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/scores', async (req, res) => {
        const { validarPayload } = await server.ssrLoadModule('/src/logic/validate.ts');
        const send = (status: number, data: unknown) => {
          res.statusCode = status;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(data));
        };
        const ranking = () => [...scores.values()].sort((a, b) => b.score - a.score);
        if (req.method === 'GET') {
          const limit = Number(new URL(req.url ?? '', 'http://x').searchParams.get('limit')) || 10;
          return send(200, ranking().slice(0, limit).map((e, i) => ({ ...e, rank: i + 1 })));
        }
        if (req.method === 'POST') {
          let body = '';
          for await (const chunk of req) body += chunk;
          let parsed: unknown;
          try { parsed = JSON.parse(body); } catch { return send(400, { error: 'JSON inválido' }); }
          const v = validarPayload(parsed);
          if (!v.ok) return send(400, { error: v.error });
          const prev = scores.get(v.data.id);
          scores.set(v.data.id, { name: v.data.name, score: Math.max(prev?.score ?? 0, v.data.score) });
          return send(200, { rank: ranking().findIndex((e) => e === scores.get(v.data.id)) + 1 });
        }
        if (req.method === 'DELETE') { scores.clear(); return send(200, { ok: true }); }
        send(405, { error: 'método não permitido' });
      });
    },
  };
}

export default defineConfig({
  plugins: [precacheSW(), devScores()],
  build: {
    target: 'es2019',
    cssTarget: 'chrome70',
    assetsInlineLimit: 2048,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'api/**/*.test.ts'],
  },
} as any);
