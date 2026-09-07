/**
 * Template catalogue — 44 layouts composed from shared shells.
 *
 * ATS-first templates stay single-column. Sidebar and two-column families are
 * labelled Good, never “guaranteed”.
 */

import {
  SidebarLayout,
  SingleColumnLayout,
  TwoColumnLayout,
  type SidebarOptions,
  type SingleColumnOptions,
  type TwoColumnOptions,
} from './layouts';
import type { TemplateCategory, TemplateComponentProps, TemplateDefinition } from './types';

export const DEFAULT_TEMPLATE_ID = 'classic-ats';

function singleColumn(options: SingleColumnOptions) {
  return function Template(props: TemplateComponentProps) {
    return <SingleColumnLayout {...props} {...options} />;
  };
}

function sidebar(options: SidebarOptions) {
  return function Template(props: TemplateComponentProps) {
    return <SidebarLayout {...props} {...options} />;
  };
}

function twoColumn(options: TwoColumnOptions) {
  return function Template(props: TemplateComponentProps) {
    return <TwoColumnLayout {...props} {...options} />;
  };
}

const SKILLS_SIDE: SidebarOptions['sidebarSections'] = [
  'technical-skills',
  'soft-skills',
  'languages',
  'certifications',
];

const STUDENT_SIDE: SidebarOptions['sidebarSections'] = [
  'education',
  'technical-skills',
  'courses',
  'languages',
];

const CREATIVE_SIDE: SidebarOptions['sidebarSections'] = [
  'technical-skills',
  'soft-skills',
  'languages',
  'interests',
];

