import type { Metadata } from 'next';

import { AnalyticsDashboard } from './analytics-dashboard';

export const metadata: Metadata = {
  title: 'Analytics',
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
      <AnalyticsDashboard />
    </div>
  );
}
