import { useMemo, useState } from 'react';
import { useProjects } from '../site/data';
import type { Project } from '../site/types';
import { PageHead, ProjectCard, ProjectDetail, Modal, Skeletons, Empty, ErrorNote } from '../site/ui';

type Filter = 'all' | 'ongoing' | 'completed';
export default function ProjectsPage() {
  const { data, loading, error } = useProjects();
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<Project | null>(null);
  const list = useMemo(() => [...(data ?? [])]
    .filter(p => filter === 'all' || p.status === filter)
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || (a.order ?? 999) - (b.order ?? 999) || String(b.year ?? '').localeCompare(String(a.year ?? ''))), [data, filter]);
  return (
    <>
      <PageHead title="Projects" intro="Things club members have designed, built and broken on the way to getting them right." />
      <section className="section">
        <div className="wrap">
          <ErrorNote msg={error} />
          <div className="filters" role="group" aria-label="Filter projects">
            {(['all', 'ongoing', 'completed'] as Filter[]).map(f => (
              <button key={f} className={filter === f ? 'on' : ''} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f === 'ongoing' ? 'Ongoing' : 'Completed'}</button>
            ))}
          </div>
          {loading && !data ? <Skeletons n={6} /> : list.length ? (
            <div className="grid-card">{list.map(p => <ProjectCard key={p.id} p={p} onOpen={setOpen} />)}</div>
          ) : <Empty title={filter === 'all' ? 'Projects are on their way.' : `No ${filter} projects right now.`} />}
        </div>
      </section>
      <Modal open={!!open} onClose={() => setOpen(null)} label="Project details" wide>{open && <ProjectDetail p={open} />}</Modal>
    </>
  );
}
