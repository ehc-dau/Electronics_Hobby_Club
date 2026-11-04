import { useCallback, useEffect, useState } from 'react';
import { loadGallery } from '../site/data';
import type { Photo } from '../site/types';
import { PageHead, Modal, FullImage, Icon, Skeletons, Empty, ErrorNote } from '../site/ui';

const PAGE = 24;
export default function GalleryPage() {
  const [items, setItems] = useState<Photo[] | null>(null);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [at, setAt] = useState<number | null>(null);
  useEffect(() => {
    loadGallery(PAGE).then(p => { setItems(p.items); setMore(p.more); }).catch(() => { setItems([]); setError('Couldn’t load photos right now. Refresh to try again.'); });
  }, []);
  const loadMore = async () => {
    setBusy(true);
    try { const p = await loadGallery(PAGE, true); setItems(cur => [...(cur ?? []), ...p.items]); setMore(p.more); }
    catch { setError('Couldn’t load more photos.'); }
    setBusy(false);
  };
  const step = useCallback((d: number) => setAt(i => (i === null || !items ? i : (i + d + items.length) % items.length)), [items]);
  useEffect(() => {
    if (at === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [at, step]);
  const cur = at !== null && items ? items[at] : null;
  return (
    <>
      <PageHead title="Gallery" intro="Workshops, competitions and late nights in the lab." />
      <section className="section">
        <div className="wrap">
          <ErrorNote msg={error} />
          {items === null ? <Skeletons n={6} kind="photo" /> : items.length ? (
            <>
              <div className="masonry">
                {items.map((p, i) => (
                  <button key={p.id} className="tile" onClick={() => setAt(i)} aria-label={p.caption ? `Open photo: ${p.caption}` : 'Open photo'}>
                    <img src={p.image} alt={p.caption || 'Club photo'} loading="lazy" decoding="async" />
                    {p.caption && <span className="tile-cap">{p.caption}</span>}
                  </button>
                ))}
              </div>
              {more && <div className="center"><button className="btn btn-dark" onClick={loadMore} disabled={busy}>{busy ? 'Loading…' : 'Load more photos'}</button></div>}
            </>
          ) : <Empty title="Photos are on their way." />}
        </div>
      </section>
      <Modal open={!!cur} onClose={() => setAt(null)} label="Photo" wide>
        {cur && (
          <figure className="viewer">
            <FullImage photoId={`gallery_${cur.id}`} thumb={cur.image} alt={cur.caption || 'Club photo'} />
            {(cur.caption || cur.event) && <figcaption>{cur.caption}{cur.event && <span>{cur.event}</span>}</figcaption>}
            {items && items.length > 1 && (<>
              <button className="viewer-nav prev" onClick={() => step(-1)} aria-label="Previous photo">{Icon.left}</button>
              <button className="viewer-nav next" onClick={() => step(1)} aria-label="Next photo">{Icon.right}</button>
            </>)}
          </figure>
        )}
      </Modal>
    </>
  );
}
