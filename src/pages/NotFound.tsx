import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <section className="section notfound">
      <div className="wrap">
        <p className="kicker dark">404</p>
        <h1 className="page-title">This page isn’t wired up</h1>
        <p className="page-intro">The link may be old, or the page has moved.</p>
        <Link className="btn btn-dark" to="/">Back to the home page</Link>
      </div>
    </section>
  );
}
