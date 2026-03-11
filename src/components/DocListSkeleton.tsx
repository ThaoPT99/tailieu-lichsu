export function DocListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-amber-200 bg-white"
        >
          <div className="h-40 animate-pulse bg-amber-100/50" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-amber-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-amber-100" />
            <div className="h-4 w-full animate-pulse rounded bg-amber-100" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-amber-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
