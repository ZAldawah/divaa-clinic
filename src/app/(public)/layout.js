import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalyticsConsent from "@/components/AnalyticsConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  referrer: "no-referrer",
  title: "Divaa Beauty",
  description:
    "Discover the art of rejuvenation with Botox, fillers, facials and more at Divaa Beauty Clinic in Houston.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />

        {children}
        <Footer />
        {process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" && <AnalyticsConsent />}
      </body>
    </html>
  );
}
