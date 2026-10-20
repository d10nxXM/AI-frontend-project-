// startsAt is local time without a zone, so it is formatted as UTC to keep the time as written.
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
})

export const formatStartsAt = (startsAt: string) => dateTimeFormat.format(new Date(`${startsAt}Z`))
