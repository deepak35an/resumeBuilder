import { useState } from 'react';
import type { FieldValues, UseFormSetError, Path } from 'react-hook-form';

import { ApiError, errorMessage } from '@/lib/api-client';

/**
 * Map an API failure onto a form: field-level errors go to the matching inputs,
 * anything else becomes a single form-level message.
 */
export function useApiFormError<T extends FieldValues>(setError: UseFormSetError<T>) {
  const [formError, setFormError] = useState<string | null>(null);

  const handle = (error: unknown) => {
    if (error instanceof ApiError) {
      const fieldErrors = error.fieldErrors;
      if (fieldErrors.length > 0) {
        let matched = false;
        for (const entry of fieldErrors) {
          const field = entry.field as Path<T>;
          setError(field, { type: 'server', message: entry.message });
          matched = true;
        }
        if (matched) {
          setFormError(null);
          return;
        }
      }
    }
    setFormError(errorMessage(error));
  };

  return { formError, setFormError, handle };
}
