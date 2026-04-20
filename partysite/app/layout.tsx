import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/themes';

import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { AdminAllowlistProvider } from '@/components/admin/admin-allowlist-provider';
import { AdminEditorShellProvider } from '@/components/admin/admin-editor-shell';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { ConvexClientProvider } from '@/components/convex-client-provider';
import { NavigationBar } from '@/components/navbar';
import { SiteFooter } from '@/components/site-footer';
import { ThemeProvider } from '@/components/theme-provider';
import { TrackingPopup } from '@/components/tracking-popup';
import { VercelWebAnalytics } from '@/components/vercel-web-analytics';
import { getAdminOrganizationIds } from '@/lib/admin/orgs';
import { getNewsletterServer, getSiteChromeServer } from '@/lib/convex-server';
import { getMetadataBase } from '@/lib/site-url';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: 'AWFixer Party',
    template: '%s',
  },
  description:
    "Independent. Transparent. Community-driven. AWFixer Party — not affiliated with AWFixer's Lounge or AWFixer Enterprising Company.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [chrome, newsletter] = await Promise.all([getSiteChromeServer(), getNewsletterServer()]);
  const allowedAdminOrganizationIds = getAdminOrganizationIds();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('antialiased', fontMono.variable, 'font-sans', geist.variable)}
    >
      <body>
        <ClerkProvider
          appearance={{
            baseTheme: shadcn,
            variables: {
              borderRadius: 'var(--radius)',
            },
          }}
        >
          <ConvexClientProvider>
            <AdminAllowlistProvider allowedAdminOrganizationIds={allowedAdminOrganizationIds}>
              <AdminEditorShellProvider>
                <ThemeProvider>
                  <VercelWebAnalytics />
                  <AnalyticsProvider>
                    <TrackingPopup />
                    <div className="flex min-h-screen flex-col">
                      <NavigationBar chrome={chrome} />
                      <main className="flex-1">{children}</main>
                      <SiteFooter chrome={chrome} newsletter={newsletter} />
                    </div>
                  </AnalyticsProvider>
                </ThemeProvider>
              </AdminEditorShellProvider>
            </AdminAllowlistProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
