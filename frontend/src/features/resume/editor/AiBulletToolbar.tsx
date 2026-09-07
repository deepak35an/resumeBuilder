import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Button } from '@/components/ui';
import { ApiError, errorMessage } from '@/lib/api-client';
import { aiService } from '@/services/ai.service';
import { toast } from '@/store/toast';
import type { AIAction, AISuggestion } from '@/types/api';

const ACTIONS: Array<{ action: AIAction; label: string }> = [
  { action: 'improve', label: 'Improve' },
  { action: 'shorten', label: 'Shorten' },
  { action: 'action-verb', label: 'Stronger verb' },
  { action: 'quantify', label: 'Quantify' },
  { action: 'grammar', label: 'Grammar' },
];

export function AiBulletToolbar({
  text,
  onApply,
}: {
  text: string;
  onApply: (next: string) => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<AIAction | null>(null);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);

  const run = async (action: AIAction) => {
    if (!text.trim()) return;
    setBusy(action);
    try {
      const result = await aiService.rewrite({ text, action });
      setSuggestion(result);
    } catch (error) {
      if (error instanceof ApiError && error.requiresUpgrade) {
        toast.warning(t('common.proFeature'), error.message);
      } else {
        toast.error('Could not rewrite that bullet', errorMessage(error));
      }
    } finally {
      setBusy(null);
    }
  };

  if (!text.trim()) return null;

  return (
    <div className="space-y-2 px-7 pb-1.5">
      <div className="flex flex-wrap items-center gap-1">
        <Sparkles aria-hidden="true" className="h-3 w-3 text-muted-foreground" />
        {ACTIONS.map((item) => (
          <Button
            key={item.action}
            size="xs"
            variant="ghost"
            loading={busy === item.action}
            disabled={busy !== null}
            onClick={() => void run(item.action)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {suggestion && (
        <div className="rounded-md border border-border bg-surface-sunken p-2.5">
          <Alert tone="neutral" className="mb-2">
            {suggestion.notice || t('editor.aiNotice')}
          </Alert>
          <p className="text-xs text-muted-foreground">{t('editor.suggested')}</p>
          <p className="mt-1 text-sm text-foreground text-pretty">{suggestion.suggestion}</p>
          {suggestion.why && (
            <p className="mt-1 text-xs text-muted-foreground">{suggestion.why}</p>
          )}
          <div className="mt-2 flex gap-2">
            <Button
              size="xs"
              onClick={() => {
                onApply(suggestion.suggestion);
                setSuggestion(null);
              }}
            >
              {t('editor.useSuggestion')}
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setSuggestion(null)}>
              {t('editor.dismiss')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
