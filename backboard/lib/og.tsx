import type { Metadata } from 'next';
import { ImageResponse } from 'next/og';

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

const MAX_TITLE = 140;
const MAX_DESCRIPTION = 280;

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max - 1)}…`;
}

export type OgImageInput = {
  title: string;
  description?: string;
};

/**
 * GitBook-style OG template: light canvas, accent rule, title + optional description.
 * Used by `app/og/route.ts` and safe to call from Edge.
 */
export function createOgImageResponse(input: OgImageInput): ImageResponse {
  const title = truncate(input.title, MAX_TITLE);
  const description = input.description ? truncate(input.description, MAX_DESCRIPTION) : '';

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
        padding: 72,
      }}
    >
      <div
        style={{
          width: 64,
          height: 4,
          backgroundColor: '#18181b',
          borderRadius: 2,
          marginBottom: 40,
        }}
      />
      <div
        style={{
          fontSize: title.length > 80 ? 44 : 56,
          fontWeight: 700,
          color: '#09090b',
          lineHeight: 1.12,
          letterSpacing: '-0.03em',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        {title}
      </div>
      {description ? (
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: '#52525b',
            marginTop: 28,
            lineHeight: 1.4,
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          }}
        >
          {description}
        </div>
      ) : null}
    </div>,
    {
      ...OG_IMAGE_SIZE,
    },
  );
}

/** Relative URL for use with `metadataBase` in metadata. */
export function ogImageUrl(title: string, description?: string): string {
  const params = new URLSearchParams();
  params.set('title', title);
  if (description) {
    params.set('description', description);
  }
  return `/og?${params.toString()}`;
}

const SITE_NAME = 'AWFixer Party';

/**
 * Merge into page `metadata`: Open Graph + Twitter card pointing at the dynamic `/og` image.
 */
export function ogMetadata(
  title: string,
  options?: { description?: string },
): Pick<Metadata, 'openGraph' | 'twitter'> {
  const { description } = options ?? {};
  const url = ogImageUrl(title, description);
  return {
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: 'website',
      images: [
        {
          url,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [url],
    },
  };
}
