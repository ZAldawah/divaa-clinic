import ServiceLayout from '@/components/layout/ServiceLayout';
import { serviceMetadata } from '@/lib/services.mjs';
export const metadata = serviceMetadata('facials');
export default function Page() { return <ServiceLayout serviceId="facials"/>; }
