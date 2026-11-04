import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Circuit from '../site/Circuit';
import { useSettings, useEvents, useProjects, useTeam, loadGallery, today, sortTeam, warmUp } from '../site/data';
import { DEFAULT_ABOUT, DEFAULT_TAGLINE, INVENTORY_URL } from '../site/config';
import type { EventItem, Project, Photo } from '../site/types';
import { SectionHead, MoreLink, EventCard, EventDetail, ProjectCard, ProjectDetail, MemberCard, Modal, Reveal, Skeletons, Empty } from '../site/ui';

const OFFER = [
  ['Workshops', 'Hands-on sessions from your first circuit to flight controllers, run by students who’ve built the thing.'],
  ['Parts library', 'Microcontrollers, sensors, motors and tools you can borrow for projects and competitions.'],
  ['Competitions', 'Teams for robotics and hardware events, with help preparing and testing.'],
  ['Help when you’re stuck', 'Ask the core team about a dead board, a wiring doubt or what to learn next.'],
];

export default function Home() {
  const { data: settings } = useSettings();
  const { data: events, loading: evLoading } = useEvents();
  const { data: projects, loading: pLoading } = useProjects();
  const { data: team } = useTeam();
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [openEv, setOpenEv] = useState<EventItem | null>(null);
  const [openP, setOpenP] = useState<Project | null>(null);
  useEffect(() => { loadGallery(8).then(p => setPhotos(p.items)).catch(() => setPhotos([])); warmUp(); }, []);

  const upcoming = useMemo(() => (events ?? []).filter(e => e.date >= today()).sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)).slice(0, 3), [events]);
  const pastCount = (events ?? []).filter(e => e.date < today()).length;
  const featured = useMemo(() => {
    const list = [...(projects ?? [])].sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || (a.order ?? 999) - (b.order ?? 999));
    return list.slice(0, 3);
  }, [projects]);
  const leads = useMemo(() => sortTeam(team ?? []).filter(m => m.group === 'leads'), [team]);
  const tagline = settings?.tagline?.trim() || DEFAULT_TAGLINE;

  return (
    <>
      <section className="hero band-dark">
        <Circuit />
        <div className="wrap hero-inner">
          <p className="kicker">Electronics Hobby Club, DAU</p>
          <h1 className="hero-title">{tagline}</h1>
          <p className="hero-sub">Robots, drones and gadgets, built by students. Join a workshop, borrow parts for your project, or bring us the thing that won’t work.</p>
          <div className="hero-cta">
            <Link className="btn btn-green" to="/events">Upcoming events</Link>
            <a className="btn btn-outline" href={INVENTORY_URL}>Borrow parts</a>
          </div>
          <dl className="stats">
            <div><dt>Projects</dt><dd>{projects ? projects.length : '–'}</dd></div>
            <div><dt>Events held</dt><dd>{events ? pastCount : '–'}</dd></div>
            <div><dt>Core team</dt><dd>{team ? team.length : '–'}</dd></div>
          </dl>
        </div>
      </section>

      <Reveal as="section" className="section">
        <div className="wrap">
          <SectionHead title="Coming up" action={<MoreLink to="/events">All events</MoreLink>} />
          {evLoading && !events ? <Skeletons n={2} kind="row" /> : upcoming.length ? (
            <div className="event-list">{upcoming.map(e => <EventCard key={e.id} ev={e} onOpen={setOpenEv} />)}</div>
          ) : <Empty title="Nothing scheduled yet.">New workshops and events show up here as soon as they’re announced.</Empty>}
        </div>
      </Reveal>

      <Reveal as="section" className="section band-tint">
        <div className="wrap">
          <SectionHead title="What we’ve built" action={<MoreLink to="/projects">All projects</MoreLink>} />
          {pLoading && !projects ? <Skeletons n={3} /> : featured.length ? (
            <div className="grid-card">{featured.map(p => <ProjectCard key={p.id} p={p} onOpen={setOpenP} />)}</div>
          ) : <Empty title="Projects are on their way." />}
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="wrap about">
          <div>
            <SectionHead title="About the club" />
            <p className="about-text">{settings?.about?.trim() || DEFAULT_ABOUT}</p>
            {leads.length > 0 && (
              <div className="leads">{leads.map(m => <MemberCard key={m.id} m={m} />)}</div>
            )}
            <MoreLink to="/team">Meet the team</MoreLink>
          </div>
          <ul className="offer">
            {OFFER.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}
          </ul>
        </div>
      </Reveal>

      {photos && photos.length > 0 && (
        <Reveal as="section" className="section band-dark">
          <div className="wrap">
            <SectionHead title="From the lab" action={<MoreLink to="/gallery">Gallery</MoreLink>} />
          </div>
          <div className="strip" role="list">
            {photos.map(p => <Link key={p.id} to="/gallery" className="strip-item" role="listitem"><img src={p.image} alt={p.caption || 'Club photo'} loading="lazy" decoding="async" /></Link>)}
          </div>
        </Reveal>
      )}

      <section className="cta-band">
        <div className="wrap cta-inner">
          <h2>Need a part for your build?</h2>
          <p>Browse what the club has, request it in a minute, and pick it up from the lab.</p>
          <a className="btn btn-dark" href={INVENTORY_URL}>Open the inventory</a>
        </div>
      </section>

      <Modal open={!!openEv} onClose={() => setOpenEv(null)} label="Event details">{openEv && <EventDetail ev={openEv} />}</Modal>
      <Modal open={!!openP} onClose={() => setOpenP(null)} label="Project details" wide>{openP && <ProjectDetail p={openP} />}</Modal>
    </>
  );
}
