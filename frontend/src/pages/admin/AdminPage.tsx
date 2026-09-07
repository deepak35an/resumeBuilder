import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { queryKeys } from '@/app/queryClient';
import { AppPage } from '@/components/layout/AppLayout';
import { RetryState } from '@/components/feedback/RetryState';
import { Seo } from '@/components/seo/Seo';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Field,
  Input,
  Modal,
  Select,
  Skeleton,
  Tabs,
  Textarea,
} from '@/components/ui';
import { errorMessage } from '@/lib/api-client';
import { adminService, type AdminBlogPayload } from '@/services/admin.service';
import { toast } from '@/store/toast';
import type { Plan } from '@/types/api';

export type AdminTab = 'stats' | 'users' | 'templates' | 'blog' | 'errors';

const PATH_TAB: Record<string, AdminTab> = {
  '/admin': 'stats',
  '/admin/users': 'users',
  '/admin/templates': 'templates',
  '/admin/blog': 'blog',
  '/admin/errors': 'errors',
};

const TAB_PATH: Record<AdminTab, string> = {
  stats: '/admin',
  users: '/admin/users',
  templates: '/admin/templates',
  blog: '/admin/blog',
  errors: '/admin/errors',
};

export default function AdminPage({ tab: tabProp }: { tab?: AdminTab }) {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = tabProp ?? PATH_TAB[location.pathname] ?? 'stats';

  return (
    <AppPage>
      <Seo title="Admin" description="ResumeForge administration." noindex />
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Admin</h1>
      <Tabs
        className="mt-6"
        label="Admin sections"
        value={tab}
        onChange={(next) => navigate(TAB_PATH[next])}
        items={[
          { value: 'stats', label: 'Stats' },
          { value: 'users', label: 'Users' },
          { value: 'templates', label: 'Templates' },
          { value: 'blog', label: 'Blog' },
          { value: 'errors', label: 'Errors' },
        ]}
      />
      <div className="mt-6">
        {tab === 'stats' && <StatsPanel />}
        {tab === 'users' && <UsersPanel />}
        {tab === 'templates' && <TemplatesPanel />}
        {tab === 'blog' && <BlogPanel />}
        {tab === 'errors' && <ErrorsPanel />}
      </div>
    </AppPage>
  );
}

function StatsPanel() {
  const stats = useQuery({ queryKey: queryKeys.adminStats, queryFn: adminService.stats });
  if (stats.isError) return <RetryState error={stats.error} onRetry={() => void stats.refetch()} />;
  if (stats.isLoading || !stats.data) return <Skeleton className="h-48" />;
  const data = stats.data;
  const cards = [
    ['Users', data.users],
    ['New this week', data.newUsersThisWeek],
    ['Pro users', data.proUsers],
    ['Resumes', data.resumes],
    ['ATS checks', data.atsChecks],
    ['Job matches', data.jobMatches],
    ['PDF downloads', data.pdfDownloads],
    ['AI requests', data.aiRequests],
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([label, value]) => (
        <Card key={label}>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        </Card>
      ))}
      <Card className="sm:col-span-2">
        <p className="text-xs text-muted-foreground">Conversion</p>
        <p className="mt-1 text-2xl font-semibold">{Math.round(data.conversionRate * 100)}%</p>
      </Card>
    </div>
  );
}

