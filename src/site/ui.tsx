import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { EventItem, Project, Member } from './types';
import { eventWhen, initials, parseDay, loadPhoto } from './data';

/* ---------- small pieces ---------- */
export function SectionHead({ title, intro, action }: { title: string; intro?: string; action?: ReactNode }) {
  return (
    <div className="sec-head">
      <div>
        <h2 className="sec-title">{title}</h2>
        {intro && <p className="sec-intro">{intro}</p>}
      </div>
      {action}
    </div>
  );
}
export function PageHead({ title, intro, dark = true }: { title: string; intro?: string; dark?: boolean }) {
  return (
    <header className={`page-head ${dark ? 'band-dark' : ''}`}>
      <div className="wrap">
        <h1 className="page-title">{title}</h1>
        {intro && <p className="page-intro">{intro}</p>}
      </div>
    </header>
  );
}
export const MoreLink = ({ to, children }: { to: string; children: ReactNode }) => <Link className="more" to={to}>{children}</Link>;
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="empty"><p className="empty-title">{title}</p>{children && <p>{children}</p>}</div>;
}
export const ErrorNote = ({ msg }: { msg: string }) => (msg ? <p className="error-note" role="alert">{msg}</p> : null);
export function Skeletons({ n = 3, kind = 'card' }: { n?: number; kind?: string }) {
  return <div className={`grid-${kind}`}>{Array.from({ length: n }, (_, i) => <div key={i} className={`skel skel-${kind}`} aria-hidden="true" />)}</div>;
}

// Fades sections in as they scroll into view; does nothing for people who prefer less motion.
export function Reveal({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref as never} className={`reveal ${shown ? 'in' : ''} ${className}`}>{children}</Tag>;
}

/* ---------- icons (inline, no icon library) ---------- */
const I = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
export const Icon = {
  linkedin: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm7 0h3.8v1.6h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.95 1.32-1.95 2.69V21h-4V9.5Z" /></svg>,
  github: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>,
  instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>,
  mail: <I d="M3 5h18v14H3zM3 6l9 7 9-7" size={18} />,
  close: <I d="M6 6l12 12M18 6 6 18" size={22} />,
  left: <I d="M15 5l-7 7 7 7" size={26} />,
  right: <I d="M9 5l7 7-7 7" size={26} />,
  menu: <I d="M4 7h16M4 12h16M4 17h16" size={24} />,
  pin: <I d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" size={16} />,
  link: <I d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" size={16} />,
};

