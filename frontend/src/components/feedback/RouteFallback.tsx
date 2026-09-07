import { LoadingRegion, Skeleton } from '@/components/ui';

/** Suspense fallback for lazily loaded routes: never a blank screen. */
export function RouteFallback() {
  return (
    <LoadingRegion label="Loading page" className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <Skeleton className="h-9 w-2/3 max-w-md" />
      <Skeleton className="mt-3 h-4 w-1/2 max-w-sm" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </LoadingRegion>
  );
}
