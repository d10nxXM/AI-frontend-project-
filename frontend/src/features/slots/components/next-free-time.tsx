import { CalendarCheck } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { localNow } from '@/lib/local-time'

import { useSlots } from '../api/use-slots'

const DAY_MS = 24 * 60 * 60 * 1000

// startsAt is local time without a zone, so dates are formatted as UTC to keep the day as written.
const dayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

// "Today", "Tomorrow" or "Wed 22 Oct" for a `YYYY-MM-DD` date, seen from `today`.
function dayLabel(date: string, today: string) {
  const days = (Date.parse(`${date}T00:00Z`) - Date.parse(`${today}T00:00Z`)) / DAY_MS
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return dayFormat.format(new Date(`${date}T00:00Z`))
}

type NextFreeTimeProps = {
  businessId: number
}

// One line for a business card: the soonest free slot from now on.
export function NextFreeTime({ businessId }: NextFreeTimeProps) {
  const { data: slots, isLoading, error } = useSlots({ businessId, status: 'free' })

  if (isLoading) return <Skeleton className="h-5 w-40" />
  if (error) return <span className="text-sm">Free times could not be loaded.</span>

  const now = localNow()
  const next = slots
    ?.filter((s) => s.startsAt >= now)
    .reduce<string | undefined>(
      (soonest, s) => (!soonest || s.startsAt < soonest ? s.startsAt : soonest),
      undefined,
    )

  if (!next) return <span className="text-sm">No free times in the next two weeks</span>

  return (
    <span className="flex items-center gap-2 text-sm font-medium text-foreground tabular-nums">
      <CalendarCheck aria-hidden className="size-4 shrink-0" />
      Next free: {dayLabel(next.slice(0, 10), now.slice(0, 10))}, {next.slice(11, 16)}
    </span>
  )
}
