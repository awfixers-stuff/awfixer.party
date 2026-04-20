import { getAllPolicyPathnames } from '@/lib/policy-navigation';
import { siteNavigation } from '@/lib/site-navigation';

/** All static marketing routes (single source for sitemap). `llms.txt` is served dynamically from `app/llms.txt/route.ts`. */
export function getSitePathnames(): string[] {
  const paths = new Set<string>(['/']);
  for (const group of Object.values(siteNavigation)) {
    for (const { href } of group) {
      paths.add(href.startsWith('/') ? href : `/${href}`);
    }
  }
  for (const p of getAllPolicyPathnames()) {
    paths.add(p);
  }
  return [...paths].sort((a, b) => a.localeCompare(b));
}
