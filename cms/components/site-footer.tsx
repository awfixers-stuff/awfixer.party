import Link from 'next/link';
import type { ReactNode } from 'react';

import { NewsletterFooter } from '@/components/newsletter-footer';
import { NewsletterFooterAdminEdit } from '@/components/newsletter-footer-admin-edit';
import type { NewsletterPayload, SiteChromePayload } from '@/lib/convex-server';
import { cn } from '@/lib/utils';

function FooterLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'text-sm text-muted-foreground transition-colors hover:text-foreground',
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SiteFooter({
  chrome,
  newsletter,
}: {
  chrome: SiteChromePayload;
  newsletter: NewsletterPayload;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 lg:px-10 lg:py-14 xl:px-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="text-base font-semibold tracking-tight text-foreground">
              {chrome.footerBrandName}
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {chrome.footerTagline}
            </p>
          </div>

          {chrome.footerColumns.map((column, i) => (
            <nav
              key={column.id}
              aria-label={column.heading}
              className={cn(
                'lg:col-span-2',
                i === 0 && 'lg:col-start-5',
                i === 1 && 'lg:col-start-7',
                i === 2 && 'lg:col-start-9',
              )}
            >
              <h2 className="text-sm font-semibold text-foreground">{column.heading}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 space-y-2">
          <NewsletterFooter newsletter={newsletter} />
          <NewsletterFooterAdminEdit />
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {chrome.copyrightText}
          </p>
          <p className="sm:ml-auto">
            This website is{' '}
            <a
              href="https://github.com/awfixerpolitics/awfixerpartysite"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground underline hover:text-foreground"
            >
              open source
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
