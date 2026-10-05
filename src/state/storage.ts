// localStorage pode falhar (aba anônima, armazenamento bloqueado): tudo com try/catch.
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sem armazenamento: o jogo segue só na memória */
  }
}

export function remove(key: string): void {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}
