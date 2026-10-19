'use client';
export default function ErrorPage({ reset }) {
  return <main id="main-content" tabIndex={-1} className="content-width section-space"><p className="eyebrow">Something went wrong</p><h1>This page couldn’t load.</h1><p className="hero-intro">Try again, or return to the homepage.</p><div className="action-row"><button className="button" onClick={reset}>Try again</button><a className="text-link" href="/">Return home</a></div></main>;
}
