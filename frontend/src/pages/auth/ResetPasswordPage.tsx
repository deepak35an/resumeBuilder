import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Seo } from '@/components/seo/Seo';
import { Alert, Button, Field, Input } from '@/components/ui';
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/schemas';
import { useApiFormError } from '@/features/auth/useFormErrors';
import { authService } from '@/services/auth.service';
import { toast } from '@/store/toast';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const { formError, handle } = useApiFormError<ResetPasswordValues>(setError);

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      await authService.resetPassword(token, values.password);
      toast.success('Password updated', 'Sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (error) {
      handle(error);
    }
  };

  return (
    <>
      <Seo title="Choose a new password" description="Set a new ResumeForge password." noindex />

      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Choose a new password
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        For your security, this signs out your other sessions.
      </p>

      {!token && (
        <Alert tone="warning" className="mt-5" assertive>
          This reset link is missing its token. Request a new link from the{' '}
          <Link to="/forgot-password" className="link-underline">
            forgot password
          </Link>{' '}
          page.
        </Alert>
      )}

      {formError && (
        <Alert tone="danger" assertive className="mt-5">
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Field
          label="New password"
          error={errors.password?.message}
          hint="At least 8 characters, including a letter and a number."
        >
          <Input
            {...register('password')}
            type="password"
            autoComplete="new-password"
            autoFocus
            disabled={!token}
          />
        </Field>

        <Field label="Confirm new password" error={errors.confirmPassword?.message}>
          <Input
            {...register('confirmPassword')}
            type="password"
            autoComplete="new-password"
            disabled={!token}
          />
        </Field>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting} disabled={!token}>
          Update password
        </Button>
      </form>
    </>
  );
}
