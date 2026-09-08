/**
 * Resume rendering primitives.
 *
 * Every template is composed from these components, which means:
 *   - the preview, the PDF and the template gallery render identical markup;
 *   - output is always real selectable text, never an image;
 *   - a fix to date handling or bullet spacing lands in all 44 templates.
 *
 * Templates choose layout and emphasis. They never re-implement content.
 */

import type { ReactNode } from 'react';

import {
  contactLine,
  displayUrl,
  formatDateRange,
  formatResumeDate,
} from '@/features/resume/formatting';
import { cn } from '@/lib/utils';
import type {
  CertificationsSection,
  EducationSection,
  ExperienceSection,
  GenericListSection,
  LanguagesSection,
  ProjectsSection,
  PublicationsSection,
  ReferencesSection,
  ResumeSection,
  ResumeSettings,
  SkillsSection,
  TagsSection,
  TextSection,
  PersonalInfo,
} from '@/types/resume';

export interface RenderContext {
  settings: ResumeSettings;
}

// --- Header -----------------------------------------------------------------

export interface ResumeHeaderProps {
  personal: PersonalInfo;
  settings: ResumeSettings;
  align?: 'left' | 'center';
  variant?: 'plain' | 'banner' | 'ruled' | 'split' | 'dark-full' | 'accent-top';
  /** Sidebar layouts render contact details in the sidebar instead. */
  hideContact?: boolean;
}

