import { CalendarPlus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import type { Booking } from '../types'
import { bookingCalendarFile, bookingCalendarFileName } from './booking-calendar-file'

type AddToCalendarButtonProps = {
  booking: Booking
}

// Downloads the booking as an .ics file; opening it adds the appointment to the calendar.
export function AddToCalendarButton({ booking }: AddToCalendarButtonProps) {
  const [failed, setFailed] = useState(false)

  function download() {
    let content: string
    try {
      // BASE_URL ends with '/': it is '/' locally and '/<repo>/' on GitHub Pages.
      const bookingUrl = `${window.location.origin}${import.meta.env.BASE_URL}bookings/${booking.id}`
      content = bookingCalendarFile(booking, bookingUrl)
    } catch {
      setFailed(true)
      return
    }
    setFailed(false)
    const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = bookingCalendarFileName(booking)
    link.click()
    // Revoking in the same tick cancels the download in some browsers (older Safari).
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="flex flex-col gap-1">
      <Button variant="outline" size="sm" onClick={download}>
        <CalendarPlus aria-hidden />
        Add to calendar
      </Button>
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          This booking could not be added to a calendar.
        </p>
      )}
    </div>
  )
}
