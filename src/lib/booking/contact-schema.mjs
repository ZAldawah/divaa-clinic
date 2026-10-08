import { z } from 'zod';

// Shared contact rules only; no server configuration or scheduling dependencies.
export const contactShape = {
  name: z.string().trim().min(1).max(100),
  email: z.email().max(254),
};
export const contactSchema = z.object(contactShape);
