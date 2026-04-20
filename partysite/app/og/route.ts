import { type NextRequest } from 'next/server';

import { createOgImageResponse } from '@/lib/og';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title')?.trim() || 'AWFixer Party';
  const description = searchParams.get('description')?.trim() || undefined;

  return createOgImageResponse({ title, description });
}
