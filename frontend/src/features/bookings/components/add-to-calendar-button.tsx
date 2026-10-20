import { CalendarPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { Booking } from '../types'
import { bookingCalendarFile, bookingCalendarFileName } from './booking-calendar-file'

type AddToCalendarButtonProps = {
  booking: Booking
}

// Downloads the booking as an .ics file; opening it adds the appointment to the calendar.
export function AddToCalendarButton({ booking }: AddToCalendarButtonProps) {
  function download() {
    const file = new Blob([bookingCalendarFile(booking)], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = bookingCalendarFileName(booking)
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={download}>
      <CalendarPlus aria-hidden />
      Add to calendar
    </Button>
  )
}
