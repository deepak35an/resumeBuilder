import { RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button, ButtonLink } from '@/components/ui';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches render errors so a single broken screen never blanks the whole app.
 * The technical message is logged, not shown to the user.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 text-center">
          <h1 className="text-lg font-semibold text-foreground">
            {this.props.fallbackTitle ?? 'This screen ran into a problem'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            Your saved work is safe. Reloading usually fixes it - if it keeps happening, let us
            know and we will look into it.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button
              leadingIcon={<RefreshCw />}
              onClick={() => {
                this.reset();
                window.location.reload();
              }}
            >
              Reload
            </Button>
            <ButtonLink to="/dashboard" variant="secondary" onClick={this.reset}>
              Back to dashboard
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }
}
