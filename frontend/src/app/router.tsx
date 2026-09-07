import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { GuestOnlyRoute, ProtectedRoute } from '@/components/routing/ProtectedRoute';

import { RootLayout } from './RootLayout';

const HomePage = lazy(() => import('@/pages/HomePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));

const ResumeBuilderPage = lazy(() => import('@/pages/ResumeBuilderPage'));
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage'));
const TemplateDetailPage = lazy(() => import('@/pages/TemplateDetailPage'));
const AtsCheckerPage = lazy(() => import('@/pages/AtsCheckerPage'));
const JobMatcherPage = lazy(() => import('@/pages/JobMatcherPage'));
const ExamplesIndexPage = lazy(() => import('@/pages/ExamplesIndexPage'));
const ExampleRolePage = lazy(() => import('@/pages/ExampleRolePage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const BlogIndexPage = lazy(() => import('@/pages/BlogIndexPage'));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const CookiesPage = lazy(() => import('@/pages/CookiesPage'));

const DashboardPage = lazy(() => import('@/pages/app/DashboardPage'));
const ResumesPage = lazy(() => import('@/pages/app/ResumesPage'));
const EditorPage = lazy(() => import('@/pages/app/EditorPage'));
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage'));
const OnboardingPage = lazy(() => import('@/pages/app/OnboardingPage'));
const JobsPage = lazy(() => import('@/pages/app/JobsPage'));
const ApplicationsPage = lazy(() => import('@/pages/app/ApplicationsPage'));

const AdminPage = lazy(() => import('@/pages/admin/AdminPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminTemplatesPage = lazy(() => import('@/pages/admin/AdminTemplatesPage'));
const AdminBlogPage = lazy(() => import('@/pages/admin/AdminBlogPage'));
const AdminErrorsPage = lazy(() => import('@/pages/admin/AdminErrorsPage'));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, path: '/', element: <HomePage /> },
          { path: '/resume-builder', element: <ResumeBuilderPage /> },
          { path: '/free-resume-builder', element: <ResumeBuilderPage /> },
          { path: '/resume-templates', element: <TemplatesPage /> },
          { path: '/ats-resume-template', element: <TemplatesPage /> },
          { path: '/resume-template/:slug', element: <TemplateDetailPage /> },
          { path: '/ats-resume-checker', element: <AtsCheckerPage /> },
          { path: '/resume-checker', element: <AtsCheckerPage /> },
          { path: '/job-description-matcher', element: <JobMatcherPage /> },
          { path: '/resume-examples', element: <ExamplesIndexPage /> },
          { path: '/resume-examples/:slug', element: <ExampleRolePage /> },
          { path: '/pricing', element: <PricingPage /> },
          { path: '/blog', element: <BlogIndexPage /> },
          { path: '/blog/:slug', element: <BlogPostPage /> },
          { path: '/about', element: <AboutPage /> },
          { path: '/contact', element: <ContactPage /> },
          { path: '/privacy', element: <PrivacyPage /> },
          { path: '/terms', element: <TermsPage /> },
          { path: '/cookies', element: <CookiesPage /> },
        ],
      },
      {
        element: <GuestOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: '/login', element: <LoginPage /> },
              { path: '/register', element: <RegisterPage /> },
              { path: '/forgot-password', element: <ForgotPasswordPage /> },
              { path: '/reset-password', element: <ResetPasswordPage /> },
            ],
          },
        ],
      },
      {
        element: <AuthLayout />,
        children: [{ path: '/verify-email', element: <VerifyEmailPage /> }],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/resumes', element: <ResumesPage /> },
              { path: '/resume/:id/edit', element: <EditorPage /> },
              { path: '/settings', element: <SettingsPage /> },
              { path: '/onboarding', element: <OnboardingPage /> },
              { path: '/jobs', element: <JobsPage /> },
              { path: '/applications', element: <ApplicationsPage /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute requireAdmin />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/admin', element: <AdminPage /> },
              { path: '/admin/users', element: <AdminUsersPage /> },
              { path: '/admin/templates', element: <AdminTemplatesPage /> },
              { path: '/admin/blog', element: <AdminBlogPage /> },
              { path: '/admin/errors', element: <AdminErrorsPage /> },
            ],
          },
        ],
      },
      {
        element: <PublicLayout />,
        children: [{ path: '*', element: <NotFoundPage /> }],
      },
    ],
  },
]);
