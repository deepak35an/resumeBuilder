/**
 * Layout shells shared by the template catalogue.
 *
 * A template is a thin configuration of one of these shells: which sections go
 * in the sidebar, how headings are drawn, whether the header is a banner. That
 * keeps 44 templates genuinely different in layout without 44 copies of the
 * section-rendering logic.
 */

import {
  ResumeContactStack,
  ResumeHeader,
  ResumeSectionBlock,
  ResumeSectionShell,
  ResumeSectionBody,
  sectionHasContent,
} from '@/features/resume/render/primitives';
import type { ResumeSection, SectionType } from '@/types/resume';
import type { TemplateComponentProps } from './types';

export type HeadingStyle = 'plain' | 'rule' | 'bar' | 'boxed';

export interface SingleColumnOptions {
  headingStyle?: HeadingStyle;
  headerAlign?: 'left' | 'center';
  headerVariant?: 'plain' | 'banner' | 'ruled';
}

function visibleSections(sections: ResumeSection[]): ResumeSection[] {
  return sections.filter((section) => section.visible && sectionHasContent(section));
}

export function SingleColumnLayout({
  data,
  settings,
  headingStyle = 'rule',
  headerAlign = 'left',
  headerVariant = 'plain',
}: TemplateComponentProps & SingleColumnOptions) {
  return (
    <>
      <ResumeHeader
        personal={data.personal}
        settings={settings}
        align={headerAlign}
        variant={headerVariant}
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
  sidebarWidth = '32%',
  headingStyle = 'rule',
  headerAlign = 'left',
  headerVariant = 'plain',
  contactInSidebar = true,
}: TemplateComponentProps & SidebarOptions) {
  const sections = visibleSections(data.sections);
  const inSidebar = sidebarSections
    .map((type) => sections.find((section) => section.type === type))
    .filter((section): section is ResumeSection => Boolean(section));
  const sidebarIds = new Set(inSidebar.map((section) => section.id));
  const inMain = sections.filter((section) => !sidebarIds.has(section.id));

  const sidebar = (
    <aside
      className={tinted ? 'resume-sidebar resume-sidebar--tinted' : 'resume-sidebar'}
      key="sidebar"
    >
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

  const main = (
    <div key="main">
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
      <ResumeHeader
        personal={data.personal}
        settings={settings}
        align={headerAlign}
        variant={headerVariant}
        hideContact={contactInSidebar}
      />
      <div
        className={`resume-columns resume-columns--sidebar-${side}`}
        style={{ marginTop: '10pt', ['--resume-sidebar-width' as string]: sidebarWidth }}
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
