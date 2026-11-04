// Small fetch-and-remember layer. Pages render instantly from memory when you navigate back,
// and from sessionStorage on reload, then quietly refresh.
import { useEffect, useState } from 'react';
import * as source from '@site-source';
import type { Settings, EventItem, Project, Member } from './types';

const memory = new Map<string, unknown>();
const STORE = 'ehc-site:';
function read<T>(key: string): T | undefined {
  if (memory.has(key)) return memory.get(key) as T;
  try {
    const raw = sessionStorage.getItem(STORE + key);
    if (raw) { const v = JSON.parse(raw) as T; memory.set(key, v); return v; }
  } catch { /* storage unavailable or full */ }
  return undefined;
}
function write(key: string, value: unknown, persist: boolean) {
  memory.set(key, value);
  if (persist) try { sessionStorage.setItem(STORE + key, JSON.stringify(value)); } catch { /* too big to keep; memory is enough */ }
}
const inflight = new Map<string, Promise<unknown>>();
function fetchOnce<T>(key: string, loader: () => Promise<T>, persist: boolean): Promise<T> {
  if (!inflight.has(key)) {
    inflight.set(key, loader().then(v => { write(key, v, persist); return v; }).finally(() => inflight.delete(key)));
  }
  return inflight.get(key) as Promise<T>;
}

export interface Loaded<T> { data: T | undefined; error: string; loading: boolean }
export function useData<T>(key: string, loader: () => Promise<T>, persist = true): Loaded<T> {
  const [state, setState] = useState<Loaded<T>>(() => { const d = read<T>(key); return { data: d, error: '', loading: d === undefined }; });
  useEffect(() => {
    let live = true;
    fetchOnce(key, loader, persist)
      .then(v => { if (live) setState({ data: v, error: '', loading: false }); })
      .catch(() => { if (live) setState(s => ({ ...s, error: 'Couldn’t load this right now. Check your connection and refresh.', loading: false })); });
    return () => { live = false; };
    // the key identifies the loader
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}

export const useSettings = () => useData<Settings | null>('settings', source.loadSettings);
export const useEvents = () => useData<EventItem[]>('events', source.loadEvents);
export const useProjects = () => useData<Project[]>('projects', source.loadProjects, false);
export const useTeam = () => useData<Member[]>('team', source.loadTeam, false);
export const loadGallery = source.loadGallery;
export const loadPhoto = source.loadPhoto;
export const checkPreview = source.checkPreview;

// Preloads the main lists while the visitor reads the home page, so other pages open instantly.
export function warmUp() {
  const idle = (cb: () => void) => ('requestIdleCallback' in window ? (window as unknown as { requestIdleCallback: (f: () => void) => void }).requestIdleCallback(cb) : setTimeout(cb, 1200));
  idle(() => { fetchOnce('team', source.loadTeam, false).catch(() => {}); fetchOnce('projects', source.loadProjects, false).catch(() => {}); });
}

export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const parseDay = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const fmtTime = (t?: string) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return new Date(2000, 0, 1, h, m).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }); };
export const eventWhen = (e: EventItem) => [parseDay(e.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }), e.start ? `${fmtTime(e.start)}${e.end ? ` to ${fmtTime(e.end)}` : ''}` : '', e.venue].filter(Boolean).join(', ');
export const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
export const GROUPS: { key: string; label: string }[] = [
  { key: 'leads', label: 'Convenors' }, { key: 'core', label: 'Core team' }, { key: 'extended', label: 'Extended core' }, { key: 'faculty', label: 'Faculty advisors' },
];
export function sortTeam<T extends { group?: string; order?: number; name: string }>(list: T[]): T[] {
  const g = (k?: string) => { const i = GROUPS.findIndex(x => x.key === k); return i < 0 ? 9 : i; };
  return [...list].sort((a, b) => g(a.group) - g(b.group) || (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name));
}
