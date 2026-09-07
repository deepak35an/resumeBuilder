import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Download, FilePlus2, History, MoreVertical, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { queryKeys } from '@/app/queryClient';
import { AppPage } from '@/components/layout/AppLayout';
import { RetryState } from '@/components/feedback/RetryState';
import { Seo } from '@/components/seo/Seo';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Dropdown,
  EmptyState,
  Input,
  Modal,
  Skeleton,
} from '@/components/ui';
import { downloadBlob, formatRelativeTime } from '@/lib/utils';
import { errorMessage } from '@/lib/api-client';
import { exportService } from '@/services/export.service';
import { resumeService } from '@/services/resume.service';
import { toast } from '@/store/toast';
import type { ResumeSummary } from '@/types/api';

export default function ResumesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [rename, setRename] = useState<ResumeSummary | null>(null);
  const [title, setTitle] = useState('');
  const [remove, setRemove] = useState<ResumeSummary | null>(null);

  const list = useQuery({
    queryKey: queryKeys.resumes({ search }),
    queryFn: () => resumeService.list({ search: search || undefined }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.resumes() });

  const create = useMutation({
    mutationFn: () => resumeService.create({ title: 'Untitled resume' }),
    onSuccess: (resume) => {
      toast.success('Resume created');
      navigate(`/resume/${resume.id}/edit`);
    },
    onError: (error) => toast.error('Could not create a resume', errorMessage(error)),
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => resumeService.duplicate(id),
    onSuccess: () => {
      toast.success('Resume duplicated');
      void invalidate();
    },
    onError: (error) => toast.error('Could not duplicate', errorMessage(error)),
  });

  return (
    <AppPage>
      <Seo title="Resumes" description="Your ResumeForge resumes." noindex />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Resumes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit, duplicate, export or run an ATS check.</p>
        </div>
        <Button leadingIcon={<FilePlus2 />} loading={create.isPending} onClick={() => create.mutate()}>
          Create resume
        </Button>
      </div>

      <Input
        className="mt-6 max-w-sm"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search resumes"
        aria-label="Search resumes"
      />

      {list.isError && (
        <div className="mt-6">
          <RetryState error={list.error} onRetry={() => void list.refetch()} />
        </div>
      )}
      {list.isLoading && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      )}

      {list.isSuccess && list.data.length === 0 && (
        <EmptyState
          className="mt-8"
          icon={<FilePlus2 />}
          title="No resumes yet"
          description="Create your first resume optimised for the role you want."
          action={
            <Button onClick={() => create.mutate()} leadingIcon={<FilePlus2 />}>
              Create resume
            </Button>
          }
        />
      )}

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {list.data?.map((resume) => (
          <li key={resume.id}>
            <Card className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <button
                    type="button"
                    className="text-left text-base font-semibold text-foreground link-underline"
                    onClick={() => navigate(`/resume/${resume.id}/edit`)}
                  >
                    {resume.title}
                  </button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Updated {formatRelativeTime(resume.updatedAt)}
                    {resume.tailoredFor ? ` · ${resume.tailoredFor}` : ''}
                  </p>
                </div>
                <Dropdown
                  menuLabel="Resume actions"
                  trigger={({ toggle, ref, open }) => (
                    <button
                      ref={ref}
                      type="button"
                      onClick={toggle}
                      aria-expanded={open}
                      aria-label="Resume actions"
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  )}
                  items={[
                    {
                      id: 'edit',
                      label: 'Edit',
                      icon: <Pencil />,
                      onSelect: () => navigate(`/resume/${resume.id}/edit`),
                    },
                    {
                      id: 'duplicate',
                      label: 'Duplicate',
                      icon: <Copy />,
                      onSelect: () => duplicate.mutate(resume.id),
                    },
                    {
                      id: 'rename',
                      label: 'Rename',
                      onSelect: () => {
                        setRename(resume);
                        setTitle(resume.title);
                      },
                    },
                    {
                      id: 'download',
                      label: 'Download PDF',
                      icon: <Download />,
                      onSelect: () => {
                        void exportService
                          .pdf({ resumeId: resume.id })
                          .then((file) =>
                            downloadBlob(file.blob, file.filename ?? `${resume.title}.pdf`),
                          )
                          .catch((error) => toast.error('Download failed', errorMessage(error)));
                      },
                    },
                    {
                      id: 'ats',
                      label: 'ATS check',
                      icon: <ShieldCheck />,
                      onSelect: () => navigate(`/ats-resume-checker?resume=${resume.id}`),
                    },
                    {
                      id: 'versions',
                      label: 'Versions',
                      icon: <History />,
                      onSelect: () => navigate(`/resume/${resume.id}/edit?versions=1`),
                    },
                    {
                      id: 'delete',
                      label: 'Delete',
                      icon: <Trash2 />,
                      tone: 'danger',
                      separatorBefore: true,
                      onSelect: () => setRemove(resume),
                    },
                  ]}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {resume.atsScore != null && <Badge size="xs">ATS {resume.atsScore}</Badge>}
                <Badge size="xs" tone="outline">
                  {resume.completeness}% complete
                </Badge>
                <Badge size="xs" tone="outline">
                  {resume.versionCount} versions
                </Badge>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <Modal
        open={Boolean(rename)}
        onClose={() => setRename(null)}
        title="Rename resume"
        footer={
          <Button
            onClick={() => {
              if (!rename) return;
              void resumeService
                .update(rename.id, { title })
                .then(() => {
                  toast.success('Renamed');
                  setRename(null);
                  void invalidate();
                })
                .catch((error) => toast.error('Could not rename', errorMessage(error)));
            }}
          >
            Save
          </Button>
        }
      >
        <Input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Resume title" />
      </Modal>

      <ConfirmDialog
        open={Boolean(remove)}
        onClose={() => setRemove(null)}
        title="Delete this resume?"
        description="It will be removed from your workspace. You can restore it shortly from the server if you change your mind."
        onConfirm={async () => {
          if (!remove) return;
          await resumeService.remove(remove.id);
          toast.success('Resume deleted');
          void invalidate();
        }}
      />
    </AppPage>
  );
}
