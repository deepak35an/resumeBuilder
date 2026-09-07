/** Contact block editor. Only a name and one contact method really matter. */

import { AtSign, Github, Globe, Linkedin, MapPin, Phone, Plus, Trash2, User } from 'lucide-react';

import { Alert, Button, Field, IconButton, Input } from '@/components/ui';
import { createId } from '@/lib/utils';
import { useResumeEditor } from '@/store/resumeEditor';
import type { PersonalInfo } from '@/types/resume';

const CONTACT_FIELDS: {
  key: keyof Omit<PersonalInfo, 'links'>;
  label: string;
  placeholder: string;
  hint?: string;
  icon: React.ReactNode;
  type?: string;
  optional?: boolean;
}[] = [
  {
    key: 'fullName',
    label: 'Full name',
    placeholder: 'Avery Chen',
    icon: <User />,
  },
  {
    key: 'title',
    label: 'Professional title',
    placeholder: 'Senior Product Engineer',
    hint: 'Match the title of the job you are applying for where that is honest.',
    icon: <User />,
    optional: true,
  },
  {
    key: 'email',
    label: 'Email',
    placeholder: 'avery.chen@example.com',
    icon: <AtSign />,
    type: 'email',
  },
  {
    key: 'phone',
    label: 'Phone',
    placeholder: '(555) 014-2288',
    icon: <Phone />,
    type: 'tel',
  },
  {
    key: 'location',
    label: 'Location',
    placeholder: 'Seattle, WA',
    hint: 'City and region is enough. Never put your full street address on a resume.',
    icon: <MapPin />,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'linkedin.com/in/averychen',
    icon: <Linkedin />,
    optional: true,
  },
  {
    key: 'github',
    label: 'GitHub',
    placeholder: 'github.com/averychen',
    icon: <Github />,
    optional: true,
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    placeholder: 'averychen.dev',
    icon: <Globe />,
    optional: true,
  },
];

export function PersonalEditor() {
  const personal = useResumeEditor((state) => state.doc?.data.personal);
  const updatePersonal = useResumeEditor((state) => state.updatePersonal);

  if (!personal) return null;

  const addLink = () =>
    updatePersonal({ links: [...personal.links, { id: createId(), label: '', url: '' }] });

  const updateLink = (id: string, patch: Partial<{ label: string; url: string }>) =>
    updatePersonal({
      links: personal.links.map((link) => (link.id === id ? { ...link, ...patch } : link)),
    });

  const removeLink = (id: string) =>
    updatePersonal({ links: personal.links.filter((link) => link.id !== id) });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {CONTACT_FIELDS.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            hint={field.hint}
            optional={field.optional}
            className={field.key === 'fullName' || field.key === 'title' ? 'sm:col-span-2' : undefined}
          >
            <Input
              type={field.type}
              value={personal[field.key]}
              placeholder={field.placeholder}
              leadingIcon={field.icon}
              autoComplete={field.key === 'fullName' ? 'name' : undefined}
              onChange={(event) => updatePersonal({ [field.key]: event.target.value })}
            />
          </Field>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Other links</span>
          <Button size="xs" variant="ghost" leadingIcon={<Plus />} onClick={addLink}>
            Add link
          </Button>
        </div>

        {personal.links.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Somewhere else worth linking - a paper, a talk, a shop? Add it here.
          </p>
        ) : (
          <ul className="space-y-2">
            {personal.links.map((link) => (
              <li key={link.id} className="flex items-center gap-2">
                <Input
                  value={link.label}
                  placeholder="Label"
                  aria-label="Link label"
                  className="max-w-[10rem]"
                  onChange={(event) => updateLink(link.id, { label: event.target.value })}
                />
                <Input
                  value={link.url}
                  placeholder="example.com/avery"
                  aria-label="Link URL"
                  onChange={(event) => updateLink(link.id, { url: event.target.value })}
                />
                <IconButton
                  size="sm"
                  variant="ghost"
                  label={`Remove ${link.label || 'link'}`}
                  icon={<Trash2 />}
                  onClick={() => removeLink(link.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Alert tone="neutral" title="What to leave out">
        Photos, date of birth, marital status and a full street address are not expected on a resume
        in most markets, and photos in particular can trip up applicant tracking systems.
      </Alert>
    </div>
  );
}
