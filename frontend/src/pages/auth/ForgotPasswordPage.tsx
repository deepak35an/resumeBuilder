import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { Seo } from '@/components/seo/Seo';
import { Alert, Button, Field, Input } from '@/components/ui';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/schemas';
import { useApiFormError } from '@/features/auth/useFormErrors';
import { authService } from '@/services/auth.service';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const { formError, handle } = useApiFormError<ForgotPasswordValues>(setError);

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await authService.forgotPassword(values.email);
      setSent(true);
    } catch (error) {
      handle(error);
    }
  };

  if (sent) {
    return (
      <>
        <Seo title="Check your email" description="Password reset instructions sent." noindex />
        <div className="text-center">
          <span
            aria-hidden="true"
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-success-subtle text-success"
          >
            <MailCheck className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            If an account exists for <span className="text-foreground">{getValues('email')}</span>,
            a password reset link is on its way. The link expires in one hour.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block text-sm font-medium text-foreground link-underline"
          >
            Back to sign in
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title="Reset your password"
        description="Request a password reset link for your ResumeForge account."
        noindex
      />

      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reset your password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We will email you a link to choose a new one.
      </p>

      {formError && (
        <Alert tone="danger" assertive className="mt-5">
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Field label="Email" error={errors.email?.message}>
          <Input
            {...register('email')}
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
          />
        </Field>
        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link to="/login" className="font-medium text-foreground link-underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
