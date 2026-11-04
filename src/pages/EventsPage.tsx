import { useMemo, useState } from 'react';
import { useEvents, today } from '../site/data';
import type { EventItem } from '../site/types';
import { PageHead, EventCard, EventDetail, Modal, Skeletons, Empty, ErrorNote, Reveal } from '../site/ui';

export default function EventsPage() {
  const { data, loading, error } = useEvents();
  const [open, setOpen] = useState<EventItem | null>(null);
  const { up, past } = useMemo(() => {
    const t = today(), list = data ?? [];
    return {
      up: list.filter(e => e.date >= t).sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)),
      past: list.filter(e => e.date < t).sort((a, b) => b.date.localeCompare(a.date)),
    };
  }, [data]);
  return (
    <>
      <PageHead title="Events" intro="Workshops, build nights and competitions. At an event, scan the QR on the screen with your phone to mark attendance." />
      <section className="section">
        <div className="wrap">
          <ErrorNote msg={error} />
          <h2 className="sub-title">Upcoming</h2>
          {loading && !data ? <Skeletons n={2} kind="row" /> : up.length ? (
            <div className="event-list">{up.map(e => <EventCard key={e.id} ev={e} onOpen={setOpen} />)}</div>
          ) : <Empty title="Nothing scheduled yet.">Check back soon.</Empty>}
          {past.length > 0 && (
            <Reveal className="past-block">
              <h2 className="sub-title">Past events</h2>
              <div className="event-list compact">{past.map(e => <EventCard key={e.id} ev={e} onOpen={setOpen} past />)}</div>
            </Reveal>
          )}
        </div>
      </section>
      <Modal open={!!open} onClose={() => setOpen(null)} label="Event details">{open && <EventDetail ev={open} />}</Modal>
    </>
  );
}
