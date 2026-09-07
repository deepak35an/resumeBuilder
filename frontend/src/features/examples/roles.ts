import { exampleRoles, type ExampleRoleSlug } from '@/components/layout/navigation';
import { sampleResumeData } from '@/features/resume/sampleData';
import { createId } from '@/lib/utils';
import type { ResumeData } from '@/types/resume';

export interface ExampleRole {
  slug: ExampleRoleSlug;
  title: string;
  headline: string;
  excerpt: string;
  recommendedTemplates: string[];
  atsTips: string[];
  faqs: Array<{ question: string; answer: string }>;
  sampleTitle: string;
  sampleCompany: string;
  skills: string[];
}

const ROLE_META: Record<ExampleRoleSlug, Omit<ExampleRole, 'slug'>> = {
  'software-engineer': {
    title: 'Software Engineer',
    headline: 'A parse-safe software engineer resume that leads with shipped systems, not a skill cloud.',
    excerpt: 'Example structure for backend, product and platform engineering roles.',
    recommendedTemplates: ['classic-ats', 'tech-skills-forward', 'engineer-compact'],
    sampleTitle: 'Software Engineer',
    sampleCompany: 'Harborline Systems',
    skills: ['TypeScript', 'React', 'PostgreSQL', 'AWS'],
    atsTips: [
      'Use the job title from the posting when it honestly matches your work.',
      'Put languages and tools in a labelled skills section, not only inside bullets.',
      'Quantify reliability, latency or adoption — parsers and humans both look for numbers.',
    ],
    faqs: [
      {
        question: 'Should a software engineer resume be one page?',
        answer:
          'One page is enough for most candidates with under ten years of experience. Two pages are fine when every bullet is a concrete result.',
      },
      {
        question: 'Do two-column tech templates hurt ATS scores?',
        answer:
          'Some older parsers read columns out of order. Skills Forward is labelled Good, not Excellent. Use Classic ATS when you do not know the employer’s system.',
      },
    ],
  },
  'frontend-developer': {
    title: 'Frontend Developer',
    headline: 'Show interface work through performance, accessibility and shipped design systems.',
    excerpt: 'How to present React, CSS and design-system experience without a graphic resume.',
    recommendedTemplates: ['frontend-modern', 'classic-ats', 'modern-ats'],
    sampleTitle: 'Frontend Developer',
    sampleCompany: 'Northlight Studio',
    skills: ['React', 'TypeScript', 'CSS', 'Accessibility'],
    atsTips: [
      'Name the libraries you actually shipped, not every tool you have opened.',
      'Mention accessibility and performance with a metric when you have one.',
      'Keep the layout single-column for large product companies.',
    ],
    faqs: [
      {
        question: 'Can I use a colourful template as a frontend developer?',
        answer:
          'You can, but colour in the chrome does not replace shipped work. Frontend Modern stays single-column so a parser still sees your sections.',
      },
      {
        question: 'Where should I put a portfolio link?',
        answer: 'In the contact block as a labelled URL. Do not replace experience bullets with “see portfolio”.',
      },
    ],
  },
  'backend-developer': {
    title: 'Backend Developer',
    headline: 'Lead with services you owned, data you protected and incidents you shortened.',
    excerpt: 'A backend-focused sample with APIs, datastores and reliability work.',
    recommendedTemplates: ['backend-column', 'classic-ats', 'engineer-compact'],
    sampleTitle: 'Backend Developer',
    sampleCompany: 'Cedar & Pine',
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
    atsTips: [
      'Name the databases and queues you operated, not only the language.',
      'Reliability and cost savings parse better than “worked on microservices”.',
      'Certifications belong in their own section so they are not lost in a summary.',
    ],
    faqs: [
      {
        question: 'How many technologies should I list?',
        answer:
          'List the ones you could defend in an interview. A short, honest skills section ranks better than a padded cloud.',
      },
      {
        question: 'Should I include system-design projects?',
        answer: 'Yes, if you built them. Put them under Projects with a one-line problem and a result.',
      },
    ],
  },
  'full-stack-developer': {
    title: 'Full Stack Developer',
    headline: 'Balance product UI and service ownership so neither side looks like a footnote.',
    excerpt: 'Sample full-stack resume with client, API and delivery evidence.',
    recommendedTemplates: ['full-stack', 'tech-skills-forward', 'classic-ats'],
    sampleTitle: 'Full Stack Developer',
    sampleCompany: 'Fieldnote',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    atsTips: [
      'Group skills into Languages, Frontend and Backend so a parser can extract them.',
      'Each bullet should say which layer you changed and what improved.',
      'Avoid “full stack developer” as the only title if the posting says “software engineer”.',
    ],
    faqs: [
      {
        question: 'Is a sidebar template safe for full-stack roles?',
        answer:
          'Full Stack is labelled ATS Compatibility: Good. If the posting goes through a large ATS, prefer Classic ATS.',
      },
      {
        question: 'How do I show both frontend and backend work?',
        answer: 'Interleave them by impact, or group bullets under the same job with the layer named in the first words.',
      },
    ],
  },
  'data-scientist': {
    title: 'Data Scientist',
    headline: 'Lead with decisions your models changed, not only the models you trained.',
    excerpt: 'A data science sample that puts impact ahead of tool lists.',
    recommendedTemplates: ['data-focused', 'classic-ats', 'academic-simple'],
    sampleTitle: 'Data Scientist',
    sampleCompany: 'Lumen Analytics',
    skills: ['Python', 'SQL', 'Pandas', 'scikit-learn'],
    atsTips: [
      'Name the business metric that moved, then the method.',
      'Put Python, SQL and the core libraries in a labelled skills section.',
      'Publications belong in their own section if you have them.',
    ],
    faqs: [
      {
        question: 'Do I need a publications section?',
        answer: 'Only if you have publications. Empty sections hurt completeness and look unfinished.',
      },
      {
        question: 'Should I include Kaggle rankings?',
        answer: 'Only when they are recent and relevant. A shipped internal model usually matters more.',
      },
    ],
  },
  'data-analyst': {
    title: 'Data Analyst',
    headline: 'Show the questions you answered and the decisions those answers changed.',
    excerpt: 'Analyst sample with SQL, dashboards and stakeholder work.',
    recommendedTemplates: ['data-focused', 'classic-professional', 'ats-standard'],
    sampleTitle: 'Data Analyst',
    sampleCompany: 'Harborline Systems',
    skills: ['SQL', 'Python', 'Tableau', 'Excel'],
    atsTips: [
      'SQL belongs in skills and in bullets where you actually used it.',
      'Name the audience for each dashboard — recruiters look for stakeholders.',
      'Avoid screenshot-only resumes; parsers cannot read images.',
    ],
    faqs: [
      {
        question: 'Is Excel still worth listing?',
        answer: 'Yes, if the posting mentions it. Pair it with SQL so you do not look limited to spreadsheets.',
      },
      {
        question: 'How do I write dashboard bullets?',
        answer: 'Say who used the dashboard and what decision it supported, not only that you “built dashboards”.',
      },
    ],
  },
  'product-manager': {
    title: 'Product Manager',
    headline: 'Write outcomes, scope and the teams you aligned — not a list of ceremonies.',
    excerpt: 'Product manager sample focused on shipped bets and measurable results.',
    recommendedTemplates: ['classic-professional', 'executive-brief', 'modern-ats'],
    sampleTitle: 'Product Manager',
    sampleCompany: 'Northwind Commerce',
    skills: ['Roadmapping', 'Discovery', 'SQL', 'Experimentation'],
    atsTips: [
      'Match the posting’s domain words when they are honest: checkout, onboarding, billing.',
      'Avoid jargon-only bullets (“ran scrum”). Say what shipped.',
      'A short skills section of methods is enough; do not invent a tech stack you did not use.',
    ],
    faqs: [
      {
        question: 'Should PMs use a tech template?',
        answer:
          'Only if the role is technical PM and your stack is real. Classic Professional is the safer default.',
      },
      {
        question: 'How many products should I list?',
        answer: 'Two or three recent products with outcomes beat a catalogue of every feature.',
      },
    ],
  },
  'project-manager': {
    title: 'Project Manager',
    headline: 'Scope, schedule, risk and delivery — written as results, not process theatre.',
    excerpt: 'Project manager sample for delivery, operations and client programmes.',
    recommendedTemplates: ['corporate-formal', 'operations-manager', 'classic-ats'],
    sampleTitle: 'Project Manager',
    sampleCompany: 'Brightline Projects',
    skills: ['Delivery', 'Risk management', 'Stakeholder management', 'Budgeting'],
    atsTips: [
      'Name budget, timeline and team size when you owned them.',
      'Certifications such as PMP belong in their own section.',
      'Use the posting’s industry words when they match your programmes.',
    ],
    faqs: [
      {
        question: 'Do I need a PMP to apply?',
        answer: 'Only if the posting requires it. Listing it when you have it helps keyword match; inventing it does not.',
      },
      {
        question: 'How do I show Agile experience?',
        answer: 'Describe a delivery outcome. “Shipped X on a four-week cadence” is stronger than “used Jira”.',
      },
    ],
  },
  'ui-ux-designer': {
    title: 'UI/UX Designer',
    headline: 'A text-first design resume plus a portfolio link — parsers cannot read case-study images.',
    excerpt: 'How to present design work without a graphic, unparseable layout.',
    recommendedTemplates: ['bold-header', 'classic-ats', 'modern-split'],
    sampleTitle: 'Product Designer',
    sampleCompany: 'Fieldnote',
    skills: ['User research', 'Figma', 'Prototyping', 'Design systems'],
    atsTips: [
      'Put the portfolio URL in the contact line.',
      'Describe research and outcome in text; do not rely on screenshots in the PDF.',
      'Use Classic ATS when applying through a large corporate portal.',
    ],
    faqs: [
      {
        question: 'Will a creative template hurt my ATS score?',
        answer:
          'Sidebar and split layouts are labelled Good. They can still parse, but Classic ATS is safer for unknown systems.',
      },
      {
        question: 'Should I list Figma as a skill?',
        answer: 'Yes if you use it daily. Pair it with research and outcome bullets so it is not the whole story.',
      },
    ],
  },
  'marketing-manager': {
    title: 'Marketing Manager',
    headline: 'Channel, audience and result — written so both a parser and a hiring manager can find them.',
    excerpt: 'Marketing sample with campaigns, conversion and ownership.',
    recommendedTemplates: ['bold-header', 'classic-professional', 'editorial-column'],
    sampleTitle: 'Marketing Manager',
    sampleCompany: 'Northlight Studio',
    skills: ['Campaigns', 'Lifecycle', 'Analytics', 'Content'],
    atsTips: [
      'Name the channel and the metric: email conversion, paid CAC, organic traffic.',
      'Avoid embedding charts; write the number in the bullet.',
      'Match product or industry terms from the posting when they are honest.',
    ],
    faqs: [
      {
        question: 'Can marketing resumes be more visual?',
        answer:
          'The export is still text. Bold Header adds presence without columns a parser might scramble.',
      },
      {
        question: 'Should I include every campaign?',
        answer: 'No. Three campaigns with a clear metric beat a long list of activities.',
      },
    ],
  },
  accountant: {
    title: 'Accountant',
    headline: 'A conservative, single-column accountant resume that keeps systems and close work readable.',
    excerpt: 'Accounting sample for audit, FP&A-adjacent and general ledger roles.',
    recommendedTemplates: ['finance-conservative', 'corporate-formal', 'classic-ats'],
    sampleTitle: 'Accountant',
    sampleCompany: 'Hale & Rowan LLP',
    skills: ['GAAP', 'Month-end close', 'Excel', 'ERP'],
    atsTips: [
      'Name the ERP you used. Parsers look for it.',
      'Close cycle time and audit findings are useful numbers.',
      'Keep the layout conservative — finance screens still print.',
    ],
    faqs: [
      {
        question: 'Should I list Excel functions?',
        answer: 'List Excel, and mention modelling or reconciliations in bullets. A function list is rarely useful.',
      },
      {
        question: 'Do certifications belong at the top?',
        answer: 'CPA or equivalent can sit next to your name or in Certifications. Do not hide them in a summary paragraph.',
      },
    ],
  },
  'business-analyst': {
    title: 'Business Analyst',
    headline: 'Requirements, stakeholders and the process you actually changed.',
    excerpt: 'Business analyst sample with discovery, documentation and delivery support.',
    recommendedTemplates: ['consulting-clean', 'classic-professional', 'ats-standard'],
    sampleTitle: 'Business Analyst',
    sampleCompany: 'Brightline Projects',
    skills: ['Requirements', 'Process mapping', 'SQL', 'Stakeholder workshops'],
    atsTips: [
      'Name the systems you analysed (CRM, billing, claims).',
      'SQL belongs in skills if you query data yourself.',
      'Avoid “liaised with stakeholders” with no outcome.',
    ],
    faqs: [
      {
        question: 'Is SQL required on a BA resume?',
        answer: 'Only if you use it. If the posting asks for SQL and you have it, put it in skills and in a bullet.',
      },
      {
        question: 'How do I show Agile BA work?',
        answer: 'Describe a backlog or process you clarified and what that unblocked.',
      },
    ],
  },
  'cyber-security': {
    title: 'Cyber Security',
    headline: 'Controls, detections and incidents — written without leaking internal detail.',
    excerpt: 'Security sample for analyst and engineer applications.',
    recommendedTemplates: ['security-analyst', 'classic-ats', 'engineer-compact'],
    sampleTitle: 'Security Analyst',
    sampleCompany: 'Harborline Systems',
    skills: ['SIEM', 'Incident response', 'Threat hunting', 'NIST'],
    atsTips: [
      'Name frameworks from the posting only when you used them.',
      'Certifications such as Security+ belong in their own section.',
      'Do not include internal tool names that are confidential.',
    ],
    faqs: [
      {
        question: 'Can I list unpublished vulnerabilities?',
        answer: 'No. Describe the class of work and the outcome without exposing employer systems.',
      },
      {
        question: 'Should I use a sidebar template?',
        answer: 'Security Analyst is labelled Good. Classic ATS is safer for government and large-bank portals.',
      },
    ],
  },
  'devops-engineer': {
    title: 'DevOps Engineer',
    headline: 'Pipelines, reliability and the toil you removed — with tools in a labelled section.',
    excerpt: 'DevOps sample focused on delivery speed and incident reduction.',
    recommendedTemplates: ['devops-split', 'platform-engineer', 'classic-ats'],
    sampleTitle: 'DevOps Engineer',
    sampleCompany: 'Cedar & Pine',
    skills: ['CI/CD', 'Terraform', 'Kubernetes', 'AWS'],
    atsTips: [
      'Put Terraform, Kubernetes and the cloud in skills so they extract cleanly.',
      'Lead bullets with deploy frequency, failed-deploy rate or recovery time.',
      'Avoid logo walls; parsers do not read icons.',
    ],
    faqs: [
      {
        question: 'Is DevOps Split safe for ATS?',
        answer: 'It is labelled Good. Use Classic ATS when applying through a Workday-style portal you have not seen before.',
      },
      {
        question: 'Should I list every cloud service?',
        answer: 'List the ones you operated. A short, honest list beats a catalogue of unused products.',
      },
    ],
  },
  'cloud-engineer': {
    title: 'Cloud Engineer',
    headline: 'Architecture, cost and reliability on a named cloud — not a list of unused services.',
    excerpt: 'Cloud engineer sample with infrastructure and operations evidence.',
    recommendedTemplates: ['cloud-architect', 'systems-engineer', 'classic-ats'],
    sampleTitle: 'Cloud Engineer',
    sampleCompany: 'Lumen Analytics',
    skills: ['AWS', 'Terraform', 'Networking', 'Observability'],
    atsTips: [
      'Name the cloud the posting uses when that is your experience.',
      'Cost reduction and availability numbers parse well.',
      'Certifications should have dates and the exact credential name.',
    ],
    faqs: [
      {
        question: 'Do I need every associate certification?',
        answer: 'No. The ones that match the job, with dates, are enough.',
      },
      {
        question: 'How do I show multi-account work?',
        answer: 'Describe the problem (isolation, billing, blast radius) and what you changed. Skip internal account IDs.',
      },
    ],
  },
  student: {
    title: 'Student',
    headline: 'Coursework, projects and campus work presented as evidence, not as a gap to hide.',
    excerpt: 'Student sample that leads with projects when internships are thin.',
    recommendedTemplates: ['campus-first', 'internship-ready', 'education-first'],
    sampleTitle: 'Computer Science Student',
    sampleCompany: 'University of Texas at Austin',
    skills: ['Python', 'Java', 'Data structures', 'Git'],
    atsTips: [
      'Projects with a result beat a long coursework list.',
      'Use Internship Ready (single column) for large campus portals.',
      'A summary is optional; a clear education block is not.',
    ],
    faqs: [
      {
        question: 'What if I have no internships?',
        answer:
          'Lead with projects, research, teaching assistant work or campus jobs. Do not invent internships.',
      },
      {
        question: 'Should I include GPA?',
        answer: 'Only if it helps. We never require it. Leave it off when it does not strengthen the application.',
      },
    ],
  },
  fresher: {
    title: 'Fresher',
    headline: 'A first-job resume that treats projects and internships as real work.',
    excerpt: 'Fresher sample for campus placements and entry-level software roles.',
    recommendedTemplates: ['fresher-compact', 'internship-ready', 'classic-ats'],
    sampleTitle: 'Graduate Software Engineer',
    sampleCompany: 'Campus placement — fictional',
    skills: ['Java', 'SQL', 'HTML', 'Git'],
    atsTips: [
      'Match the posting’s language names when you used them in projects.',
      'One honest internship beats three vague “academic projects”.',
      'Keep the file a real PDF with selectable text.',
    ],
    faqs: [
      {
        question: 'Can I apply with only academic projects?',
        answer: 'Yes. Write what you built, what was hard, and what you would do differently. Avoid copied tutorial text.',
      },
      {
        question: 'Should I use a creative template as a fresher?',
        answer: 'Fresher Compact stays single-column. That is the safer default for placement portals.',
      },
    ],
  },
  internship: {
    title: 'Internship',
    headline: 'A one-page internship resume: education, two projects, and the tools you actually used.',
    excerpt: 'Internship sample aimed at summer and co-op postings.',
    recommendedTemplates: ['internship-ready', 'campus-first', 'classic-ats'],
    sampleTitle: 'Software Engineering Intern',
    sampleCompany: 'Fieldnote',
    skills: ['Python', 'React', 'SQL', 'Git'],
    atsTips: [
      'Use the internship title from the posting when it matches.',
      'Campus portals often parse poorly — stay single-column.',
      'Availability dates can sit in a short summary, not in the filename only.',
    ],
    faqs: [
      {
        question: 'How long should an internship resume be?',
        answer: 'One page. If you need two, you are listing coursework that does not help.',
      },
      {
        question: 'Should I include high school?',
        answer: 'Usually no, once you have university coursework or a first internship.',
      },
    ],
  },
  teacher: {
    title: 'Teacher',
    headline: 'Classroom, curriculum and outcomes written so a district ATS can still extract them.',
    excerpt: 'Teacher sample for school and training-centre applications.',
    recommendedTemplates: ['academic-simple', 'traditional-ats', 'classic-professional'],
    sampleTitle: 'Mathematics Teacher',
    sampleCompany: 'Riverside Secondary School',
    skills: ['Curriculum design', 'Classroom management', 'Assessment', 'Differentiation'],
    atsTips: [
      'Name the subject and age range in the title line.',
      'Certifications and licences belong in their own section.',
      'Avoid tables for class schedules; parsers skip them.',
    ],
    faqs: [
      {
        question: 'Should I include every club I sponsored?',
        answer: 'Include the ones with responsibility and a result. A long extras list dilutes teaching evidence.',
      },
      {
        question: 'Is a two-page teacher resume acceptable?',
        answer: 'Yes when certifications, endorsements and recent roles need the space. Lead with the last five years.',
      },
    ],
  },
  nurse: {
    title: 'Nurse',
    headline: 'Unit, credentials and patient-care outcomes — without a decorative layout that clinics cannot parse.',
    excerpt: 'Nursing sample for hospital and clinic applicant systems.',
    recommendedTemplates: ['traditional-ats', 'classic-ats', 'ats-standard'],
    sampleTitle: 'Registered Nurse',
    sampleCompany: 'Cedar Valley Medical Centre',
    skills: ['Med-surg', 'Patient education', 'EMR', 'Triage'],
    atsTips: [
      'Put licence and registration details in Certifications.',
      'Name the unit and the EMR if the posting mentions them.',
      'Keep the file text-based; scanned PDFs fail hospital ATS tools.',
    ],
    faqs: [
      {
        question: 'Where do I put my licence number?',
        answer: 'In Certifications, with the issuing body and expiry. Follow your regulator’s rules on what to publish.',
      },
      {
        question: 'Should I list every rotation?',
        answer: 'Recent unit experience matters more. Summarise older rotations in one line if needed.',
      },
    ],
  },
  'mechanical-engineer': {
    title: 'Mechanical Engineer',
    headline: 'Products, analysis tools and manufacturing context in a single, parseable column.',
    excerpt: 'Mechanical engineering sample for design and manufacturing roles.',
    recommendedTemplates: ['classic-ats', 'engineer-compact', 'ats-standard'],
    sampleTitle: 'Mechanical Engineer',
    sampleCompany: 'Helix Dynamics',
    skills: ['CAD', 'GD&T', 'FEA', 'Manufacturing'],
    atsTips: [
      'Name CAD packages the posting lists only if you used them.',
      'Prototypes and cost or weight savings belong in bullets.',
      'Skip logo sheets of tools; write the names.',
    ],
    faqs: [
      {
        question: 'Should I include a projects gallery?',
        answer: 'Link a portfolio if you have one. The resume itself should stay text so the ATS can read it.',
      },
      {
        question: 'Is a two-column engineering template safe?',
        answer: 'Prefer Classic ATS for large manufacturers. Split layouts are labelled Good, not Excellent.',
      },
    ],
  },
  'electrical-engineer': {
    title: 'Electrical Engineer',
    headline: 'Circuits, systems and compliance written as shipped work, not a course list.',
    excerpt: 'Electrical engineering sample for product and power roles.',
    recommendedTemplates: ['classic-ats', 'systems-engineer', 'engineer-compact'],
    sampleTitle: 'Electrical Engineer',
    sampleCompany: 'Helix Dynamics',
    skills: ['Circuit design', 'PCB', 'MATLAB', 'Testing'],
    atsTips: [
      'Name standards only when you worked to them.',
      'Lab and test experience should include what you measured.',
      'Keep skills as words, not icon rows.',
    ],
    faqs: [
      {
        question: 'Do I list every lab tool?',
        answer: 'List the ones in the posting and the ones you would be happy to use on week one.',
      },
      {
        question: 'Should internships go above education?',
        answer: 'Yes once you have relevant internships. Students may still lead with education.',
      },
    ],
  },
  'civil-engineer': {
    title: 'Civil Engineer',
    headline: 'Projects, codes and site responsibility in a conservative single column.',
    excerpt: 'Civil engineering sample for consultancy and site roles.',
    recommendedTemplates: ['traditional-ats', 'classic-professional', 'classic-ats'],
    sampleTitle: 'Civil Engineer',
    sampleCompany: 'Brightline Projects',
    skills: ['AutoCAD', 'Site supervision', 'Estimating', 'Codes'],
    atsTips: [
      'Name project type (highway, water, structural) in the first words of a bullet.',
      'Licensure belongs in Certifications.',
      'Avoid scanned drawings inside the PDF.',
    ],
    faqs: [
      {
        question: 'How do I list projects I cannot name?',
        answer: 'Describe sector, scale and your responsibility without the client’s confidential name.',
      },
      {
        question: 'Is a creative template appropriate?',
        answer: 'Rarely for civil roles. Traditional ATS is the better default.',
      },
    ],
  },
  doctor: {
    title: 'Doctor',
    headline: 'Training, credentials and clinical work in a layout hospital systems can extract.',
    excerpt: 'Clinician sample — fictional only — for training and staff-grade applications.',
    recommendedTemplates: ['traditional-ats', 'academic-simple', 'classic-professional'],
    sampleTitle: 'Resident Physician',
    sampleCompany: 'Cedar Valley Medical Centre',
    skills: ['Clinical assessment', 'EMR', 'Patient communication', 'Audit'],
    atsTips: [
      'Put registration and exams in Certifications.',
      'Hospital ATS tools struggle with tables and multi-column CVs.',
      'Research and audits belong in their own sections when you have them.',
    ],
    faqs: [
      {
        question: 'Is a CV different from this resume?',
        answer:
          'Academic medicine often wants a longer CV. This page shows an ATS-safe one-to-two page clinical resume.',
      },
      {
        question: 'Should I include every rotation?',
        answer: 'Summarise earlier years. Detail the rotations that match the post.',
      },
    ],
  },
};

export const EXAMPLE_ROLES: ExampleRole[] = exampleRoles.map((slug) => ({
  slug,
  ...ROLE_META[slug],
}));

export function exampleRoleBySlug(slug: string): ExampleRole | undefined {
  return EXAMPLE_ROLES.find((role) => role.slug === slug);
}

export function exampleResumeForRole(role: ExampleRole): ResumeData {
  const base = sampleResumeData();
  return {
    ...base,
    personal: {
      ...base.personal,
      title: role.sampleTitle,
    },
    sections: base.sections.map((section) => {
      if (section.kind === 'experience' && section.items[0]) {
        return {
          ...section,
          items: section.items.map((item, index) =>
            index === 0
              ? { ...item, title: role.sampleTitle, company: role.sampleCompany }
              : item,
          ),
        };
      }
      if (section.kind === 'skills' && section.groups[0]) {
        return {
          ...section,
          groups: [
            { id: createId(), name: 'Core', skills: role.skills },
            ...section.groups.slice(1),
          ],
        };
      }
      return section;
    }),
  };
}
