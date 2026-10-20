import { z } from 'zod'

// Rules for who a booking is for (docs/entities.md); also trims the values it returns.
export const clientDetailsSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, 'Enter your name (at least 2 characters).')
    .max(60, 'Use at most 60 characters.'),
  clientPhone: z
    .string()
    .trim()
    .regex(/^\+?[\d ]{6,20}$/, 'Enter a phone number with digits only, e.g. +382 67 123 456.')
    .refine((phone) => phone.replace(/\D/g, '').length >= 6, 'Enter at least 6 digits.'),
  note: z
    .string()
    .trim()
    .max(200, 'Use at most 200 characters.')
    .optional()
    // An empty note is stored as no note.
    .transform((note) => note || undefined),
})
