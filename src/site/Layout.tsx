import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSettings, checkPreview } from './data';
import { INVENTORY_URL } from './config';
import { Icon } from './ui';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/events', label: 'Events' },
  { to: '/projects', label: 'Projects' },
  { to: '/team', label: 'Team' },
  { to: '/gallery', label: 'Gallery' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  return (
    <header className={`nav ${open ? 'open' : ''}`}>
      <div className="wrap nav-inner">
        <Link to="/" className="nav-logo" aria-label="EHC home">
          <img className="logo-light" src="/brand/logo-light.png" alt="EHC, Electronics Hobby Club" width="140" height="62" />
          <img className="logo-dark" src="/brand/logo-dark.png" alt="" width="140" height="62" aria-hidden="true" />
        </Link>
        <nav className="nav-links" aria-label="Main">
          {LINKS.map(l => <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'on' : '')}>{l.label}</NavLink>)}
          <a className="btn btn-dark nav-cta" href={INVENTORY_URL}>Borrow parts</a>
        </nav>
        <button className="nav-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? Icon.close : Icon.menu}</button>
      </div>
    </header>
  );
}

function Footer() {
  const { data: s } = useSettings();
  const email = s?.email || 'ehc@dau.ac.in';
  return (
    <footer className="footer band-dark">
      <div className="wrap footer-inner">
        <div>
          <img src="/brand/logo-dark.png" alt="EHC, Electronics Hobby Club" className="footer-logo" width="180" height="80" loading="lazy" />
          <p className="footer-note">Electronics Hobby Club, Dhirubhai Ambani University, Gandhinagar.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          {LINKS.map(l => <Link key={l.to} to={l.to}>{l.label}</Link>)}
          <a href={INVENTORY_URL}>Inventory and event check-in</a>
        </nav>
        <div className="footer-contact">
          <a href={`mailto:${email}`}>{Icon.mail}{email}</a>
          <div className="socials">
            {s?.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">{Icon.instagram}</a>}
            {s?.linkedin && <a href={s.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">{Icon.linkedin}</a>}
            {s?.github && <a href={s.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">{Icon.github}</a>}
          </div>
        </div>
      </div>
      <div className="wrap footer-base">© {new Date().getFullYear()} Electronics Hobby Club, DAU</div>
    </footer>
  );
}

function ComingSoon() {
  return (
    <main className="soon">
      <div className="soon-card">
        <img className="logo-light" src="/brand/logo-light.png" alt="EHC, Electronics Hobby Club" />
        <img className="logo-dark" src="/brand/logo-dark.png" alt="" aria-hidden="true" />
        <h1>New site coming soon</h1>
        <p>We’re rebuilding the club website. Borrowing parts, asking the core team for help and event check-in all work as usual.</p>
        <a className="btn btn-green" href={INVENTORY_URL}>Go to inventory and events</a>
      </div>
    </main>
  );
}

// The website shows only when the dashboard switch says so, or to someone holding a preview link.
function useAccess() {
  const { data: s, loading } = useSettings();
  const [preview, setPreview] = useState(() => { try { return sessionStorage.getItem('ehc-preview') === '1'; } catch { return false; } });
  useEffect(() => {
    const url = new URL(location.href);
    const key = url.searchParams.get('preview');
    if (!key) return;
    url.searchParams.delete('preview');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
    checkPreview(key).then(ok => { if (ok) { try { sessionStorage.setItem('ehc-preview', '1'); } catch { /* fine */ } setPreview(true); } }).catch(() => {});
  }, []);
  return { ready: !loading || s !== undefined, isPublic: !!s?.public, preview };
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function Layout({ children }: { children: ReactNode }) {
  const { ready, isPublic, preview } = useAccess();
  if (!ready) return <div className="boot" aria-busy="true"><img src="/brand/logo-light.png" alt="EHC" className="logo-light" /><img src="/brand/logo-dark.png" alt="" className="logo-dark" /></div>;
  if (!isPublic && !preview) return <ComingSoon />;
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      {!isPublic && <div className="preview-bar">Preview: the website is hidden from the public. Switch it on in the dashboard under Website, Settings.</div>}
      <Navbar />
      <ScrollToTop />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
