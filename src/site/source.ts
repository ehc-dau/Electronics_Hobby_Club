// Reads the website's content from Firestore. Uses Firestore Lite: no live updates, a fraction
// of the download size, which is all a public content site needs.
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, query, where, orderBy, limit, startAfter, getDocs, getDoc, doc,
  type QueryConstraint, type QueryDocumentSnapshot, type DocumentData,
} from 'firebase/firestore/lite';
import { FIREBASE } from './config';
import type { Settings, EventItem, Project, Member, Photo, GalleryPage } from './types';

const db = getFirestore(initializeApp(FIREBASE));
const rows = <T,>(snap: { docs: QueryDocumentSnapshot<DocumentData>[] }) => snap.docs.map(d => ({ id: d.id, ...d.data() }) as T);
const needsIndex = (e: unknown) => /index|failed-precondition/i.test(String((e as { code?: string; message?: string })?.code ?? '') + String((e as Error)?.message ?? ''));

// Published items, newest first. Until the database index exists (it builds a few minutes after
// `firebase deploy`), falls back to loading everything and sorting here.
async function published<T extends object>(name: string, extra: QueryConstraint[] = [], dated = false): Promise<T[]> {
  const base = query(collection(db, name), where('published', '==', true));
  if (!dated) return rows<T>(await getDocs(base));
  try {
    return rows<T>(await getDocs(query(collection(db, name), where('published', '==', true), orderBy('date', 'desc'), ...extra)));
  } catch (e) {
    if (!needsIndex(e)) throw e;
    const byDate = (x: T) => String((x as { date?: string }).date ?? '');
    return rows<T>(await getDocs(base)).sort((a, b) => byDate(b).localeCompare(byDate(a)));
  }
}

export async function loadSettings(): Promise<Settings | null> {
  const s = await getDoc(doc(db, 'site', 'settings'));
  return s.exists() ? (s.data() as Settings) : null;
}
export const loadEvents = () => published<EventItem>('events', [limit(150)], true);
export const loadProjects = () => published<Project>('projects');
export const loadTeam = () => published<Member>('team');

let galleryCursor: QueryDocumentSnapshot<DocumentData> | null = null;
export async function loadGallery(pageSize: number, more = false): Promise<GalleryPage> {
  if (!more) galleryCursor = null;
  try {
    const cons: QueryConstraint[] = [where('published', '==', true), orderBy('date', 'desc'), limit(pageSize)];
    if (galleryCursor) cons.push(startAfter(galleryCursor));
    const snap = await getDocs(query(collection(db, 'gallery'), ...cons));
    galleryCursor = snap.docs[snap.docs.length - 1] ?? galleryCursor;
    return { items: rows<Photo>(snap), more: snap.docs.length === pageSize };
  } catch (e) {
    if (!needsIndex(e) || more) throw e;
    const all = await published<Photo>('gallery');
    return { items: all.sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? ''))), more: false };
  }
}
// Full-size image for the lightbox; the lists only carry small versions.
export async function loadPhoto(id: string): Promise<string> {
  const s = await getDoc(doc(db, 'photos', id));
  return s.exists() ? String(s.data().data ?? '') : '';
}
// A preview link from the dashboard: /?preview=<key>. Knowing the key is the permission.
export async function checkPreview(key: string): Promise<boolean> {
  if (!/^[A-Za-z0-9]{12,64}$/.test(key)) return false;
  return (await getDoc(doc(db, 'sitePreview', key))).exists();
}