export const TEMPLATES: TemplateDefinition[] = [
  // --- ATS (10) ------------------------------------------------------------
  {
    id: 'classic-ats',
    name: 'Classic ATS',
    slug: 'classic-ats',
    category: 'ats',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'A single column, conservative type and clear section rules. The safest choice when you know nothing about the employer.',
    bestFor: ['Any role', 'Large employers', 'Online applications'],
    component: singleColumn({ headingStyle: 'rule' }),
  },
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    slug: 'classic-professional',
    category: 'ats',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'The same parse-safe stack as Classic ATS, with plain headings and a little more space between sections.',
    bestFor: ['Corporate roles', 'Finance', 'Consulting'],
    component: singleColumn({ headingStyle: 'plain' }),
  },
  {
    id: 'ats-standard',
    name: 'ATS Standard',
    slug: 'ats-standard',
    category: 'ats',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'Boxed section titles and a left-aligned header. Easy for a parser to split and easy for a recruiter to scan.',
    bestFor: ['High-volume applications', 'Government portals', 'Staffing agencies'],
    component: singleColumn({ headingStyle: 'boxed' }),
  },
  {
    id: 'modern-ats',
    name: 'Modern ATS',
    slug: 'modern-ats',
    category: 'ats',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'The same parse-safe structure as Classic, with an accent bar beside each heading and slightly more air.',
    bestFor: ['Any role', 'Tech and product', 'Design-aware employers'],
    settingsDefaults: { accentColor: '#4f46e5' },
    component: singleColumn({ headingStyle: 'bar' }),
  },
  {
    id: 'centered-classic',
    name: 'Centered Classic',
    slug: 'centered-classic',
    category: 'ats',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'A centred name and contact line above a traditional single column. Reads well when printed.',
    bestFor: ['Academia', 'Public sector', 'Printed applications'],
    component: singleColumn({ headingStyle: 'rule', headerAlign: 'center', headerVariant: 'ruled' }),
  },
  {
    id: 'clean-ats',
    name: 'Clean ATS',
    slug: 'clean-ats',
    category: 'ats',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'Minimal chrome: plain headings, a banner name block, and nothing a parser has to skip.',
    bestFor: ['Early career', 'Career changes', 'Straightforward roles'],
    component: singleColumn({ headingStyle: 'plain', headerVariant: 'banner' }),
  },
  {
    id: 'simple-ats',
    name: 'Simple ATS',
    slug: 'simple-ats',
    category: 'ats',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'A centred header on an otherwise undecorated single column. Use when the content has to do the work.',
    bestFor: ['Internships', 'Graduate schemes', 'First jobs'],
    component: singleColumn({ headingStyle: 'plain', headerAlign: 'center' }),
  },
  {
    id: 'ats-compact',
    name: 'ATS Compact',
    slug: 'ats-compact',
    category: 'ats',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'Tighter type and boxed headings for experienced candidates who need more history on one page.',
    bestFor: ['Senior IC roles', 'Longer work history', 'Dense skill lists'],
    settingsDefaults: { fontSize: 10, sectionSpacing: 0.85 },
    component: singleColumn({ headingStyle: 'boxed' }),
  },
  {
    id: 'traditional-ats',
    name: 'Traditional ATS',
    slug: 'traditional-ats',
    category: 'ats',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'Ruled header and ruled headings. Familiar to older applicant systems and printed HR packets.',
    bestFor: ['Public sector', 'Education', 'Healthcare administration'],
    component: singleColumn({ headingStyle: 'rule', headerVariant: 'ruled' }),
  },
  {
    id: 'ats-minimal',
    name: 'ATS Minimal',
    slug: 'ats-minimal',
    category: 'ats',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'A centred ruled header and bar headings. Still a single column — still safe to upload anywhere.',
    bestFor: ['Any role', 'Online applications', 'Template-averse employers'],
    settingsDefaults: { accentColor: '#111827' },
    component: singleColumn({ headingStyle: 'bar', headerAlign: 'center', headerVariant: 'ruled' }),
  },

  // --- Tech (12) -----------------------------------------------------------
  {
    id: 'tech-skills-forward',
    name: 'Skills Forward',
    slug: 'tech-skills-forward',
    category: 'tech',
    layout: 'two-column',
    atsRating: 'good',
    isPremium: false,
    description:
      'Summary across the top, then experience beside a skills and certifications column. Good when the stack matters as much as the story.',
    bestFor: ['Engineering', 'Data', 'IT operations'],
    settingsDefaults: { accentColor: '#0f766e' },
    component: twoColumn({
      rightSections: ['technical-skills', 'certifications', 'languages', 'courses'],
      headingStyle: 'rule',
    }),
  },
  {
    id: 'tech-stack',
    name: 'Tech Stack',
    slug: 'tech-stack',
    category: 'tech',
    layout: 'two-column',
    atsRating: 'good',
    isPremium: false,
    description:
      'Bar headings and a skills-first right column. Built for roles that screen on languages and tools first.',
    bestFor: ['Backend', 'Platform', 'SRE'],
    settingsDefaults: { accentColor: '#0f766e' },
    component: twoColumn({
      rightSections: ['technical-skills', 'projects', 'certifications'],
      headingStyle: 'bar',
    }),
  },
  {
    id: 'engineer-compact',
    name: 'Engineer Compact',
    slug: 'engineer-compact',
    category: 'tech',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'Single-column engineering resume with boxed headings. Safer than a split layout when the ATS is unknown.',
    bestFor: ['Software engineering', 'QA', 'Support engineering'],
    component: singleColumn({ headingStyle: 'boxed' }),
  },
  {
    id: 'systems-engineer',
    name: 'Systems Engineer',
    slug: 'systems-engineer',
    category: 'tech',
    layout: 'sidebar-left',
    atsRating: 'good',
    isPremium: false,
    description:
      'Left sidebar for skills, certs and languages. Main column keeps the systems work visible.',
    bestFor: ['Systems', 'Infrastructure', 'Networking'],
    settingsDefaults: { accentColor: '#1e3a5f' },
    component: sidebar({
      sidebarSections: ['technical-skills', 'certifications', 'languages'],
      side: 'left',
      headingStyle: 'rule',
    }),
  },
  {
    id: 'data-focused',
    name: 'Data Focused',
    slug: 'data-focused',
    category: 'tech',
    layout: 'two-column',
    atsRating: 'good',
    isPremium: false,
    description:
      'Projects sit beside experience so analysis work is not buried under job titles.',
    bestFor: ['Data science', 'Analytics', 'ML engineering'],
    settingsDefaults: { accentColor: '#0369a1' },
    component: twoColumn({
      rightSections: ['projects', 'technical-skills', 'education'],
      headingStyle: 'plain',
      fullWidthSections: ['summary'],
    }),
  },
  {
    id: 'full-stack',
    name: 'Full Stack',
    slug: 'full-stack',
    category: 'tech',
    layout: 'sidebar-right',
    atsRating: 'good',
    isPremium: false,
    description:
      'Experience on the left, a tinted skills sidebar on the right. Reads as product-minded without losing the stack.',
    bestFor: ['Full-stack', 'Product engineering', 'Startups'],
    settingsDefaults: { accentColor: '#4338ca' },
    component: sidebar({
      sidebarSections: SKILLS_SIDE,
      side: 'right',
      tinted: true,
      headingStyle: 'bar',
    }),
  },
  {
    id: 'devops-split',
    name: 'DevOps Split',
    slug: 'devops-split',
    category: 'tech',
    layout: 'two-column',
    atsRating: 'good',
    isPremium: true,
    description:
      'Certifications and tooling sit in a dedicated column so on-call and platform work stay scannable.',
    bestFor: ['DevOps', 'SRE', 'Platform'],
    settingsDefaults: { accentColor: '#0f172a' },
    component: twoColumn({
      rightSections: ['certifications', 'technical-skills', 'courses'],
      headingStyle: 'boxed',
    }),
  },
  {
    id: 'cloud-architect',
    name: 'Cloud Architect',
    slug: 'cloud-architect',
    category: 'tech',
    layout: 'sidebar-left',
    atsRating: 'good',
    isPremium: true,
    description:
      'Tinted left rail for certifications and skills. Banner header for a more senior presentation.',
    bestFor: ['Cloud', 'Architecture', 'Solutions engineering'],
    settingsDefaults: { accentColor: '#1d4ed8' },
    component: sidebar({
      sidebarSections: ['certifications', 'technical-skills', 'languages'],
      side: 'left',
      tinted: true,
      headingStyle: 'plain',
      headerVariant: 'banner',
    }),
  },
  {
    id: 'backend-column',
    name: 'Backend Column',
    slug: 'backend-column',
    category: 'tech',
    layout: 'two-column',
    atsRating: 'good',
    isPremium: false,
    description:
      'Ruled headings and a certifications column. Built for API, data and service-ownership stories.',
    bestFor: ['Backend', 'API', 'Data engineering'],
    component: twoColumn({
      rightSections: ['technical-skills', 'certifications', 'languages'],
      headingStyle: 'rule',
      headerAlign: 'left',
    }),
  },
  {
    id: 'frontend-modern',
    name: 'Frontend Modern',
    slug: 'frontend-modern',
    category: 'tech',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'Centred banner header and bar headings. Still a single column so design-aware teams and parsers both cope.',
    bestFor: ['Frontend', 'Design systems', 'Web'],
    settingsDefaults: { accentColor: '#4f46e5' },
    component: singleColumn({ headingStyle: 'bar', headerAlign: 'center', headerVariant: 'banner' }),
  },
  {
    id: 'security-analyst',
    name: 'Security Analyst',
    slug: 'security-analyst',
    category: 'tech',
    layout: 'sidebar-right',
    atsRating: 'good',
    isPremium: true,
    description:
      'Right sidebar for certs and skills. Conservative type for security, risk and compliance screens.',
    bestFor: ['Security', 'GRC', 'SOC'],
    settingsDefaults: { accentColor: '#111827' },
    component: sidebar({
      sidebarSections: ['certifications', 'technical-skills', 'courses'],
      side: 'right',
      headingStyle: 'rule',
    }),
  },
  {
    id: 'platform-engineer',
    name: 'Platform Engineer',
    slug: 'platform-engineer',
    category: 'tech',
    layout: 'two-column',
    atsRating: 'good',
    isPremium: false,
    description:
      'Projects and skills share the right column so internal platforms get as much space as product work.',
    bestFor: ['Platform', 'Developer experience', 'Infrastructure'],
    settingsDefaults: { accentColor: '#0f766e' },
    component: twoColumn({
      rightSections: ['projects', 'technical-skills', 'languages'],
      headingStyle: 'bar',
      headerVariant: 'ruled',
    }),
  },

  // --- Business (8) --------------------------------------------------------
  {
    id: 'executive-brief',
    name: 'Executive Brief',
    slug: 'executive-brief',
    category: 'business',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'Banner header and ruled headings. Written for directors who still have to pass an ATS first.',
    bestFor: ['Directors', 'Heads of function', 'General management'],
    settingsDefaults: { accentColor: '#111827', fontSize: 11 },
    component: singleColumn({ headingStyle: 'rule', headerVariant: 'banner' }),
  },
  {
    id: 'consulting-clean',
    name: 'Consulting Clean',
    slug: 'consulting-clean',
    category: 'business',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'Centred ruled header and boxed headings. Familiar to consulting and professional-services screens.',
    bestFor: ['Consulting', 'Strategy', 'Client services'],
    component: singleColumn({ headingStyle: 'boxed', headerAlign: 'center', headerVariant: 'ruled' }),
  },
  {
    id: 'corporate-formal',
    name: 'Corporate Formal',
    slug: 'corporate-formal',
    category: 'business',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'Plain headings, left aligned, no decoration. The conservative choice for regulated employers.',
    bestFor: ['Banking', 'Insurance', 'Legal operations'],
    component: singleColumn({ headingStyle: 'plain' }),
  },
  {
    id: 'finance-conservative',
    name: 'Finance Conservative',
    slug: 'finance-conservative',
    category: 'business',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'Ruled header and bar headings in near-black. Built for finance teams that still print packets.',
    bestFor: ['Accounting', 'FP&A', 'Audit'],
    settingsDefaults: { accentColor: '#1f2937' },
    component: singleColumn({ headingStyle: 'bar', headerVariant: 'ruled' }),
  },
  {
    id: 'operations-manager',
    name: 'Operations Manager',
    slug: 'operations-manager',
    category: 'business',
    layout: 'two-column',
    atsRating: 'good',
    isPremium: false,
    description:
      'Skills and certifications sit beside operations stories so metrics stay easy to find.',
    bestFor: ['Operations', 'Supply chain', 'Programme management'],
    component: twoColumn({
      rightSections: ['technical-skills', 'certifications', 'languages'],
      headingStyle: 'rule',
    }),
  },
  {
    id: 'leadership-banner',
    name: 'Leadership Banner',
    slug: 'leadership-banner',
    category: 'business',
    layout: 'sidebar-left',
    atsRating: 'good',
    isPremium: true,
    description:
      'Banner name block and a left skills rail. For leaders applying where a human will also read it.',
    bestFor: ['People leadership', 'GM tracks', 'Business operations'],
    settingsDefaults: { accentColor: '#312e81' },
    component: sidebar({
      sidebarSections: ['technical-skills', 'languages', 'certifications'],
      side: 'left',
      tinted: true,
      headingStyle: 'plain',
      headerVariant: 'banner',
    }),
  },
  {
    id: 'board-ready',
    name: 'Board Ready',
    slug: 'board-ready',
    category: 'business',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: true,
    description:
      'Centred banner and boxed headings. A quieter executive layout that still parses as one column.',
    bestFor: ['C-suite briefs', 'Board materials', 'Advisory roles'],
    settingsDefaults: { fontSize: 11, accentColor: '#111827' },
    component: singleColumn({ headingStyle: 'boxed', headerAlign: 'center', headerVariant: 'banner' }),
  },
  {
    id: 'mba-professional',
    name: 'MBA Professional',
    slug: 'mba-professional',
    category: 'business',
    layout: 'two-column',
    atsRating: 'good',
    isPremium: false,
    description:
      'Education and skills share a column so MBA coursework and internships stay visible.',
    bestFor: ['MBA internships', 'Rotational programmes', 'Strategy internships'],
    component: twoColumn({
      rightSections: ['education', 'technical-skills', 'languages'],
      headingStyle: 'bar',
      headerAlign: 'center',
    }),
  },

  // --- Student (7) ---------------------------------------------------------
  {
    id: 'campus-first',
    name: 'Campus First',
    slug: 'campus-first',
    category: 'student',
    layout: 'sidebar-left',
    atsRating: 'good',
    isPremium: false,
    description:
      'Education and coursework live in the sidebar so campus experience is not buried under internships.',
    bestFor: ['Students', 'Campus recruiting', 'Co-ops'],
    component: sidebar({
      sidebarSections: STUDENT_SIDE,
      side: 'left',
      headingStyle: 'rule',
    }),
  },
  {
    id: 'internship-ready',
    name: 'Internship Ready',
    slug: 'internship-ready',
    category: 'student',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'Single column with bar headings. The safest student layout for large internship portals.',
    bestFor: ['Internships', 'Summer programmes', 'First applications'],
    settingsDefaults: { accentColor: '#4f46e5' },
    component: singleColumn({ headingStyle: 'bar' }),
  },
  {
    id: 'education-first',
    name: 'Education First',
    slug: 'education-first',
    category: 'student',
    layout: 'two-column',
    atsRating: 'good',
    isPremium: false,
    description:
      'Education stays full-width; projects and skills sit beside internships.',
    bestFor: ['New graduates', 'Research assistants', 'Course-heavy profiles'],
    component: twoColumn({
      fullWidthSections: ['summary', 'education'],
      rightSections: ['projects', 'technical-skills', 'courses'],
      headingStyle: 'plain',
    }),
  },
  {
    id: 'fresher-compact',
    name: 'Fresher Compact',
    slug: 'fresher-compact',
    category: 'student',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'Centred header and boxed headings. Designed so projects and coursework can fill a first page honestly.',
    bestFor: ['Freshers', 'Entry-level', 'Campus placements'],
    component: singleColumn({ headingStyle: 'boxed', headerAlign: 'center' }),
  },
  {
    id: 'academic-simple',
    name: 'Academic Simple',
    slug: 'academic-simple',
    category: 'student',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'Ruled, print-friendly academic layout. Use when publications and coursework matter more than jobs.',
    bestFor: ['Research', 'Teaching assistants', 'Graduate school'],
    component: singleColumn({ headingStyle: 'rule', headerVariant: 'ruled' }),
  },
  {
    id: 'new-grad',
    name: 'New Grad',
    slug: 'new-grad',
    category: 'student',
    layout: 'sidebar-right',
    atsRating: 'good',
    isPremium: false,
    description:
      'Right rail for skills and courses. Main column keeps internships and projects in reading order.',
    bestFor: ['New graduates', 'Graduate schemes', 'Junior roles'],
    settingsDefaults: { accentColor: '#4338ca' },
    component: sidebar({
      sidebarSections: ['technical-skills', 'courses', 'languages'],
      side: 'right',
      tinted: true,
      headingStyle: 'bar',
    }),
  },
  {
    id: 'scholar-profile',
    name: 'Scholar Profile',
    slug: 'scholar-profile',
    category: 'student',
    layout: 'two-column',
    atsRating: 'good',
    isPremium: true,
    description:
      'Courses and languages sit beside research and awards. A quieter academic two-column.',
    bestFor: ['Scholarships', 'PhD applications', 'Academic internships'],
    component: twoColumn({
      fullWidthSections: ['summary', 'education'],
      rightSections: ['courses', 'languages', 'certifications'],
      headingStyle: 'rule',
      headerAlign: 'center',
    }),
  },

  // --- Creative (7) --------------------------------------------------------
  {
    id: 'sidebar-slate',
    name: 'Sidebar Slate',
    slug: 'sidebar-slate',
    category: 'creative',
    layout: 'sidebar-left',
    atsRating: 'good',
    isPremium: false,
    description:
      'A tinted left sidebar holds contact details and skills. Distinctive, and still text-only underneath.',
    bestFor: ['Product', 'Marketing', 'Smaller employers'],
    settingsDefaults: { accentColor: '#1f2937' },
    component: sidebar({
      sidebarSections: CREATIVE_SIDE,
      side: 'left',
      tinted: true,
    }),
  },
  {
    id: 'bold-header',
    name: 'Bold Header',
    slug: 'bold-header',
    category: 'creative',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: false,
    description:
      'A full-width banner name and boxed headings. More presence than Classic ATS without leaving one column.',
    bestFor: ['Marketing', 'Communications', 'Brand roles'],
    settingsDefaults: { accentColor: '#4f46e5' },
    component: singleColumn({ headingStyle: 'boxed', headerVariant: 'banner' }),
  },
  {
    id: 'modern-split',
    name: 'Modern Split',
    slug: 'modern-split',
    category: 'creative',
    layout: 'two-column',
    atsRating: 'good',
    isPremium: false,
    description:
      'Centred header, then a skills column beside the story. For teams that will open the PDF, not only parse it.',
    bestFor: ['Product marketing', 'Content', 'Community'],
    settingsDefaults: { accentColor: '#4f46e5' },
    component: twoColumn({
      rightSections: ['technical-skills', 'soft-skills', 'languages', 'interests'],
      headingStyle: 'bar',
      headerAlign: 'center',
    }),
  },
  {
    id: 'creative-banner',
    name: 'Creative Banner',
    slug: 'creative-banner',
    category: 'creative',
    layout: 'sidebar-right',
    atsRating: 'good',
    isPremium: true,
    description:
      'Banner header and a tinted right rail. Distinctive without images, tables or icons in the body.',
    bestFor: ['Design-adjacent roles', 'Studios', 'In-house creative'],
    settingsDefaults: { accentColor: '#6d28d9' },
    component: sidebar({
      sidebarSections: CREATIVE_SIDE,
      side: 'right',
      tinted: true,
      headingStyle: 'plain',
      headerVariant: 'banner',
    }),
  },
  {
    id: 'portfolio-sidebar',
    name: 'Portfolio Sidebar',
    slug: 'portfolio-sidebar',
    category: 'creative',
    layout: 'sidebar-left',
    atsRating: 'good',
    isPremium: false,
    description:
      'Projects and skills live in the left rail so a portfolio-minded resume still has a clear main story.',
    bestFor: ['UX-adjacent', 'Product design support', 'Creative operations'],
    component: sidebar({
      sidebarSections: ['projects', 'technical-skills', 'interests'],
      side: 'left',
      headingStyle: 'boxed',
      contactInSidebar: true,
    }),
  },
  {
    id: 'designer-right',
    name: 'Designer Right',
    slug: 'designer-right',
    category: 'creative',
    layout: 'sidebar-right',
    atsRating: 'good',
    isPremium: true,
    description:
      'Ruled headings and an untinted right sidebar. A quieter creative layout that still labels ATS as Good.',
    bestFor: ['Visual design support', 'Content design', 'Research ops'],
    settingsDefaults: { accentColor: '#0f172a' },
    component: sidebar({
      sidebarSections: ['technical-skills', 'languages', 'interests'],
      side: 'right',
      tinted: false,
      headingStyle: 'rule',
      headerAlign: 'center',
    }),
  },
  {
    id: 'editorial-column',
    name: 'Editorial Column',
    slug: 'editorial-column',
    category: 'creative',
    layout: 'two-column',
    atsRating: 'good',
    isPremium: false,
    description:
      'A magazine-like split with a ruled header. Written for editors, writers and communications leads.',
    bestFor: ['Editorial', 'Communications', 'Content strategy'],
    component: twoColumn({
      rightSections: ['soft-skills', 'languages', 'interests', 'certifications'],
      headingStyle: 'rule',
      headerVariant: 'ruled',
    }),
  },
];

export const TEMPLATE_BY_ID = new Map(TEMPLATES.map((template) => [template.id, template]));

export function templateById(id: string): TemplateDefinition {
  return TEMPLATE_BY_ID.get(id) ?? TEMPLATE_BY_ID.get(DEFAULT_TEMPLATE_ID)!;
}

export function templateBySlug(slug: string): TemplateDefinition | undefined {
  return TEMPLATES.find((template) => template.slug === slug);
}

export function templatesByCategory(category: TemplateCategory): TemplateDefinition[] {
  return TEMPLATES.filter((template) => template.category === category);
}
