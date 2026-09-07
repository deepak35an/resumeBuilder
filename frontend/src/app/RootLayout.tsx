import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CommandPalette } from '@/components/command/CommandPalette';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { RouteFallback } from '@/components/feedback/RouteFallback';
import { ScrollToTop } from '@/components/routing/ScrollToTop';
import { Toaster } from '@/components/ui';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useCommandPalette } from '@/store/commandPalette';

/**
 * Router root. Everything that needs router context (command palette, scroll
 * restoration) lives here rather than beside `RouterProvider`.
 */
export function RootLayout() {
  const togglePalette = useCommandPalette((state) => state.toggle);
  useKeyboardShortcut('k', togglePalette, { meta: true, allowInInput: true });

  return (
    <>
      <ScrollToTop />
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
      <CommandPalette />
      <Toaster />
    </>
  );
}
