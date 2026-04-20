import type { MetadataRoute } from 'next';

import { getSitePathnames } from '@/lib/site-routes';
import { getSiteUrl } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().replace(/\/$/, '');
  const now = new Date();

  return getSitePathnames().map((pathname) => {
    const url = pathname === '/' ? `${base}/` : `${base}${pathname}`;
    return {
      url,
      lastModified: now,
      changeFrequency: pathname === '/' ? 'weekly' : 'monthly',
      priority: pathname === '/' ? 1 : 0.75,
    };
  });
}
