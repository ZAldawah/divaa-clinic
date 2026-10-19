'use client';
import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { services } from '@/lib/services.mjs';
export default function Navbar() {
  const menu = useRef(null), toggle = useRef(null);
  const pathname = usePathname();
  return <header className="site-header">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="header-inner">
      <a href="/" className="wordmark" aria-label="Divaa Beauty Clinic home">divaa<span>BEAUTY CLINIC</span></a>
      <nav aria-label="Main navigation" className="header-nav">
        <details ref={menu} className="site-menu" onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) menu.current.open = false;
        }} onKeyDown={event => {
          if (event.key === 'Escape') { menu.current.open = false; toggle.current.focus(); }
        }}>
          <summary ref={toggle}>Menu <span aria-hidden="true">＋</span></summary>
          <div className="menu-panel">
            <p className="eyebrow">Explore Divaa</p>
            <a href="/" aria-current={pathname === '/' ? 'page' : undefined}>Home</a>
            <a href="/#services" onClick={() => { menu.current.open = false; }}>All services</a>
            <div className="menu-services">{services.map(service => <a key={service.id} href={'/' + service.id} aria-current={pathname === '/' + service.id ? 'page' : undefined}>{service.name}</a>)}</div>
            <a href="sms:8329929606?body=Hi%20Divaa%20Beauty%20Clinic%2C%20I%E2%80%99d%20like%20help%20with%20booking%2C%20services%2C%20or%20my%20questions.">Text us about booking, services, or questions <span aria-hidden="true">↗</span></a>
            <a href="/#contact" onClick={() => { menu.current.open = false; }}>Contact the clinic</a>
          </div>
        </details>
        <a href="sms:8329929606?body=Hi%20Divaa%20Beauty%20Clinic%2C%20I%E2%80%99d%20like%20help%20with%20booking%2C%20services%2C%20or%20my%20questions." className="button header-book">Text us <span aria-hidden="true">↗</span></a>
      </nav>
    </div>
  </header>;
}
