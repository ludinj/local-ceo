export function CompanyWorkspaceSkeleton() {
  return (
    <div className="p-6 md:p-10 max-w-6xl space-y-8 animate-pulse">
      {/* Workspace Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-muted" />
            <div className="space-y-1.5">
              <div className="h-7 w-48 rounded-md bg-muted" />
              <div className="h-4 w-32 rounded-md bg-muted" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-20 rounded-full bg-muted" />
          <div className="h-6 w-24 rounded-full bg-muted" />
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-6 w-28 rounded bg-muted" />
            <div className="h-3 w-36 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Detail Sections Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-border/50">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-4 w-36 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="h-5 w-36 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
