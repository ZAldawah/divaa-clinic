import ServiceLayout from '@/components/layout/ServiceLayout';
import { serviceMetadata } from '@/lib/services.mjs';
export const metadata = serviceMetadata('prp');
export default function Page() { return <ServiceLayout serviceId="prp"/>; }
