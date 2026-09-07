import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { onUnauthorized } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth';
import { initTheme } from '@/store/theme';
import { toast } from '@/store/toast';

import { queryClient } from './queryClient';
import { router } from './router';

export function App() {
  const restore = useAuthStore((state) => state.restore);

  useEffect(() => {
    const cleanupTheme = initTheme();
    // Exchange the stored refresh token for a session on first load.
    void restore();

    const cleanupAuth = onUnauthorized(() => {
      queryClient.clear();
      toast.warning('Session expired', 'Please sign in again to continue.');
    });

    return () => {
      cleanupTheme();
      cleanupAuth();
    };
  }, [restore]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary fallbackTitle="ResumeForge ran into a problem">
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
