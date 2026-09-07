import { Outlet } from 'react-router-dom';

import { CookieConsent } from '@/components/consent/CookieConsent';

import { PublicFooter } from './PublicFooter';
import { PublicHeader } from './PublicHeader';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <PublicHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <CookieConsent />
    </div>
  );
}
