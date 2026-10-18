export default function Footer() {
  return <footer className="site-footer">
    <div className="content-width footer-grid">
      <div><a className="wordmark" href="/">divaa<span>BEAUTY CLINIC</span></a><p>11777 Katy Fwy<br/>Houston, TX 77079</p></div>
      <div><p className="eyebrow">Get in touch</p><a className="footer-phone" href="tel:+18329929422">832-992-9422</a><a href="sms:8329929422">Text the clinic</a></div>
      <nav aria-label="Footer navigation"><a href="/#services">Explore services</a><a href="/book?service=consulting">Book a consultation</a><a href="/admin/login">Staff sign in</a></nav>
    </div>
    <div className="content-width footer-bottom"><span>© {new Date().getFullYear()} Divaa Beauty Clinic</span><span>Houston, Texas</span></div>
  </footer>;
}
