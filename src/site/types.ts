export interface Settings {
  public: boolean;
  tagline?: string;
  about?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
}
export interface EventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start?: string;
  end?: string;
  venue?: string;
  description?: string;
  poster?: string; // small JPEG data URL; full size in photos/event_<id>
  attendeeCount?: number;
}
export interface Project {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  status?: 'ongoing' | 'completed';
  year?: string;
  team?: string;
  tags?: string[];
  link?: string;
  image?: string; // card image; full size in photos/project_<id>
  featured?: boolean;
  order?: number;
}
export type Group = 'leads' | 'core' | 'extended' | 'faculty';
export interface Member {
  id: string;
  name: string;
  role?: string;
  group?: Group;
  order?: number;
  photo?: string;
  linkedin?: string;
  github?: string;
  email?: string;
}
export interface Photo {
  id: string;
  caption?: string;
  date?: string;
  event?: string;
  image: string; // grid image; full size in photos/gallery_<id>
}
export interface GalleryPage {
  items: Photo[];
  more: boolean;
}
