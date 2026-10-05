import { describe, expect, it } from 'vitest';
import { erroNome, limparNome, temPalavrao, validarPayload } from './validate';

const ID = '3f2b8c1e-4d5a-4e6f-9a7b-1c2d3e4f5a6b';
const ok = { id: ID, name: 'Gotinha', score: 120, phases: [100, 20, 0, 0, 0, 0, 0] };

describe('apelido', () => {
  it('limpa HTML e espaços', () => {
    expect(limparNome('  <b>Ana</b>  ')).toBe('bAnab');
    expect(limparNome('a'.repeat(30))).toHaveLength(16);
  });
  it('rejeita curto e palavrão', () => {
    expect(erroNome('A')).not.toBeNull();
    expect(erroNome('p0rr4')).not.toBeNull();
    expect(erroNome('Maria')).toBeNull();
  });
  it('não barra nomes comuns parecidos com palavrões', () => {
    for (const n of ['Carolina', 'Pintor', 'Computador', 'Cuca', 'Pedro Lucas']) expect(temPalavrao(n)).toBe(false);
  });
});

describe('payload da API', () => {
  it('aceita payload válido', () => {
    const r = validarPayload(ok);
    expect(r.ok).toBe(true);
  });
  it('rejeita id inválido', () => expect(validarPayload({ ...ok, id: 'x' }).ok).toBe(false));
  it('rejeita fase acima de 100', () =>
    expect(validarPayload({ ...ok, phases: [101, 19, 0, 0, 0, 0, 0] }).ok).toBe(false));
  it('rejeita soma errada', () => expect(validarPayload({ ...ok, score: 999 }).ok).toBe(false));
  it('rejeita número errado de fases', () =>
    expect(validarPayload({ ...ok, phases: [100, 20] }).ok).toBe(false));
  it('rejeita não-inteiros', () =>
    expect(validarPayload({ ...ok, score: 120.5, phases: [100.5, 20, 0, 0, 0, 0, 0] }).ok).toBe(false));
});
