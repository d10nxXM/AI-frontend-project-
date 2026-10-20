import { describe, expect, it } from 'vitest'

import { parseFavorites } from './favorites-store'

describe('parseFavorites', () => {
  it('reads a stored list of business ids', () => {
    expect(parseFavorites('[1,3]')).toEqual([1, 3])
  })

  it('returns an empty list for nothing, broken JSON or the wrong shape', () => {
    for (const raw of [null, '', 'not json', '{"1":true}', '"1"', '42', 'null']) {
      expect(parseFavorites(raw)).toEqual([])
    }
  })

  it('keeps only positive whole numbers, without duplicates', () => {
    expect(parseFavorites('[1, "2", -3, 0, 4.5, 1, null, 5]')).toEqual([1, 5])
  })

  it('keeps at most 100 favorites', () => {
    const many = JSON.stringify(Array.from({ length: 150 }, (_, i) => i + 1))
    expect(parseFavorites(many)).toHaveLength(100)
  })
})
