import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { queryClient, queryKeys } from '@/app/queryClient';
import { Seo } from '@/components/seo/Seo';
import { Alert, Button, Field, Input } from '@/components/ui';
import { IconButton } from '@/components/ui/IconButton';
import { loginSchema, type LoginValues } from '@/features/auth/schemas';
import { useApiFormError } from '@/features/auth/useFormErrors';
import { defaultSettings } from '@/features/resume/defaults';
import { templateById } from '@/features/resume/templates/registry';
import { errorMessage } from '@/lib/api-client';
import { resumeService } from '@/services/resume.service';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/store/toast';

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const template = params.get('template');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const { formError, handle } = useApiFormError<LoginValues>(setError);
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const onSubmit = async (values: LoginValues) => {
    let user;
    try {
      user = await login(values);
    } catch (error) {
      handle(error);
      return;
    }

    if (!template) {
      navigate(redirectTo, { replace: true });
      return;
    }

    if (!user.onboarding?.completed) {
      navigate(`/onboarding?template=${encodeURIComponent(template)}`, { replace: true });
      return;
    }

    try {
      const chosen = templateById(template);
      const resume = await resumeService.create({
        title: `${chosen.name} resume`,
        templateId: chosen.id,
        settings: { ...defaultSettings(), ...chosen.settingsDefaults },
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: ['resumes'] });
      navigate(`/resume/${resume.id}/edit`, { replace: true });
    } catch (error) {
      toast.error('Could not start this template', errorMessage(error));
    }
  };

  return (
    <>
      <Seo
        title="Sign in"
        description="Sign in to ResumeForge to build, check and tailor your resume."
        noindex
      />

      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Sign in to pick up where you left off.
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

        <Field
          label="Password"
          error={errors.password?.message}
          action={
            <Link to="/forgot-password" className="text-xs text-muted-foreground link-underline">
              Forgot password?
            </Link>
          }
        >
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Your password"
            trailingSlot={
              <IconButton
                size="xs"
                label={showPassword ? 'Hide password' : 'Show password'}
                icon={showPassword ? <EyeOff /> : <Eye />}
                onClick={() => setShowPassword((value) => !value)}
                tabIndex={-1}
              />
            }
          />
        </Field>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to ResumeForge?{' '}
        <Link
          to={template ? `/register?template=${encodeURIComponent(template)}` : '/register'}
          className="font-medium text-foreground link-underline"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
