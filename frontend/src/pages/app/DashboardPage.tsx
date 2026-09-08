import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FilePlus2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { queryKeys } from '@/app/queryClient';
import { AppPage } from '@/components/layout/AppLayout';
import { RetryState } from '@/components/feedback/RetryState';
import { Seo } from '@/components/seo/Seo';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  ScoreRing,
  SectionHeading,
  Skeleton,
} from '@/components/ui';
import { defaultSettings } from '@/features/resume/defaults';
import { TemplatePickerModal } from '@/features/resume/templates/TemplatePickerModal';
import type { TemplateDefinition } from '@/features/resume/templates/types';
import { formatRelativeTime } from '@/lib/utils';
import { dashboardService } from '@/services/dashboard.service';
import { resumeService } from '@/services/resume.service';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/store/toast';
import { errorMessage } from '@/lib/api-client';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const overview = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: dashboardService.get,
  });

  const createResume = async (template: TemplateDefinition) => {
    setCreating(true);
    try {
      const resume = await resumeService.create({
        title: `${template.name} resume`,
        templateId: template.id,
        settings: { ...defaultSettings(), ...template.settingsDefaults },
      });
      toast.success('Resume created');
      setPickerOpen(false);
      navigate(`/resume/${resume.id}/edit`);
    } catch (error) {
      toast.error('Could not create a resume', errorMessage(error));
      setCreating(false);
    }
  };

  const data = overview.data;
  const empty = data && data.resumeCount === 0;

  return (
    <AppPage>
      <Seo title="Career OS" description="Your ResumeForge workspace." noindex />

      {overview.isError && (
        <RetryState error={overview.error} onRetry={() => void overview.refetch()} />
      )}
      {overview.isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      )}

      {empty && (
        <EmptyState
          icon={<FilePlus2 />}
          title="Welcome to your Career OS"
          description="Create a resume to start the loop: build, check, match, tailor, export, apply."
          action={
            <Button onClick={() => setPickerOpen(true)} leadingIcon={<FilePlus2 />}>
              Create resume
            </Button>
          }
          secondaryAction={
            <ButtonLink to="/resume-templates" variant="secondary">
              Browse templates
            </ButtonLink>
          }
        />
      )}

      {data && !empty && (
        <div className="space-y-10">
          <header>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              Hello, {data.greetingName || user?.fullName?.split(' ')[0] || 'there'}
            </h1>
          </header>

          <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Next best action
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">{data.nextBestAction.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">{data.nextBestAction.detail}</p>
            </div>
            <ButtonLink to={data.nextBestAction.ctaHref} trailingIcon={<ArrowRight />}>
              {data.nextBestAction.ctaLabel}
            </ButtonLink>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="flex items-center gap-4">
              <ScoreRing score={data.latestScore ?? 0} size="sm" label="Resume health" />
              <div>
                <p className="text-sm font-semibold text-foreground">Resume health</p>
                <p className="text-xs text-muted-foreground">
                  {data.band ?? 'No score yet'}
                  {data.scoreDelta != null ? ` · ${data.scoreDelta > 0 ? '+' : ''}${data.scoreDelta}` : ''}
                </p>
              </div>
            </Card>
            <Card>
              <p className="text-xs text-muted-foreground">Resumes</p>
              <p className="mt-1 text-2xl font-semibold">{data.resumeCount}</p>
              <p className="text-xs text-muted-foreground">{data.downloadCount} downloads</p>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Plan</p>
                <Badge tone={user?.plan === 'pro' ? 'pro' : 'outline'} size="xs" uppercase>
                  {user?.plan ?? 'free'}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-foreground">
                {data.subscription?.status === 'active' ? 'Pro is active' : 'Free workspace'}
              </p>
              {user?.plan === 'free' && (
                <ButtonLink to="/pricing" size="sm" variant="subtle" className="mt-3">
                  Upgrade
                </ButtonLink>
              )}
            </Card>
          </div>

          <section>
            <SectionHeading
              title="Recent resumes"
              action={
                <ButtonLink to="/resumes" variant="ghost" size="sm">
                  See all
                </ButtonLink>
              }
            />
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {data.recentResumes.map((resume) => (
                <li key={resume.id}>
                  <Card interactive>
                    <Link to={`/resume/${resume.id}/edit`} className="block">
                      <p className="font-medium text-foreground">{resume.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Updated {formatRelativeTime(resume.updatedAt)}
                        {resume.atsScore != null ? ` · ATS ${resume.atsScore}` : ''}
                      </p>
                    </Link>
                  </Card>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading
              title="Recent reports"
              action={
                <ButtonLink to="/ats-resume-checker" variant="ghost" size="sm" leadingIcon={<ShieldCheck />}>
                  New check
                </ButtonLink>
              }
            />
            {data.recentReports.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No ATS reports yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {data.recentReports.map((report) => (
                  <li key={report.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span>
                      {report.resumeTitle ?? 'Resume'} · {report.kind === 'job_match' ? 'Match' : 'ATS'}
                    </span>
                    <span className="font-mono tabular-nums">{report.matchScore ?? report.overallScore}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      <TemplatePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        busy={creating}
        onConfirm={(template) => void createResume(template)}
      />
    </AppPage>
  );
}
