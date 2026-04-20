/**
 * Server-side calls to the Nitro backboard (`/api/v1/**`).
 * Set `BACKBOARD_API_BASE` (no trailing slash), e.g. `http://127.0.0.1:3001`,
 * `https://backboard.example.com`, or on Railway private networking
 * `http://backboard.railway.internal:<port>` (prefer Railway reference variables; see example.env).
 */
export function getBackboardApiBase(): string | null {
  const raw = process.env.BACKBOARD_API_BASE;
  if (typeof raw !== 'string') return null;
  const t = raw.trim().replace(/\/+$/, '');
  return t.length > 0 ? t : null;
}

export async function fetchBackboardJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const base = getBackboardApiBase();
  if (!base) {
    throw new Error('BACKBOARD_API_BASE is not set');
  }
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`backboard ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}
