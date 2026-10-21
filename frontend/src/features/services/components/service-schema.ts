import { z } from 'zod'

// Rules for a service (docs/entities.md). The form keeps every field as typed text; the schema
// trims it and turns price and duration into numbers.
// U+0000–U+001F and U+007F (docs/entities.md, security); line breaks only where allowed.
const hasControlCharacters = (text: string, allowLineBreaks: boolean) =>
  [...text].some((char) => {
    if (allowLineBreaks && (char === '\n' || char === '\r')) return false
    const code = char.charCodeAt(0)
    return code <= 0x1f || code === 0x7f
  })

export const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter a name (at least 2 characters).')
    .max(80, 'Use at most 80 characters.')
    .refine((name) => !hasControlCharacters(name, false), 'Remove tabs and other special characters.'),
  description: z
    .string()
    .trim()
    .min(1, 'Enter a short description.')
    .max(500, 'Use at most 500 characters.')
    .refine((text) => !hasControlCharacters(text, true), 'Remove tabs and other special characters.'),
  // Euros with at most two decimals; a comma works as the decimal mark too.
  price: z
    .string()
    .trim()
    .regex(/^\d{1,5}([.,]\d{1,2})?$/, 'Enter a price in euros, e.g. 25 or 12.50.')
    .transform((price) => Number(price.replace(',', '.'))),
  durationMinutes: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, 'Enter the length in whole minutes, e.g. 45.')
    .transform(Number)
    .refine((minutes) => minutes >= 5 && minutes <= 480, 'Use 5 to 480 minutes.'),
})

export type ServiceFormValues = z.input<typeof serviceSchema>
