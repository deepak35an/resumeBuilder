import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Seo } from '@/components/seo/Seo';
import { ButtonLink, Spinner } from '@/components/ui';
import { errorMessage } from '@/lib/api-client';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth';

type State = 'verifying' | 'verified' | 'failed' | 'missing';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated');

  const [state, setState] = useState<State>(token ? 'verifying' : 'missing');
  const [message, setMessage] = useState('');
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    authService
      .verifyEmail(token)
      .then((user) => {
        setState('verified');
        // Refresh the cached user so the app drops the "verify your email" nudge.
        if (isAuthenticated) setUser(user);
      })
      .catch((error) => {
        setState('failed');
        setMessage(errorMessage(error, 'This verification link is invalid or has expired.'));
      });
  }, [token, isAuthenticated, setUser]);

  return (
    <>
      <Seo title="Verify your email" description="Confirm your ResumeForge email address." noindex />

      <div className="text-center">
        {state === 'verifying' && (
          <>
            <Spinner className="mx-auto h-6 w-6" label="Verifying your email" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
              Verifying your email
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">This only takes a moment.</p>
          </>
        )}

        {state === 'verified' && (
          <>
            <span
              aria-hidden="true"
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-success-subtle text-success"
            >
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
              Email verified
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              Your account is confirmed. Next step: build a resume with an ATS-friendly template.
            </p>
            <ButtonLink to={isAuthenticated ? '/dashboard' : '/login'} className="mt-6">
              {isAuthenticated ? 'Go to dashboard' : 'Sign in'}
            </ButtonLink>
          </>
        )}

        {(state === 'failed' || state === 'missing') && (
          <>
            <span
              aria-hidden="true"
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-danger-subtle text-danger"
            >
              <XCircle className="h-5 w-5" />
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
              We could not verify that link
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              {state === 'missing'
                ? 'This link is missing its verification token.'
                : message}{' '}
              You can request a new link from your settings after signing in. Verification is not
              required to build or download a resume.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <ButtonLink to={isAuthenticated ? '/settings' : '/login'}>
                {isAuthenticated ? 'Open settings' : 'Sign in'}
              </ButtonLink>
              <Link
                to="/"
                className="inline-flex items-center px-3 py-2 text-sm text-muted-foreground link-underline"
              >
                Back to home
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
