/** Version history: snapshots taken on save, restorable without losing current work. */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { History, Lock, RotateCcw } from 'lucide-react';

import { Alert, Button, ButtonLink, EmptyState, Sheet, Skeleton } from '@/components/ui';
import { ApiError, errorMessage } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';
import { queryKeys } from '@/app/queryClient';
import { resumeService } from '@/services/resume.service';
import { useAuthStore } from '@/store/auth';
import { useResumeEditor } from '@/store/resumeEditor';
import { toast } from '@/store/toast';
import type { ResumeVersion } from '@/types/api';

const TRIGGER_LABELS: Record<ResumeVersion['trigger'], string> = {
  manual: 'Saved',
  autosave: 'Autosaved',
  restore: 'Before restore',
  import: 'Imported',
};

export function VersionsSheet({
  open,
  onClose,
  resumeId,
}: {
  open: boolean;
  onClose: () => void;
  resumeId: string;
}) {
  const plan = useAuthStore((state) => state.user?.plan ?? 'free');
  const adopt = useResumeEditor((state) => state.adopt);
  const queryClient = useQueryClient();

  const versions = useQuery({
    queryKey: queryKeys.resumeVersions(resumeId),
    queryFn: () => resumeService.listVersions(resumeId),
    enabled: open,
  });

  const snapshot = useMutation({
    mutationFn: () => resumeService.createVersion(resumeId),
    onSuccess: () => {
      toast.success('Version saved');
      void queryClient.invalidateQueries({ queryKey: queryKeys.resumeVersions(resumeId) });
    },
    onError: (error) => toast.error('Could not save a version', errorMessage(error)),
  });

  const restore = useMutation({
    mutationFn: (versionId: string) => resumeService.restoreVersion(resumeId, versionId),
    onSuccess: (resume) => {
      adopt(resume);
      toast.success('Version restored', 'Your previous content was snapshotted first.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.resumeVersions(resumeId) });
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.requiresUpgrade) {
        toast.warning('Version history is a Pro feature', error.message);
        return;
      }
      toast.error('Could not restore that version', errorMessage(error));
    },
  });

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Version history"
      description="A snapshot is kept every time you save, and at most once every ten minutes while you type."
      footer={
        <Button
          variant="secondary"
          fullWidth
          leadingIcon={<History />}
          loading={snapshot.isPending}
          onClick={() => snapshot.mutate()}
        >
          Save a version now
        </Button>
      }
    >
      {plan === 'free' && (
        <Alert
          tone="pro"
          title="Restoring is a Pro feature"
          action={
            <ButtonLink to="/pricing" size="xs" variant="primary">
              See Pro
            </ButtonLink>
          }
          className="mb-4"
        >
          Snapshots are still taken on the Free plan, so nothing is lost - you need Pro to roll a
          resume back to one.
        </Alert>
      )}

      {versions.isPending && (
        <div className="space-y-2">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {versions.isError && (
        <Alert tone="danger" title="Could not load version history">
          {errorMessage(versions.error)}
        </Alert>
      )}

      {versions.data?.length === 0 && (
        <EmptyState
          title="No versions yet"
          description="Save your resume and a restorable snapshot will appear here."
          size="sm"
        />
      )}

      <ul className="space-y-2">
        {versions.data?.map((version) => (
          <li
            key={version.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{version.versionName}</p>
              <p className="text-xs text-muted-foreground">
                {TRIGGER_LABELS[version.trigger]} {formatRelativeTime(version.createdAt)}
                {version.atsScore !== null && ` \u00b7 ATS ${version.atsScore}`}
              </p>
            </div>
            <Button
              size="xs"
              variant="secondary"
              leadingIcon={plan === 'free' ? <Lock /> : <RotateCcw />}
              loading={restore.isPending && restore.variables === version.id}
              onClick={() => restore.mutate(version.id)}
            >
              Restore
            </Button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
