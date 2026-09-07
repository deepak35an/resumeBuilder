import { useMutation } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';

import { Alert, Button, EmptyState, Sheet } from '@/components/ui';
import { ApiError, errorMessage } from '@/lib/api-client';
import { aiService } from '@/services/ai.service';
import { useResumeEditor } from '@/store/resumeEditor';
import { toast } from '@/store/toast';
import type { CopilotInsight } from '@/types/api';

export function ResumeCopilotSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const resumeId = useResumeEditor((state) => state.resumeId);
  const data = useResumeEditor((state) => state.doc?.data);

  const query = useMutation({
    mutationFn: () => aiService.copilot({ resumeId: resumeId ?? undefined, data }),
    onError: (error) => {
      if (error instanceof ApiError && error.requiresUpgrade) {
        toast.warning('Resume Copilot is a Pro feature', error.message);
        return;
      }
      toast.error('Copilot could not run', errorMessage(error));
    },
  });

  const insights: CopilotInsight[] = query.data?.insights ?? [];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Resume Copilot"
      description="Concrete edits for this document. Suggestions are generated — review before you apply them."
      width="lg"
      footer={
        <Button
          fullWidth
          leadingIcon={<Sparkles />}
          loading={query.isPending}
          onClick={() => query.mutate()}
        >
          {insights.length ? 'Refresh suggestions' : 'Analyse this resume'}
        </Button>
      }
    >
      {query.data?.notice && (
        <Alert tone="neutral" className="mb-4">
          {query.data.notice}
        </Alert>
      )}

      {insights.length === 0 && !query.isPending ? (
        <EmptyState
          size="sm"
          icon={<Sparkles />}
          title="No suggestions yet"
          description="Run Copilot to get section-level advice. It will not invent metrics you did not provide."
        />
      ) : (
        <ul className="space-y-3">
          {insights.map((insight) => (
            <li key={insight.id} className="rounded-lg border border-border px-3 py-3">
              <p className="text-sm font-medium text-foreground">{insight.title}</p>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">{insight.detail}</p>
              {insight.action && (
                <p className="mt-2 text-xs font-medium text-foreground">{insight.action.label}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
