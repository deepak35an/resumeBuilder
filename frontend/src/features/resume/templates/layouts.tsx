/**
 * Layout shells shared by the template catalogue.
 *
 * A template is a thin configuration of one of these shells: which sections go
 * in the sidebar, how headings are drawn, whether the header is a banner. That
 * keeps 44+ templates genuinely different in layout without copies of the
 * section-rendering logic.
 */

import {
  ResumeContactStack,
  ResumeHeader,
  ResumePhoto,
  ResumeSectionBlock,
  ResumeSectionShell,
  ResumeSectionBody,
  sectionHasContent,
  type HeaderPhotoPlacement,
} from '@/features/resume/render/primitives';
import type { ResumeSection, SectionType } from '@/types/resume';
import type { TemplateComponentProps } from './types';

export type HeadingStyle = 'plain' | 'rule' | 'bar' | 'boxed' | 'underline-accent' | 'dot-accent' | 'pill' | 'gradient-bar' | 'inline-rule';

export type PhotoPlacement = HeaderPhotoPlacement | 'sidebar-top';

export interface SingleColumnOptions {
  headingStyle?: HeadingStyle;
  headerAlign?: 'left' | 'center';
  headerVariant?: 'plain' | 'banner' | 'ruled' | 'split' | 'dark-full' | 'accent-top';
  /** Opt-in. ATS templates leave this unset so photos never appear. */
  photoPlacement?: PhotoPlacement;
}

function visibleSections(sections: ResumeSection[]): ResumeSection[] {
  return sections.filter((section) => section.visible && sectionHasContent(section));
}

function headerPhotoPlacement(
  placement: PhotoPlacement | undefined,
): HeaderPhotoPlacement | undefined {
  if (!placement || placement === 'sidebar-top') return undefined;
  return placement;
}

export function SingleColumnLayout({
  data,
  settings,
  headingStyle = 'rule',
  headerAlign = 'left',
  headerVariant = 'plain',
  photoPlacement,
}: TemplateComponentProps & SingleColumnOptions) {
  return (
    <>
      <ResumeHeader
        personal={data.personal}
        settings={settings}
        align={headerAlign}
        variant={headerVariant}
        photoPlacement={headerPhotoPlacement(photoPlacement)}
      />
      <div style={{ marginTop: '10pt' }}>
        {visibleSections(data.sections).map((section) => (
          <ResumeSectionBlock
            key={section.id}
            section={section}
            settings={settings}
            headingStyle={headingStyle}
          />
        ))}
      </div>
    </>
  );
}

export interface SidebarOptions extends SingleColumnOptions {
  /** Section types pulled into the sidebar, in this order. */
  sidebarSections: SectionType[];
  side?: 'left' | 'right';
  tinted?: boolean;
  /** Dark sidebar: accent-coloured background with white text. */
  dark?: boolean;
  /** Slightly lighter dark variant for a softer look. */
  darkTinted?: boolean;
  sidebarWidth?: string;
  /** Contact details in the sidebar rather than under the name. */
  contactInSidebar?: boolean;
}

