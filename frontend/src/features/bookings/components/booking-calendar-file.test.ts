import { describe, expect, it } from 'vitest'

import type { Booking } from '../types'
import { bookingCalendarFile, bookingCalendarFileName } from './booking-calendar-file'

const booking: Booking = {
  id: 7,
  businessId: 1,
  serviceId: 2,
  slotId: 10101,
  businessName: 'Studio Lana',
  category: 'hair',
  serviceName: 'Full colour',
  serviceDescription: 'Single-tone colour.',
  price: 45,
  city: 'Podgorica',
  address: 'Njegoseva 12',
  startsAt: '2026-10-21T18:30',
  durationMinutes: 120,
  status: 'booked',
  imageUrl: '',
  clientName: 'Ana Petrovic',
  clientPhone: '+382 69 555 123',
  createdAt: '2026-10-20',
}

const NOW = new Date(Date.UTC(2026, 9, 20, 8, 5, 9))
const lines = (ics: string) => ics.split('\r\n')

describe('bookingCalendarFile', () => {
  it('is one event with local start and end times', () => {
    const ics = bookingCalendarFile(booking, NOW)
    expect(lines(ics)).toEqual(
      expect.arrayContaining([
        'BEGIN:VCALENDAR',
        'BEGIN:VEVENT',
        'UID:booking-7@zakazi.me',
        'DTSTAMP:20261020T080509Z',
        'DTSTART:20261021T183000',
        // 18:30 + 120 min
        'DTEND:20261021T203000',
        'SUMMARY:Full colour at Studio Lana',
        'LOCATION:Njegoseva 12\\, Podgorica',
        'END:VEVENT',
        'END:VCALENDAR',
      ]),
    )
  })

  it('uses CRLF line endings, including after the last line', () => {
    const ics = bookingCalendarFile(booking, NOW)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/)
  })

  it('ends on the next day when the booking runs past midnight', () => {
    const late = { ...booking, startsAt: '2026-10-21T23:30', durationMinutes: 60 }
    expect(lines(bookingCalendarFile(late, NOW))).toContain('DTEND:20261022T003000')
  })

  it('escapes commas, semicolons, backslashes and line breaks in text', () => {
    const tricky = { ...booking, note: 'Bring photo; short\\long, ok\nThanks' }
    const ics = bookingCalendarFile(tricky, NOW).replace(/\r\n /g, '')
    expect(ics).toContain(
      'DESCRIPTION:Booked for Ana Petrovic\\, +382 69 555 123\\nBring photo\\; short\\\\long\\, ok\\nThanks',
    )
  })

  it('folds lines longer than 75 characters', () => {
    const long = { ...booking, serviceName: 'Very long service name '.repeat(5).trim() }
    const ics = bookingCalendarFile(long, NOW)
    expect(lines(ics).every((line) => line.length <= 75)).toBe(true)
    // Unfolding (removing CRLF + space) gives back the full line.
    expect(ics.replace(/\r\n /g, '')).toContain(`SUMMARY:${long.serviceName} at Studio Lana`)
  })
})

describe('bookingCalendarFileName', () => {
  it('uses the date and a safe version of the service name', () => {
    expect(bookingCalendarFileName({ ...booking, serviceName: "Women's haircut & blow-dry" })).toBe(
      'zakazi-2026-10-21-women-s-haircut-blow-dry.ics',
    )
  })
})