function UsersPanel() {
  const [search, setSearch] = useState('');
  const users = useQuery({
    queryKey: queryKeys.adminUsers({ search }),
    queryFn: () => adminService.users({ search: search || undefined }),
  });

  if (users.isError) return <RetryState error={users.error} onRetry={() => void users.refetch()} />;

  return (
    <div>
      <Input
        className="max-w-sm"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search users"
        aria-label="Search users"
      />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">Email</th>
              <th className="py-2 font-medium">Plan</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.data?.items.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="py-2">{row.fullName}</td>
                <td className="py-2">{row.email}</td>
                <td className="py-2">
                  <Select
                    selectSize="sm"
                    value={row.plan}
                    options={[
                      { value: 'free', label: 'Free' },
                      { value: 'pro', label: 'Pro' },
                    ]}
                    onChange={(event) => {
                      void adminService
                        .patchUser(row.id, { plan: event.target.value as Plan })
                        .then(() => users.refetch())
                        .catch((error) => toast.error('Could not update user', errorMessage(error)));
                    }}
                  />
                </td>
                <td className="py-2">
                  <Badge size="xs" tone={row.isActive ? 'success' : 'danger'}>
                    {row.isActive ? 'Active' : 'Disabled'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TemplatesPanel() {
  const templates = useQuery({
    queryKey: queryKeys.adminTemplates,
    queryFn: adminService.templates,
  });
  if (templates.isError) return <RetryState error={templates.error} onRetry={() => void templates.refetch()} />;
  if (templates.isLoading) return <Skeleton className="h-48" />;

  return (
    <ul className="space-y-2">
      {templates.data?.map((template) => (
        <li key={template.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
          <div>
            <p className="text-sm font-medium">{template.name}</p>
            <p className="text-xs text-muted-foreground">{template.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            {template.isPremium && (
              <Badge tone="pro" size="xs">
                Pro
              </Badge>
            )}
            <Button
              size="xs"
              variant="secondary"
              onClick={() => {
                void adminService
                  .patchTemplate(template.id, { isPremium: !template.isPremium })
                  .then(() => templates.refetch())
                  .catch((error) => toast.error('Could not update template', errorMessage(error)));
              }}
            >
              {template.isPremium ? 'Make free' : 'Make Pro'}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function BlogPanel() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<AdminBlogPayload | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const posts = useQuery({ queryKey: queryKeys.adminBlog, queryFn: adminService.listBlog });

  const create = useMutation({
    mutationFn: (payload: AdminBlogPayload) => adminService.createBlog(payload),
    onSuccess: () => {
      toast.success('Post saved');
      setDraft(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminBlog });
    },
    onError: (error) => toast.error('Could not save post', errorMessage(error)),
  });

  if (posts.isError) return <RetryState error={posts.error} onRetry={() => void posts.refetch()} />;

  return (
    <div>
      <Button onClick={() => setDraft({ title: '', slug: '', excerpt: '', content: '' })}>New post</Button>
      <ul className="mt-4 space-y-2">
        {posts.data?.map((post) => (
          <li key={post.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
            <span>{post.title}</span>
            <Button size="xs" variant="ghost" onClick={() => setRemoveId(post.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>

      <Modal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title="New blog post"
        footer={
          <Button
            loading={create.isPending}
            disabled={!draft?.title || !draft.slug || !draft.content}
            onClick={() => draft && create.mutate(draft)}
          >
            Publish
          </Button>
        }
      >
        <div className="space-y-3">
          <Field label="Title">
            <Input
              value={draft?.title ?? ''}
              onChange={(event) => setDraft((current) => ({ ...(current as AdminBlogPayload), title: event.target.value }))}
            />
          </Field>
          <Field label="Slug">
            <Input
              value={draft?.slug ?? ''}
              onChange={(event) => setDraft((current) => ({ ...(current as AdminBlogPayload), slug: event.target.value }))}
            />
          </Field>
          <Field label="Excerpt">
            <Textarea
              minRows={2}
              value={draft?.excerpt ?? ''}
              onChange={(event) => setDraft((current) => ({ ...(current as AdminBlogPayload), excerpt: event.target.value }))}
            />
          </Field>
          <Field label="Content">
            <Textarea
              minRows={8}
              value={draft?.content ?? ''}
              onChange={(event) => setDraft((current) => ({ ...(current as AdminBlogPayload), content: event.target.value }))}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(removeId)}
        onClose={() => setRemoveId(null)}
        title="Delete this post?"
        description="The article will be removed from the public blog."
        onConfirm={async () => {
          if (!removeId) return;
          await adminService.deleteBlog(removeId);
          toast.success('Post deleted');
          void queryClient.invalidateQueries({ queryKey: queryKeys.adminBlog });
        }}
      />
    </div>
  );
}

function ErrorsPanel() {
  const errors = useQuery({
    queryKey: queryKeys.adminErrors,
    queryFn: () => adminService.errors(),
  });
  if (errors.isError) return <RetryState error={errors.error} onRetry={() => void errors.refetch()} />;
  if (errors.isLoading) return <Skeleton className="h-48" />;

  return (
    <ul className="space-y-2">
      {errors.data?.items.map((row) => (
        <li key={row.id} className="rounded-lg border border-border px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge size="xs" tone={row.level === 'error' ? 'danger' : 'warning'}>
              {row.level}
            </Badge>
            <span className="font-medium">{row.source}</span>
          </div>
          <p className="mt-1 text-muted-foreground">{row.message}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {row.path} · {row.createdAt}
          </p>
        </li>
      ))}
    </ul>
  );
}
