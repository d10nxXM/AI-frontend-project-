import { describe, expect, it } from 'vitest'

import { averageRating, reviewCountLabel } from './average-rating'
import { reviewSchema } from './review-schema'
import { shortName } from './short-name'

describe('averageRating', () => {
  it('is the mean to one decimal, or undefined without reviews', () => {
    expect(averageRating([{ rating: 5 }, { rating: 4 }, { rating: 5 }])).toBe(4.7)
    expect(averageRating([{ rating: 3 }])).toBe(3)
    expect(averageRating([])).toBeUndefined()
  })

  it('counts reviews in words', () => {
    expect(reviewCountLabel(1)).toBe('1 review')
    expect(reviewCountLabel(3)).toBe('3 reviews')
  })
})

describe('shortName', () => {
  it('shows only a first name and an initial', () => {
    expect(shortName('Milena Vukovic')).toBe('Milena V.')
    expect(shortName('  ana   petrovic  ')).toBe('ana P.')
    expect(shortName('Marko')).toBe('Marko')
  })

  it('uses the last word as the surname and keeps whole letters', () => {
    expect(shortName('Ana Marija Petrovic')).toBe('Ana P.')
    // "Šarić" typed as S + combining caron (NFD) still gives "Š."
    expect(shortName('Mila Šarić')).toBe('Mila Š.')
    // An emoji surname is not cut into half a character.
    expect(shortName('Ana \u{1F600}x')).toBe('Ana \u{1F600}.')
    expect(shortName('   ')).toBe('')
  })
})

describe('reviewSchema', () => {
  it('accepts 1 to 5 stars and trims the comment', () => {
    expect(reviewSchema.parse({ rating: 4, comment: '  Great  ' })).toEqual({ rating: 4, comment: 'Great' })
    expect(reviewSchema.parse({ rating: '5', comment: '   ' })).toEqual({ rating: 5, comment: undefined })
  })

  it('rejects no rating, out of range or half stars', () => {
    for (const rating of [0, 6, 4.5, 'x', undefined]) {
      expect(reviewSchema.safeParse({ rating }).success).toBe(false)
    }
  })

  it('rejects a comment over 500 characters', () => {
    expect(reviewSchema.safeParse({ rating: 5, comment: 'x'.repeat(501) }).success).toBe(false)
  })
})
