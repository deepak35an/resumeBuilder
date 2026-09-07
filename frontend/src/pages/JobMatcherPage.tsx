import { useMutation, useQuery } from '@tanstack/react-query';
import { Sparkles, Target } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { queryKeys } from '@/app/queryClient';
import { breadcrumbJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';
import { Alert, Button, ButtonLink, Card, EmptyState, Field, Input, Select, Textarea } from '@/components/ui';
import { AtsReportView } from '@/features/ats/AtsReportView';
import { ApiError, errorMessage } from '@/lib/api-client';
import { atsService } from '@/services/ats.service';
import { resumeService } from '@/services/resume.service';
import { useIsAuthenticated } from '@/store/auth';
import { toast } from '@/store/toast';

export default function JobMatcherPage() {
  const signedIn = useIsAuthenticated();
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeId, setResumeId] = useState('');

  const resumes = useQuery({
    queryKey: queryKeys.resumes(),
    queryFn: () => resumeService.list(),
    enabled: signedIn,
  });

  const match = useMutation({
    mutationFn: async () => {
      if (resumeId) {
        return atsService.jobMatch({
          resumeId,
          jobTitle,
          company: company || undefined,
          jobDescription,
        });
      }
      if (signedIn && resumeText.trim()) {
        const parsed = await resumeService.importText(resumeText);
        return atsService.jobMatch({
          data: parsed.data,
          jobTitle,
          company: company || undefined,
          jobDescription,
        });
      }
      return atsService.analyze({
        text: resumeText,
        jobTitle,
        company,
        jobDescription,
      });
    },
    onSuccess: () => toast.success('Job match complete'),
    onError: (error) => {
      if (error instanceof ApiError && error.requiresUpgrade) {
        toast.warning('Job matching is a Pro feature', error.message);
        return;
      }
      toast.error('Match failed', errorMessage(error));
    },
  });

  const tailor = useMutation({
    mutationFn: () => {
      if (!resumeId) throw new Error('Choose a saved resume to tailor.');
      const title = [jobTitle || 'Role', company].filter(Boolean).join(' · ');
      return resumeService.tailor(resumeId, {
        title: title || 'Tailored resume',
        jobTitle: jobTitle || 'Role',
        company,
      });
    },
    onSuccess: (resume) => {
      toast.success('Tailored version created');
      navigate(`/resume/${resume.id}/edit`);
    },
    onError: (error) => toast.error('Could not create a tailored version', errorMessage(error)),
  });

  const canMatch = jobDescription.trim().length > 40 && (resumeId || resumeText.trim().length > 40);

  return (
    <>
      <Seo
        title="Job Description Matcher"
        description="Paste a job description and compare it with your resume. See matched and missing keywords, then create a tailored version."
        path="/job-description-matcher"
        keywords={['job description matcher', 'resume keyword match', 'tailor resume']}
        jsonLd={[
          webPageJsonLd({
            name: 'Job Description Matcher',
            description: 'Compare a resume with a job posting and create a tailored version.',
            path: '/job-description-matcher',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Job Description Matcher', path: '/job-description-matcher' },
          ]),
        ]}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-wide px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Match your resume to a real posting
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
            We extract weighted terms from the job description and show what is already in the
            resume. We will not tell you to stuff keywords into a footer.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-wide gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-foreground">Job description</h2>
          <Field label="Job title" className="mt-4">
            <Input value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder="Product Manager" />
          </Field>
          <Field label="Company" optional className="mt-3">
            <Input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Northwind" />
          </Field>
          <Field label="Posting" className="mt-3">
            <Textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              minRows={12}
              placeholder="Paste the full job description"
            />
          </Field>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-foreground">Your resume</h2>
          {signedIn && (resumes.data?.length ?? 0) > 0 && (
            <Field label="Saved resume" className="mt-4">
              <Select
                value={resumeId}
                onChange={(event) => setResumeId(event.target.value)}
                placeholder="Select a resume"
                options={resumes.data!.map((resume) => ({
                  value: resume.id,
                  label: resume.title,
                }))}
              />
            </Field>
          )}
          <Field label="Or paste resume text" className="mt-4">
            <Textarea
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              minRows={10}
              placeholder="Paste resume text if you are not using a saved resume"
            />
          </Field>
          {!signedIn && (
            <Alert tone="neutral" className="mt-4">
              Sign in to match against a saved resume and create a tailored copy.{' '}
              <ButtonLink to="/login" size="xs" variant="ghost">
                Sign in
              </ButtonLink>
            </Alert>
          )}
        </Card>
      </div>

      <div className="mx-auto flex max-w-wide flex-wrap gap-3 px-4 pb-8 sm:px-6">
        <Button
          leadingIcon={<Target />}
          loading={match.isPending}
          disabled={!canMatch}
          onClick={() => match.mutate()}
        >
          Run match
        </Button>
        <Button
          variant="secondary"
          leadingIcon={<Sparkles />}
          loading={tailor.isPending}
          disabled={!resumeId || !jobTitle}
          onClick={() => tailor.mutate()}
        >
          Create tailored version
        </Button>
      </div>

      <div className="mx-auto max-w-wide px-4 pb-16 sm:px-6">
        {match.data ? (
          <>
            {'placementGuidance' in match.data &&
            typeof match.data.placementGuidance === 'string' &&
            match.data.placementGuidance ? (
              <Alert tone="info" className="mb-6">
                {match.data.placementGuidance}
              </Alert>
            ) : null}
            <AtsReportView report={match.data} />
          </>
        ) : (
          <EmptyState
            icon={<Target />}
            title="No match yet"
            description="Paste a job description on the left and a resume on the right, then run the match."
          />
        )}
      </div>
    </>
  );
}
