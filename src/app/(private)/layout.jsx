import '../globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
export default function PrivateLayout({children}) {
 return <html lang="en"><body className="antialiased"><Navbar/>{children}<Footer/></body></html>;
}
