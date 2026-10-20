import { describe, expect, it } from 'vitest'

import { clientDetailsSchema } from './client-details-schema'

const valid = { clientName: 'Ana Petrovic', clientPhone: '+382 69 555 123' }
const errorFor = (input: Record<string, string>) =>
  clientDetailsSchema.safeParse({ ...valid, ...input }).error?.issues[0]?.message

describe('clientDetailsSchema', () => {
  it('accepts a name and phone, and trims them', () => {
    expect(clientDetailsSchema.parse({ clientName: '  Ana Petrovic ', clientPhone: ' 069555123 ' })).toEqual({
      clientName: 'Ana Petrovic',
      clientPhone: '069555123',
      note: undefined,
    })
  })

  it('stores an empty or blank note as no note', () => {
    expect(clientDetailsSchema.parse({ ...valid, note: '   ' }).note).toBeUndefined()
    expect(clientDetailsSchema.parse({ ...valid, note: ' First visit ' }).note).toBe('First visit')
  })

  it('rejects a name that is too short or too long', () => {
    expect(errorFor({ clientName: 'A' })).toMatch(/at least 2/)
    expect(errorFor({ clientName: ' A ' })).toMatch(/at least 2/)
    expect(errorFor({ clientName: 'x'.repeat(61) })).toMatch(/at most 60/)
  })

  it('rejects phones with letters or symbols, or too few digits', () => {
    expect(errorFor({ clientPhone: '067-123-456' })).toMatch(/digits only/)
    expect(errorFor({ clientPhone: 'call me' })).toMatch(/digits only/)
    expect(errorFor({ clientPhone: '12345' })).toMatch(/digits only/)
    expect(errorFor({ clientPhone: '+1 2 3 4 5' })).toMatch(/at least 6 digits/)
  })

  it('allows a leading + and spaces', () => {
    expect(errorFor({ clientPhone: '+382 67 123 456' })).toBeUndefined()
  })

  it('rejects a note over 200 characters', () => {
    expect(errorFor({ note: 'x'.repeat(201) })).toMatch(/at most 200/)
  })
})
