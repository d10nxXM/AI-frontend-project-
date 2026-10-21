import { z } from 'zod'

// Control characters break other formats (calendar files, e-mail, CSV), see docs/entities.md.
// Multi-line fields may still contain line breaks.
const isControl = (char: string) => {
  const code = char.charCodeAt(0)
  return code <= 0x1f || code === 0x7f
}
const hasControl = (value: string) => [...value].some(isControl)
const hasControlExceptBreaks = (value: string) =>
  [...value].some((char) => isControl(char) && char !== '\n' && char !== '\r')

const line = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `Enter the ${label} (at least ${min} characters).`)
    .max(max, `Use at most ${max} characters.`)
    .refine((value) => !hasControl(value), 'Remove special characters such as tabs.')

// Only https photos: no http (mixed content), and no javascript: or data: links.
const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

// Rules for the owner's business profile (docs/entities.md); also trims the values it returns.
export const businessProfileSchema = z.object({
  name: line('name', 2, 80),
  city: line('city', 2, 60),
  address: line('address', 2, 120),
  openingHours: line('opening hours', 2, 100),
  description: z
    .string()
    .trim()
    .min(1, 'Enter a short description.')
    .max(500, 'Use at most 500 characters.')
    .refine((value) => !hasControlExceptBreaks(value), 'Remove special characters such as tabs.'),
  // Empty means no photo: the category icon is shown instead.
  imageUrl: z
    .string()
    .trim()
    .max(500, 'Use at most 500 characters.')
    .refine((value) => value === '' || isHttpsUrl(value), 'Enter a photo link that starts with https://.'),
})

export type BusinessProfile = z.infer<typeof businessProfileSchema>
