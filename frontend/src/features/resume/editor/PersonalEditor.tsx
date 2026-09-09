/** Contact block editor. Only a name and one contact method really matter. */

import { AtSign, Github, Globe, Linkedin, MapPin, Phone, Plus, Trash2, User } from 'lucide-react';
import { useRef, useState } from 'react';

import { Alert, Button, Field, IconButton, Input } from '@/components/ui';
import { templateById } from '@/features/resume/templates/registry';
import { compressResumePhoto } from '@/lib/resume-photo';
import { createId } from '@/lib/utils';
import { useResumeEditor } from '@/store/resumeEditor';
import type { PersonalInfo } from '@/types/resume';

const CONTACT_FIELDS: {
  key: keyof Omit<PersonalInfo, 'links' | 'photo'>;
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
  const templateId = useResumeEditor((state) => state.doc?.templateId);
  const updatePersonal = useResumeEditor((state) => state.updatePersonal);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  if (!personal) return null;

  const photoTemplate = Boolean(templateId && templateById(templateId).supportsPhoto);

  const addLink = () =>
    updatePersonal({ links: [...personal.links, { id: createId(), label: '', url: '' }] });

  const updateLink = (id: string, patch: Partial<{ label: string; url: string }>) =>
    updatePersonal({
      links: personal.links.map((link) => (link.id === id ? { ...link, ...patch } : link)),
    });

  const removeLink = (id: string) =>
    updatePersonal({ links: personal.links.filter((link) => link.id !== id) });

  const onPickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoError(null);
    setPhotoBusy(true);
    try {
      const dataUrl = await compressResumePhoto(file);
      updatePersonal({ photo: dataUrl });
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Could not use that image.');
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-5">
      <Field
        label="Profile photo"
        optional
        hint={
          photoTemplate
            ? 'Shown on this template. JPEG, PNG or WebP, under 5 MB.'
            : 'Saved here, but ATS-first templates hide photos so parsers still read your name as text.'
        }
        error={photoError ?? undefined}
      >
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-border bg-muted">
            {personal.photo ? (
              <img src={personal.photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                Photo
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => void onPickPhoto(event.target.files?.[0])}
            />
            <Button
              size="sm"
              variant="secondary"
              disabled={photoBusy}
              onClick={() => fileRef.current?.click()}
            >
              {photoBusy ? 'Processing…' : personal.photo ? 'Replace photo' : 'Upload photo'}
            </Button>
            {personal.photo ? (
              <Button size="sm" variant="ghost" onClick={() => updatePersonal({ photo: '' })}>
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </Field>

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
        {photoTemplate
          ? 'Date of birth, marital status and a full street address are still unnecessary. Photos can trip up applicant tracking systems — keep Classic ATS for online portals.'
          : 'Photos, date of birth, marital status and a full street address are not expected on a resume in most markets, and photos in particular can trip up applicant tracking systems.'}
      </Alert>
    </div>
  );
}
