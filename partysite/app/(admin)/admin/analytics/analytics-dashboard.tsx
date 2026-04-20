'use client';

import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';

function StatCard({ label, value }: { label: string; value: number | string | undefined }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">
        {value === undefined ? (
          <span className="animate-pulse text-muted-foreground/40">—</span>
        ) : (
          value
        )}
      </p>
    </div>
  );
}

function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex h-20 items-end gap-px">
      {data.map((d) => (
        <div key={d.date} className="group relative flex-1" style={{ height: '100%' }}>
          <div
            className="absolute bottom-0 w-full rounded-t bg-primary/70 transition-all group-hover:bg-primary"
            style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 1)}%` }}
          />
          <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-1 py-0.5 text-[10px] opacity-0 shadow group-hover:opacity-100">
            {d.date.slice(5)}: {d.count}
          </span>
        </div>
      ))}
    </div>
  );
}

const FUNNEL_LABELS: Record<string, string> = {
  form_start: 'Started',
  form_submit_attempt: 'Attempted submit',
  form_submit_success: 'Submitted',
  form_submit_error: 'Submit error',
  form_abandon: 'Abandoned',
  form_validation_error: 'Validation error',
};

const NEWSLETTER_LABELS: Record<string, string> = {
  newsletter_section_view: 'Section views',
  newsletter_subscribe_click: 'Subscribe link clicks',
};

export function AnalyticsDashboard() {
  const stats = useQuery(api.analytics.getStats);
  const byDay = useQuery(api.analytics.getPageViewsByDay);
  const topPages = useQuery(api.analytics.getTopPages);
  const topEvents = useQuery(api.analytics.getTopEvents);
  const formFunnel = useQuery(api.analytics.getFormFunnel);
  const newsletterMetrics = useQuery(api.analytics.getNewsletterMetrics);
  const recent = useQuery(api.analytics.getRecentEvents);

  const maxTopCount = Math.max(...(topPages?.map((p) => p.count) ?? [1]), 1);
  const maxEventCount = Math.max(...(topEvents?.map((e) => e.count) ?? [1]), 1);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Page views today" value={stats?.pageViewsToday} />
        <StatCard label="Unique sessions today" value={stats?.uniqueSessionsToday} />
        <StatCard label="Total page views" value={stats?.totalPageViews} />
        <StatCard label="Events today" value={stats?.eventsToday} />
      </div>

      {/* 30-day sparkline */}
      <div className="rounded-lg border bg-background p-4">
        <p className="mb-3 text-sm font-medium">Page views — last 30 days</p>
        {byDay ? (
          <MiniBarChart data={byDay} />
        ) : (
          <div className="h-20 animate-pulse rounded bg-muted" />
        )}
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{byDay?.[0]?.date.slice(5)}</span>
          <span>{byDay?.[byDay.length - 1]?.date.slice(5)}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top pages */}
        <div className="rounded-lg border bg-background p-4">
          <p className="mb-3 text-sm font-medium">Top pages — last 7 days</p>
          {topPages === undefined ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-5 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : topPages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {topPages.map((p) => (
                <div key={p.path} className="flex items-center gap-2">
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary/60"
                      style={{ width: `${(p.count / maxTopCount) * 100}%` }}
                    />
                  </div>
                  <span
                    className="w-32 shrink-0 truncate text-right font-mono text-xs text-muted-foreground"
                    title={p.path}
                  >
                    {p.path}
                  </span>
                  <span className="w-8 shrink-0 text-right text-xs tabular-nums">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top custom events */}
        <div className="rounded-lg border bg-background p-4">
          <p className="mb-3 text-sm font-medium">Top events — last 7 days</p>
          {topEvents === undefined ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-5 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : topEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <div className="space-y-2">
              {topEvents.map((e) => (
                <div key={e.name} className="flex items-center gap-2">
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-blue-500/50"
                      style={{ width: `${(e.count / maxEventCount) * 100}%` }}
                    />
                  </div>
                  <span
                    className="w-36 shrink-0 truncate text-right font-mono text-xs text-muted-foreground"
                    title={e.name}
                  >
                    {e.name}
                  </span>
                  <span className="w-8 shrink-0 text-right text-xs tabular-nums">{e.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form funnel */}
      <div className="rounded-lg border bg-background p-4">
        <p className="mb-3 text-sm font-medium">Form funnel — last 30 days</p>
        {formFunnel === undefined ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {formFunnel.map((step) => (
              <div key={step.name} className="rounded-md border bg-muted/30 p-3 text-center">
                <p className="text-xl font-semibold tabular-nums">{step.count}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {FUNNEL_LABELS[step.name] ?? step.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter metrics */}
      <div className="rounded-lg border bg-background p-4">
        <p className="mb-3 text-sm font-medium">Newsletter — last 30 days</p>
        {newsletterMetrics === undefined ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            {newsletterMetrics.map((step) => (
              <div key={step.name} className="rounded-md border bg-muted/30 p-3 text-center">
                <p className="text-xl font-semibold tabular-nums">{step.count}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {NEWSLETTER_LABELS[step.name] ?? step.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent events */}
      <div className="rounded-lg border bg-background p-4">
        <p className="mb-3 text-sm font-medium">Recent events</p>
        {recent === undefined ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        ) : (
          <div className="divide-y text-xs">
            {recent.map((e) => (
              <div key={e._id} className="flex items-baseline gap-2 py-1.5">
                <span className="shrink-0 font-mono text-muted-foreground">
                  {new Date(e.ts).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] uppercase tracking-wide">
                  {e.type}
                </span>
                {e.name && (
                  <span className="rounded bg-blue-500/10 px-1 py-0.5 font-mono text-[10px] text-blue-600 dark:text-blue-400">
                    {e.name}
                  </span>
                )}
                <span className="min-w-0 truncate text-muted-foreground" title={e.path}>
                  {e.path}
                </span>
                {e.country && (
                  <span className="ml-auto shrink-0 text-muted-foreground/60">{e.country}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
