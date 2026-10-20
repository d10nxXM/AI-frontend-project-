import { describe, expect, it } from 'vitest'

import { directionsUrl } from './maps'

describe('directionsUrl', () => {
  it('searches Google Maps for the address and city, safely encoded', () => {
    const url = new URL(directionsUrl('Bulevar Svetog Petra Cetinjskog 45', 'Podgorica'))
    expect(url.origin).toBe('https://www.google.com')
    expect(url.pathname).toBe('/maps/search/')
    expect(url.searchParams.get('api')).toBe('1')
    expect(url.searchParams.get('query')).toBe('Bulevar Svetog Petra Cetinjskog 45, Podgorica')
  })

  it('keeps characters like & and # inside the query', () => {
    const url = new URL(directionsUrl('Trg #1 & Co', 'Bar'))
    expect(url.searchParams.get('query')).toBe('Trg #1 & Co, Bar')
    expect(url.hash).toBe('')
  })
})
