/**
 * Renders the right editor for a section based on its `kind`.
 *
 * The switch is exhaustive: adding a section kind to `types/resume.ts` makes
 * this fail to compile until an editor exists for it.
 */

import { CertificationsSectionEditor } from '@/features/resume/editor/CertificationsSectionEditor';
import { EducationSectionEditor } from '@/features/resume/editor/EducationSectionEditor';
import { ExperienceSectionEditor } from '@/features/resume/editor/ExperienceSectionEditor';
import { ListSectionEditor } from '@/features/resume/editor/ListSectionEditor';
import {
  LanguagesSectionEditor,
  PublicationsSectionEditor,
  ReferencesSectionEditor,
  TagsSectionEditor,
} from '@/features/resume/editor/MiscSectionEditors';
import { ProjectsSectionEditor } from '@/features/resume/editor/ProjectsSectionEditor';
import { SkillsSectionEditor } from '@/features/resume/editor/SkillsSectionEditor';
import { TextSectionEditor } from '@/features/resume/editor/TextSectionEditor';
import type { ResumeSection } from '@/types/resume';

export function SectionEditor({
  section,
  onChange,
}: {
  section: ResumeSection;
  onChange: (section: ResumeSection) => void;
}) {
  switch (section.kind) {
    case 'text':
      return <TextSectionEditor section={section} onChange={onChange} />;
    case 'experience':
      return <ExperienceSectionEditor section={section} onChange={onChange} />;
    case 'education':
      return <EducationSectionEditor section={section} onChange={onChange} />;
    case 'skills':
      return <SkillsSectionEditor section={section} onChange={onChange} />;
    case 'projects':
      return <ProjectsSectionEditor section={section} onChange={onChange} />;
    case 'certifications':
      return <CertificationsSectionEditor section={section} onChange={onChange} />;
    case 'publications':
      return <PublicationsSectionEditor section={section} onChange={onChange} />;
    case 'languages':
      return <LanguagesSectionEditor section={section} onChange={onChange} />;
    case 'tags':
      return <TagsSectionEditor section={section} onChange={onChange} />;
    case 'references':
      return <ReferencesSectionEditor section={section} onChange={onChange} />;
    case 'list':
      return <ListSectionEditor section={section} onChange={onChange} />;
  }
}
