import { describe, expect, it } from 'vitest'

import { serviceSchema } from './service-schema'

const valid = {
  name: '  Blow-dry ',
  description: ' Wash and blow-dry. ',
  price: '12.50',
  durationMinutes: '30',
}

describe('serviceSchema', () => {
  it('trims the text and turns price and duration into numbers', () => {
    expect(serviceSchema.parse(valid)).toEqual({
      name: 'Blow-dry',
      description: 'Wash and blow-dry.',
      price: 12.5,
      durationMinutes: 30,
    })
  })

  it('accepts a free service and a comma as the decimal mark', () => {
    expect(serviceSchema.parse({ ...valid, price: '0' }).price).toBe(0)
    expect(serviceSchema.parse({ ...valid, price: '9,99' }).price).toBe(9.99)
  })

  it('rejects names that are too short or too long', () => {
    expect(serviceSchema.safeParse({ ...valid, name: ' a ' }).success).toBe(false)
    expect(serviceSchema.safeParse({ ...valid, name: 'a'.repeat(81) }).success).toBe(false)
  })

  it('requires a description of at most 500 characters', () => {
    expect(serviceSchema.safeParse({ ...valid, description: '   ' }).success).toBe(false)
    expect(serviceSchema.safeParse({ ...valid, description: 'a'.repeat(501) }).success).toBe(false)
  })

  it('rejects negative prices, more than two decimals and other text', () => {
    for (const price of ['-5', '12.345', 'abc', '', '1e3']) {
      expect(serviceSchema.safeParse({ ...valid, price }).success, price).toBe(false)
    }
  })

  it('takes whole minutes from 5 to 480 only', () => {
    for (const durationMinutes of ['0', '4', '481', '30.5', '-30', '']) {
      expect(serviceSchema.safeParse({ ...valid, durationMinutes }).success, durationMinutes).toBe(false)
    }
    expect(serviceSchema.parse({ ...valid, durationMinutes: '480' }).durationMinutes).toBe(480)
  })

  it('rejects control characters, but allows line breaks in the description', () => {
    expect(serviceSchema.safeParse({ ...valid, name: 'Blow\tdry' }).success).toBe(false)
    expect(serviceSchema.safeParse({ ...valid, description: 'Wash\u0000' }).success).toBe(false)
    expect(serviceSchema.parse({ ...valid, description: 'Wash.\nBlow-dry.' }).description).toBe(
      'Wash.\nBlow-dry.',
    )
  })
})
