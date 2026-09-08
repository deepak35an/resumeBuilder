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
    component: singleColumn({ headingStyle: 'underline-accent' }),
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
      'The same parse-safe stack as Classic ATS, with inline-rule headings and refined spacing for a modern feel.',
    bestFor: ['Corporate roles', 'Finance', 'Consulting'],
    component: singleColumn({ headingStyle: 'inline-rule' }),
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
      'Gradient-bar headings with a subtle colour wash. Modern presence while staying fully parseable.',
    bestFor: ['Any role', 'Tech and product', 'Design-aware employers'],
    settingsDefaults: { accentColor: '#4f46e5' },
    component: singleColumn({ headingStyle: 'gradient-bar' }),
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
      'A centred name and contact line above a traditional single column with dot-accent headings.',
    bestFor: ['Academia', 'Public sector', 'Printed applications'],
    component: singleColumn({ headingStyle: 'dot-accent', headerAlign: 'center', headerVariant: 'ruled' }),
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
      'Minimal chrome with an accent-top header and underline-accent headings. Clean, modern, professional.',
    bestFor: ['Early career', 'Career changes', 'Straightforward roles'],
    settingsDefaults: { accentColor: '#0f766e' },
    component: singleColumn({ headingStyle: 'underline-accent', headerVariant: 'accent-top' }),
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
      'Tighter type and gradient-bar headings for experienced candidates who need more history on one page.',
    bestFor: ['Senior IC roles', 'Longer work history', 'Dense skill lists'],
    settingsDefaults: { fontSize: 10, sectionSpacing: 0.85, accentColor: '#1e3a5f' },
    component: singleColumn({ headingStyle: 'gradient-bar' }),
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
      'A centred ruled header and inline-rule headings with a quiet accent line. Minimal yet striking.',
    bestFor: ['Any role', 'Online applications', 'Template-averse employers'],
    settingsDefaults: { accentColor: '#111827' },
    component: singleColumn({ headingStyle: 'inline-rule', headerAlign: 'center', headerVariant: 'ruled' }),
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
      'Summary across the top, then experience beside a skills and certifications column with gradient-bar headings.',
    bestFor: ['Engineering', 'Data', 'IT operations'],
    settingsDefaults: { accentColor: '#0f766e' },
    component: twoColumn({
      rightSections: ['technical-skills', 'certifications', 'languages', 'courses'],
      headingStyle: 'gradient-bar',
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
      'Dot-accent headings and a skills-first right column. Built for roles that screen on languages and tools first.',
    bestFor: ['Backend', 'Platform', 'SRE'],
    settingsDefaults: { accentColor: '#0f766e' },
    component: twoColumn({
      rightSections: ['technical-skills', 'projects', 'certifications'],
      headingStyle: 'dot-accent',
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
      'Single-column engineering resume with pill headings. Safer than a split layout when the ATS is unknown.',
    bestFor: ['Software engineering', 'QA', 'Support engineering'],
    settingsDefaults: { accentColor: '#1e3a5f' },
    component: singleColumn({ headingStyle: 'pill' }),
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
      'Dark left sidebar for skills, certs and languages. Main column keeps the systems work visible.',
    bestFor: ['Systems', 'Infrastructure', 'Networking'],
    settingsDefaults: { accentColor: '#1e3a5f' },
    component: sidebar({
      sidebarSections: ['technical-skills', 'certifications', 'languages'],
      side: 'left',
      dark: true,
      headingStyle: 'underline-accent',
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
      headingStyle: 'underline-accent',
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
      'Experience on the left, a dark-tinted skills sidebar on the right. Reads as product-minded without losing the stack.',
    bestFor: ['Full-stack', 'Product engineering', 'Startups'],
    settingsDefaults: { accentColor: '#4338ca' },
    component: sidebar({
      sidebarSections: SKILLS_SIDE,
      side: 'right',
      darkTinted: true,
      headingStyle: 'dot-accent',
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
      headingStyle: 'gradient-bar',
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
      'Dark left rail for certifications and skills. Dark-full header for a commanding senior presentation.',
    bestFor: ['Cloud', 'Architecture', 'Solutions engineering'],
    settingsDefaults: { accentColor: '#1d4ed8' },
    component: sidebar({
      sidebarSections: ['certifications', 'technical-skills', 'languages'],
      side: 'left',
      dark: true,
      headingStyle: 'underline-accent',
      headerVariant: 'dark-full',
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
      'Inline-rule headings and a certifications column. Built for API, data and service-ownership stories.',
    bestFor: ['Backend', 'API', 'Data engineering'],
    component: twoColumn({
      rightSections: ['technical-skills', 'certifications', 'languages'],
      headingStyle: 'inline-rule',
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
      'Centred accent-top header and pill headings. Still a single column so design-aware teams and parsers both cope.',
    bestFor: ['Frontend', 'Design systems', 'Web'],
    settingsDefaults: { accentColor: '#4f46e5' },
    component: singleColumn({ headingStyle: 'pill', headerAlign: 'center', headerVariant: 'accent-top' }),
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
      'Dark right sidebar for certs and skills. Conservative type for security, risk and compliance screens.',
    bestFor: ['Security', 'GRC', 'SOC'],
    settingsDefaults: { accentColor: '#111827' },
    component: sidebar({
      sidebarSections: ['certifications', 'technical-skills', 'courses'],
      side: 'right',
      dark: true,
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
      headingStyle: 'dot-accent',
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
      'Dark-full header and underline-accent headings. Written for directors who still have to pass an ATS first.',
    bestFor: ['Directors', 'Heads of function', 'General management'],
    settingsDefaults: { accentColor: '#111827', fontSize: 11 },
    component: singleColumn({ headingStyle: 'underline-accent', headerVariant: 'dark-full' }),
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
      'Centred ruled header and inline-rule headings. Familiar to consulting and professional-services screens.',
    bestFor: ['Consulting', 'Strategy', 'Client services'],
    component: singleColumn({ headingStyle: 'inline-rule', headerAlign: 'center', headerVariant: 'ruled' }),
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
      'Gradient-bar headings with accent-top header. The refined choice for regulated employers.',
    bestFor: ['Banking', 'Insurance', 'Legal operations'],
    settingsDefaults: { accentColor: '#1e3a5f' },
    component: singleColumn({ headingStyle: 'gradient-bar', headerVariant: 'accent-top' }),
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
      'Ruled header and underline-accent headings in near-black. Built for finance teams that still print packets.',
    bestFor: ['Accounting', 'FP&A', 'Audit'],
    settingsDefaults: { accentColor: '#1f2937' },
    component: singleColumn({ headingStyle: 'underline-accent', headerVariant: 'ruled' }),
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
      'Skills and certifications sit beside operations stories with dot-accent headings for easy scanning.',
    bestFor: ['Operations', 'Supply chain', 'Programme management'],
    component: twoColumn({
      rightSections: ['technical-skills', 'certifications', 'languages'],
      headingStyle: 'dot-accent',
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
      'Dark-full header and a dark left skills rail. For leaders applying where a human will also read it.',
    bestFor: ['People leadership', 'GM tracks', 'Business operations'],
    settingsDefaults: { accentColor: '#312e81' },
    component: sidebar({
      sidebarSections: ['technical-skills', 'languages', 'certifications'],
      side: 'left',
      dark: true,
      headingStyle: 'underline-accent',
      headerVariant: 'dark-full',
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
      'Centred accent-top header and pill headings. A modern executive layout that still parses as one column.',
    bestFor: ['C-suite briefs', 'Board materials', 'Advisory roles'],
    settingsDefaults: { fontSize: 11, accentColor: '#111827' },
    component: singleColumn({ headingStyle: 'pill', headerAlign: 'center', headerVariant: 'accent-top' }),
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
      headingStyle: 'gradient-bar',
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
      'Education and coursework live in a tinted sidebar so campus experience is not buried under internships.',
    bestFor: ['Students', 'Campus recruiting', 'Co-ops'],
    component: sidebar({
      sidebarSections: STUDENT_SIDE,
      side: 'left',
      tinted: true,
      headingStyle: 'underline-accent',
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
      'Single column with gradient-bar headings and accent-top stripe. Eye-catching for large internship portals.',
    bestFor: ['Internships', 'Summer programmes', 'First applications'],
    settingsDefaults: { accentColor: '#4f46e5' },
    component: singleColumn({ headingStyle: 'gradient-bar', headerVariant: 'accent-top' }),
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
      'Education stays full-width; projects and skills sit beside internships with dot-accent headings.',
    bestFor: ['New graduates', 'Research assistants', 'Course-heavy profiles'],
    component: twoColumn({
      fullWidthSections: ['summary', 'education'],
      rightSections: ['projects', 'technical-skills', 'courses'],
      headingStyle: 'dot-accent',
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
      'Centred header and pill headings. Designed so projects and coursework can fill a first page honestly.',
    bestFor: ['Freshers', 'Entry-level', 'Campus placements'],
    settingsDefaults: { accentColor: '#6d28d9' },
    component: singleColumn({ headingStyle: 'pill', headerAlign: 'center' }),
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
      'Dark-tinted right rail for skills and courses. Main column keeps internships and projects in reading order.',
    bestFor: ['New graduates', 'Graduate schemes', 'Junior roles'],
    settingsDefaults: { accentColor: '#4338ca' },
    component: sidebar({
      sidebarSections: ['technical-skills', 'courses', 'languages'],
      side: 'right',
      darkTinted: true,
      headingStyle: 'underline-accent',
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
      'Courses and languages sit beside research and awards with inline-rule headings. A refined academic two-column.',
    bestFor: ['Scholarships', 'PhD applications', 'Academic internships'],
    component: twoColumn({
      fullWidthSections: ['summary', 'education'],
      rightSections: ['courses', 'languages', 'certifications'],
      headingStyle: 'inline-rule',
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
      'A bold dark left sidebar holds contact details and skills. Distinctive and modern, still text-only underneath.',
    bestFor: ['Product', 'Marketing', 'Smaller employers'],
    settingsDefaults: { accentColor: '#1f2937' },
    component: sidebar({
      sidebarSections: CREATIVE_SIDE,
      side: 'left',
      dark: true,
      headingStyle: 'underline-accent',
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
      'A commanding dark-full header and pill headings. More presence than Classic ATS without leaving one column.',
    bestFor: ['Marketing', 'Communications', 'Brand roles'],
    settingsDefaults: { accentColor: '#4f46e5' },
    component: singleColumn({ headingStyle: 'pill', headerVariant: 'dark-full' }),
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
      'Split header with a dark name panel, then a skills column beside the story with gradient-bar headings.',
    bestFor: ['Product marketing', 'Content', 'Community'],
    settingsDefaults: { accentColor: '#4f46e5' },
    component: twoColumn({
      rightSections: ['technical-skills', 'soft-skills', 'languages', 'interests'],
      headingStyle: 'gradient-bar',
      headerVariant: 'split',
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
      'Dark-full header and a dark right rail. Distinctive without images, tables or icons in the body.',
    bestFor: ['Design-adjacent roles', 'Studios', 'In-house creative'],
    settingsDefaults: { accentColor: '#6d28d9' },
    component: sidebar({
      sidebarSections: CREATIVE_SIDE,
      side: 'right',
      dark: true,
      headingStyle: 'dot-accent',
      headerVariant: 'dark-full',
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
      'Projects and skills live in the dark-tinted left rail so a portfolio-minded resume still has a clear main story.',
    bestFor: ['UX-adjacent', 'Product design support', 'Creative operations'],
    settingsDefaults: { accentColor: '#0f172a' },
    component: sidebar({
      sidebarSections: ['projects', 'technical-skills', 'interests'],
      side: 'left',
      darkTinted: true,
      headingStyle: 'underline-accent',
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
      'Inline-rule headings and a tinted right sidebar. A quieter creative layout that still labels ATS as Good.',
    bestFor: ['Visual design support', 'Content design', 'Research ops'],
    settingsDefaults: { accentColor: '#0f172a' },
    component: sidebar({
      sidebarSections: ['technical-skills', 'languages', 'interests'],
      side: 'right',
      tinted: true,
      headingStyle: 'inline-rule',
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
      'A magazine-like split with underline-accent headings. Written for editors, writers and communications leads.',
    bestFor: ['Editorial', 'Communications', 'Content strategy'],
    component: twoColumn({
      rightSections: ['soft-skills', 'languages', 'interests', 'certifications'],
      headingStyle: 'underline-accent',
      headerVariant: 'ruled',
    }),
  },

  // --- NEW PREMIUM TEMPLATES (4) -------------------------------------------
  {
    id: 'executive-dark',
    name: 'Executive Dark',
    slug: 'executive-dark',
    category: 'business',
    layout: 'sidebar-left',
    atsRating: 'good',
    isPremium: true,
    description:
      'A commanding dark sidebar with underline-accent headings and a professional navy palette. Built for senior leaders who want maximum visual impact.',
    bestFor: ['VP and above', 'Board presentations', 'Senior leadership'],
    settingsDefaults: { accentColor: '#1e293b', fontSize: 11 },
    component: sidebar({
      sidebarSections: ['technical-skills', 'certifications', 'languages', 'interests'],
      side: 'left',
      dark: true,
      headingStyle: 'underline-accent',
      sidebarWidth: '34%',
    }),
  },
  {
    id: 'modern-split-header',
    name: 'Modern Split Header',
    slug: 'modern-split-header',
    category: 'creative',
    layout: 'split-header',
    atsRating: 'good',
    isPremium: true,
    description:
      'Two-tone split header — dark left with your name, light right with contact details — and pill headings below. The showstopper template.',
    bestFor: ['Startups', 'Creative agencies', 'Product roles'],
    settingsDefaults: { accentColor: '#1e3a5f' },
    component: singleColumn({ headingStyle: 'pill', headerVariant: 'split' }),
  },
  {
    id: 'two-tone-professional',
    name: 'Two-Tone Professional',
    slug: 'two-tone-professional',
    category: 'tech',
    layout: 'sidebar-right',
    atsRating: 'good',
    isPremium: true,
    description:
      'Dark right sidebar for skills and certifications with dot-accent headings. Split header gives a premium two-tone look.',
    bestFor: ['Tech leads', 'Staff engineers', 'Senior developers'],
    settingsDefaults: { accentColor: '#0f172a' },
    component: sidebar({
      sidebarSections: ['technical-skills', 'certifications', 'languages', 'courses'],
      side: 'right',
      dark: true,
      headingStyle: 'dot-accent',
      headerVariant: 'split',
    }),
  },
  {
    id: 'minimal-elegant',
    name: 'Minimal Elegant',
    slug: 'minimal-elegant',
    category: 'creative',
    layout: 'single-column',
    atsRating: 'excellent',
    isPremium: true,
    description:
      'Dark-full header, inline-rule headings, elegant typography. A serif-inspired single column that makes a quiet statement.',
    bestFor: ['Editorial', 'Luxury brands', 'Publishing', 'PR'],
    settingsDefaults: { accentColor: '#1a1a2e', fontSize: 11 },
    component: singleColumn({ headingStyle: 'inline-rule', headerVariant: 'dark-full' }),
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