export function ResumeHeader({
  personal,
  align = 'left',
  variant = 'plain',
  hideContact = false,
}: ResumeHeaderProps) {
  const contacts = contactLine(personal);

  // Split header: two-panel layout (dark left name, light right contact)
  if (variant === 'split') {
    return (
      <header className="resume-header--split">
        <div className="resume-header__left">
          <div className="resume-name">{personal.fullName || 'Your Name'}</div>
          {personal.title && <div className="resume-role">{personal.title}</div>}
        </div>
        <div className="resume-header__right">
          {contacts.length > 0 && (
            <div className="resume-contact">
              {contacts.map((entry, index) => (
                <span key={`${entry}-${index}`}>
                  <span>{displayUrl(entry)}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        variant === 'banner' && 'resume-header--banner',
        variant === 'dark-full' && 'resume-header--dark-full',
        variant === 'accent-top' && 'resume-header--accent-top',
        align === 'center' && 'text-center',
      )}
      style={variant === 'ruled' ? { borderBottom: '1pt solid var(--resume-rule)', paddingBottom: '6pt' } : undefined}
    >
      <div className="resume-name">{personal.fullName || 'Your Name'}</div>
      {personal.title && <div className="resume-role">{personal.title}</div>}
      {!hideContact && contacts.length > 0 && (
        <div
          className="resume-contact"
          style={{ marginTop: '4pt', justifyContent: align === 'center' ? 'center' : undefined }}
        >
          {contacts.map((entry, index) => (
            <span key={`${entry}-${index}`}>
              {index > 0 && <span className="resume-contact__sep" aria-hidden="true">{' | '}</span>}
              <span>{displayUrl(entry)}</span>
            </span>
          ))}
        </div>
      )}
    </header>
  );
}

/** Stacked contact block, for sidebar templates. */
export function ResumeContactStack({ personal }: { personal: PersonalInfo }) {
  const contacts = contactLine(personal);
  if (contacts.length === 0) return null;
  return (
    <div style={{ display: 'grid', gap: '2pt' }}>
      {contacts.map((entry, index) => (
        <span key={`${entry}-${index}`} style={{ fontSize: 'calc(var(--resume-font-size) * 0.9)', color: 'var(--resume-muted)', wordBreak: 'break-word' }}>
          {displayUrl(entry)}
        </span>
      ))}
    </div>
  );
}

// --- Section shell ----------------------------------------------------------

export interface ResumeSectionShellProps {
  title: string;
  settings: ResumeSettings;
  children: ReactNode;
  /** Heading style: rule, bar, boxed, plus new styles. */
  headingStyle?: 'plain' | 'rule' | 'bar' | 'boxed' | 'underline-accent' | 'dot-accent' | 'pill' | 'gradient-bar' | 'inline-rule';
  className?: string;
}

export function ResumeSectionShell({
  title,
  settings,
  children,
  headingStyle = 'rule',
  className,
}: ResumeSectionShellProps) {
  // Determine style and className for each heading type
  const headingClassName = cn(
    'resume-section__title',
    settings.uppercaseHeadings && 'resume-section__title--uppercase',
    headingStyle === 'underline-accent' && 'resume-section__title--underline-accent',
    headingStyle === 'dot-accent' && 'resume-section__title--dot-accent',
    headingStyle === 'pill' && 'resume-section__title--pill',
    headingStyle === 'gradient-bar' && 'resume-section__title--gradient-bar',
    headingStyle === 'inline-rule' && 'resume-section__title--inline-rule',
  );

  const headingInlineStyle =
    headingStyle === 'boxed'
      ? {
          background: 'var(--resume-accent)',
          color: '#ffffff',
          padding: '2pt 4pt',
        }
      : headingStyle === 'bar'
        ? { borderLeft: '3pt solid var(--resume-accent)', paddingLeft: '5pt' }
        : undefined;

  // Whether to show the old-style rule <hr>
  const showRule = headingStyle === 'rule';
  // Styles that have their own spacing built in
  const hasOwnSpacing = ['underline-accent', 'dot-accent', 'pill', 'gradient-bar', 'inline-rule'].includes(headingStyle);

  return (
    <section className={cn('resume-section', className)}>
      <h2 className={headingClassName} style={headingInlineStyle}>
        {title}
      </h2>
      {showRule && <hr className="resume-section__rule" />}
      {!showRule && !hasOwnSpacing && <div style={{ height: '4pt' }} />}
      {hasOwnSpacing && <div style={{ height: '3pt' }} />}
      {children}
    </section>
  );
}

// --- Entries ----------------------------------------------------------------

export interface EntryHeadProps {
  title: string;
  subtitle?: string;
  meta?: string;
  /** `stacked` puts the date on its own line - kinder to narrow columns. */
  layout?: 'split' | 'stacked';
}

export function ResumeEntryHead({ title, subtitle, meta, layout = 'split' }: EntryHeadProps) {
  if (layout === 'stacked') {
    return (
      <>
        <div className="resume-entry__title">{title}</div>
        {(subtitle || meta) && (
          <div className="resume-entry__subtitle">
            {[subtitle, meta].filter(Boolean).join(' \u00b7 ')}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="resume-entry__head">
        <span className="resume-entry__title">{title}</span>
        {meta && <span className="resume-entry__meta">{meta}</span>}
      </div>
      {subtitle && <div className="resume-entry__subtitle">{subtitle}</div>}
    </>
  );
}

export function ResumeBullets({ bullets }: { bullets: string[] }) {
  const items = bullets.map((bullet) => bullet.trim()).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <ul className="resume-bullets">
      {items.map((bullet, index) => (
        <li key={`${index}-${bullet.slice(0, 12)}`}>{bullet}</li>
      ))}
    </ul>
  );
}

// --- Per-kind renderers -----------------------------------------------------

export interface SectionRenderProps<T extends ResumeSection = ResumeSection> {
  section: T;
  settings: ResumeSettings;
  /** Sidebar and two-column templates need the tighter entry layout. */
  compact?: boolean;
}

function TextBody({ section }: SectionRenderProps<TextSection>) {
  if (!section.content.trim()) return null;
  return <p style={{ whiteSpace: 'pre-wrap' }}>{section.content.trim()}</p>;
}

function ExperienceBody({ section, settings, compact }: SectionRenderProps<ExperienceSection>) {
  return (
    <>
      {section.items.map((item) => (
        <div className="resume-entry" key={item.id}>
          <ResumeEntryHead
            title={[item.title, item.company].filter(Boolean).join(' \u2013 ') || 'Role'}
            subtitle={item.location || undefined}
            meta={formatDateRange(item.startDate, item.endDate, item.current, settings.dateFormat)}
            layout={compact ? 'stacked' : 'split'}
          />
          {item.description.trim() && <p style={{ marginTop: '2pt' }}>{item.description.trim()}</p>}
          <ResumeBullets bullets={item.bullets} />
          {item.technologies.length > 0 && (
            <div className="resume-skills__row">
              <span className="resume-skills__label">Tools:</span>
              <span>{item.technologies.join(', ')}</span>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function EducationBody({ section, settings, compact }: SectionRenderProps<EducationSection>) {
  return (
    <>
      {section.items.map((item) => {
        const degree = [item.degree, item.field].filter(Boolean).join(', ');
        return (
          <div className="resume-entry" key={item.id}>
            <ResumeEntryHead
              title={degree || item.institution || 'Qualification'}
              subtitle={
                [degree ? item.institution : '', item.location].filter(Boolean).join(' \u00b7 ') ||
                undefined
              }
              meta={formatDateRange(item.startDate, item.endDate, item.current, settings.dateFormat)}
              layout={compact ? 'stacked' : 'split'}
            />
            {item.gpa.trim() && <div>GPA: {item.gpa.trim()}</div>}
            {item.coursework.length > 0 && (
              <div className="resume-skills__row">
                <span className="resume-skills__label">Coursework:</span>
                <span>{item.coursework.join(', ')}</span>
              </div>
            )}
            <ResumeBullets bullets={item.bullets} />
          </div>
        );
      })}
    </>
  );
}

function SkillsBody({ section }: SectionRenderProps<SkillsSection>) {
  const groups = section.groups.filter((group) => group.skills.length > 0);
  if (groups.length === 0) return null;

  if (section.display === 'inline') {
    return (
      <p className="resume-inline-list">
        {groups.flatMap((group) => group.skills).join(' \u00b7 ')}
      </p>
    );
  }

  return (
    <>
      {groups.map((group) => (
        <div className="resume-skills__row" key={group.id}>
          {group.name && <span className="resume-skills__label">{group.name}:</span>}
          <span>{group.skills.join(', ')}</span>
        </div>
      ))}
    </>
  );
}

function ProjectsBody({ section, settings, compact }: SectionRenderProps<ProjectsSection>) {
  return (
    <>
      {section.items.map((item) => {
        const link = item.url || item.github;
        return (
          <div className="resume-entry" key={item.id}>
            <ResumeEntryHead
              title={[item.name, item.role].filter(Boolean).join(' \u2013 ') || 'Project'}
              subtitle={link ? displayUrl(link) : undefined}
              meta={formatDateRange(item.startDate, item.endDate, false, settings.dateFormat)}
              layout={compact ? 'stacked' : 'split'}
            />
            {item.description.trim() && <p style={{ marginTop: '2pt' }}>{item.description.trim()}</p>}
            <ResumeBullets bullets={item.bullets} />
            {item.technologies.length > 0 && (
              <div className="resume-skills__row">
                <span className="resume-skills__label">Built with:</span>
                <span>{item.technologies.join(', ')}</span>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function CertificationsBody({ section, settings }: SectionRenderProps<CertificationsSection>) {
  return (
    <>
      {section.items.map((item) => (
        <div className="resume-entry" key={item.id} style={{ marginTop: '3pt' }}>
          <ResumeEntryHead
            title={item.name || 'Certification'}
            subtitle={item.issuer || undefined}
            meta={formatResumeDate(item.date, settings.dateFormat)}
          />
          {item.credentialId.trim() && (
            <div className="resume-entry__meta">Credential ID: {item.credentialId.trim()}</div>
          )}
        </div>
      ))}
    </>
  );
}

function ListBody({ section, settings }: SectionRenderProps<GenericListSection>) {
  return (
    <>
      {section.items.map((item) => (
        <div className="resume-entry" key={item.id} style={{ marginTop: '3pt' }}>
          <ResumeEntryHead
            title={item.title || 'Entry'}
            subtitle={item.subtitle || undefined}
            meta={formatResumeDate(item.date, settings.dateFormat)}
          />
          {item.description.trim() && <p>{item.description.trim()}</p>}
          <ResumeBullets bullets={item.bullets} />
        </div>
      ))}
    </>
  );
}

function PublicationsBody({ section, settings }: SectionRenderProps<PublicationsSection>) {
  return (
    <>
      {section.items.map((item) => (
        <div className="resume-entry" key={item.id} style={{ marginTop: '3pt' }}>
          <div className="resume-entry__title">{item.title || 'Publication'}</div>
          <div className="resume-entry__subtitle">
            {[item.authors, item.publisher, formatResumeDate(item.date, settings.dateFormat)]
              .filter(Boolean)
              .join('. ')}
          </div>
          {item.url.trim() && <div className="resume-entry__meta">{displayUrl(item.url)}</div>}
          {item.description.trim() && <p>{item.description.trim()}</p>}
        </div>
      ))}
    </>
  );
}

function LanguagesBody({ section }: SectionRenderProps<LanguagesSection>) {
  const items = section.items.filter((item) => item.name.trim());
  if (items.length === 0) return null;
  return (
    <p className="resume-inline-list">
      {items
        .map((item) =>
          item.proficiency ? `${item.name} (${item.proficiency})` : item.name,
        )
        .join(' \u00b7 ')}
    </p>
  );
}

function TagsBody({ section }: SectionRenderProps<TagsSection>) {
  if (section.tags.length === 0) return null;
  return <p className="resume-inline-list">{section.tags.join(' \u00b7 ')}</p>;
}

function ReferencesBody({ section }: SectionRenderProps<ReferencesSection>) {
  if (section.hideDetails) return <p>References available on request.</p>;
  return (
    <>
      {section.items.map((item) => (
        <div className="resume-entry" key={item.id} style={{ marginTop: '3pt' }}>
          <ResumeEntryHead
            title={item.name || 'Referee'}
            subtitle={[item.title, item.company].filter(Boolean).join(', ') || undefined}
            meta={item.relationship || undefined}
          />
          {(item.email || item.phone) && (
            <div className="resume-entry__meta">
              {[item.email, item.phone].filter(Boolean).join(' \u00b7 ')}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

/** The body of a section, without its heading. */
export function ResumeSectionBody({ section, settings, compact }: SectionRenderProps) {
  switch (section.kind) {
    case 'text':
      return <TextBody section={section} settings={settings} compact={compact} />;
    case 'experience':
      return <ExperienceBody section={section} settings={settings} compact={compact} />;
    case 'education':
      return <EducationBody section={section} settings={settings} compact={compact} />;
    case 'skills':
      return <SkillsBody section={section} settings={settings} compact={compact} />;
    case 'projects':
      return <ProjectsBody section={section} settings={settings} compact={compact} />;
    case 'certifications':
      return <CertificationsBody section={section} settings={settings} compact={compact} />;
    case 'publications':
      return <PublicationsBody section={section} settings={settings} compact={compact} />;
    case 'languages':
      return <LanguagesBody section={section} settings={settings} compact={compact} />;
    case 'tags':
      return <TagsBody section={section} settings={settings} compact={compact} />;
    case 'references':
      return <ReferencesBody section={section} settings={settings} compact={compact} />;
    case 'list':
      return <ListBody section={section} settings={settings} compact={compact} />;
  }
}

/** True when a section would render nothing, so templates can skip its heading. */
export function sectionHasContent(section: ResumeSection): boolean {
  switch (section.kind) {
    case 'text':
      return Boolean(section.content.trim());
    case 'skills':
      return section.groups.some((group) => group.skills.length > 0);
    case 'tags':
      return section.tags.length > 0;
    case 'references':
      return section.hideDetails || section.items.length > 0;
    default:
      return section.items.length > 0;
  }
}

/** Heading + body. Templates use this for the common case. */
export function ResumeSectionBlock({
  section,
  settings,
  compact,
  headingStyle,
}: SectionRenderProps & { headingStyle?: ResumeSectionShellProps['headingStyle'] }) {
  if (!section.visible || !sectionHasContent(section)) return null;
  return (
    <ResumeSectionShell title={section.title} settings={settings} headingStyle={headingStyle}>
      <ResumeSectionBody section={section} settings={settings} compact={compact} />
    </ResumeSectionShell>
  );
}
