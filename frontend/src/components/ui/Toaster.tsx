import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { useToastStore, type Toast, type ToastTone } from '@/store/toast';

const icons: Record<ToastTone, ReactNode> = {
  default: <Info className="h-4 w-4 text-muted-foreground" />,
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning" />,
  danger: <XCircle className="h-4 w-4 text-danger" />,
  info: <Info className="h-4 w-4 text-info" />,
};

function ToastCard({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-border',
        'bg-surface p-3.5 shadow-lg animate-fade-up',
      )}
    >
      <span aria-hidden="true" className="mt-0.5 shrink-0">
        {icons[toast.tone]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{toast.description}</p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              dismiss(toast.id);
            }}
            className="mt-2 text-sm font-medium text-accent-strong hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismiss(toast.id)}
        className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** Global notification viewport. Mounted once by the app shell. */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="toast-viewport pointer-events-none fixed inset-x-0 bottom-0 z-toast flex flex-col
        items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:top-0 sm:w-[22rem] sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
