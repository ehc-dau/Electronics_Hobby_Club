import { lazy, Suspense } from 'react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from './site/Layout';
import Home from './pages/Home';

// The other pages load on demand, so the first visit only downloads the home page.
const EventsPage = lazy(() => import('./pages/EventsPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// The preview build runs inside a page that doesn't own the URL, so it keeps routes in memory.
const Router = import.meta.env.VITE_MEMORY_ROUTER === '1' ? MemoryRouter : BrowserRouter;

export default function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}
