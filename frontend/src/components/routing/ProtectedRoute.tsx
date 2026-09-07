import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Skeleton } from '@/components/ui';
import { useAuthStore } from '@/store/auth';

function RestoringSession() {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-content px-4 py-10 sm:px-6">
      <span className="sr-only">Restoring your session</span>
      <Skeleton className="h-8 w-56" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="mt-6 h-64" />
    </div>
  );
}

/** Gate for signed-in routes. Preserves the intended destination. */
export function ProtectedRoute({ requireAdmin = false }: { requireAdmin?: boolean }) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (status === 'idle' || status === 'restoring') return <RestoringSession />;

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

/** Keeps signed-in users out of the sign-in and sign-up screens. */
export function GuestOnlyRoute() {
  const status = useAuthStore((state) => state.status);
  if (status === 'idle' || status === 'restoring') return <RestoringSession />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
