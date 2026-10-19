export default function Footer() {
  return <footer className="site-footer">
    <div className="content-width footer-grid">
      <div><a className="wordmark" href="/">divaa<span>BEAUTY CLINIC</span></a><p>11777 Katy Fwy<br/>Houston, TX 77079</p></div>
      <div><p className="eyebrow">Get in touch</p><a className="footer-phone" href="tel:+18329929422">832-992-9422</a><a href="sms:8329929422">Text the clinic</a></div>
      <nav aria-label="Footer navigation"><a href="/#services">Explore services</a><a href="sms:8329929422?body=Hi%20Divaa%20Beauty%20Clinic%2C%20I%E2%80%99d%20like%20help%20with%20booking%2C%20services%2C%20or%20my%20questions.">Text us about booking, services, or questions</a></nav>
    </div>
    <div className="content-width footer-bottom"><span>© {new Date().getFullYear()} Divaa Beauty Clinic</span><span>Houston, Texas</span></div>
  </footer>;
}
