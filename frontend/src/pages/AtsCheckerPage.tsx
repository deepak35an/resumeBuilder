import { useMutation } from '@tanstack/react-query';
import { ShieldCheck, Upload } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdSlot } from '@/components/ads/AdSlot';
import { breadcrumbJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';
import { Alert, Button, ButtonLink, Card, EmptyState, Field, Input, Textarea } from '@/components/ui';
import { AtsReportView } from '@/features/ats/AtsReportView';
import { ApiError, errorMessage } from '@/lib/api-client';
import { atsService } from '@/services/ats.service';
import { resumeService } from '@/services/resume.service';
import { useIsAuthenticated } from '@/store/auth';
import { toast } from '@/store/toast';
import type { ResumeData } from '@/types/resume';

const ACCEPT = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export default function AtsCheckerPage() {
  const { t } = useTranslation();
  const signedIn = useIsAuthenticated();
  const [text, setText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const analyze = useMutation({
    mutationFn: (payload: { text?: string; data?: ResumeData }) =>
      atsService.analyze({
        text: payload.text,
        data: payload.data,
        jobTitle: jobTitle || undefined,
      }),
    onSuccess: () => toast.success(t('toast.analysisComplete')),
    onError: (error) => {
      if (error instanceof ApiError && error.requiresUpgrade) {
        toast.warning(t('common.proFeature'), error.message);
        return;
      }
      toast.error('Analysis failed', errorMessage(error));
    },
  });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.pdf') && !lower.endsWith('.docx')) {
      toast.error(t('errors.fileType'));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error(t('errors.fileSize'));
      return;
    }
    setFileName(file.name);

    if (!signedIn) {
      toast.info('Paste the resume text, or sign in so we can parse the file.');
      return;
    }

    try {
      const parsed = await resumeService.importFile(file);
      if (parsed.warnings.length) {
        toast.warning('Review imported content', parsed.warnings[0]);
      }
      analyze.mutate({ data: parsed.data });
    } catch (error) {
      toast.error('We could not read that file', errorMessage(error));
    }
  };

  return (
    <>
      <Seo
        title="ATS Resume Checker"
        description="Upload a PDF or paste your resume to see how an applicant tracking system may read it. Scores include formatting, keywords and completeness."
        path="/ats-resume-checker"
        keywords={['ats resume checker', 'resume checker', 'ats score']}
        jsonLd={[
          webPageJsonLd({
            name: 'ATS Resume Checker',
            description: 'Check how an applicant tracking system may read your resume.',
            path: '/ats-resume-checker',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'ATS Resume Checker', path: '/ats-resume-checker' },
          ]),
        ]}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-wide px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            See how a parser may read your resume
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
            Formatting, keywords, content quality and completeness — each with an explanation.
            Scores are estimates. Different systems parse and rank resumes differently.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-wide gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <Card>
          <Field label="Target job title" optional hint="Used to weight keywords when you have a role in mind.">
            <Input
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              placeholder="Software Engineer"
            />
          </Field>

          <Field label="Paste resume text" className="mt-4">
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              minRows={10}
              placeholder="Paste the plain text of your resume"
            />
          </Field>

          <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:border-border-strong">
            <Upload aria-hidden="true" className="h-4 w-4" />
            <span>{fileName ?? 'Upload PDF or DOCX'}</span>
            <input
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(event) => void onFile(event.target.files?.[0])}
            />
          </label>

          <Button
            className="mt-4"
            fullWidth
            leadingIcon={<ShieldCheck />}
            loading={analyze.isPending}
            disabled={!text.trim() && !analyze.isPending}
            onClick={() => analyze.mutate({ text })}
          >
            Check ATS score
          </Button>

          {!signedIn && (
            <p className="mt-3 text-xs text-muted-foreground">
              File parsing needs an account.{' '}
              <ButtonLink to="/login" variant="ghost" size="xs">
                Sign in
              </ButtonLink>
            </p>
          )}
        </Card>

        <div>
          {analyze.isError && (
            <Alert tone="danger" className="mb-4" action={<Button size="sm" variant="secondary" onClick={() => analyze.reset()}>Dismiss</Button>}>
              {errorMessage(analyze.error)}
            </Alert>
          )}

          {analyze.data ? (
            <AtsReportView report={analyze.data} />
          ) : (
            <EmptyState
              icon={<ShieldCheck />}
              title="No report yet"
              description="Paste your resume or upload a file to see a score ring, issues and keywords."
            />
          )}
          <AdSlot slot="templates" className="mt-8" />
        </div>
      </div>
    </>
  );
}
