import '@/app/booking.css';
import { notFound } from 'next/navigation';
import { bookingQaEnabled } from '@/lib/booking/qa-guard.mjs';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Local booking QA simulation', robots: { index: false, follow: false } };
export default async function BookingQaPage() {
  if (!bookingQaEnabled(process.env)) notFound();
  const { default: BookingQa } = await import('@/components/BookingQa');
  return <BookingQa />;
}

