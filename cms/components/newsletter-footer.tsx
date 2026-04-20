import {
  NewsletterSubscribeAnchor,
  NewsletterViewRoot,
} from '@/components/newsletter-footer-analytics';
import type { NewsletterPayload } from '@/lib/convex-server';

export function NewsletterFooter({ newsletter }: { newsletter: NewsletterPayload }) {
  if (!newsletter.enabled || newsletter.provider === 'none') {
    return null;
  }

  const hasEmbed = Boolean(newsletter.embedHtml?.trim());
  const subscribeHref = newsletter.subscribeUrl?.trim();

  return (
    <NewsletterViewRoot>
      <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
        {newsletter.heading && (
          <h2 className="text-lg font-semibold tracking-tight">{newsletter.heading}</h2>
        )}
        {newsletter.subheading && (
          <p className="mt-2 text-sm text-muted-foreground">{newsletter.subheading}</p>
        )}
      </div>

      {hasEmbed ? (
        <div
          className="newsletter-embed mt-6 [&_iframe]:max-w-full"
          dangerouslySetInnerHTML={{ __html: newsletter.embedHtml ?? '' }}
        />
      ) : (
        <div className="mt-6 rounded-lg border border-dashed bg-background/50 p-8 text-center text-sm text-muted-foreground">
          <p>Substack newsletter embed will appear here once configured in the admin dashboard.</p>
          {subscribeHref && (
            <NewsletterSubscribeAnchor href={subscribeHref}>
              Subscribe on Substack
            </NewsletterSubscribeAnchor>
          )}
        </div>
      )}
    </NewsletterViewRoot>
  );
}
