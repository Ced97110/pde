import { z } from "zod";
import { unitSlugs } from "@/content/units";

export const contactFormSchema = z.object({
  gite: z.enum(unitSlugs).optional().or(z.literal("")),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  dates: z.string().trim().max(120).optional().or(z.literal("")),
  guests: z.coerce.number().int().min(1).max(20).optional(),
  message: z.string().trim().min(10).max(2000),
  // Honeypot: real users never fill this hidden field.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
