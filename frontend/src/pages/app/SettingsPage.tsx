import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { queryKeys } from '@/app/queryClient';
import { AppPage } from '@/components/layout/AppLayout';
import { Seo } from '@/components/seo/Seo';
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  Field,
  Input,
  SegmentedControl,
  Tabs,
} from '@/components/ui';
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from '@/features/auth/schemas';
import { downloadJson } from '@/lib/utils';
import { errorMessage } from '@/lib/api-client';
import { authService } from '@/services/auth.service';
import { billingService } from '@/services/billing.service';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/store/auth';
import { useThemeStore, type ThemePreference } from '@/store/theme';
import { toast } from '@/store/toast';

type Tab = 'profile' | 'security' | 'subscription' | 'preferences' | 'privacy';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState('');
  const theme = useThemeStore((state) => state.preference);
  const setTheme = useThemeStore((state) => state.setPreference);

  const subscription = useQuery({
    queryKey: queryKeys.subscription,
    queryFn: billingService.me,
    retry: false,
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const cancelSub = useMutation({
    mutationFn: billingService.cancel,
    onSuccess: () => toast.success('Subscription will cancel at period end'),
    onError: (error) => toast.error('Could not cancel', errorMessage(error)),
  });

  return (
    <AppPage className="max-w-3xl">
      <Seo title="Settings" description="Account settings." noindex />
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>

      <Tabs
        className="mt-6"
        label="Settings sections"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'profile', label: 'Profile' },
          { value: 'security', label: 'Security' },
          { value: 'subscription', label: 'Subscription' },
          { value: 'preferences', label: 'Preferences' },
          { value: 'privacy', label: 'Data & Privacy' },
        ]}
      />

      {tab === 'profile' && (
        <Card className="mt-6 space-y-4">
          <Field label="Full name">
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </Field>
          <Field label="Email" hint="Email is used to sign in and cannot be changed here.">
            <Input value={user?.email ?? ''} disabled />
          </Field>
          <Button
            onClick={() => {
              void usersService
                .updateMe({ fullName })
                .then((next) => {
                  setUser(next);
                  toast.success('Profile updated');
                })
                .catch((error) => toast.error('Could not update profile', errorMessage(error)));
            }}
          >
            Save profile
          </Button>
        </Card>
      )}

      {tab === 'security' && (
        <Card className="mt-6">
          <form
            className="space-y-4"
            onSubmit={passwordForm.handleSubmit(async (values) => {
              try {
                await authService.changePassword(values.currentPassword, values.newPassword);
                toast.success('Password changed');
                passwordForm.reset();
              } catch (error) {
                toast.error('Could not change password', errorMessage(error));
              }
            })}
          >
            <Field label="Current password" error={passwordForm.formState.errors.currentPassword?.message}>
              <Input type="password" autoComplete="current-password" {...passwordForm.register('currentPassword')} />
            </Field>
            <Field label="New password" error={passwordForm.formState.errors.newPassword?.message}>
              <Input type="password" autoComplete="new-password" {...passwordForm.register('newPassword')} />
            </Field>
            <Field label="Confirm new password" error={passwordForm.formState.errors.confirmPassword?.message}>
              <Input type="password" autoComplete="new-password" {...passwordForm.register('confirmPassword')} />
            </Field>
            <Button type="submit" loading={passwordForm.formState.isSubmitting}>
              Change password
            </Button>
          </form>
        </Card>
      )}

      {tab === 'subscription' && (
        <Card className="mt-6 space-y-3">
          <p className="text-sm text-foreground">
            Current plan: <strong>{user?.plan ?? 'free'}</strong>
          </p>
          {subscription.data && (
            <p className="text-sm text-muted-foreground">
              Status {subscription.data.status}
              {subscription.data.endDate ? ` · renews or ends ${subscription.data.endDate}` : ''}
            </p>
          )}
          {user?.plan === 'free' ? (
            <Button onClick={() => navigate('/pricing')}>Upgrade to Pro</Button>
          ) : (
            <Button variant="secondary" loading={cancelSub.isPending} onClick={() => cancelSub.mutate()}>
              Cancel subscription
            </Button>
          )}
        </Card>
      )}

      {tab === 'preferences' && (
        <Card className="mt-6">
          <p className="text-sm font-medium text-foreground">Theme</p>
          <p className="mt-1 text-xs text-muted-foreground">
            App chrome only. Resume previews stay print-white.
          </p>
          <div className="mt-4">
            <SegmentedControl
              label="Theme"
              value={theme}
              onChange={(value) => setTheme(value as ThemePreference)}
              options={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </div>
        </Card>
      )}

      {tab === 'privacy' && (
        <Card className="mt-6 space-y-4">
          <Alert tone="neutral">
            We do not sell resume content. You can export everything we store, or delete the account.
          </Alert>
          <Button
            variant="secondary"
            onClick={() => {
              void usersService
                .exportData()
                .then((data) => downloadJson(data, 'resumeforge-export.json'))
                .catch((error) => toast.error('Export failed', errorMessage(error)));
            }}
          >
            Export my data (JSON)
          </Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            Delete account
          </Button>
        </Card>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        description={
          <div className="space-y-3">
            <p>This permanently deletes your resumes, jobs and reports. Type DELETE and enter your password.</p>
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" />
          </div>
        }
        confirmLabel="Delete account"
        onConfirm={async () => {
          await usersService.deleteAccount({ password, confirmation: 'DELETE' });
          await logout();
          navigate('/');
        }}
      />
    </AppPage>
  );
}
