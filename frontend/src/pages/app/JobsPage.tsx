import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { queryKeys } from '@/app/queryClient';
import { AppPage } from '@/components/layout/AppLayout';
import { RetryState } from '@/components/feedback/RetryState';
import { Seo } from '@/components/seo/Seo';
import {
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Modal,
  Textarea,
} from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import { errorMessage } from '@/lib/api-client';
import { jobsService, type JobPayload } from '@/services/jobs.service';
import { toast } from '@/store/toast';
import type { JobDescription } from '@/types/api';

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [editor, setEditor] = useState<Partial<JobPayload> | null>(null);
  const [remove, setRemove] = useState<JobDescription | null>(null);

  const jobs = useQuery({
    queryKey: queryKeys.jobs(),
    queryFn: jobsService.list,
  });
  const applications = useQuery({
    queryKey: queryKeys.applications,
    queryFn: jobsService.listApplications,
  });

  const save = useMutation({
    mutationFn: (payload: JobPayload) => jobsService.create(payload),
    onSuccess: () => {
      toast.success('Job saved');
      setEditor(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs() });
    },
    onError: (error) => toast.error('Could not save that job', errorMessage(error)),
  });

  return (
    <AppPage>
      <Seo title="Jobs" description="Saved job descriptions and applications." noindex />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Jobs workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Save postings, match them, then track applications.
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink to="/applications" variant="secondary">
            Applications
          </ButtonLink>
          <Button leadingIcon={<Plus />} onClick={() => setEditor({ title: '', content: '' })}>
            Save a job
          </Button>
        </div>
      </div>

      {jobs.isError && (
        <div className="mt-6">
          <RetryState error={jobs.error} onRetry={() => void jobs.refetch()} />
        </div>
      )}

      {jobs.isSuccess && jobs.data.length === 0 && (
        <EmptyState
          className="mt-8"
          icon={<Briefcase />}
          title="No job descriptions yet"
          description="Paste a posting to compare it with a resume and keep it next to your applications."
          action={
            <Button onClick={() => setEditor({ title: '', content: '' })} leadingIcon={<Plus />}>
              Save a job
            </Button>
          }
        />
      )}

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {jobs.data?.map((job) => (
          <li key={job.id}>
            <Card>
              <h2 className="text-base font-semibold text-foreground">{job.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.company ?? 'Company not set'} · {formatRelativeTime(job.createdAt)}
              </p>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{job.content}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ButtonLink to={`/job-description-matcher?job=${job.id}`} size="sm">
                  Match
                </ButtonLink>
                <Button size="sm" variant="ghost" onClick={() => setRemove(job)}>
                  Delete
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {applications.data && applications.data.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">Recent applications</h2>
          <ul className="mt-3 space-y-2">
            {applications.data.slice(0, 5).map((item) => (
              <li key={item.id} className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span>
                  {item.jobTitle} {item.company ? `· ${item.company}` : ''}
                </span>
                <Link to="/applications" className="text-muted-foreground link-underline">
                  {item.status}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Modal
        open={Boolean(editor)}
        onClose={() => setEditor(null)}
        title="Save a job description"
        footer={
          <Button
            loading={save.isPending}
            disabled={!editor?.title?.trim() || !editor?.content?.trim()}
            onClick={() => {
              if (!editor?.title || !editor.content) return;
              save.mutate({
                title: editor.title,
                company: editor.company,
                content: editor.content,
                url: editor.url,
              });
            }}
          >
            Save
          </Button>
        }
      >
        <div className="space-y-3">
          <Field label="Job title">
            <Input
              value={editor?.title ?? ''}
              onChange={(event) => setEditor((current) => ({ ...current, title: event.target.value }))}
            />
          </Field>
          <Field label="Company" optional>
            <Input
              value={editor?.company ?? ''}
              onChange={(event) => setEditor((current) => ({ ...current, company: event.target.value }))}
            />
          </Field>
          <Field label="Posting">
            <Textarea
              minRows={8}
              value={editor?.content ?? ''}
              onChange={(event) => setEditor((current) => ({ ...current, content: event.target.value }))}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(remove)}
        onClose={() => setRemove(null)}
        title="Delete this job?"
        description="The saved posting will be removed from your workspace."
        onConfirm={async () => {
          if (!remove) return;
          await jobsService.remove(remove.id);
          toast.success('Job deleted');
          void queryClient.invalidateQueries({ queryKey: queryKeys.jobs() });
        }}
      />
    </AppPage>
  );
}
