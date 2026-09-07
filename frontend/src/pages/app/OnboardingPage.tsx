import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AppPage } from '@/components/layout/AppLayout';
import { Seo } from '@/components/seo/Seo';
import { Badge, Button, Field, Input, Select } from '@/components/ui';
import { TemplateCard } from '@/features/resume/templates/TemplateCard';
import { TEMPLATES } from '@/features/resume/templates/registry';
import { errorMessage } from '@/lib/api-client';
import { resumeService } from '@/services/resume.service';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/store/toast';
import type { ExperienceLevel } from '@/types/api';

const LEVELS: Array<{ value: ExperienceLevel; label: string }> = [
  { value: 'student', label: 'Student' },
  { value: 'fresher', label: 'Fresher / new grad' },
  { value: '1-3', label: '1–3 years' },
  { value: '3-5', label: '3–5 years' },
  { value: '5-10', label: '5–10 years' },
  { value: '10+', label: '10+ years' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [role, setRole] = useState('');
  const [level, setLevel] = useState<ExperienceLevel>('1-3');
  const [templateId, setTemplateId] = useState(params.get('template') ?? 'classic-ats');
  const [busy, setBusy] = useState(false);

  const recommended = useMemo(() => {
    if (level === 'student' || level === 'fresher') {
      return TEMPLATES.filter((t) => t.category === 'student' || t.id === 'classic-ats').slice(0, 4);
    }
    if (/engineer|developer|data|devops|cloud|security/i.test(role)) {
      return TEMPLATES.filter((t) => t.category === 'tech' || t.id === 'classic-ats').slice(0, 4);
    }
    if (/manager|director|consult|financ|account/i.test(role)) {
      return TEMPLATES.filter((t) => t.category === 'business' || t.id === 'classic-ats').slice(0, 4);
    }
    return TEMPLATES.filter((t) => t.category === 'ats').slice(0, 4);
  }, [level, role]);

  const finish = async () => {
    setBusy(true);
    try {
      const user = await usersService.saveOnboarding({
        targetRole: role || 'Professional',
        experienceLevel: level,
        goal: 'job-search',
      });
      setUser(user);
      const resume = await resumeService.create({
        title: role ? `${role} resume` : 'Untitled resume',
        templateId,
      });
      toast.success('Workspace ready');
      navigate(`/resume/${resume.id}/edit`);
    } catch (error) {
      toast.error('Could not finish onboarding', errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppPage>
      <Seo title="Onboarding" description="Set up your Career OS." noindex />
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Set up your Career OS</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Tell us the role you want. We will recommend templates — Classic ATS remains the safest default.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field label="Target role">
          <Input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Software Engineer" />
        </Field>
        <Field label="Experience">
          <Select
            value={level}
            onChange={(event) => setLevel(event.target.value as ExperienceLevel)}
            options={LEVELS}
          />
        </Field>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-foreground">Recommended templates</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {recommended.map((template) => (
          <div
            key={template.id}
            className={templateId === template.id ? 'rounded-xl ring-2 ring-accent' : undefined}
          >
            <TemplateCard template={template} />
            <div className="flex items-center justify-between px-4 pb-4">
              {templateId === template.id ? (
                <Badge tone="accent" size="xs">
                  Selected
                </Badge>
              ) : (
                <span />
              )}
              <Button size="sm" variant="secondary" onClick={() => setTemplateId(template.id)}>
                Use {template.name}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button className="mt-8" loading={busy} onClick={() => void finish()}>
        Create my resume
      </Button>
    </AppPage>
  );
}
