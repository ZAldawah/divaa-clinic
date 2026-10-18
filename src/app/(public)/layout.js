import '../globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
export const metadata = {
  metadataBase: new URL('https://divaabeauty.net'),
  referrer: 'no-referrer',
  title: 'Divaa Beauty Clinic | Houston, Texas',
  description: 'Explore services at Divaa Beauty Clinic in Houston, Texas. Book a consultation or contact the clinic.',
};
export default function PublicLayout({ children }) {
  return <html lang="en"><body><Navbar/>{children}<Footer/></body></html>;
}
