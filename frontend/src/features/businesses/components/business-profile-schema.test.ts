import { describe, expect, it } from 'vitest'

import { businessProfileSchema } from './business-profile-schema'

const valid = {
  name: 'Studio Lana',
  city: 'Podgorica',
  address: 'Njegoseva 12',
  openingHours: 'Mon–Sat 09:00–19:00',
  description: "Women's hair salon.",
  imageUrl: 'https://picsum.photos/seed/zakazi-lana/600/338',
}

const fails = (changes: Partial<typeof valid>) =>
  !businessProfileSchema.safeParse({ ...valid, ...changes }).success

describe('businessProfileSchema', () => {
  it('accepts a full profile and trims every field', () => {
    expect(businessProfileSchema.parse({ ...valid, name: '  Studio Lana  ', imageUrl: ' ' })).toEqual({
      ...valid,
      imageUrl: '',
    })
  })

  it('checks the length of the name, city and address', () => {
    expect(fails({ name: 'A' })).toBe(true)
    expect(fails({ name: 'A'.repeat(81) })).toBe(true)
    expect(fails({ city: ' ' })).toBe(true)
    expect(fails({ address: 'x'.repeat(121) })).toBe(true)
    expect(fails({ openingHours: '' })).toBe(true)
    expect(fails({ description: '' })).toBe(true)
    expect(fails({ description: 'x'.repeat(501) })).toBe(true)
  })

  it('allows line breaks only in the description', () => {
    expect(fails({ description: 'Cuts.\nColour.' })).toBe(false)
    expect(fails({ description: 'Cuts.\tColour.' })).toBe(true)
    expect(fails({ name: 'Studio\nLana' })).toBe(true)
    expect(fails({ openingHours: 'Mon–Sat\u000009:00' })).toBe(true)
  })

  it('takes only https photo links, or none', () => {
    expect(fails({ imageUrl: '' })).toBe(false)
    expect(fails({ imageUrl: 'http://example.com/a.jpg' })).toBe(true)
    expect(fails({ imageUrl: 'javascript:alert(1)' })).toBe(true)
    expect(fails({ imageUrl: 'data:image/png;base64,AAAA' })).toBe(true)
    expect(fails({ imageUrl: 'not a link' })).toBe(true)
  })
})
