import type { TOCItem } from '@/lib/toc';

/**
 * Fetch TOC from the Convex HTTP router (e.g. `https://http.awfixer.party/toc?path=/about`).
 * Set `NEXT_PUBLIC_CONVEX_HTTP_URL` to your deployment’s HTTP actions base (no trailing slash).
 * Prefer `getTocForPathServer` or `useQuery(api.toc.getTocForPath)` in App Router when possible.
 */
export async function fetchTocFromConvexHttp(path: string): Promise<TOCItem[]> {
  const base = process.env.NEXT_PUBLIC_CONVEX_HTTP_URL?.trim();
  if (!base) {
    return [];
  }
  const url = new URL('/toc', base.replace(/\/$/, ''));
  url.searchParams.set('path', path.startsWith('/') ? path : `/${path}`);
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as { items?: TOCItem[] };
  return Array.isArray(data.items) ? data.items : [];
}
