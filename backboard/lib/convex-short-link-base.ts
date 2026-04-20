/**
 * Public base for Convex HTTP actions (`.convex.site`). Short links resolve at
 * `${convexShortLinkBaseUrl()}/r/{code}` unless you point a custom domain at Convex HTTP.
 */
export function convexShortLinkBaseUrl(): string {
  const site = process.env.NEXT_PUBLIC_CONVEX_SITE_URL?.trim();
  if (site) {
    return site.replace(/\/$/, '');
  }
  const cloud = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  if (cloud?.toLowerCase().includes('.convex.cloud')) {
    return cloud.replace(/\/$/, '').replace(/\.convex\.cloud$/i, '.convex.site');
  }
  return cloud?.replace(/\/$/, '') ?? '';
}

export function shortLinkPublicUrl(code: string): string {
  const base = convexShortLinkBaseUrl();
  if (!base) {
    return `/r/${code}`;
  }
  return `${base}/r/${encodeURIComponent(code)}`;
}
