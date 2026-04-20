import { registerRoutes } from '@the_shujaa/link-shortener';
import { httpRouter } from 'convex/server';

import { api, components, internal } from './_generated/api';
import { httpAction } from './_generated/server';

const http = httpRouter();

function sanitizeProps(
  raw: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      result[k.slice(0, 50)] = typeof v === 'string' ? v.slice(0, 200) : v;
    }
    if (Object.keys(result).length >= 20) break;
  }
  return result;
}

registerRoutes(http, components.linkShortener, { pathPrefix: '/r/' });

const ALLOWED_ORIGIN = 'https://awfixer.party';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true',
};

http.route({
  path: '/track',
  method: 'OPTIONS',
  handler: httpAction(async (_ctx, _req) => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: '/track',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(null, { status: 400, headers: corsHeaders });
    }

    if (!body || typeof body !== 'object') {
      return new Response(null, { status: 400, headers: corsHeaders });
    }

    const data = body as Record<string, unknown>;
    const type = data.type === 'event' ? ('event' as const) : ('pageview' as const);
    const path = typeof data.path === 'string' ? data.path.slice(0, 500) : '/';
    const sessionId = typeof data.sessionId === 'string' ? data.sessionId.slice(0, 64) : 'unknown';
    const referrer = typeof data.referrer === 'string' ? data.referrer.slice(0, 500) : undefined;
    const userAgent = req.headers.get('user-agent')?.slice(0, 500) ?? undefined;
    const name = typeof data.name === 'string' ? data.name.slice(0, 100) : undefined;
    const country = req.headers.get('x-vercel-ip-country')?.slice(0, 10) ?? undefined;
    const rawProps =
      data.props !== null && typeof data.props === 'object' && !Array.isArray(data.props)
        ? (data.props as Record<string, unknown>)
        : undefined;
    const props = rawProps ? sanitizeProps(rawProps) : undefined;

    await ctx.runMutation(internal.analytics.record, {
      type,
      path,
      sessionId,
      referrer,
      userAgent,
      name,
      country,
      ts: Date.now(),
      props,
    });

    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: '/toc',
  method: 'GET',
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const path = url.searchParams.get('path');
    if (!path?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing ?path= query parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const items = await ctx.runQuery(api.toc.getTocForPath, { path });
    return new Response(JSON.stringify({ path, items }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    });
  }),
});

export default http;
