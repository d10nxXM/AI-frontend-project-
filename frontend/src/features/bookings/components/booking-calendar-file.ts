import type { Booking } from '../types'

// Builds an iCalendar (.ics) file for one booking, which phones and Outlook/Google add to the calendar.
// Times are "floating" local times (no time zone), exactly as the business wrote them, so a client
// in the same city sees the same 18:00 without any time zone conversion.
// Only what the client needs goes in: no phone number and no note, because calendars are often
// synced and shared.

// Drops control characters (keeps tab), so no text can start a new calendar line on its own.
const stripControl = (text: string) =>
  [...text]
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0
      return code === 9 || (code >= 32 && code !== 127)
    })
    .join('')

// RFC 5545: escape backslash, semicolon and comma; every kind of line break (CRLF, LF and a bare
// CR, which many parsers also treat as a new line) becomes the two characters \n.
const escapeText = (text: string) =>
  stripControl(
    text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r\n|\r|\n/g, '\\n'),
  )

const utf8Length = (text: string) => new TextEncoder().encode(text).length

// RFC 5545: lines longer than 75 octets continue on the next line, which starts with a space.
// Counts UTF-8 bytes and never splits a character.
function fold(line: string) {
  const parts: string[] = []
  let current = ''
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74
    if (utf8Length(current + char) > limit) {
      parts.push(current)
      current = ''
    }
    current += char
  }
  parts.push(current)
  return parts.join('\r\n ')
}

const LOCAL_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

// `2026-10-21T18:00` -> `20261021T180000`
const toIcsLocal = (startsAt: string) => `${startsAt.replace(/[-:]/g, '')}00`

function addMinutes(startsAt: string, minutes: number) {
  const end = new Date(Date.parse(`${startsAt}Z`) + minutes * 60_000)
  return end.toISOString().slice(0, 16)
}

// Throws when the booking time is not a valid `YYYY-MM-DDTHH:mm` with a positive whole duration,
// so a bad value never ends up in the file.
export function bookingCalendarFile(booking: Booking, bookingUrl?: string, now = new Date()) {
  const { startsAt, durationMinutes } = booking
  if (
    !LOCAL_TIME.test(startsAt) ||
    Number.isNaN(Date.parse(`${startsAt}Z`)) ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0
  ) {
    throw new Error('The booking time is not valid.')
  }

  const stamp = `${now.toISOString().slice(0, 19).replace(/[-:]/g, '')}Z`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zakazi.me//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:booking-${booking.id}@zakazi.me`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsLocal(startsAt)}`,
    `DTEND:${toIcsLocal(addMinutes(startsAt, durationMinutes))}`,
    `SUMMARY:${escapeText(`${booking.serviceName} at ${booking.businessName}`)}`,
    `LOCATION:${escapeText(`${booking.address}, ${booking.city}`)}`,
    `DESCRIPTION:${escapeText(`Booked for ${booking.clientName} on Zakazi.me`)}`,
    ...(bookingUrl ? [`URL:${stripControl(bookingUrl)}`] : []),
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
