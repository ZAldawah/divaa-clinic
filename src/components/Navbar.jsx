import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
    return (
        <div className="navbar-section">
          <div className="navbar">
            <Link href="/" className="navbar-logo">
              <Image src="/pictures/logo5.png" alt="Divaa Beauty home" width={150} height={100} sizes="150px" priority style={{objectFit:'contain',width:'auto',height:'100%'}} />
            </Link>
            <div>
              <a
                href="/book"
                className="contact-button"
              >
                Book appointment
              </a>
            </div>
          </div>
        </div>
)
}

export default Navbar;
