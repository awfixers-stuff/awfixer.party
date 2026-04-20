import { siteNavigation } from '@/lib/site-navigation';

const SITE_TAGLINE =
  "Independent. Transparent. Community-driven. AWFixer Party is not affiliated with AWFixer's Lounge or AWFixer Enterprising Company.";

/** Normalize llms.txt-style markdown: LF endings, trim line ends, collapse blank runs, single trailing newline. */
export function cleanLlmsTxt(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').map((line) => line.trimEnd());
  const body = lines.join('\n').replace(/\n{3,}/g, '\n\n');
  return `${body.trim()}\n`;
}

function sectionTitle(key: string): string {
  if (key === 'about') {
    return 'About';
  }
  if (key === 'policies') {
    return 'Policies';
  }
  if (key === 'legal') {
    return 'Legal';
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function absoluteUrl(siteUrl: string, pathname: string): string {
  const base = siteUrl.replace(/\/$/, '');
  if (pathname === '/') {
    return `${base}/`;
  }
  return `${base}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

/**
 * Regenerate llms.txt body (markdown). Pass canonical site origin (no trailing slash).
 */
export function buildLlmsTxt(siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, '');
  const lines: string[] = [
    '# AWFixer Party',
    '',
    `> ${SITE_TAGLINE}`,
    '',
    '## Site',
    '',
    `- [Home](${base}/): Main landing page`,
    '',
  ];

  for (const [key, links] of Object.entries(siteNavigation)) {
    lines.push(`## ${sectionTitle(key)}`, '');
    for (const item of links) {
      const url = absoluteUrl(base, item.href);
      lines.push(`- [${item.label}](${url})`);
    }
    lines.push('');
  }

  lines.push(
    '## Optional',
    '',
    `- [Open Graph image endpoint](${base}/og?title=Example&description=Description): Dynamic social preview images.`,
    '',
  );

  return cleanLlmsTxt(lines.join('\n'));
}

/** Payload from `api.llmsTxt.getLlmsTxtPayload` (Convex). */
export type LlmsTxtLivePayload = {
  navGroups: Array<{
    id: string;
    triggerLabel: string;
    overviewHref: string;
    overviewTitle: string;
    overviewDescription: string;
    links: Array<{ href: string; label: string }>;
  }>;
  cmsPages: Array<{ path: string; title: string }>;
};

/**
 * Build llms.txt from live Convex nav + extra CMS pages, plus static policy route list.
 * Falls back to `buildLlmsTxt` when `payload` is null (no Convex URL or query failed).
 */
export function buildLlmsTxtLive(
  siteUrl: string,
  payload: LlmsTxtLivePayload | null,
  policyPathnames: string[],
): string {
  if (!payload) {
    return buildLlmsTxt(siteUrl);
  }

  const base = siteUrl.replace(/\/$/, '');
  const lines: string[] = [
    '# AWFixer Party',
    '',
    `> ${SITE_TAGLINE}`,
    '',
    '## Site',
    '',
    `- [Home](${base}/): Main landing page`,
    '',
  ];

  for (const group of payload.navGroups) {
    lines.push(`## ${group.triggerLabel}`, '');
    for (const item of group.links) {
      const url = absoluteUrl(base, item.href);
      lines.push(`- [${item.label}](${url})`);
    }
    lines.push('');
  }

  if (payload.cmsPages.length > 0) {
    lines.push('## Additional pages (CMS)', '');
    for (const p of payload.cmsPages) {
      lines.push(`- [${p.title}](${absoluteUrl(base, p.path)})`);
    }
    lines.push('');
  }

  if (policyPathnames.length > 0) {
    lines.push('## Policy routes', '');
    for (const path of policyPathnames) {
      lines.push(`- [${path}](${absoluteUrl(base, path)})`);
    }
    lines.push('');
  }

  lines.push(
    '## Optional',
    '',
    `- [Open Graph image endpoint](${base}/og?title=Example&description=Description): Dynamic social preview images.`,
    '',
  );

  return cleanLlmsTxt(lines.join('\n'));
}
