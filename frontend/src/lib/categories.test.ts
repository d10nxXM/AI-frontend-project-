import { describe, expect, it } from 'vitest'

import { isCategory } from './categories'

describe('isCategory', () => {
  it('accepts the three categories', () => {
    expect(['hair', 'gym', 'service'].every(isCategory)).toBe(true)
  })

  it('rejects anything else from the URL, including inherited object keys', () => {
    for (const value of [
      null,
      '',
      'bakery',
      'Hair',
      'constructor',
      'toString',
      '__proto__',
      'hasOwnProperty',
    ]) {
      expect(isCategory(value)).toBe(false)
    }
  })
})
