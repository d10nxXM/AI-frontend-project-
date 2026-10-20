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
  note: 'Allergic to ammonia',
  createdAt: '2026-10-20',
}

const NOW = new Date(Date.UTC(2026, 9, 20, 8, 5, 9))
const file = (b: Booking, url?: string) => bookingCalendarFile(b, url, NOW)
const lines = (ics: string) => ics.split('\r\n')
const unfold = (ics: string) => ics.replace(/\r\n /g, '')
// Every property name the file is allowed to have.
const ALLOWED =
  /^(BEGIN|END|VERSION|PRODID|CALSCALE|METHOD|UID|DTSTAMP|DTSTART|DTEND|SUMMARY|LOCATION|DESCRIPTION|URL)[:;]/

describe('bookingCalendarFile', () => {
  it('is one event with local start and end times', () => {
    expect(lines(file(booking))).toEqual(
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

  it('leaves out the phone number and the note, and links to the booking', () => {
    const ics = unfold(file(booking, 'https://zakazi.me/bookings/7'))
    expect(ics).toContain('DESCRIPTION:Booked for Ana Petrovic on Zakazi.me')
    expect(ics).toContain('URL:https://zakazi.me/bookings/7')
    expect(ics).not.toContain('555')
    expect(ics).not.toContain('ammonia')
  })

  it('uses CRLF line endings, including after the last line', () => {
    const ics = file(booking)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/)
  })

  it('ends on the next day when the booking runs past midnight', () => {
    const late = { ...booking, startsAt: '2026-10-21T23:30', durationMinutes: 60 }
    expect(lines(file(late))).toContain('DTEND:20261022T003000')
  })

  it('escapes commas, semicolons and backslashes in text', () => {
    const tricky = { ...booking, serviceName: 'Cut; wash\\dry, style' }
    expect(unfold(file(tricky))).toContain('SUMMARY:Cut\\; wash\\\\dry\\, style at Studio Lana')
  })

  it('cannot be tricked into new properties by any kind of line break or control character', () => {
    const attack = {
      ...booking,
      serviceName: 'Cut\rURL:https://evil.example\nATTENDEE:mailto:x@evil.example\r\nBEGIN:VALARM',
      address: `Njegoseva 12${String.fromCharCode(0)}${String.fromCharCode(11)}${String.fromCharCode(127)}`,
      clientName: 'Ana\rORGANIZER:mailto:boss@evil.example',
    }
    const ics = file(attack)
    // No raw CR or LF except the CRLF between lines.
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/)
    // After unfolding, every line is one of the known properties.
    for (const line of lines(unfold(ics)).filter(Boolean)) expect(line).toMatch(ALLOWED)
    expect(unfold(ics)).toContain('SUMMARY:Cut\\nURL:https://evil.example\\nATTENDEE')
    expect(unfold(ics)).toContain('LOCATION:Njegoseva 12\\, Podgorica')
  })

  it('folds lines longer than 75 bytes, counting non-ASCII letters as more than one byte', () => {
    const long = { ...booking, serviceName: 'Šišanje i feniranje za duže kose '.repeat(4).trim() }
    const ics = file(long)
    const bytes = (text: string) => new TextEncoder().encode(text).length
    expect(lines(ics).every((line) => bytes(line) <= 75)).toBe(true)
    // Unfolding (removing CRLF + space) gives back the full line, with no letter split in two.
    expect(unfold(ics)).toContain(`SUMMARY:${long.serviceName} at Studio Lana`)
  })

  it('refuses an invalid time or duration instead of writing it into the file', () => {
    expect(() => file({ ...booking, startsAt: '2026-10-21T18:30\r\nX:1' })).toThrow('not valid')
    expect(() => file({ ...booking, startsAt: '2026-13-45T99:99' })).toThrow('not valid')
    expect(() => file({ ...booking, durationMinutes: 0 })).toThrow('not valid')
    expect(() => file({ ...booking, durationMinutes: 1.5 })).toThrow('not valid')
  })
})

describe('bookingCalendarFileName', () => {
  it('uses the date and a safe version of the service name', () => {
    expect(bookingCalendarFileName({ ...booking, serviceName: "Women's haircut & blow-dry" })).toBe(
      'zakazi-2026-10-21-women-s-haircut-blow-dry.ics',
    )
  })
})
