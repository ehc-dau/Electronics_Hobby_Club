import { useMemo } from 'react';
import { useTeam, sortTeam, GROUPS } from '../site/data';
import { PageHead, MemberCard, Skeletons, Empty, ErrorNote, Reveal } from '../site/ui';

export default function TeamPage() {
  const { data, loading, error } = useTeam();
  const groups = useMemo(() => {
    const list = sortTeam(data ?? []);
    return GROUPS.map(g => ({ ...g, people: list.filter(m => (m.group || 'core') === g.key) })).filter(g => g.people.length);
  }, [data]);
  return (
    <>
      <PageHead title="Team" intro="The students who run the club this year." />
      <section className="section">
        <div className="wrap">
          <ErrorNote msg={error} />
          {loading && !data ? <Skeletons n={4} kind="member" /> : groups.length ? groups.map((g, i) => (
            <Reveal key={g.key} className="team-group">
              <h2 className="sub-title">{g.label}</h2>
              <div className={`grid-member ${i === 0 && g.key === 'leads' ? 'leads-grid' : ''}`}>{g.people.map(m => <MemberCard key={m.id} m={m} big={g.key === 'leads'} />)}</div>
            </Reveal>
          )) : <Empty title="The team list is being updated." />}
        </div>
      </section>
    </>
  );
}
