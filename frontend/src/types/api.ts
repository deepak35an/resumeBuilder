/** API payload types shared across features. */

import type { ResumeData, ResumeSettings } from './resume';

export type Plan = 'free' | 'pro';
export type ExperienceLevel = 'student' | 'fresher' | '1-3' | '3-5' | '5-10' | '10+';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar: string | null;
  isVerified: boolean;
  isActive: boolean;
  plan: Plan;
  role: 'user' | 'admin';
  onboarding: {
    targetRole?: string;
    experienceLevel?: ExperienceLevel;
    goal?: string | null;
    completed?: boolean;
  };
  preferences: Record<string, unknown>;
  createdAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthResponse extends TokenPair {
  user: User;
}

export interface PlanFeatures {
  plan: Plan;
  features: {
    premiumTemplates: boolean;
    docxExport: boolean;
    versionHistory: boolean;
    advancedAts: boolean;
    jobMatcher: boolean;
    aiFeatures: boolean;
    tailoredVersions: boolean;
  };
  quotas: {
    maxResumes: number;
    atsChecksPerDay: number;
    jobMatchesPerDay: number;
    aiRequestsPerDay: number;
    importsPerDay: number;
    pdfExportsPerDay: number;
  };
  usage: Record<string, number>;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MessageResponse {
  message: string;
  ok: boolean;
}

// --- Resumes ---------------------------------------------------------------

export interface ResumeSummary {
  id: string;
  title: string;
  templateId: string;
  atsScore: number | null;
  downloadCount: number;
  tailoredFor: string | null;
  sourceResumeId: string | null;
  versionCount: number;
  completeness: number;
  createdAt: string;
  updatedAt: string;
}

export interface Resume extends ResumeSummary {
  data: ResumeData;
  settings: ResumeSettings;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  versionName: string;
  versionNumber: number;
  templateId: string;
  atsScore: number | null;
  trigger: 'manual' | 'autosave' | 'restore' | 'import';
  createdAt: string;
}

export interface ResumeVersionDetail extends ResumeVersion {
  data: ResumeData;
  settings: ResumeSettings;
}

// --- Templates -------------------------------------------------------------

export type TemplateCategory = 'ats' | 'tech' | 'business' | 'student' | 'creative';
export type TemplateLayout = 'single-column' | 'two-column' | 'sidebar-left' | 'sidebar-right';

export interface Template {
  id: string;
  slug: string;
  name: string;
  category: TemplateCategory;
  description: string;
  /** 1-5 heuristic. Higher means a more conservative, more parseable layout. */
  atsRating: number;
  layout: TemplateLayout;
  style: string;
  isPremium: boolean;
  isRecommended: boolean;
  industries: string[];
  experienceLevels: ExperienceLevel[];
  badges: string[];
  popularity: number;
  templateConfig: Record<string, unknown>;
}

// --- ATS -------------------------------------------------------------------

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'critical' | 'warning' | 'good';

export interface ATSIssue {
  id: string;
  severity: IssueSeverity;
  status: IssueStatus;
  category: 'formatting' | 'keywords' | 'content' | 'completeness' | 'contact' | 'experience';
  title: string;
  detail: string;
  /** Actionable next step, e.g. "add-skill" or "switch-template". */
  action?: {
    kind:
      | 'add-keyword'
      | 'improve-bullet'
      | 'switch-template'
      | 'edit-section'
      | 'add-section'
      | 'edit-contact';
    label: string;
    payload?: Record<string, unknown>;
  };
  before?: string;
  after?: string;
  why?: string;
}

export interface ScoreBreakdownEntry {
  key: string;
  label: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface KeywordMatch {
  term: string;
  category: string;
  weight: number;
  resumeCount: number;
  jobCount: number;
  /** Where in the resume the term appears. */
  locations: string[];
  related?: string[];
}

export interface SectionAnalysis {
  key: string;
  label: string;
  present: boolean;
  status: IssueStatus | 'optional';
  detail: string;
}

export interface ATSReport {
  id: string | null;
  kind: 'ats_check' | 'job_match';
  overallScore: number;
  matchScore: number | null;
  band: 'excellent' | 'good' | 'needs-improvement' | 'needs-major-improvement';
  bandLabel: string;
  headline: string;
  breakdown: ScoreBreakdownEntry[];
  issues: ATSIssue[];
  strengths: ATSIssue[];
  recommendations: Recommendation[];
  matchedKeywords: KeywordMatch[];
  missingKeywords: KeywordMatch[];
  relatedKeywords: KeywordMatch[];
  sections: SectionAnalysis[];
  completeness: SectionAnalysis[];
  wordCount: number;
  estimatedPages: number;
  disclaimer: string;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  priority: IssueSeverity;
  title: string;
  detail: string;
  section?: string;
  action?: ATSIssue['action'];
}

export interface JobMatchReport extends ATSReport {
  jobTitle: string;
  company: string | null;
  jobDescriptionId: string | null;
  requiredSkills: KeywordMatch[];
  preferredSkills: KeywordMatch[];
  matchedRequirements: number;
  totalRequirements: number;
  experienceMatch: SectionAnalysis[];
  educationMatch: SectionAnalysis[];
  sectionsToImprove: Recommendation[];
  placementGuidance: string;
}

// --- Jobs / applications ---------------------------------------------------

export interface JobDescription {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  url: string | null;
  content: string;
  keywordCount: number;
  createdAt: string;
}

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  jobTitle: string;
  company: string | null;
  status: ApplicationStatus;
  resumeId: string | null;
  resumeTitle: string | null;
  jobDescriptionId: string | null;
  atsReportId: string | null;
  atsScore: number | null;
  matchScore: number | null;
  notes: string | null;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Import / parsing ------------------------------------------------------

export interface ParsedResumeResponse {
  data: ResumeData;
  /** Fields the parser could not confidently detect. */
  warnings: string[];
  detected: {
    name: boolean;
    email: boolean;
    phone: boolean;
    experience: number;
    education: number;
    skills: number;
    projects: number;
    certifications: number;
  };
  rawTextLength: number;
  notice: string;
}

// --- AI --------------------------------------------------------------------

export type AIAction =
  | 'improve'
  | 'shorten'
  | 'professional'
  | 'action-verb'
  | 'quantify'
  | 'grammar'
  | 'technical';

export interface AISuggestion {
  original: string;
  suggestion: string;
  why: string;
  /** True when a metric would strengthen the bullet but was not supplied. */
  needsMetric: boolean;
  provider: 'rules' | 'model';
  notice: string;
}

export interface SummarySuggestion {
  summary: string;
  tone: string;
  why: string;
  provider: 'rules' | 'model';
  notice: string;
}

export interface CopilotInsight {
  id: string;
  priority: IssueSeverity;
  title: string;
  detail: string;
  action?: ATSIssue['action'];
}

// --- Subscriptions ---------------------------------------------------------

export interface Subscription {
  id: string;
  plan: Plan;
  status: 'incomplete' | 'active' | 'past_due' | 'canceled' | 'expired';
  provider: string;
  interval: 'monthly' | 'yearly';
  startDate: string | null;
  endDate: string | null;
  canceledAt: string | null;
}

export interface CheckoutSession {
  provider: string;
  /** Null when the provider is `noop` and the plan was applied directly. */
  checkoutUrl: string | null;
  sessionId: string | null;
  message: string;
}

export interface PricingPlan {
  key: Plan;
  name: string;
  priceMonthlyUsd: number;
  priceYearlyUsd: number;
  highlights: string[];
  features: Record<string, boolean>;
  quotas: Record<string, number>;
}

// --- Content ---------------------------------------------------------------

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  readingMinutes: number;
  coverImage: string | null;
  publishedAt: string | null;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
}

// --- Dashboard / analytics -------------------------------------------------

export interface NextBestAction {
  id: string;
  title: string;
  detail: string;
  ctaLabel: string;
  ctaHref: string;
  tone: 'accent' | 'success' | 'warning';
}

export interface DashboardOverview {
  greetingName: string;
  resumeCount: number;
  atsCheckCount: number;
  jobMatchCount: number;
  jobDescriptionCount: number;
  downloadCount: number;
  latestScore: number | null;
  previousScore: number | null;
  scoreDelta: number | null;
  band: string | null;
  topMatch: { jobTitle: string; company: string | null; matchScore: number } | null;
  mostUsedTemplate: { slug: string; name: string; count: number } | null;
  recentResumes: ResumeSummary[];
  recentReports: Array<{
    id: string;
    kind: 'ats_check' | 'job_match';
    resumeId: string | null;
    resumeTitle: string | null;
    overallScore: number;
    matchScore: number | null;
    createdAt: string;
  }>;
  scoreHistory: Array<{ date: string; score: number }>;
  subscription: Subscription | null;
  nextBestAction: NextBestAction;
}

// --- Admin -----------------------------------------------------------------

export interface AdminStats {
  users: number;
  newUsersThisWeek: number;
  activeUsersThisWeek: number;
  proUsers: number;
  conversionRate: number;
  resumes: number;
  atsChecks: number;
  jobMatches: number;
  pdfDownloads: number;
  docxDownloads: number;
  aiRequests: number;
  monthlyRevenueUsd: number;
  signupsByDay: Array<{ date: string; count: number }>;
  usageByDay: Array<{ date: string; atsChecks: number; jobMatches: number; exports: number }>;
}

export interface AdminUserRow {
  id: string;
  email: string;
  fullName: string;
  plan: Plan;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  resumeCount: number;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminErrorRow {
  id: string;
  level: string;
  source: string;
  message: string;
  path: string | null;
  createdAt: string;
}
