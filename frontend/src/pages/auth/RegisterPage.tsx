import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { Seo } from '@/components/seo/Seo';
import { Alert, Button, Checkbox, Field, Input } from '@/components/ui';
import { IconButton } from '@/components/ui/IconButton';
import { passwordStrength, registerSchema, type RegisterValues } from '@/features/auth/schemas';
import { useApiFormError } from '@/features/auth/useFormErrors';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

const strengthColors = [
  'bg-danger',
  'bg-danger',
  'bg-warning',
  'bg-accent',
  'bg-success',
] as const;

export default function RegisterPage() {
  const registerUser = useAuthStore((state) => state.register);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', acceptTerms: false as never },
  });

  const { formError, handle } = useApiFormError<RegisterValues>(setError);
  const password = watch('password') ?? '';
  const strength = passwordStrength(password);

  const onSubmit = async (values: RegisterValues) => {
    try {
      await registerUser({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      });
      navigate('/onboarding', { replace: true });
    } catch (error) {
      handle(error);
    }
  };

  return (
    <>
      <Seo
        title="Create your account"
        description="Create a free ResumeForge account to build an ATS-friendly resume, check its score and match it to job descriptions."
        noindex
      />

      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Free to start. No card required.
      </p>

      {formError && (
        <Alert tone="danger" assertive className="mt-5">
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Field label="Full name" error={errors.fullName?.message}>
          <Input {...register('fullName')} autoComplete="name" autoFocus placeholder="Your name" />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <Input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </Field>

        <Field
          label="Password"
          error={errors.password?.message}
          hint="At least 8 characters, including a letter and a number."
        >
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Create a password"
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

        {password.length > 0 && (
          <div className="flex items-center gap-2" aria-live="polite">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors duration-base',
                    index < strength.score ? strengthColors[strength.score] : 'bg-muted',
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{strength.label}</span>
          </div>
        )}

        <Checkbox
          {...register('acceptTerms')}
          label="I agree to the terms and privacy policy"
          description="Your resumes stay private. We never sell resume content."
        />
        {errors.acceptTerms?.message && (
          <p role="alert" className="text-xs text-danger">
            {errors.acceptTerms.message}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-foreground link-underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
