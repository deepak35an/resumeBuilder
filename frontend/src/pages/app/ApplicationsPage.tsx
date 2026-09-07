import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { queryKeys } from '@/app/queryClient';
import { AppPage } from '@/components/layout/AppLayout';
import { RetryState } from '@/components/feedback/RetryState';
import { Seo } from '@/components/seo/Seo';
import { Badge, Button, Card, EmptyState, Field, Input, Modal, Select } from '@/components/ui';
import { errorMessage } from '@/lib/api-client';
import { jobsService, type ApplicationPayload } from '@/services/jobs.service';
import { toast } from '@/store/toast';
import type { ApplicationStatus } from '@/types/api';

const STATUSES: ApplicationStatus[] = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
];

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [editor, setEditor] = useState<ApplicationPayload | null>(null);

  const list = useQuery({
    queryKey: queryKeys.applications,
    queryFn: jobsService.listApplications,
  });

  const create = useMutation({
    mutationFn: (payload: ApplicationPayload) => jobsService.createApplication(payload),
    onSuccess: () => {
      toast.success('Application saved');
      setEditor(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.applications });
    },
    onError: (error) => toast.error('Could not save', errorMessage(error)),
  });

  return (
    <AppPage>
      <Seo title="Applications" description="Track applications." noindex />
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">A light tracker next to your resumes and job matches.</p>
        </div>
        <Button onClick={() => setEditor({ jobTitle: '', status: 'saved' })}>Add application</Button>
      </div>

      {list.isError && (
        <div className="mt-6">
          <RetryState error={list.error} onRetry={() => void list.refetch()} />
        </div>
      )}
      {list.isSuccess && list.data.length === 0 && (
        <EmptyState
          className="mt-8"
          title="No applications yet"
          description="When you apply, log the role here so the Career OS can point you at the next step."
          action={<Button onClick={() => setEditor({ jobTitle: '', status: 'saved' })}>Add application</Button>}
        />
      )}

      <ul className="mt-6 space-y-3">
        {list.data?.map((item) => (
          <li key={item.id}>
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{item.jobTitle}</p>
                <p className="text-sm text-muted-foreground">{item.company ?? 'Company not set'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge size="xs">{item.status}</Badge>
                <Select
                  selectSize="sm"
                  aria-label={`Status for ${item.jobTitle}`}
                  value={item.status}
                  options={STATUSES.map((status) => ({ value: status, label: status }))}
                  onChange={(event) => {
                    void jobsService
                      .updateApplication(item.id, { status: event.target.value as ApplicationStatus })
                      .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.applications }))
                      .catch((error) => toast.error('Could not update', errorMessage(error)));
                  }}
                />
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <Modal
        open={Boolean(editor)}
        onClose={() => setEditor(null)}
        title="Add application"
        footer={
          <Button
            loading={create.isPending}
            disabled={!editor?.jobTitle?.trim()}
            onClick={() => editor && create.mutate(editor)}
          >
            Save
          </Button>
        }
      >
        <div className="space-y-3">
          <Field label="Job title">
            <Input
              value={editor?.jobTitle ?? ''}
              onChange={(event) => setEditor((current) => ({ ...(current ?? { jobTitle: '' }), jobTitle: event.target.value }))}
            />
          </Field>
          <Field label="Company" optional>
            <Input
              value={editor?.company ?? ''}
              onChange={(event) =>
                setEditor((current) => ({ ...(current ?? { jobTitle: '' }), company: event.target.value }))
              }
            />
          </Field>
        </div>
      </Modal>
    </AppPage>
  );
}
