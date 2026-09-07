import { Alert, Button } from '@/components/ui';
import { errorMessage } from '@/lib/api-client';

export function RetryState({
  error,
  onRetry,
  title = 'We could not load this page',
}: {
  error: unknown;
  onRetry: () => void;
  title?: string;
}) {
  return (
    <Alert
      tone="danger"
      title={title}
      action={
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      }
    >
      {errorMessage(error)}
    </Alert>
  );
}
