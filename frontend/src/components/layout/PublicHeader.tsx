import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { Logo } from '@/components/brand/Logo';
import { Button, ButtonLink } from '@/components/ui';
import { IconButton } from '@/components/ui/IconButton';
import { useOnClickOutside } from '@/hooks/useUiPrimitives';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

import { headerNav, productLinks, workspaceNav, type NavLinkDef } from './navigation';
import { ThemeToggle } from './ThemeToggle';

function DesktopMenu({ label, items }: { label: string; items: NavLinkDef[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground
          transition-colors hover:text-foreground"
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={cn('h-3.5 w-3.5 transition-transform duration-fast', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-dropdown w-80 animate-scale-in pt-2"
          role="menu"
          aria-label={label}
        >
          <div className="rounded-xl border border-border bg-surface p-1.5 shadow-lg">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
              >
                <span className="block text-sm font-medium text-foreground">{item.label}</span>
                {item.description && (
                  <span className="mt-0.5 block text-xs text-muted-foreground text-pretty">
                    {item.description}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Sticky marketing header with a subtle backdrop blur once scrolled. */
export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = status === 'authenticated';

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      data-app-header
      className={cn(
        'sticky top-0 z-sticky border-b transition-colors duration-base',
        scrolled
          ? 'border-border bg-background/85 backdrop-blur-md'
          : 'border-transparent bg-background',
      )}
    >
      <div className="mx-auto flex h-14 max-w-wide items-center gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="ml-4 hidden items-center gap-0.5 lg:flex">
          {isAuthenticated ? (
            <>
              {workspaceNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-2.5 py-1.5 text-sm transition-colors',
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <DesktopMenu label="Site" items={[{ label: 'Home', to: '/' }, ...productLinks]} />
            </>
          ) : (
            headerNav.map((entry) =>
              'items' in entry ? (
                <DesktopMenu key={entry.label} label={entry.label} items={entry.items} />
              ) : (
                <NavLink
                  key={entry.to}
                  to={entry.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-2.5 py-1.5 text-sm transition-colors',
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )
                  }
                >
                  {entry.label}
                </NavLink>
              ),
            )
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <ButtonLink to="/dashboard" size="sm" variant="primary">
              Dashboard
            </ButtonLink>
          ) : (
            <>
              <ButtonLink to="/login" size="sm" variant="ghost" className="hidden sm:inline-flex">
                Sign in
              </ButtonLink>
              <ButtonLink to="/register" size="sm" variant="primary">
                Create resume
              </ButtonLink>
            </>
          )}
          <IconButton
            label={mobileOpen ? 'Close menu' : 'Open menu'}
            icon={mobileOpen ? <X /> : <Menu />}
            onClick={() => setMobileOpen((value) => !value)}
            className="lg:hidden"
          />
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile"
          className="animate-fade-in border-t border-border bg-surface px-4 pb-5 pt-3 lg:hidden"
        >
          {isAuthenticated ? (
            <>
              {workspaceNav.map((item) => (
                <Link key={item.to} to={item.to} className="block rounded-lg px-1 py-2 text-sm text-foreground">
                  {item.label}
                </Link>
              ))}
              <p className="px-1 pb-1 pt-2 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                Site
              </p>
              <Link to="/" className="block rounded-lg px-1 py-2 text-sm text-foreground">
                Home
              </Link>
              {productLinks.map((item) => (
                <Link key={item.to} to={item.to} className="block rounded-lg px-1 py-2 text-sm text-foreground">
                  {item.label}
                </Link>
              ))}
            </>
          ) : (
            headerNav.map((entry) => (
              <div key={'items' in entry ? entry.label : entry.to} className="py-1">
                {'items' in entry ? (
                  <>
                    <p className="px-1 pb-1 pt-2 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {entry.label}
                    </p>
                    {entry.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="block rounded-lg px-1 py-2 text-sm text-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link to={entry.to} className="block rounded-lg px-1 py-2 text-sm text-foreground">
                    {entry.label}
                  </Link>
                )}
              </div>
            ))
          )}
          {!isAuthenticated && (
            <Link to="/login" className="mt-2 block sm:hidden">
              <Button variant="secondary" fullWidth>
                Sign in
              </Button>
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