export function SidebarLayout({
  data,
  settings,
  sidebarSections,
  side = 'left',
  tinted = false,
  dark = false,
  darkTinted = false,
  sidebarWidth = '32%',
  headingStyle = 'rule',
  headerAlign = 'left',
  headerVariant = 'plain',
  contactInSidebar = true,
  photoPlacement,
}: TemplateComponentProps & SidebarOptions) {
  const sections = visibleSections(data.sections);
  const inSidebar = sidebarSections
    .map((type) => sections.find((section) => section.type === type))
    .filter((section): section is ResumeSection => Boolean(section));
  const sidebarIds = new Set(inSidebar.map((section) => section.id));
  const inMain = sections.filter((section) => !sidebarIds.has(section.id));
  const showSidebarPhoto = photoPlacement === 'sidebar-top' && settings.showPhoto !== false;

  // Determine sidebar CSS class
  const sidebarClassName = dark
    ? 'resume-sidebar resume-sidebar--dark'
    : darkTinted
      ? 'resume-sidebar resume-sidebar--dark-tinted'
      : tinted
        ? 'resume-sidebar resume-sidebar--tinted'
        : 'resume-sidebar';

  const sidebar = (
    <aside className={sidebarClassName} key="sidebar">
      {showSidebarPhoto && (
        <div className="resume-sidebar__photo">
          <ResumePhoto personal={data.personal} settings={settings} />
        </div>
      )}
      {contactInSidebar && (
        <ResumeSectionShell title="Contact" settings={settings} headingStyle={headingStyle}>
          <ResumeContactStack personal={data.personal} />
        </ResumeSectionShell>
      )}
      {inSidebar.map((section) => (
        <ResumeSectionShell
          key={section.id}
          title={section.title}
          settings={settings}
          headingStyle={headingStyle}
        >
          <ResumeSectionBody section={section} settings={settings} compact />
        </ResumeSectionShell>
      ))}
    </aside>
  );

  const header = (
    <ResumeHeader
      personal={data.personal}
      settings={settings}
      align={headerAlign}
      variant={headerVariant}
      hideContact={contactInSidebar}
      photoPlacement={headerPhotoPlacement(photoPlacement)}
    />
  );

  // Banner headers span the page. A plain header belongs in the main column
  // so a full-height sidebar does not cover the name.
  const bannerHeader = headerVariant !== 'plain' && headerVariant !== 'ruled';

  const main = (
    <div key="main" className="resume-main">
      {!bannerHeader && header}
      {inMain.map((section) => (
        <ResumeSectionBlock
          key={section.id}
          section={section}
          settings={settings}
          headingStyle={headingStyle}
        />
      ))}
    </div>
  );

  return (
    <>
      {bannerHeader && header}
      <div
        className={`resume-columns resume-columns--sidebar-${side}${bannerHeader ? '' : ' resume-columns--flush'}`}
        style={{ ['--resume-sidebar-width' as string]: sidebarWidth }}
      >
        {side === 'left' ? [sidebar, main] : [main, sidebar]}
      </div>
    </>
  );
}

export interface TwoColumnOptions extends SingleColumnOptions {
  /** Section types that stay full width above the two columns. */
  fullWidthSections?: SectionType[];
  rightSections: SectionType[];
}

export function TwoColumnLayout({
  data,
  settings,
  fullWidthSections = ['summary', 'objective'],
  rightSections,
  headingStyle = 'rule',
  headerAlign = 'left',
  headerVariant = 'plain',
  photoPlacement,
}: TemplateComponentProps & TwoColumnOptions) {
  const sections = visibleSections(data.sections);
  const full = sections.filter((section) => fullWidthSections.includes(section.type));
  const fullIds = new Set(full.map((section) => section.id));
  const right = sections.filter(
    (section) => !fullIds.has(section.id) && rightSections.includes(section.type),
  );
  const rightIds = new Set(right.map((section) => section.id));
  const left = sections.filter(
    (section) => !fullIds.has(section.id) && !rightIds.has(section.id),
  );

  return (
    <>
      <ResumeHeader
        personal={data.personal}
        settings={settings}
        align={headerAlign}
        variant={headerVariant}
        photoPlacement={headerPhotoPlacement(photoPlacement)}
      />
      <div style={{ marginTop: '10pt' }}>
        {full.map((section) => (
          <ResumeSectionBlock
            key={section.id}
            section={section}
            settings={settings}
            headingStyle={headingStyle}
          />
        ))}
      </div>
      <div className="resume-columns resume-columns--even" style={{ marginTop: '10pt' }}>
        <div>
          {left.map((section) => (
            <ResumeSectionBlock
              key={section.id}
              section={section}
              settings={settings}
              headingStyle={headingStyle}
              compact
            />
          ))}
        </div>
        <div>
          {right.map((section) => (
            <ResumeSectionBlock
              key={section.id}
              section={section}
              settings={settings}
              headingStyle={headingStyle}
              compact
            />
          ))}
        </div>
      </div>
    </>
  );
}
