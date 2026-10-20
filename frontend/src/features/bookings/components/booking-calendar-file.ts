import type { Booking } from '../types'

// Builds an iCalendar (.ics) file for one booking, which phones and Outlook/Google add to the calendar.
// Times are "floating" local times (no time zone), exactly as the business wrote them, so a client
// in the same city sees the same 18:00 without any time zone conversion.

// RFC 5545: escape backslash, semicolon and comma, and turn line breaks into \n.
const escapeText = (text: string) =>
  text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

// RFC 5545: lines longer than 75 characters continue on the next line, which starts with a space.
function fold(line: string) {
  const parts: string[] = []
  for (let i = 0; i < line.length; i += i === 0 ? 75 : 74) {
    parts.push(line.slice(i, i === 0 ? 75 : i + 74))
  }
  return parts.join('\r\n ')
}

// `2026-10-21T18:00` -> `20261021T180000`
const toIcsLocal = (startsAt: string) => `${startsAt.replace(/[-:]/g, '')}00`

function addMinutes(startsAt: string, minutes: number) {
  const end = new Date(Date.parse(`${startsAt}Z`) + minutes * 60_000)
  return end.toISOString().slice(0, 16)
}

export function bookingCalendarFile(booking: Booking, now = new Date()) {
  const stamp = `${now.toISOString().slice(0, 19).replace(/[-:]/g, '')}Z`
  const description = [`Booked for ${booking.clientName}, ${booking.clientPhone}`, booking.note]
    .filter(Boolean)
    .join('\n')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zakazi.me//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:booking-${booking.id}@zakazi.me`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsLocal(booking.startsAt)}`,
    `DTEND:${toIcsLocal(addMinutes(booking.startsAt, booking.durationMinutes))}`,
    `SUMMARY:${escapeText(`${booking.serviceName} at ${booking.businessName}`)}`,
    `LOCATION:${escapeText(`${booking.address}, ${booking.city}`)}`,
    `DESCRIPTION:${escapeText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  // Lines end with CRLF, including the last one.
  return `${lines.map(fold).join('\r\n')}\r\n`
}

// A file name like `zakazi-2026-10-21-full-colour.ics`.
export const bookingCalendarFileName = (booking: Booking) =>
  `zakazi-${booking.startsAt.slice(0, 10)}-${booking.serviceName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}.ics`
