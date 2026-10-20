import { afterEach, describe, expect, it, vi } from 'vitest'

import { localNow } from './local-time'

describe('localNow', () => {
  afterEach(() => vi.useRealTimers())

  it('uses the same YYYY-MM-DDTHH:mm shape as slot times, with zero padding', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 5, 7, 3))
    expect(localNow()).toBe('2026-01-05T07:03')
  })

  it('compares correctly with slot times as plain strings', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 20, 9, 45))
    expect('2026-10-20T09:30' < localNow()).toBe(true)
    expect('2026-10-20T10:00' < localNow()).toBe(false)
  })
})