/* ---------- modal + image viewer ---------- */
export function Modal({ open, onClose, children, label, wide = false }: { open: boolean; onClose: () => void; children: ReactNode; label: string; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { d.showModal(); document.body.classList.add('modal-open'); }
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => () => document.body.classList.remove('modal-open'), []);
  return (
    <dialog ref={ref} className={`modal ${wide ? 'wide' : ''}`} aria-label={label}
      onClose={() => { document.body.classList.remove('modal-open'); onClose(); }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <button className="modal-x" onClick={onClose} aria-label="Close">{Icon.close}</button>
      {open && children}
    </dialog>
  );
}
// Shows the small image straight away and swaps in the full-size one when it arrives.
export function FullImage({ photoId, thumb, alt }: { photoId?: string; thumb?: string; alt: string }) {
  const [src, setSrc] = useState(thumb ?? '');
  useEffect(() => {
    setSrc(thumb ?? '');
    let live = true;
    if (photoId) loadPhoto(photoId).then(full => { if (live && full) setSrc(full); }).catch(() => {});
    return () => { live = false; };
  }, [photoId, thumb]);
  return src ? <img className="full-img" src={src} alt={alt} /> : null;
}

/* ---------- cards ---------- */
export function DateBlock({ date }: { date: string }) {
  const d = parseDay(date);
  return <div className="date-block" aria-hidden="true"><b>{d.getDate()}</b><span>{d.toLocaleDateString('en-IN', { month: 'short' })}</span></div>;
}
export function EventCard({ ev, onOpen, past = false }: { ev: EventItem; onOpen: (e: EventItem) => void; past?: boolean }) {
  return (
    <button className={`event-card ${past ? 'past' : ''}`} onClick={() => onOpen(ev)}>
      <DateBlock date={ev.date} />
      <div className="event-body">
        <h3>{ev.title}</h3>
        <p className="event-meta">{eventWhen(ev)}</p>
        {!past && ev.description && <p className="event-desc">{ev.description}</p>}
        {past && ev.attendeeCount ? <p className="event-meta">{ev.attendeeCount} attended</p> : null}
      </div>
      {ev.poster && !past && <img className="event-poster" src={ev.poster} alt="" loading="lazy" decoding="async" />}
    </button>
  );
}
export function EventDetail({ ev }: { ev: EventItem }) {
  return (
    <div className="detail">
      {ev.poster && <FullImage photoId={`event_${ev.id}`} thumb={ev.poster} alt={`Poster for ${ev.title}`} />}
      <div className="detail-body">
        <h2>{ev.title}</h2>
        <p className="detail-meta">{eventWhen(ev)}</p>
        {ev.description && <p className="detail-text">{ev.description}</p>}
      </div>
    </div>
  );
}
export function ProjectCard({ p, onOpen }: { p: Project; onOpen: (p: Project) => void }) {
  return (
    <button className="project-card" onClick={() => onOpen(p)}>
      <div className="project-img">{p.image ? <img src={p.image} alt="" loading="lazy" decoding="async" /> : <div className="img-fallback" aria-hidden="true">{initials(p.title)}</div>}</div>
      <div className="project-body">
        <div className="project-top">{p.status && <span className={`status ${p.status}`}>{p.status === 'ongoing' ? 'Ongoing' : 'Completed'}</span>}{p.year && <span className="muted">{p.year}</span>}</div>
        <h3>{p.title}</h3>
        {p.summary && <p>{p.summary}</p>}
        {p.tags && p.tags.length > 0 && <div className="tags">{p.tags.slice(0, 4).map(t => <span key={t} className="tag">{t}</span>)}</div>}
      </div>
    </button>
  );
}
export function ProjectDetail({ p }: { p: Project }) {
  return (
    <div className="detail">
      {p.image && <FullImage photoId={`project_${p.id}`} thumb={p.image} alt={p.title} />}
      <div className="detail-body">
        <div className="project-top">{p.status && <span className={`status ${p.status}`}>{p.status === 'ongoing' ? 'Ongoing' : 'Completed'}</span>}{p.year && <span className="muted">{p.year}</span>}</div>
        <h2>{p.title}</h2>
        {p.summary && <p className="detail-lede">{p.summary}</p>}
        {p.description && <p className="detail-text">{p.description}</p>}
        {p.team && <p className="detail-meta"><b>Built by</b> {p.team}</p>}
        {p.tags && p.tags.length > 0 && <div className="tags">{p.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>}
        {p.link && <a className="btn btn-dark" href={p.link} target="_blank" rel="noopener noreferrer">{Icon.link} See the project</a>}
      </div>
    </div>
  );
}
export function MemberCard({ m, big = false }: { m: Member; big?: boolean }) {
  return (
    <article className={`member ${big ? 'big' : ''}`}>
      <div className="member-photo">{m.photo ? <img src={m.photo} alt={m.name} loading="lazy" decoding="async" /> : <span className="member-initials" aria-hidden="true">{initials(m.name)}</span>}</div>
      <h3>{m.name}</h3>
      {m.role && <p className="member-role">{m.role}</p>}
      {(m.linkedin || m.github || m.email) && (
        <div className="member-links">
          {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}>{Icon.linkedin}</a>}
          {m.github && <a href={m.github} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on GitHub`}>{Icon.github}</a>}
          {m.email && <a href={`mailto:${m.email}`} aria-label={`Email ${m.name}`}>{Icon.mail}</a>}
        </div>
      )}
    </article>
  );
}
