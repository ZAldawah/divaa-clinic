import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
export const metadata = { title: 'Page not found | Divaa Beauty Clinic', robots: { index: false, follow: false } };
export default function NotFound() {
  return <html lang="en"><body><Navbar/><main id="main-content" tabIndex={-1} className="content-width section-space"><p className="eyebrow">Page not found</p><h1>Let’s find your way.</h1><p className="hero-intro">This page is unavailable. Explore our services or return to the homepage.</p><div className="action-row"><a className="button" href="/">Return home</a><a className="text-link" href="/#services">Explore services</a></div></main><Footer/></body></html>;
}
