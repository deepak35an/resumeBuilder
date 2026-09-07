import { useMutation, useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useState } from 'react';

import { queryKeys } from '@/app/queryClient';
import { RetryState } from '@/components/feedback/RetryState';
import { breadcrumbJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';
import { Badge, Button, ButtonLink, Card, SegmentedControl } from '@/components/ui';
import { ApiError, errorMessage } from '@/lib/api-client';
import { billingService, FALLBACK_PRICING } from '@/services/billing.service';
import { useAuthStore, useIsAuthenticated } from '@/store/auth';
import { toast } from '@/store/toast';

export default function PricingPage() {
  const signedIn = useIsAuthenticated();
  const plan = useAuthStore((state) => state.user?.plan ?? 'free');
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');

  const pricing = useQuery({
    queryKey: queryKeys.pricing,
    queryFn: billingService.pricing,
    retry: false,
  });

  const plans = pricing.data && pricing.data.length > 0 ? pricing.data : FALLBACK_PRICING;

  const checkout = useMutation({
    mutationFn: () => billingService.checkout({ plan: 'pro', interval }),
    onSuccess: (session) => {
      if (session.checkoutUrl) {
        window.location.assign(session.checkoutUrl);
        return;
      }
      toast.success(session.message || 'Pro is now active on this account.');
    },
    onError: (error) => toast.error('Checkout failed', errorMessage(error)),
  });

  return (
    <>
      <Seo
        title="Pricing"
        description="ResumeForge Free is $0. Pro is $9 a month or $79 a year for job match, AI, DOCX and every template."
        path="/pricing"
        jsonLd={[
          webPageJsonLd({
            name: 'Pricing',
            description: 'Free and Pro plans for ResumeForge.',
            path: '/pricing',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Pricing', path: '/pricing' },
          ]),
        ]}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Simple pricing</h1>
          <p className="mt-3 text-muted-foreground text-pretty">
            Build and check on Free. Upgrade when you need job match, AI, DOCX or the full template
            catalogue.
          </p>
          <div className="mt-6 flex justify-center">
            <SegmentedControl
              label="Billing interval"
              value={interval}
              onChange={setInterval}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-wide px-4 py-12 sm:px-6">
        {pricing.isError && !(pricing.error instanceof ApiError && pricing.error.status === 404) && (
          <div className="mb-6">
            <RetryState
              title="Live pricing is unavailable — showing standard plans"
              error={pricing.error}
              onRetry={() => void pricing.refetch()}
            />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((item) => {
            const price = interval === 'yearly' ? item.priceYearlyUsd : item.priceMonthlyUsd;
            const isCurrent = signedIn && plan === item.key;
            return (
              <Card key={item.key} className={item.key === 'pro' ? 'border-accent/40' : undefined}>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">{item.name}</h2>
                  {item.key === 'pro' && (
                    <Badge tone="pro" size="xs" uppercase>
                      Pro
                    </Badge>
                  )}
                  {isCurrent && <Badge size="xs">Current</Badge>}
                </div>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
                  ${price}
                  <span className="text-base font-normal text-muted-foreground">
                    {item.key === 'free' ? '' : interval === 'yearly' ? ' / year' : ' / month'}
                  </span>
                </p>
                <ul className="mt-6 space-y-2">
                  {item.highlights.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm text-foreground">
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 text-success" />
                      {line}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {item.key === 'free' ? (
                    <ButtonLink to={signedIn ? '/dashboard' : '/register'} variant="secondary" fullWidth>
                      {signedIn ? 'Open Career OS' : 'Start free'}
                    </ButtonLink>
                  ) : isCurrent ? (
                    <Button disabled fullWidth>
                      You are on Pro
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      loading={checkout.isPending}
                      onClick={() => {
                        if (!signedIn) {
                          window.location.assign('/register?next=/pricing');
                          return;
                        }
                        checkout.mutate();
                      }}
                    >
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
