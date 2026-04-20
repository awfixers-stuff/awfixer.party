import { ConvexHttpClient } from 'convex/browser';

import { api } from '@/convex/_generated/api';
import { buildLlmsTxtLive } from '@/lib/llms-txt';
import { getAllPolicyPathnames } from '@/lib/policy-navigation';
import { getSiteUrl } from '@/lib/site-url';

/**
 * Dynamic llms.txt: nav + CMS pages from Convex at request time (not build-time).
 * Cache: `revalidate` + CDN `s-maxage`. When you wire publish webhooks, add
 * `revalidatePath("/llms.txt")` (or `revalidateTag`) so edits appear before TTL.
 */
export const revalidate = 300;

export async function GET() {
  const siteUrl = getSiteUrl();
  let payload = null;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  if (convexUrl) {
    try {
      const client = new ConvexHttpClient(convexUrl);
      payload = await client.query(api.llmsTxt.getLlmsTxtPayload, {});
    } catch {
      payload = null;
    }
  }

  const body = buildLlmsTxtLive(siteUrl, payload, getAllPolicyPathnames());

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
