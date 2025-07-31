import Link from "next/link";

const Navbar = () => {
    return (
        <div className="navbar-section">
          <div className="navbar">
            <Link href="/" className="navbar-logo">
              <img src="/pictures/logo5.png" alt="Divaa Logo" />
            </Link>
            <div className="navbar-links">
              <a
                href="sms:8329929422?&body=Hi%20I%27m%20interested%20in%20Botox%20services%20at%20Divaa"
                className="contact-button"
              >
                CONSULT NOW: (832) 992-9422
              </a>
            </div>
          </div>
        </div>
)
}

export default Navbar;