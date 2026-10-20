const pad = (n: number) => String(n).padStart(2, '0')

// The current local time as `YYYY-MM-DDTHH:mm`, the shape of slot and booking times,
// so the two compare as plain strings. Shared by the slots and bookings features.
export function localNow() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}
