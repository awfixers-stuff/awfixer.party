import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin overview',
  robots: { index: false, follow: false },
};

export default function AdminOverviewPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="text-muted-foreground text-sm">
        Use the sidebar to manage forms or open analytics. Add new admin sections by registering a
        route and an entry in{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">lib/admin/nav.ts</code>.
      </p>
    </div>
  );
}
