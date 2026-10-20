import { z } from 'zod'

// Rules for a review (docs/entities.md); also trims the comment and drops an empty one.
export const reviewSchema = z.object({
  rating: z.coerce
    .number({ message: 'Choose 1 to 5 stars.' })
    .int('Choose 1 to 5 stars.')
    .min(1, 'Choose 1 to 5 stars.')
    .max(5, 'Choose 1 to 5 stars.'),
  comment: z
    .string()
    .trim()
    .max(500, 'Use at most 500 characters.')
    .optional()
    .transform((comment) => comment || undefined),
})
