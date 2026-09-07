import { api } from '@/lib/api-client';
import type { CheckoutSession, MessageResponse, PricingPlan, Subscription } from '@/types/api';

export const FALLBACK_PRICING: PricingPlan[] = [
  {
    key: 'free',
    name: 'Free',
    priceMonthlyUsd: 0,
    priceYearlyUsd: 0,
    highlights: [
      '3 resumes',
      'Classic ATS and other free templates',
      'Daily ATS checks',
      'PDF export',
    ],
    features: {
      premiumTemplates: false,
      docxExport: false,
      versionHistory: false,
      advancedAts: false,
      jobMatcher: false,
      aiFeatures: false,
      tailoredVersions: false,
    },
    quotas: {
      maxResumes: 3,
      atsChecksPerDay: 3,
      jobMatchesPerDay: 0,
      aiRequestsPerDay: 0,
      importsPerDay: 2,
      pdfExportsPerDay: 5,
    },
  },
  {
    key: 'pro',
    name: 'Pro',
    priceMonthlyUsd: 9,
    priceYearlyUsd: 79,
    highlights: [
      'Unlimited resumes',
      'All 44 templates',
      'Job matcher and tailored versions',
      'AI rewrite and Resume Copilot',
      'PDF and DOCX export',
      'Version history',
    ],
    features: {
      premiumTemplates: true,
      docxExport: true,
      versionHistory: true,
      advancedAts: true,
      jobMatcher: true,
      aiFeatures: true,
      tailoredVersions: true,
    },
    quotas: {
      maxResumes: 100,
      atsChecksPerDay: 50,
      jobMatchesPerDay: 30,
      aiRequestsPerDay: 40,
      importsPerDay: 20,
      pdfExportsPerDay: 50,
    },
  },
];

export const billingService = {
  pricing: () => api.get<PricingPlan[]>('/subscriptions/pricing'),

  me: () => api.get<Subscription>('/subscriptions/me'),

  checkout: (payload: { plan: 'pro'; interval: 'monthly' | 'yearly' }) =>
    api.post<CheckoutSession>('/subscriptions/checkout', payload),

  cancel: () => api.post<MessageResponse>('/subscriptions/cancel'),
};
