export default function LegalSlugLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-8 md:flex-row lg:px-10 xl:px-12">
      <div className="flex-1 space-y-4 animate-pulse">
        <div className="h-9 w-2/3 rounded-md bg-muted" />
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="mt-8 space-y-3">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
        </div>
      </div>
      <aside className="hidden w-64 lg:block">
        <div className="sticky top-20 space-y-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
        </div>
      </aside>
    </div>
  );
}
