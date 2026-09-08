import {
  Briefcase,
  FileText,
  Globe,
  Home,
  LayoutTemplate,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { Logo } from '@/components/brand/Logo';
import { Badge, ButtonLink, Dropdown } from '@/components/ui';
import { cn, initialsOf, modifierKeyLabel } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useCommandPalette } from '@/store/commandPalette';

import { ThemeToggle } from './ThemeToggle';

const primaryNav = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/resumes', label: 'Resumes', icon: FileText },
  { to: '/resume-templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/ats-resume-checker', label: 'ATS', icon: ShieldCheck },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
];

function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <Dropdown
      menuLabel="Account"
      trigger={({ toggle, ref, open }) => (
        <button
          ref={ref}
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label="Account menu"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-2xs
            font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {initialsOf(user.fullName || user.email)}
        </button>
      )}
      items={[
        {
          id: 'profile',
          label: user.fullName || user.email,
          icon: <UserIcon />,
          onSelect: () => navigate('/settings'),
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: <Settings />,
          onSelect: () => navigate('/settings'),
        },
        {
          id: 'site',
          label: 'Website',
          icon: <Globe />,
          separatorBefore: true,
          onSelect: () => navigate('/'),
        },
        ...(user.role === 'admin'
          ? [
              {
                id: 'admin',
                label: 'Admin',
                icon: <Sparkles />,
                onSelect: () => navigate('/admin'),
                separatorBefore: true,
              },
            ]
          : []),
        {
          id: 'logout',
          label: 'Sign out',
          icon: <LogOut />,
          tone: 'danger' as const,
          separatorBefore: true,
          onSelect: () => {
            void logout().then(() => navigate('/'));
          },
        },
      ]}
    />
  );
}

/**
 * Application shell.
 *
 * Deliberately not an admin sidebar: a slim top bar keeps the focus on the
 * user's own work, and mobile gets a real bottom navigation bar.
 */
export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const openPalette = useCommandPalette((state) => state.setOpen);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header
        data-app-header
        className="sticky top-0 z-sticky border-b border-border bg-background/85 backdrop-blur-md"
      >
        <div className="mx-auto flex h-14 max-w-content items-center gap-3 px-4 sm:px-6">
          <Logo to="/dashboard" />

          <nav aria-label="Workspace" className="ml-4 hidden items-center gap-0.5 md:flex">
            {primaryNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                <item.icon aria-hidden="true" className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground
                transition-colors hover:text-foreground"
            >
              <Globe aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Website</span>
            </Link>
            <button
              type="button"
              onClick={() => openPalette(true)}
              className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5
                text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground sm:flex"
            >
              <Search aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="font-mono text-2xs">{modifierKeyLabel()} K</kbd>
            </button>

            {user?.plan === 'free' ? (
              <ButtonLink to="/pricing" size="xs" variant="subtle" className="hidden sm:inline-flex">
                Upgrade
              </ButtonLink>
            ) : (
              <Badge tone="pro" size="xs" uppercase className="hidden sm:inline-flex">
                Pro
              </Badge>
            )}

            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <main id="main" className="flex-1 pb-[calc(var(--mobile-nav-height)+1rem)] md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom navigation: a designed mobile experience, not a shrunk desktop one. */}
      <nav
        data-app-nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-sticky border-t border-border bg-surface/95 backdrop-blur-md md:hidden"
      >
        <ul className="mx-auto flex h-[var(--mobile-nav-height)] max-w-md items-stretch">
          {[
            { to: '/dashboard', label: 'Home', icon: Home },
            { to: '/resumes', label: 'Resumes', icon: FileText },
            { to: '/resume-templates', label: 'Templates', icon: LayoutTemplate },
            { to: '/jobs', label: 'Jobs', icon: Briefcase },
            { to: '/settings', label: 'Profile', icon: UserIcon },
          ].map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex h-full flex-col items-center justify-center gap-1 text-2xs transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )
                }
              >
                <item.icon aria-hidden="true" className="h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/** Consistent page container for application screens. */
export function AppPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto max-w-content px-4 py-6 sm:px-6 sm:py-8', className)}>
      {children}
    </div>
  );
}
