/**
 * Canonical navigation and internal-linking map.
 *
 * Keeping every route in one place is what makes the internal linking between
 * templates, the builder, the checker, examples and the blog consistent.
 */

export interface NavLinkDef {
  label: string;
  to: string;
  description?: string;
}

export const productLinks: NavLinkDef[] = [
  {
    label: 'Resume Builder',
    to: '/resume-builder',
    description: 'Write, structure and preview an ATS-friendly resume.',
  },
  {
    label: 'ATS Resume Checker',
    to: '/ats-resume-checker',
    description: 'See how an applicant tracking system may read your resume.',
  },
  {
    label: 'Job Description Matcher',
    to: '/job-description-matcher',
    description: 'Compare your resume with a specific job posting.',
  },
  {
    label: 'Resume Templates',
    to: '/resume-templates',
    description: '44 templates, each labelled with its ATS compatibility.',
  },
];

export const resourceLinks: NavLinkDef[] = [
  { label: 'Resume Examples', to: '/resume-examples', description: 'Sample resumes by role.' },
  { label: 'Blog', to: '/blog', description: 'Guides on ATS, keywords and resume writing.' },
  { label: 'Pricing', to: '/pricing', description: 'Free and Pro plans.' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

/** Same destinations on the public site and the workspace, so signed-in users are not stuck in one bar. */
export const workspaceNav: NavLinkDef[] = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Resumes', to: '/resumes' },
  { label: 'Templates', to: '/resume-templates' },
  { label: 'ATS', to: '/ats-resume-checker' },
  { label: 'Jobs', to: '/jobs' },
];

export const headerNav: Array<
  { label: string; to: string } | { label: string; items: NavLinkDef[] }
> = [
  { label: 'Product', items: productLinks },
  { label: 'Templates', to: '/resume-templates' },
  { label: 'ATS Checker', to: '/ats-resume-checker' },
  { label: 'Resume Examples', to: '/resume-examples' },
  { label: 'Resources', items: resourceLinks },
  { label: 'Pricing', to: '/pricing' },
];

export const footerColumns: Array<{ title: string; links: NavLinkDef[] }> = [
  {
    title: 'Product',
    links: [
      { label: 'Resume Builder', to: '/resume-builder' },
      { label: 'Free Resume Builder', to: '/free-resume-builder' },
      { label: 'Resume Templates', to: '/resume-templates' },
      { label: 'ATS Resume Template', to: '/ats-resume-template' },
      { label: 'Pricing', to: '/pricing' },
    ],
  },
  {
    title: 'Optimise',
    links: [
      { label: 'ATS Resume Checker', to: '/ats-resume-checker' },
      { label: 'Resume Checker', to: '/resume-checker' },
      { label: 'Job Description Matcher', to: '/job-description-matcher' },
    ],
  },
  {
    title: 'Examples',
    links: [
      { label: 'Software Engineer', to: '/resume-examples/software-engineer' },
      { label: 'Frontend Developer', to: '/resume-examples/frontend-developer' },
      { label: 'Data Scientist', to: '/resume-examples/data-scientist' },
      { label: 'Product Manager', to: '/resume-examples/product-manager' },
      { label: 'Fresher', to: '/resume-examples/fresher' },
      { label: 'All examples', to: '/resume-examples' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Blog', to: '/blog' },
      { label: 'How ATS screening works', to: '/blog/how-ats-resume-screening-works' },
      { label: 'Resume keywords', to: '/blog/resume-keywords-how-to-use-them' },
      { label: 'Resume bullet points', to: '/blog/how-to-write-resume-bullet-points' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
      { label: 'Cookies', to: '/cookies' },
    ],
  },
];

/** Roles that get a dedicated `/resume-examples/:slug` page. */
export const exampleRoles = [
  'software-engineer',
  'frontend-developer',
  'backend-developer',
  'full-stack-developer',
  'data-scientist',
  'data-analyst',
  'product-manager',
  'project-manager',
  'ui-ux-designer',
  'marketing-manager',
  'accountant',
  'business-analyst',
  'cyber-security',
  'devops-engineer',
  'cloud-engineer',
  'student',
  'fresher',
  'internship',
  'teacher',
  'nurse',
  'mechanical-engineer',
  'electrical-engineer',
  'civil-engineer',
  'doctor',
] as const;

export type ExampleRoleSlug = (typeof exampleRoles)[number];
